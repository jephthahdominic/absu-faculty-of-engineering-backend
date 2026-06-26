import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import { HTTP_STATUS } from '../constants/httpStatus';
import { logger } from '../utils/logger.util';
import { AppError } from '../services/auth.service';

interface ErrorResponse {
  success: boolean;
  message: string;
  errors: unknown[];
  stack?: string;
}

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction): void => {
  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
  });

  const response: ErrorResponse = {
    success: false,
    message: err.message || 'Internal server error',
    errors: [],
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ ...response, errors: err.errors });
    return;
  }

  if (err instanceof MongooseError.ValidationError) {
    const errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
      ...response,
      message: 'Validation error',
      errors,
    });
    return;
  }

  if (err instanceof MongooseError.CastError) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      ...response,
      message: `Invalid ${err.path}: ${err.value}`,
    });
    return;
  }

  if ((err as { code?: number }).code === 11000) {
    const field = Object.keys((err as { keyValue?: Record<string, unknown> }).keyValue || {})[0];
    res.status(HTTP_STATUS.CONFLICT).json({
      ...response,
      message: `${field} already exists`,
    });
    return;
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      ...response,
      message: 'Invalid or expired token',
    });
    return;
  }

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(response);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    errors: [],
  });
};
