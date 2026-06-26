import { Request, Response } from 'express';
import { lecturerService } from '../services/lecturer.service';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response.util';
import { asyncHandler } from '../utils/asyncHandler.util';
import { parsePaginationQuery } from '../utils/pagination.util';
import { LECTURER_MESSAGES } from '../constants/messages';
import { Role } from '../constants/roles';

export const createLecturer = asyncHandler(async (req: Request, res: Response) => {
  const lecturer = await lecturerService.createLecturer(
    req.body,
    req.user!.role as Role,
    req.user!.departmentId?.toString(),
  );
  sendCreated(res, LECTURER_MESSAGES.CREATED, lecturer);
});

export const getLecturers = asyncHandler(async (req: Request, res: Response) => {
  const query = parsePaginationQuery(req.query as Record<string, unknown>);
  const result = await lecturerService.getLecturers(query, req.user!.role as Role, req.user!.departmentId?.toString());
  sendPaginated(res, LECTURER_MESSAGES.FETCHED, result.data, result.pagination);
});

export const getLecturerById = asyncHandler(async (req: Request, res: Response) => {
  const lecturer = await lecturerService.getLecturerById(
    req.params.id,
    req.user!.role as Role,
    req.user!.departmentId?.toString(),
  );
  sendSuccess(res, LECTURER_MESSAGES.FETCHED_ONE, lecturer);
});

export const updateLecturer = asyncHandler(async (req: Request, res: Response) => {
  const lecturer = await lecturerService.updateLecturer(
    req.params.id,
    req.body,
    req.user!.role as Role,
    req.user!.departmentId?.toString(),
  );
  sendSuccess(res, LECTURER_MESSAGES.UPDATED, lecturer);
});

export const deleteLecturer = asyncHandler(async (req: Request, res: Response) => {
  await lecturerService.deleteLecturer(req.params.id, req.user!.role as Role, req.user!.departmentId?.toString());
  sendSuccess(res, LECTURER_MESSAGES.DELETED);
});

export const updateLecturerProfileImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw new Error('No file provided');
  const lecturer = await lecturerService.updateProfileImage(
    req.params.id,
    req.file,
    req.user!.role as Role,
    req.user!.departmentId?.toString(),
  );
  sendSuccess(res, 'Lecturer profile image updated', lecturer);
});
