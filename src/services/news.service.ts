import { Types, FilterQuery } from 'mongoose';
import { newsRepository } from '../repositories/news.repository';
import { r2Service } from './r2.service';
import { INewsDocument, NewsCategory } from '../interfaces/news.interface';
import { IPaginationResult } from '../interfaces/pagination.interface';
import { buildPaginationResult } from '../utils/pagination.util';
import { sanitizeContent } from '../utils/sanitize.util';
import { logger } from '../utils/logger.util';
import { AppError } from './auth.service';
import { HTTP_STATUS } from '../constants/httpStatus';

export interface INewsQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  sort?: string;
}

export interface ICreateNewsPayload {
  title: string;
  summary?: string;
  content: string;
  category?: NewsCategory;
  isFeatured?: boolean;
  isPublished?: boolean;
  publishedAt?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export type IUpdateNewsPayload = Partial<ICreateNewsPayload>;

const parseSort = (sort?: string): Record<string, 1 | -1> => {
  const value = sort?.trim() || '-createdAt';
  if (value.startsWith('-')) {
    return { [value.slice(1)]: -1 };
  }
  return { [value]: 1 };
};

const buildBaseFilter = (query: INewsQuery): FilterQuery<INewsDocument> => {
  const filter: FilterQuery<INewsDocument> = {};

  if (query.category) filter.category = query.category;
  if (query.isFeatured !== undefined) filter.isFeatured = query.isFeatured;

  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: 'i' } },
      { content: { $regex: query.search, $options: 'i' } },
      { summary: { $regex: query.search, $options: 'i' } },
    ];
  }

  return filter;
};

class NewsService {
  async createNews(
    data: ICreateNewsPayload,
    authorId: string,
    file?: Express.Multer.File,
  ): Promise<INewsDocument> {
    const createData: Partial<INewsDocument> = {
      title: data.title,
      summary: data.summary,
      content: sanitizeContent(data.content),
      category: data.category,
      isFeatured: data.isFeatured ?? false,
      isPublished: data.isPublished ?? false,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      author: new Types.ObjectId(authorId),
    };

    if (file) {
      const { fileId, fileUrl } = await r2Service.uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype,
        'news-images',
      );
      createData.imageUrl = fileUrl;
      createData.imageId = fileId;
    }

    const news = await newsRepository.create(createData);
    logger.info(`News created: ${news.title}`);
    return newsRepository.findById(news._id.toString()) as Promise<INewsDocument>;
  }

  async updateNews(
    id: string,
    data: IUpdateNewsPayload,
    updatedById: string,
    file?: Express.Multer.File,
  ): Promise<INewsDocument> {
    const news = await newsRepository.findById(id);
    if (!news) throw new AppError('News not found', HTTP_STATUS.NOT_FOUND);

    if (data.title !== undefined) news.title = data.title;
    if (data.summary !== undefined) news.summary = data.summary;
    if (data.content !== undefined) news.content = sanitizeContent(data.content);
    if (data.category !== undefined) news.category = data.category;
    if (data.isFeatured !== undefined) news.isFeatured = data.isFeatured;
    if (data.metaTitle !== undefined) news.metaTitle = data.metaTitle;
    if (data.metaDescription !== undefined) news.metaDescription = data.metaDescription;
    if (data.publishedAt !== undefined) news.publishedAt = new Date(data.publishedAt);
    if (data.isPublished !== undefined) news.isPublished = data.isPublished;

    if (file) {
      if (news.imageId) {
        try {
          await r2Service.deleteFile(news.imageId);
        } catch {
          logger.warn(`Failed to delete old news image`);
        }
      }
      const { fileId, fileUrl } = await r2Service.uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype,
        'news-images',
      );
      news.imageUrl = fileUrl;
      news.imageId = fileId;
    }

    news.updatedBy = new Types.ObjectId(updatedById);

    await news.save();
    logger.info(`News updated: ${id}`);
    return newsRepository.findById(id) as Promise<INewsDocument>;
  }

  async deleteNews(id: string): Promise<void> {
    const news = await newsRepository.findById(id);
    if (!news) throw new AppError('News not found', HTTP_STATUS.NOT_FOUND);

    if (news.imageId) {
      try {
        await r2Service.deleteFile(news.imageId);
      } catch {
        logger.warn(`Failed to delete news image from R2`);
      }
    }

    await newsRepository.deleteById(id);
    logger.info(`News deleted: ${id}`);
  }

  async getNewsById(id: string): Promise<INewsDocument> {
    const news = await newsRepository.findById(id);
    if (!news) throw new AppError('News not found', HTTP_STATUS.NOT_FOUND);
    return news;
  }

  async getNewsBySlug(slug: string): Promise<INewsDocument> {
    const news = await newsRepository.findBySlug(slug);
    if (!news || !news.isPublished) throw new AppError('News not found', HTTP_STATUS.NOT_FOUND);
    return news;
  }

  async getAllNews(query: INewsQuery): Promise<IPaginationResult<INewsDocument>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const filter = buildBaseFilter(query);
    if (query.isPublished !== undefined) filter.isPublished = query.isPublished;

    const sort = parseSort(query.sort);
    const { data, total } = await newsRepository.findPaginated(filter, page, limit, sort);
    return buildPaginationResult(data, total, page, limit);
  }

  async getPublishedNews(query: INewsQuery): Promise<IPaginationResult<INewsDocument>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const filter = buildBaseFilter(query);
    filter.isPublished = true;

    const sort = parseSort(query.sort);
    const { data, total } = await newsRepository.findPaginated(filter, page, limit, sort);
    return buildPaginationResult(data, total, page, limit);
  }
}

export const newsService = new NewsService();
