import { Types } from 'mongoose';
import { lecturerRepository } from '../repositories/lecturer.repository';
import { departmentRepository } from '../repositories/department.repository';
import { r2Service } from './r2.service';
import { ILecturerDocument } from '../interfaces/lecturer.interface';
import { IPaginationQuery, IPaginationResult } from '../interfaces/pagination.interface';
import { buildPaginationResult } from '../utils/pagination.util';
import { logger } from '../utils/logger.util';
import { AppError } from './auth.service';
import { HTTP_STATUS } from '../constants/httpStatus';
import { FilterQuery } from 'mongoose';
import { ROLES, Role } from '../constants/roles';

class LecturerService {
  async createLecturer(
    data: {
      firstName: string;
      lastName: string;
      email: string;
      staffId?: string;
      designation: string;
      bio?: string;
      departmentId: string;
      password?: string;
    },
    requesterRole: Role,
    requesterDeptId?: string,
  ): Promise<ILecturerDocument> {
    if (requesterRole === ROLES.DEPARTMENT_ADMIN && data.departmentId !== requesterDeptId) {
      throw new AppError('You can only add lecturers to your department', HTTP_STATUS.FORBIDDEN);
    }

    const dept = await departmentRepository.findById(data.departmentId);
    if (!dept) {
      throw new AppError('Department not found', HTTP_STATUS.NOT_FOUND);
    }

    const emailExists = await lecturerRepository.findByEmail(data.email);
    if (emailExists) {
      throw new AppError('Lecturer email already in use', HTTP_STATUS.CONFLICT);
    }

    // if (data.staffId) {
    //   const staffIdExists = await lecturerRepository.findByStaffId(data.staffId);
    //   if (staffIdExists) {
    //     throw new AppError('Staff ID already in use', HTTP_STATUS.CONFLICT);
    //   }
    // }

    const createData: Partial<ILecturerDocument> = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      staffId: data.staffId,
      designation: data.designation,
      bio: data.bio,
      departmentId: new Types.ObjectId(data.departmentId),
      password: data.password,
      // Admin-created lecturers are trusted by the creator's authority; no HOD verification needed.
      isVerified: true,
    };

