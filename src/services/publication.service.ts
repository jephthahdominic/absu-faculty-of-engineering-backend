import { Types } from 'mongoose';
import { publicationRepository } from '../repositories/publication.repository';
import { departmentRepository } from '../repositories/department.repository';
import { lecturerRepository } from '../repositories/lecturer.repository';
import { IPublicationDocument } from '../interfaces/publication.interface';
import { IPaginationQuery, IPaginationResult } from '../interfaces/pagination.interface';
import { buildPaginationResult } from '../utils/pagination.util';
import { toIdString } from '../utils/objectId.util';
import { logger } from '../utils/logger.util';
import { AppError } from './auth.service';
import { HTTP_STATUS } from '../constants/httpStatus';
import { FilterQuery } from 'mongoose';
import { ROLES, Role } from '../constants/roles';

class PublicationService {
  async createPublication(
    data: {
      title: string;
      journal: string;
      publicationYear: number;
      publicationUrl: string;
      authors: string[];
      lecturerId: string;
      departmentId: string;
      isPublished?: boolean;
    },
    requesterRole: Role,
    requesterDeptId?: string,
  ): Promise<IPublicationDocument> {
    if (requesterRole === ROLES.DEPARTMENT_ADMIN && data.departmentId !== requesterDeptId) {
      throw new AppError('You can only add publications to your department', HTTP_STATUS.FORBIDDEN);
    }

    const dept = await departmentRepository.findById(data.departmentId);
    if (!dept) throw new AppError('Department not found', HTTP_STATUS.NOT_FOUND);

    const lecturer = await lecturerRepository.findById(data.lecturerId);
    if (!lecturer) throw new AppError('Lecturer not found', HTTP_STATUS.NOT_FOUND);

    if (lecturer.departmentId.toString() !== data.departmentId) {
      throw new AppError('Lecturer does not belong to the specified department', HTTP_STATUS.BAD_REQUEST);
    }

    const createData: Partial<IPublicationDocument> = {
      title: data.title,
      journal: data.journal,
      publicationYear: data.publicationYear,
      publicationUrl: data.publicationUrl,
      authors: data.authors,
      lecturerId: new Types.ObjectId(data.lecturerId),
      departmentId: new Types.ObjectId(data.departmentId),
      isPublished: data.isPublished ?? true,
    };

    const pub = await publicationRepository.create(createData);
    logger.info(`Publication created: ${pub.title}`);
    return pub;
  }

  async getPublications(
    query: IPaginationQuery,
    requesterRole: Role | undefined,
    requesterDeptId?: string,
  ): Promise<IPaginationResult<IPublicationDocument>> {
    const { page = 1, limit = 20, search, sort = 'createdAt', order = 'desc', departmentId, publicationYear, isPublished } = query;

    const filter: FilterQuery<IPublicationDocument> = {};

    if (requesterRole === ROLES.DEPARTMENT_ADMIN || requesterRole === ROLES.STUDENT) {
      filter.departmentId = requesterDeptId;
    } else if (departmentId) {
      filter.departmentId = departmentId;
    }

    const canViewUnpublished =
      requesterRole === ROLES.DEAN || requesterRole === ROLES.SUPER_ADMIN || requesterRole === ROLES.DEPARTMENT_ADMIN;

    if (canViewUnpublished) {
      if (isPublished !== undefined) filter.isPublished = isPublished;
    } else {
      filter.isPublished = true;
    }

    if (publicationYear) filter.publicationYear = publicationYear;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { journal: { $regex: search, $options: 'i' } },
        { authors: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const { data, total } = await publicationRepository.findPaginated(filter, page, limit, { [sort]: sortOrder });
    return buildPaginationResult(data, total, page, limit);
  }

  async getPublicationById(id: string, requesterRole: Role | undefined, requesterDeptId?: string): Promise<IPublicationDocument> {
    const pub = await publicationRepository.findById(id);
    if (!pub) throw new AppError('Publication not found', HTTP_STATUS.NOT_FOUND);

    if (
      (requesterRole === ROLES.DEPARTMENT_ADMIN || requesterRole === ROLES.STUDENT) &&
      toIdString(pub.departmentId) !== requesterDeptId
    ) {
      throw new AppError('You can only access resources in your department', HTTP_STATUS.FORBIDDEN);
    }

    const canViewUnpublished =
      requesterRole === ROLES.DEAN ||
      requesterRole === ROLES.SUPER_ADMIN ||
      (requesterRole === ROLES.DEPARTMENT_ADMIN && toIdString(pub.departmentId) === requesterDeptId);

    if (!pub.isPublished && !canViewUnpublished) {
      throw new AppError('Publication not found', HTTP_STATUS.NOT_FOUND);
    }

    return pub;
  }

  async updatePublication(
    id: string,
    data: Partial<{
      title: string;
      journal: string;
      publicationYear: number;
      publicationUrl: string;
      authors: string[];
      lecturerId: string;
      isPublished: boolean;
    }>,
    requesterRole: Role,
    requesterDeptId?: string,
  ): Promise<IPublicationDocument> {
    const pub = await publicationRepository.findById(id);
    if (!pub) throw new AppError('Publication not found', HTTP_STATUS.NOT_FOUND);

    if (requesterRole === ROLES.DEPARTMENT_ADMIN && toIdString(pub.departmentId) !== requesterDeptId) {
      throw new AppError('You can only update publications in your department', HTTP_STATUS.FORBIDDEN);
    }

    if (data.lecturerId) {
      const lecturer = await lecturerRepository.findById(data.lecturerId);
      if (!lecturer) throw new AppError('Lecturer not found', HTTP_STATUS.NOT_FOUND);
    }

    const updateData: Partial<IPublicationDocument> = {};
    if (data.title) updateData.title = data.title;
    if (data.journal) updateData.journal = data.journal;
    if (data.publicationYear) updateData.publicationYear = data.publicationYear;
    if (data.publicationUrl) updateData.publicationUrl = data.publicationUrl;
    if (data.authors) updateData.authors = data.authors;
    if (data.lecturerId) updateData.lecturerId = new Types.ObjectId(data.lecturerId);
    if (data.isPublished !== undefined) updateData.isPublished = data.isPublished;

    const updated = await publicationRepository.updateById(id, updateData);
    logger.info(`Publication updated: ${id}`);
    return updated!;
  }

  async deletePublication(id: string, requesterRole: Role, requesterDeptId?: string): Promise<void> {
    const pub = await publicationRepository.findById(id);
    if (!pub) throw new AppError('Publication not found', HTTP_STATUS.NOT_FOUND);

    if (requesterRole === ROLES.DEPARTMENT_ADMIN && toIdString(pub.departmentId) !== requesterDeptId) {
      throw new AppError('You can only delete publications in your department', HTTP_STATUS.FORBIDDEN);
    }

    await publicationRepository.deleteById(id);
    logger.info(`Publication deleted: ${id}`);
  }
}

export const publicationService = new PublicationService();
