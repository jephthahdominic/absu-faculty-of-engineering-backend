import { Request, Response } from 'express';
import { newsService } from '../services/news.service';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response.util';
import { asyncHandler } from '../utils/asyncHandler.util';
import { parsePaginationQuery } from '../utils/pagination.util';
import { NEWS_MESSAGES } from '../constants/messages';
import { Role } from '../constants/roles';
import { AppError } from '../services/auth.service';
import { HTTP_STATUS } from '../constants/httpStatus';

export const createNews = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError('Featured image is required', HTTP_STATUS.BAD_REQUEST);
  }
  const news = await newsService.createNews(
    req.body,
    req.file,
    req.user!.role as Role,
    req.user!.departmentId?.toString(),
  );
  sendCreated(res, NEWS_MESSAGES.CREATED, news);
});

export const getNews = asyncHandler(async (req: Request, res: Response) => {
  const query = parsePaginationQuery(req.query as Record<string, unknown>);
  const result = await newsService.getNews(query, req.user?.role as Role | undefined, req.user?.departmentId?.toString());
  sendPaginated(res, NEWS_MESSAGES.FETCHED, result.data, result.pagination);
});

export const getNewsById = asyncHandler(async (req: Request, res: Response) => {
  const news = await newsService.getNewsById(
    req.params.id,
    req.user?.role as Role | undefined,
    req.user?.departmentId?.toString(),
  );
  sendSuccess(res, NEWS_MESSAGES.FETCHED_ONE, news);
});

export const getNewsBySlug = asyncHandler(async (req: Request, res: Response) => {
  const news = await newsService.getNewsBySlug(req.params.slug);
  sendSuccess(res, NEWS_MESSAGES.FETCHED_ONE, news);
});

export const updateNews = asyncHandler(async (req: Request, res: Response) => {
  const news = await newsService.updateNews(
    req.params.id,
    req.body,
    req.file,
    req.user!.role as Role,
    req.user!.departmentId?.toString(),
  );
  sendSuccess(res, NEWS_MESSAGES.UPDATED, news);
});

export const deleteNews = asyncHandler(async (req: Request, res: Response) => {
  await newsService.deleteNews(req.params.id, req.user!.role as Role, req.user!.departmentId?.toString());
  sendSuccess(res, NEWS_MESSAGES.DELETED);
});
