import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.util';
import { HTTP_STATUS } from '../constants/httpStatus';
import { AUTH_MESSAGES } from '../constants/messages';
import { Role } from '../constants/roles';

export const authorize = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, AUTH_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    if (!roles.includes(req.user.role as Role)) {
      sendError(res, AUTH_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
      return;
    }

    next();
  };
};
