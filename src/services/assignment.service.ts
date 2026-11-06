import { FilterQuery, Types } from 'mongoose';
import { assignmentRepository, submissionRepository } from '../repositories/assignment.repository';
import { departmentRepository } from '../repositories/department.repository';
import { lecturerRepository } from '../repositories/lecturer.repository';
import { r2Service } from './r2.service';
import { IAssignmentDocument, ISubmissionDocument } from '../interfaces/assignment.interface';
import { IPaginationQuery, IPaginationResult } from '../interfaces/pagination.interface';
import { buildPaginationResult } from '../utils/pagination.util';
import { toIdString } from '../utils/objectId.util';
import { logger } from '../utils/logger.util';
import { AppError } from './auth.service';
import { HTTP_STATUS } from '../constants/httpStatus';
import { ROLES, Role } from '../constants/roles';

export interface IRequester {
  id: string;
  role: Role;
  departmentId?: string;
  level?: string;
}

type AssignmentWithSubmission = Record<string, unknown>;

const verifyDepartmentsExist = async (departmentIds: string[]): Promise<void> => {
  const unique = Array.from(new Set(departmentIds));
  const found = await departmentRepository.findAll({ _id: { $in: unique } });
  if (found.length !== unique.length) {
    throw new AppError('One or more departments were not found', HTTP_STATUS.NOT_FOUND);
  }
};

const safeDelete = async (fileId?: string | null): Promise<void> => {
  if (!fileId) return;
  try {
    await r2Service.deleteFile(fileId);
  } catch {
    logger.warn(`Failed to delete file ${fileId} from storage`);
  }
};

class AssignmentService {
  /** Can this requester see/manage this assignment's submissions as staff? */
  private assertStaffAccess(assignment: IAssignmentDocument, requester: IRequester, action: string): void {
    if (requester.role === ROLES.LECTURER) {
      if (toIdString(assignment.lecturerId) !== requester.id) {
        throw new AppError(`You can only ${action} your own assignments`, HTTP_STATUS.FORBIDDEN);
      }
    } else if (requester.role === ROLES.DEPARTMENT_ADMIN) {
      if (!assignment.departmentIds.some((d) => toIdString(d) === requester.departmentId)) {
        throw new AppError('You can only access assignments in your department', HTTP_STATUS.FORBIDDEN);
      }
    } else if (requester.role === ROLES.STUDENT) {
      throw new AppError('You do not have permission to perform this action', HTTP_STATUS.FORBIDDEN);
    }
  }

  private assertStudentCanSee(assignment: IAssignmentDocument, requester: IRequester): void {
    const inDept = assignment.departmentIds.some((d) => toIdString(d) === requester.departmentId);
    const inLevel = !!requester.level && assignment.levels.includes(requester.level);
    if (!inDept || !inLevel) {
      throw new AppError('This assignment is not available to you', HTTP_STATUS.FORBIDDEN);
    }
  }

  async createAssignment(
    data: {
      title: string;
      description?: string;
      courseCode?: string;
      levels: string[];
      dueDate: string;
      lecturerId?: string;
      departmentIds?: string[];
    },
    file: Express.Multer.File,
    requester: IRequester,
  ): Promise<IAssignmentDocument> {
    const lecturerId = requester.role === ROLES.LECTURER ? requester.id : data.lecturerId;
    const departmentIds = data.departmentIds ?? [];

    if (!lecturerId) throw new AppError('lecturerId is required', HTTP_STATUS.BAD_REQUEST);
    if (departmentIds.length === 0) throw new AppError('At least one departmentId is required', HTTP_STATUS.BAD_REQUEST);
    if (file.mimetype !== 'application/pdf') throw new AppError('Assignment brief must be a PDF', HTTP_STATUS.BAD_REQUEST);

    await verifyDepartmentsExist(departmentIds);
    const lecturer = await lecturerRepository.findById(lecturerId);
    if (!lecturer) throw new AppError('Lecturer not found', HTTP_STATUS.NOT_FOUND);

    const { fileId, fileUrl } = await r2Service.uploadFile(file.buffer, file.originalname, file.mimetype, 'assignments');

    const assignment = await assignmentRepository.create({
      title: data.title,
      description: data.description ?? '',
      courseCode: data.courseCode ?? '',
      levels: data.levels,
      dueDate: new Date(data.dueDate),
      fileUrl,
      fileId,
      lecturerId: new Types.ObjectId(lecturerId),
      departmentIds: departmentIds.map((id) => new Types.ObjectId(id)),
    });
    logger.info(`Assignment created: ${assignment.title}`);
    return assignment;
  }

