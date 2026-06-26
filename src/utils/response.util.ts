import { Response } from 'express';
import { HTTP_STATUS } from '../constants/httpStatus';

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode: number = HTTP_STATUS.OK,
): Response => {
  const response: ApiResponse<T> = { success: true, message };
  if (data !== undefined) response.data = data;
  return res.status(statusCode).json(response);
};

export const sendCreated = <T>(res: Response, message: string, data?: T): Response => {
  return sendSuccess(res, message, data, HTTP_STATUS.CREATED);
};

export const sendPaginated = <T>(
  res: Response,
  message: string,
  data: T[],
  pagination: ApiResponse['pagination'],
): Response => {
  const response: ApiResponse<T[]> = { success: true, message, data, pagination };
  return res.status(HTTP_STATUS.OK).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  errors: unknown[] = [],
): Response => {
  const response: ApiResponse = { success: false, message, errors };
  return res.status(statusCode).json(response);
};
