import { Types } from 'mongoose';
import { lectureNoteRepository } from '../repositories/lectureNote.repository';
import { departmentRepository } from '../repositories/department.repository';
import { lecturerRepository } from '../repositories/lecturer.repository';
import { r2Service } from './r2.service';
import { ILectureNoteDocument } from '../interfaces/lectureNote.interface';
import { IPaginationQuery, IPaginationResult } from '../interfaces/pagination.interface';
import { buildPaginationResult } from '../utils/pagination.util';
import { toIdString } from '../utils/objectId.util';
import { logger } from '../utils/logger.util';
import { AppError } from './auth.service';
import { HTTP_STATUS } from '../constants/httpStatus';
import { FilterQuery } from 'mongoose';
import { ROLES, Role } from '../constants/roles';

const verifyDepartmentsExist = async (departmentIds: string[]): Promise<void> => {
  const unique = Array.from(new Set(departmentIds));
  const found = await departmentRepository.findAll({ _id: { $in: unique } });
  if (found.length !== unique.length) {
    throw new AppError('One or more departments were not found', HTTP_STATUS.NOT_FOUND);
  }
};

class LectureNoteService {
  async createLectureNote(
    data: {
      title: string;
      courseCode: string;
      level: string;
      semester: string;
      lecturerId?: string;
      departmentIds?: string[];
    },
    file: Express.Multer.File,
    requesterRole: Role,
    requesterId: string,
    requesterDeptId?: string,
  ): Promise<ILectureNoteDocument> {
    let lecturerId = data.lecturerId;
    let departmentIds = data.departmentIds ?? [];

    if (requesterRole === ROLES.LECTURER) {
      lecturerId = requesterId;
      // Lecturers pick whichever departments the course serves — they may teach
      // across multiple departments, not just the one they're employed under.
    }

    if (!lecturerId) {
      throw new AppError('lecturerId is required', HTTP_STATUS.BAD_REQUEST);
    }

    if (departmentIds.length === 0) {
      throw new AppError('At least one departmentId is required', HTTP_STATUS.BAD_REQUEST);
    }

    await verifyDepartmentsExist(departmentIds);

    const lecturer = await lecturerRepository.findById(lecturerId);
    if (!lecturer) throw new AppError('Lecturer not found', HTTP_STATUS.NOT_FOUND);

    const { fileId, fileUrl } = await r2Service.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      'lecture-notes',
    );

    const createData: Partial<ILectureNoteDocument> = {
      title: data.title,
      courseCode: data.courseCode,
      level: data.level,
      semester: data.semester,
      fileUrl,
      fileId,
      lecturerId: new Types.ObjectId(lecturerId),
      departmentIds: departmentIds.map((id) => new Types.ObjectId(id)),
    };

