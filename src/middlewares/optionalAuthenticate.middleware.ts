import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/token.util';
import { userRepository } from '../repositories/user.repository';
import { studentRepository } from '../repositories/student.repository';
import { lecturerRepository } from '../repositories/lecturer.repository';
import { ROLES } from '../constants/roles';
import { logger } from '../utils/logger.util';

export const optionalAuthenticate = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    const user = payload.role === ROLES.STUDENT
      ? await studentRepository.findById(payload.userId)
      : payload.role === ROLES.LECTURER
        ? await lecturerRepository.findById(payload.userId)
        : await userRepository.findById(payload.userId);

    if (user && user.isActive) {
      if (
        user.departmentId &&
        typeof user.departmentId === 'object' &&
        '_id' in (user.departmentId as object)
      ) {
        (user as unknown as Record<string, unknown>).departmentId = (user.departmentId as { _id: unknown })._id;
      }
      req.user = user;
    }

    next();
  } catch (error) {
    logger.warn(`Optional authentication skipped: ${error}`);
    next();
  }
};
