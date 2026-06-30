import { Request, Response } from 'express';
import { academicSessionService } from '../services/academicSession.service';
import { sendSuccess } from '../utils/response.util';
import { asyncHandler } from '../utils/asyncHandler.util';
import { ACADEMIC_SESSION_MESSAGES } from '../constants/messages';

export const updateSession = asyncHandler(async (req: Request, res: Response) => {
  const session = await academicSessionService.updateSession(
    req.body.session,
    req.user!._id.toString(),
  );
  sendSuccess(res, ACADEMIC_SESSION_MESSAGES.UPDATED, session);
});

export const getCurrentSession = asyncHandler(async (req: Request, res: Response) => {
  const session = await academicSessionService.getCurrentSession();
  sendSuccess(res, ACADEMIC_SESSION_MESSAGES.FETCHED, session);
});
