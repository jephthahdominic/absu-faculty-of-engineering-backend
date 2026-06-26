import { Request, Response } from 'express';
import { eventService } from '../services/event.service';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response.util';
import { asyncHandler } from '../utils/asyncHandler.util';
import { parsePaginationQuery } from '../utils/pagination.util';
import { EVENT_MESSAGES } from '../constants/messages';
import { Role } from '../constants/roles';
import { AppError } from '../services/auth.service';
import { HTTP_STATUS } from '../constants/httpStatus';

export const createEvent = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError('Featured image is required', HTTP_STATUS.BAD_REQUEST);
  }
  const event = await eventService.createEvent(
    { ...req.body, eventDate: new Date(req.body.eventDate) },
    req.file,
    req.user!.role as Role,
    req.user!.departmentId?.toString(),
  );
  sendCreated(res, EVENT_MESSAGES.CREATED, event);
});

export const getEvents = asyncHandler(async (req: Request, res: Response) => {
  const query = parsePaginationQuery(req.query as Record<string, unknown>);
  const result = await eventService.getEvents(query, req.user!.role as Role, req.user!.departmentId?.toString());
  sendPaginated(res, EVENT_MESSAGES.FETCHED, result.data, result.pagination);
});

export const getEventById = asyncHandler(async (req: Request, res: Response) => {
  const event = await eventService.getEventById(
    req.params.id,
    req.user!.role as Role,
    req.user!.departmentId?.toString(),
  );
  sendSuccess(res, EVENT_MESSAGES.FETCHED_ONE, event);
});

export const updateEvent = asyncHandler(async (req: Request, res: Response) => {
  const updateData = { ...req.body };
  if (updateData.eventDate) updateData.eventDate = new Date(updateData.eventDate);
  const event = await eventService.updateEvent(
    req.params.id,
    updateData,
    req.file,
    req.user!.role as Role,
    req.user!.departmentId?.toString(),
  );
  sendSuccess(res, EVENT_MESSAGES.UPDATED, event);
});

export const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
  await eventService.deleteEvent(req.params.id, req.user!.role as Role, req.user!.departmentId?.toString());
  sendSuccess(res, EVENT_MESSAGES.DELETED);
});