  async getAssignments(
    query: IPaginationQuery,
    requester: IRequester,
  ): Promise<IPaginationResult<AssignmentWithSubmission>> {
    const { page = 1, limit = 20, search, sort = 'createdAt', order = 'desc', departmentId, level } = query;
    const filter: FilterQuery<IAssignmentDocument> = {};

    if (requester.role === ROLES.STUDENT) {
      filter.departmentIds = requester.departmentId;
      if (requester.level) filter.levels = requester.level;
    } else if (requester.role === ROLES.LECTURER) {
      filter.lecturerId = requester.id;
      if (departmentId) filter.departmentIds = departmentId;
      if (level) filter.levels = level;
    } else if (requester.role === ROLES.DEPARTMENT_ADMIN) {
      filter.departmentIds = requester.departmentId;
      if (level) filter.levels = level;
    } else {
      if (departmentId) filter.departmentIds = departmentId;
      if (level) filter.levels = level;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { courseCode: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const { data, total } = await assignmentRepository.findPaginated(filter, page, limit, { [sort]: sortOrder });
    const ids = data.map((a) => a._id.toString());

    let enriched: AssignmentWithSubmission[];
    if (requester.role === ROLES.STUDENT) {
      const mine = await submissionRepository.findByStudentAndAssignments(requester.id, ids);
      const byAssignment = new Map(mine.map((s) => [s.assignmentId.toString(), s]));
      enriched = data.map((a) => ({
        ...a.toJSON(),
        mySubmission: byAssignment.get(a._id.toString())?.toJSON() ?? null,
      }));
    } else {
      const counts = await submissionRepository.countByAssignments(ids);
      enriched = data.map((a) => ({ ...a.toJSON(), submissionCount: counts[a._id.toString()] ?? 0 }));
    }

    return buildPaginationResult(enriched, total, page, limit);
  }

  async getAssignmentById(id: string, requester: IRequester): Promise<AssignmentWithSubmission> {
    const assignment = await assignmentRepository.findById(id);
    if (!assignment) throw new AppError('Assignment not found', HTTP_STATUS.NOT_FOUND);

    if (requester.role === ROLES.STUDENT) {
      this.assertStudentCanSee(assignment, requester);
      const mine = await submissionRepository.findByAssignmentAndStudent(id, requester.id);
      return { ...assignment.toJSON(), mySubmission: mine?.toJSON() ?? null };
    }

    if (requester.role === ROLES.LECTURER || requester.role === ROLES.DEPARTMENT_ADMIN) {
      this.assertStaffAccess(assignment, requester, 'access');
    }
    const counts = await submissionRepository.countByAssignments([id]);
    return { ...assignment.toJSON(), submissionCount: counts[id] ?? 0 };
  }

  async updateAssignment(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      courseCode: string;
      levels: string[];
      dueDate: string;
      departmentIds: string[];
    }>,
    file: Express.Multer.File | undefined,
    requester: IRequester,
  ): Promise<IAssignmentDocument> {
    const assignment = await assignmentRepository.findById(id);
    if (!assignment) throw new AppError('Assignment not found', HTTP_STATUS.NOT_FOUND);
    this.assertStaffAccess(assignment, requester, 'update');

    const update: Partial<IAssignmentDocument> = {};
    if (data.title) update.title = data.title;
    if (data.description !== undefined) update.description = data.description;
    if (data.courseCode !== undefined) update.courseCode = data.courseCode;
    if (data.levels && data.levels.length > 0) update.levels = data.levels;
    if (data.dueDate) update.dueDate = new Date(data.dueDate);
    if (data.departmentIds && data.departmentIds.length > 0) {
      await verifyDepartmentsExist(data.departmentIds);
      update.departmentIds = data.departmentIds.map((d) => new Types.ObjectId(d));
    }

    if (file) {
      await safeDelete(assignment.fileId);
      const { fileId, fileUrl } = await r2Service.uploadFile(file.buffer, file.originalname, file.mimetype, 'assignments');
      update.fileUrl = fileUrl;
      update.fileId = fileId;
    }

    const updated = await assignmentRepository.updateById(id, update);
    logger.info(`Assignment updated: ${id}`);
    return updated!;
  }

  async deleteAssignment(id: string, requester: IRequester): Promise<void> {
    const assignment = await assignmentRepository.findById(id);
    if (!assignment) throw new AppError('Assignment not found', HTTP_STATUS.NOT_FOUND);
    this.assertStaffAccess(assignment, requester, 'delete');

    const submissions = await submissionRepository.deleteByAssignment(id);
    await Promise.all(submissions.map((s) => safeDelete(s.fileId)));
    await safeDelete(assignment.fileId);
    await assignmentRepository.deleteById(id);
    logger.info(`Assignment deleted: ${id}`);
  }

  // ─── Submissions ────────────────────────────────────────────────────────────

  async submitSolution(id: string, file: Express.Multer.File, requester: IRequester): Promise<ISubmissionDocument> {
    const assignment = await assignmentRepository.findById(id);
    if (!assignment) throw new AppError('Assignment not found', HTTP_STATUS.NOT_FOUND);
    this.assertStudentCanSee(assignment, requester);

    const existing = await submissionRepository.findByAssignmentAndStudent(id, requester.id);
    if (existing && existing.score !== null && existing.score !== undefined) {
      throw new AppError('Your submission has already been scored and can no longer be changed', HTTP_STATUS.CONFLICT);
    }

    const { fileId, fileUrl } = await r2Service.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      `submissions/${id}`,
    );

    if (existing) {
      await safeDelete(existing.fileId);
      const updated = await submissionRepository.updateById(existing._id.toString(), {
        fileUrl,
        fileId,
        submittedAt: new Date(),
      });
      logger.info(`Submission replaced: assignment ${id}, student ${requester.id}`);
      return updated!;
    }

    const submission = await submissionRepository.create({
      assignmentId: new Types.ObjectId(id),
      studentId: new Types.ObjectId(requester.id),
      fileUrl,
      fileId,
      submittedAt: new Date(),
    });
    logger.info(`Submission created: assignment ${id}, student ${requester.id}`);
    return submission;
  }