    const lecturer = await lecturerRepository.create(createData);
    logger.info(`Lecturer created: ${lecturer.email}`);
    return lecturer;
  }

  async registerLecturer(
    data: {
      fullName: string;
      email: string;
      staffId?: string;
      departmentId: string;
      designation: string;
      password: string;
    },
    file: Express.Multer.File,
  ): Promise<ILecturerDocument> {
    const dept = await departmentRepository.findById(data.departmentId);
    if (!dept) {
      throw new AppError('Department not found', HTTP_STATUS.NOT_FOUND);
    }

    const emailExists = await lecturerRepository.findByEmail(data.email);
    if (emailExists) {
      throw new AppError('Lecturer email already in use', HTTP_STATUS.CONFLICT);
    }

    // if (data.staffId) {
    //   const staffIdExists = await lecturerRepository.findByStaffId(data.staffId);
    //   if (staffIdExists) {
    //     throw new AppError('Staff ID already in use', HTTP_STATUS.CONFLICT);
    //   }
    // }

    const [firstName, ...rest] = data.fullName.trim().split(/\s+/);
    const lastName = rest.join(' ');

    const { fileId, fileUrl } = await r2Service.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      'lecturer-images',
    );

    const createData: Partial<ILecturerDocument> = {
      firstName,
      lastName,
      email: data.email,
      staffId: data.staffId,
      designation: data.designation,
      departmentId: new Types.ObjectId(data.departmentId),
      password: data.password,
      profileImage: fileUrl,
      profileImageId: fileId,
      role: ROLES.LECTURER,
      isVerified: false,
    };

    const lecturer = await lecturerRepository.create(createData);
    logger.info(`Lecturer registered: ${lecturer.email}`);
    return lecturer;
  }

  async verifyLecturer(
    id: string,
    verifierId: string,
    requesterRole: Role,
    requesterDeptId?: string,
  ): Promise<ILecturerDocument> {
    const lecturer = await lecturerRepository.findById(id);
    if (!lecturer) {
      throw new AppError('Lecturer not found', HTTP_STATUS.NOT_FOUND);
    }

    if (requesterRole === ROLES.DEPARTMENT_ADMIN && lecturer.departmentId.toString() !== requesterDeptId) {
      throw new AppError('You can only verify lecturers in your department', HTTP_STATUS.FORBIDDEN);
    }

    if (lecturer.isVerified) {
      throw new AppError('Lecturer is already verified', HTTP_STATUS.CONFLICT);
    }

    const updated = await lecturerRepository.updateById(id, {
      isVerified: true,
      verifiedBy: new Types.ObjectId(verifierId),
      verifiedAt: new Date(),
    });
    logger.info(`Lecturer verified: ${id} by ${verifierId}`);
    return updated!;
  }

  async getLecturers(
    query: IPaginationQuery,
    requesterRole: Role,
    requesterDeptId?: string,
  ): Promise<IPaginationResult<ILecturerDocument>> {
    const { page = 1, limit = 20, search, sort = 'createdAt', order = 'desc', departmentId } = query;

    const filter: FilterQuery<ILecturerDocument> = {};

    if (requesterRole === ROLES.DEPARTMENT_ADMIN || requesterRole === ROLES.STUDENT) {
      filter.departmentId = requesterDeptId;
    } else if (departmentId) {
      filter.departmentId = departmentId;
    }

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const { data, total } = await lecturerRepository.findPaginated(filter, page, limit, { [sort]: sortOrder });
    return buildPaginationResult(data, total, page, limit);
  }

  async getLecturerById(id: string, requesterRole: Role, requesterDeptId?: string): Promise<ILecturerDocument> {
    const lecturer = await lecturerRepository.findById(id);
    if (!lecturer) {
      throw new AppError('Lecturer not found', HTTP_STATUS.NOT_FOUND);
    }

    if (
      (requesterRole === ROLES.DEPARTMENT_ADMIN || requesterRole === ROLES.STUDENT) &&
      lecturer.departmentId.toString() !== requesterDeptId
    ) {
      throw new AppError('You can only access resources in your department', HTTP_STATUS.FORBIDDEN);
    }

    return lecturer;
  }

  async updateLecturer(
    id: string,
    data: Partial<{ firstName: string; lastName: string; email: string; staffId: string; designation: string; bio: string; departmentId: string }>,
    requesterRole: Role,
    requesterDeptId?: string,
  ): Promise<ILecturerDocument> {
    const lecturer = await lecturerRepository.findById(id);
    if (!lecturer) {
      throw new AppError('Lecturer not found', HTTP_STATUS.NOT_FOUND);
    }

    if (requesterRole === ROLES.DEPARTMENT_ADMIN && lecturer.departmentId.toString() !== requesterDeptId) {
      throw new AppError('You can only update lecturers in your department', HTTP_STATUS.FORBIDDEN);
    }

    if (data.email && data.email !== lecturer.email) {
      const emailExists = await lecturerRepository.findByEmail(data.email);
      if (emailExists) {
        throw new AppError('Lecturer email already in use', HTTP_STATUS.CONFLICT);
      }
    }

    if (data.staffId && data.staffId !== lecturer.staffId) {
      const staffIdExists = await lecturerRepository.findByStaffId(data.staffId);
      if (staffIdExists) {
        throw new AppError('Staff ID already in use', HTTP_STATUS.CONFLICT);
      }
    }

    const updateData: Partial<ILecturerDocument> = {};
    if (data.firstName) updateData.firstName = data.firstName;
    if (data.lastName) updateData.lastName = data.lastName;
    if (data.email) updateData.email = data.email;
    if (data.staffId) updateData.staffId = data.staffId;
    if (data.designation) updateData.designation = data.designation;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.departmentId) updateData.departmentId = new Types.ObjectId(data.departmentId);

    const updated = await lecturerRepository.updateById(id, updateData);
    logger.info(`Lecturer updated: ${id}`);
    return updated!;
  }

  async deleteLecturer(id: string, requesterRole: Role, requesterDeptId?: string): Promise<void> {
    const lecturer = await lecturerRepository.findById(id);
    if (!lecturer) {
      throw new AppError('Lecturer not found', HTTP_STATUS.NOT_FOUND);
    }

    if (requesterRole === ROLES.DEPARTMENT_ADMIN && lecturer.departmentId.toString() !== requesterDeptId) {
      throw new AppError('You can only delete lecturers in your department', HTTP_STATUS.FORBIDDEN);
    }

    if (lecturer.profileImageId) {
      try {
        await r2Service.deleteFile(lecturer.profileImageId);
      } catch {
        logger.warn(`Failed to delete lecturer profile image`);
      }
    }

    await lecturerRepository.deleteById(id);
    logger.info(`Lecturer deleted: ${id}`);
  }

  async updateProfileImage(
    id: string,
    file: Express.Multer.File,
    requesterRole: Role,
    requesterDeptId?: string,
  ): Promise<ILecturerDocument> {
    const lecturer = await lecturerRepository.findById(id);
    if (!lecturer) {
      throw new AppError('Lecturer not found', HTTP_STATUS.NOT_FOUND);
    }

    if (requesterRole === ROLES.DEPARTMENT_ADMIN && lecturer.departmentId.toString() !== requesterDeptId) {
      throw new AppError('You can only update lecturers in your department', HTTP_STATUS.FORBIDDEN);
    }

    if (lecturer.profileImageId) {
      try {
        await r2Service.deleteFile(lecturer.profileImageId);
      } catch {
        logger.warn(`Failed to delete old lecturer profile image`);
      }
    }

    const { fileId, fileUrl } = await r2Service.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      'lecturer-images',
    );

    const updated = await lecturerRepository.updateById(id, { profileImage: fileUrl, profileImageId: fileId });
    logger.info(`Lecturer profile image updated: ${id}`);
    return updated!;
  }
}

export const lecturerService = new LecturerService();
