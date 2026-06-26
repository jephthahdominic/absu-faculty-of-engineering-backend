import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { sendError } from '../utils/response.util';
import { HTTP_STATUS } from '../constants/httpStatus';
import { COMMON_MESSAGES } from '../constants/messages';

export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.type === 'field' ? err.path : 'unknown',
      message: err.msg,
    }));

    sendError(res, COMMON_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST, formattedErrors);
    return;
  }

  next();
};