  async getMySubmission(id: string, requester: IRequester): Promise<ISubmissionDocument> {
    const assignment = await assignmentRepository.findById(id);
    if (!assignment) throw new AppError('Assignment not found', HTTP_STATUS.NOT_FOUND);
    this.assertStudentCanSee(assignment, requester);

    const submission = await submissionRepository.findByAssignmentAndStudent(id, requester.id);
    if (!submission) throw new AppError('You have not submitted this assignment', HTTP_STATUS.NOT_FOUND);
    return submission;
  }

  async getSubmissions(id: string, requester: IRequester): Promise<ISubmissionDocument[]> {
    const assignment = await assignmentRepository.findById(id);
    if (!assignment) throw new AppError('Assignment not found', HTTP_STATUS.NOT_FOUND);
    this.assertStaffAccess(assignment, requester, 'view submissions for');
    return submissionRepository.findByAssignment(id);
  }

  async scoreSubmission(
    submissionId: string,
    data: { score: number; feedback?: string | null },
    requester: IRequester,
  ): Promise<ISubmissionDocument> {
    const submission = await submissionRepository.findByIdPopulated(submissionId);
    if (!submission) throw new AppError('Submission not found', HTTP_STATUS.NOT_FOUND);

    const assignment = await assignmentRepository.findById(toIdString(submission.assignmentId));
    if (!assignment) throw new AppError('Assignment not found', HTTP_STATUS.NOT_FOUND);
    this.assertStaffAccess(assignment, requester, 'score submissions for');

    const update: Partial<ISubmissionDocument> = {
      score: data.score,
      gradedAt: new Date(),
    };
    if (data.feedback !== undefined) update.feedback = data.feedback;
    if (requester.role === ROLES.LECTURER) update.gradedBy = new Types.ObjectId(requester.id);

    const updated = await submissionRepository.updateById(submissionId, update);
    logger.info(`Submission scored: ${submissionId} -> ${data.score}/10`);
    return updated!;
  }
}

export const assignmentService = new AssignmentService();
