import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.util';
import { HTTP_STATUS } from '../constants/httpStatus';
import { COMMON_MESSAGES } from '../constants/messages';
import { ROLES } from '../constants/roles';

export const departmentAccess = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    sendError(res, 'Unauthorized', HTTP_STATUS.UNAUTHORIZED);
    return;
  }

  if (req.user.role === ROLES.SUPER_ADMIN) {
    next();
    return;
  }

  const requestedDeptId = req.params.departmentId || req.query.departmentId || req.body.departmentId;

  if (!requestedDeptId) {
    next();
    return;
  }

  const userDeptId = req.user.departmentId?.toString();

  if (!userDeptId) {
    sendError(res, COMMON_MESSAGES.DEPARTMENT_ACCESS_DENIED, HTTP_STATUS.FORBIDDEN);
    return;
  }

  if (requestedDeptId.toString() !== userDeptId) {
    sendError(res, COMMON_MESSAGES.DEPARTMENT_ACCESS_DENIED, HTTP_STATUS.FORBIDDEN);
    return;
  }

  next();
};
