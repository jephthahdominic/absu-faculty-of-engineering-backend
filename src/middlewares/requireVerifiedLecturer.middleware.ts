import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.util';
import { HTTP_STATUS } from '../constants/httpStatus';
import { LECTURER_MESSAGES } from '../constants/messages';
import { ROLES } from '../constants/roles';

export const requireVerifiedLecturer = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user?.role === ROLES.LECTURER && !req.user.isVerified) {
    sendError(res, LECTURER_MESSAGES.PENDING_VERIFICATION, HTTP_STATUS.FORBIDDEN);
    return;
  }
  next();
};
