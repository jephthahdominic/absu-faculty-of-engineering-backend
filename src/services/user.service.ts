import { Types } from 'mongoose';
import { userRepository } from '../repositories/user.repository';
import { departmentRepository } from '../repositories/department.repository';
import { r2Service } from './r2.service';
import { IUserDocument, IUserResponse } from '../interfaces/user.interface';
import { IPaginationQuery, IPaginationResult } from '../interfaces/pagination.interface';
import { buildPaginationResult } from '../utils/pagination.util';
import { logger } from '../utils/logger.util';
import { AppError } from './auth.service';
import { HTTP_STATUS } from '../constants/httpStatus';
import { ROLES, Role } from '../constants/roles';
import { FilterQuery } from 'mongoose';

class UserService {
  private mapToResponse(user: IUserDocument): IUserResponse {
    return {
      _id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId?.toString(),
      matricNumber: user.matricNumber,
      level: user.level,
      profileImage: user.profileImage,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: (user as unknown as { createdAt?: Date }).createdAt,
      updatedAt: (user as unknown as { updatedAt?: Date }).updatedAt,
    };
  }

  async createUser(
    data: {
      fullName: string;
      email: string;
      password: string;
      role: Role;
      departmentId?: string;
      matricNumber?: string;
      level?: string;
    },
    creatorRole: Role,
  ): Promise<IUserResponse> {
    const emailExists = await userRepository.findByEmailWithoutPassword(data.email);
    if (emailExists) {
      throw new AppError('Email already in use', HTTP_STATUS.CONFLICT);
    }

    if (data.matricNumber) {
      const matricExists = await userRepository.findByMatricNumber(data.matricNumber);
      if (matricExists) {
        throw new AppError('Matriculation number already in use', HTTP_STATUS.CONFLICT);
      }
    }

    if (data.role === ROLES.SUPER_ADMIN && creatorRole !== ROLES.SUPER_ADMIN) {
      throw new AppError('Only super admin can create super admin accounts', HTTP_STATUS.FORBIDDEN);
    }

    if (data.departmentId) {
      const deptExists = await departmentRepository.findById(data.departmentId);
      if (!deptExists) {
        throw new AppError('Department not found', HTTP_STATUS.NOT_FOUND);
      }
    }

    const createData: Partial<IUserDocument> = {
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      role: data.role,
      isActive: true,
    };

    if (data.departmentId) {
      createData.departmentId = new Types.ObjectId(data.departmentId);
    }

    const user = await userRepository.create(createData);
    logger.info(`User created: ${user.email} (${user.role})`);
    return this.mapToResponse(user);
  }

  async getUsers(
    query: IPaginationQuery,
    requesterRole: Role,
    requesterDeptId?: string,
  ): Promise<IPaginationResult<IUserResponse>> {
    const { page = 1, limit = 20, search, sort = 'createdAt', order = 'desc', departmentId } = query;

    const filter: FilterQuery<IUserDocument> = {};

    if (requesterRole === ROLES.DEPARTMENT_ADMIN) {
      filter.departmentId = requesterDeptId;
    } else if (departmentId) {
      filter.departmentId = departmentId;
    }

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const { data, total } = await userRepository.findPaginated(filter, page, limit, { [sort]: sortOrder });

    return buildPaginationResult(data.map((u) => this.mapToResponse(u)), total, page, limit);
  }

  async getUserById(id: string): Promise<IUserResponse> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }
    return this.mapToResponse(user);
  }

  async updateUser(
    id: string,
    data: Partial<{
      fullName: string;
      email: string;
      departmentId: string;
      matricNumber: string;
      level: string;
      isActive: boolean;
    }>,
  ): Promise<IUserResponse> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }

    if (data.email && data.email !== user.email) {
      const emailExists = await userRepository.findByEmailWithoutPassword(data.email);
      if (emailExists) {
        throw new AppError('Email already in use', HTTP_STATUS.CONFLICT);
      }
    }

    if (data.matricNumber && data.matricNumber !== user.matricNumber) {
      const matricExists = await userRepository.findByMatricNumber(data.matricNumber);
      if (matricExists) {
        throw new AppError('Matriculation number already in use', HTTP_STATUS.CONFLICT);
      }
    }

    if (data.departmentId) {
      const dept = await departmentRepository.findById(data.departmentId);
      if (!dept) {
        throw new AppError('Department not found', HTTP_STATUS.NOT_FOUND);
      }
    }

    const updateData: Partial<IUserDocument> = {};
    if (data.fullName) updateData.fullName = data.fullName;
    if (data.email) updateData.email = data.email;
    if (data.matricNumber) updateData.matricNumber = data.matricNumber;
    if (data.level) updateData.level = data.level;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.departmentId) updateData.departmentId = new Types.ObjectId(data.departmentId);

    const updated = await userRepository.updateById(id, updateData);
    logger.info(`User updated: ${id}`);
    return this.mapToResponse(updated!);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }
    await userRepository.deleteById(id);
    logger.info(`User deleted: ${id}`);
  }

  async updateProfileImage(userId: string, file: Express.Multer.File): Promise<IUserResponse> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }

    if (user.profileImageId) {
      try {
        await r2Service.deleteFile(user.profileImageId);
      } catch {
        logger.warn(`Failed to delete old profile image: ${user.profileImageId}`);
      }
    }

    const { fileId, fileUrl } = await r2Service.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      'profile-images',
    );

    const updated = await userRepository.updateById(userId, {
      profileImage: fileUrl,
      profileImageId: fileId,
    });

    logger.info(`Profile image updated for user: ${userId}`);
    return this.mapToResponse(updated!);
  }
}

export const userService = new UserService();
