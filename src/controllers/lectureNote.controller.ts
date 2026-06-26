import { Request, Response } from 'express';
import { lectureNoteService } from '../services/lectureNote.service';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response.util';
import { asyncHandler } from '../utils/asyncHandler.util';
import { parsePaginationQuery } from '../utils/pagination.util';
import { LECTURE_NOTE_MESSAGES } from '../constants/messages';
import { Role } from '../constants/roles';
import { AppError } from '../services/auth.service';
import { HTTP_STATUS } from '../constants/httpStatus';

export const createLectureNote = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError('File is required', HTTP_STATUS.BAD_REQUEST);
  }
  const note = await lectureNoteService.createLectureNote(
    req.body,
    req.file,
    req.user!.role as Role,
    req.user!.departmentId?.toString(),
  );
  sendCreated(res, LECTURE_NOTE_MESSAGES.CREATED, note);
});

export const getLectureNotes = asyncHandler(async (req: Request, res: Response) => {
  const query = parsePaginationQuery(req.query as Record<string, unknown>);
  const result = await lectureNoteService.getLectureNotes(query, req.user!.role as Role, req.user!.departmentId?.toString());
  sendPaginated(res, LECTURE_NOTE_MESSAGES.FETCHED, result.data, result.pagination);
});

export const getLectureNoteById = asyncHandler(async (req: Request, res: Response) => {
  const note = await lectureNoteService.getLectureNoteById(
    req.params.id,
    req.user!.role as Role,
    req.user!.departmentId?.toString(),
  );
  sendSuccess(res, LECTURE_NOTE_MESSAGES.FETCHED_ONE, note);
});

export const updateLectureNote = asyncHandler(async (req: Request, res: Response) => {
  const note = await lectureNoteService.updateLectureNote(
    req.params.id,
    req.body,
    req.file,
    req.user!.role as Role,
    req.user!.departmentId?.toString(),
  );
  sendSuccess(res, LECTURE_NOTE_MESSAGES.UPDATED, note);
});

export const deleteLectureNote = asyncHandler(async (req: Request, res: Response) => {
  await lectureNoteService.deleteLectureNote(req.params.id, req.user!.role as Role, req.user!.departmentId?.toString());
  sendSuccess(res, LECTURE_NOTE_MESSAGES.DELETED);
});