    const note = await lectureNoteRepository.create(createData);
    logger.info(`Lecture note created: ${note.title}`);
    return note;
  }

  async getLectureNotes(
    query: IPaginationQuery,
    requesterRole: Role,
    requesterDeptId?: string,
  ): Promise<IPaginationResult<ILectureNoteDocument>> {
    const { page = 1, limit = 20, search, sort = 'createdAt', order = 'desc', departmentId, level, semester } = query;

    const filter: FilterQuery<ILectureNoteDocument> = {};

    if (requesterRole === ROLES.DEPARTMENT_ADMIN || requesterRole === ROLES.STUDENT) {
      filter.departmentIds = requesterDeptId;
    } else if (departmentId) {
      filter.departmentIds = departmentId;
    }

    if (level) filter.level = level;
    if (semester) filter.semester = semester;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { courseCode: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const { data, total } = await lectureNoteRepository.findPaginated(filter, page, limit, { [sort]: sortOrder });
    return buildPaginationResult(data, total, page, limit);
  }

  async getLectureNoteById(id: string, requesterRole: Role, requesterDeptId?: string): Promise<ILectureNoteDocument> {
    const note = await lectureNoteRepository.findById(id);
    if (!note) throw new AppError('Lecture note not found', HTTP_STATUS.NOT_FOUND);

    if (
      (requesterRole === ROLES.DEPARTMENT_ADMIN || requesterRole === ROLES.STUDENT) &&
      !note.departmentIds.some((d) => toIdString(d) === requesterDeptId)
    ) {
      throw new AppError('You can only access resources in your department', HTTP_STATUS.FORBIDDEN);
    }

    return note;
  }

  async updateLectureNote(
    id: string,
    data: Partial<{ title: string; courseCode: string; level: string; semester: string; lecturerId: string; departmentIds: string[] }>,
    file: Express.Multer.File | undefined,
    requesterRole: Role,
    requesterId: string,
    requesterDeptId?: string,
  ): Promise<ILectureNoteDocument> {
    const note = await lectureNoteRepository.findById(id);
    if (!note) throw new AppError('Lecture note not found', HTTP_STATUS.NOT_FOUND);

    if (requesterRole === ROLES.LECTURER) {
      if (toIdString(note.lecturerId) !== requesterId) {
        throw new AppError('You can only update your own lecture notes', HTTP_STATUS.FORBIDDEN);
      }
    }

    const updateData: Partial<ILectureNoteDocument> = {};
    if (data.title) updateData.title = data.title;
    if (data.courseCode) updateData.courseCode = data.courseCode;
    if (data.level) updateData.level = data.level;
    if (data.semester) updateData.semester = data.semester;
    // Lecturers can't reassign a note to someone else — only admins may change ownership.
    if (data.lecturerId && requesterRole !== ROLES.LECTURER) {
      updateData.lecturerId = new Types.ObjectId(data.lecturerId);
    }

    if (data.departmentIds && data.departmentIds.length > 0) {
      // A department_admin's notes stay pinned to their own department; only
      // lecturers (re-scoping their own note) and dean/super_admin may change this.
      // if (requesterRole !== ROLES.DEPARTMENT_ADMIN) {
      await verifyDepartmentsExist(data.departmentIds);
      updateData.departmentIds = data.departmentIds.map((depId) => new Types.ObjectId(depId));
      // }
    }

    if (file) {
      if (note.fileId) {
        try {
          await r2Service.deleteFile(note.fileId);
        } catch {
          logger.warn(`Failed to delete old lecture note file`);
        }
      }
      const { fileId, fileUrl } = await r2Service.uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype,
        'lecture-notes',
      );
      updateData.fileUrl = fileUrl;
      updateData.fileId = fileId;
    }

    const updated = await lectureNoteRepository.updateById(id, updateData);
    logger.info(`Lecture note updated: ${id}`);
    return updated!;
  }

  async deleteLectureNote(
    id: string,
    requesterRole: Role,
    requesterId: string,
    requesterDeptId?: string,
  ): Promise<void> {
    const note = await lectureNoteRepository.findById(id);
    if (!note) throw new AppError('Lecture note not found', HTTP_STATUS.NOT_FOUND);

    if (requesterRole === ROLES.LECTURER) {
      if (toIdString(note.lecturerId) !== requesterId) {
        throw new AppError('You can only delete your own lecture notes', HTTP_STATUS.FORBIDDEN);
      }
    } else if (
      requesterRole === ROLES.DEPARTMENT_ADMIN &&
      !note.departmentIds.some((d) => toIdString(d) === requesterDeptId)
    ) {
      throw new AppError('You can only delete lecture notes in your department', HTTP_STATUS.FORBIDDEN);
    }

    if (note.fileId) {
      try {
        await r2Service.deleteFile(note.fileId);
      } catch {
        logger.warn(`Failed to delete lecture note file from Drive`);
      }
    }

    await lectureNoteRepository.deleteById(id);
    logger.info(`Lecture note deleted: ${id}`);
  }
}

export const lectureNoteService = new LectureNoteService();
