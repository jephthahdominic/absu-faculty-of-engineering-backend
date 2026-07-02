import { Request, Response } from 'express';
import { newsService, INewsQuery } from '../services/news.service';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response.util';
import { asyncHandler } from '../utils/asyncHandler.util';
import { NEWS_MESSAGES } from '../constants/messages';
import { ROLES, Role } from '../constants/roles';

const parseNewsQuery = (query: Record<string, unknown>): INewsQuery => {
  return {
    page: query.page ? parseInt(String(query.page), 10) : undefined,
    limit: query.limit ? parseInt(String(query.limit), 10) : undefined,
    search: query.search ? String(query.search).trim() : undefined,
    category: query.category ? String(query.category) : undefined,
    isPublished: query.isPublished !== undefined ? query.isPublished === 'true' : undefined,
    isFeatured: query.isFeatured !== undefined ? query.isFeatured === 'true' : undefined,
    sort: query.sort ? String(query.sort) : undefined,
  };
};

export const createNews = asyncHandler(async (req: Request, res: Response) => {
  const news = await newsService.createNews(req.body, req.user!._id.toString(), req.file);
  sendCreated(res, NEWS_MESSAGES.CREATED, news);
});

export const updateNews = asyncHandler(async (req: Request, res: Response) => {
  const news = await newsService.updateNews(
    req.params.id,
    req.body,
    req.user!._id.toString(),
    req.file,
  );
  sendSuccess(res, NEWS_MESSAGES.UPDATED, news);
});

export const deleteNews = asyncHandler(async (req: Request, res: Response) => {
  await newsService.deleteNews(req.params.id);
  sendSuccess(res, NEWS_MESSAGES.DELETED);
});

export const getNewsById = asyncHandler(async (req: Request, res: Response) => {
  const news = await newsService.getNewsById(req.params.id);
  sendSuccess(res, NEWS_MESSAGES.FETCHED_ONE, news);
});

export const getNewsBySlug = asyncHandler(async (req: Request, res: Response) => {
  const news = await newsService.getNewsBySlug(req.params.slug);
  sendSuccess(res, NEWS_MESSAGES.FETCHED_ONE, news);
});

export const getNews = asyncHandler(async (req: Request, res: Response) => {
  const query = parseNewsQuery(req.query as Record<string, unknown>);
  const role = req.user?.role as Role | undefined;

  const result =
    role === ROLES.DEAN || role === ROLES.SUPER_ADMIN
      ? await newsService.getAllNews(query)
      : await newsService.getPublishedNews(query);

  sendPaginated(res, NEWS_MESSAGES.FETCHED, result.data, result.pagination);
});
