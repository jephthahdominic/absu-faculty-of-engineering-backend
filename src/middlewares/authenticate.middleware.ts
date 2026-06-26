import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/token.util';
import { userRepository } from '../repositories/user.repository';
import { studentRepository } from '../repositories/student.repository';
import { sendError } from '../utils/response.util';
import { HTTP_STATUS } from '../constants/httpStatus';
import { AUTH_MESSAGES } from '../constants/messages';
import { ROLES } from '../constants/roles';
import { logger } from '../utils/logger.util';

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, AUTH_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const token = authHeader.split(' ')[1];

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      sendError(res, AUTH_MESSAGES.TOKEN_INVALID, HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const user = payload.role === ROLES.STUDENT
      ? await studentRepository.findById(payload.userId)
      : await userRepository.findById(payload.userId);

    if (!user) {
      sendError(res, AUTH_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    if (!user.isActive) {
      sendError(res, AUTH_MESSAGES.ACCOUNT_DISABLED, HTTP_STATUS.FORBIDDEN);
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error(`Authentication error: ${error}`);
    sendError(res, AUTH_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
  }
};
