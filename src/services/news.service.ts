import { Types } from 'mongoose';
import { newsRepository } from '../repositories/news.repository';
import { departmentRepository } from '../repositories/department.repository';
import { r2Service } from './r2.service';
import { INewsDocument } from '../interfaces/news.interface';
import { IPaginationQuery, IPaginationResult } from '../interfaces/pagination.interface';
import { buildPaginationResult } from '../utils/pagination.util';
import { generateSlug } from '../utils/slug.util';
import { logger } from '../utils/logger.util';
import { AppError } from './auth.service';
import { HTTP_STATUS } from '../constants/httpStatus';
import { FilterQuery } from 'mongoose';
import { ROLES, Role } from '../constants/roles';

class NewsService {
  async createNews(
    data: {
      title: string;
      content: string;
      category: string;
      isPublished?: boolean;
      departmentId: string;
    },
    file: Express.Multer.File,
    requesterRole: Role,
    requesterDeptId?: string,
  ): Promise<INewsDocument> {
    if (requesterRole === ROLES.DEPARTMENT_ADMIN && data.departmentId !== requesterDeptId) {
      throw new AppError('You can only add news to your department', HTTP_STATUS.FORBIDDEN);
    }

    const dept = await departmentRepository.findById(data.departmentId);
    if (!dept) throw new AppError('Department not found', HTTP_STATUS.NOT_FOUND);

    const { fileId, fileUrl } = await r2Service.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      'news-images',
    );

    const slug = generateSlug(data.title);
    const publishedAt = data.isPublished ? new Date() : undefined;

    const createData: Partial<INewsDocument> = {
      title: data.title,
      content: data.content,
      category: data.category,
      isPublished: data.isPublished ?? false,
      slug,
      featuredImage: fileUrl,
      featuredImageId: fileId,
      publishedAt,
      departmentId: new Types.ObjectId(data.departmentId),
    };

    const news = await newsRepository.create(createData);
    logger.info(`News created: ${news.title}`);
    return news;
  }

  async getNews(
    query: IPaginationQuery,
    requesterRole: Role | undefined,
    requesterDeptId?: string,
  ): Promise<IPaginationResult<INewsDocument>> {
    const { page = 1, limit = 20, search, sort = 'createdAt', order = 'desc', departmentId, isPublished, category } = query;

    const filter: FilterQuery<INewsDocument> = {};

    if (requesterRole === ROLES.DEPARTMENT_ADMIN || requesterRole === ROLES.STUDENT) {
      filter.departmentId = requesterDeptId;
    } else if (departmentId) {
      filter.departmentId = departmentId;
    }

    if (!requesterRole || requesterRole === ROLES.STUDENT) {
      filter.isPublished = true;
    } else if (isPublished !== undefined) {
      filter.isPublished = isPublished;
    }

    if (category) filter.category = category;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const { data, total } = await newsRepository.findPaginated(filter, page, limit, { [sort]: sortOrder });
    return buildPaginationResult(data, total, page, limit);
  }

  async getNewsById(id: string, requesterRole: Role | undefined, requesterDeptId?: string): Promise<INewsDocument> {
    const news = await newsRepository.findById(id);
    if (!news) throw new AppError('News not found', HTTP_STATUS.NOT_FOUND);

    if (
      (requesterRole === ROLES.DEPARTMENT_ADMIN || requesterRole === ROLES.STUDENT) &&
      news.departmentId.toString() !== requesterDeptId
    ) {
      throw new AppError('You can only access resources in your department', HTTP_STATUS.FORBIDDEN);
    }

    if ((!requesterRole || requesterRole === ROLES.STUDENT) && !news.isPublished) {
      throw new AppError('News not found', HTTP_STATUS.NOT_FOUND);
    }

    return news;
  }

  async getNewsBySlug(slug: string): Promise<INewsDocument> {
    const news = await newsRepository.findBySlug(slug);
    if (!news || !news.isPublished) throw new AppError('News not found', HTTP_STATUS.NOT_FOUND);
    return news;
  }

  async updateNews(
    id: string,
    data: Partial<{ title: string; content: string; category: string; isPublished: boolean }>,
    file: Express.Multer.File | undefined,
    requesterRole: Role,
    requesterDeptId?: string,
  ): Promise<INewsDocument> {
    const news = await newsRepository.findById(id);
    if (!news) throw new AppError('News not found', HTTP_STATUS.NOT_FOUND);

    if (requesterRole === ROLES.DEPARTMENT_ADMIN && news.departmentId.toString() !== requesterDeptId) {
      throw new AppError('You can only update news in your department', HTTP_STATUS.FORBIDDEN);
    }

    const updateData: Partial<INewsDocument> = {};
    if (data.title) {
      updateData.title = data.title;
      if (data.title !== news.title) updateData.slug = generateSlug(data.title);
    }
    if (data.content) updateData.content = data.content;
    if (data.category) updateData.category = data.category;
    if (data.isPublished !== undefined) {
      updateData.isPublished = data.isPublished;
      if (data.isPublished && !news.isPublished) updateData.publishedAt = new Date();
    }

    if (file) {
      if (news.featuredImageId) {
        try {
          await r2Service.deleteFile(news.featuredImageId);
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
      updateData.featuredImage = fileUrl;
      updateData.featuredImageId = fileId;
    }

    const updated = await newsRepository.updateById(id, updateData);
    logger.info(`News updated: ${id}`);
    return updated!;
  }

  async deleteNews(id: string, requesterRole: Role, requesterDeptId?: string): Promise<void> {
    const news = await newsRepository.findById(id);
    if (!news) throw new AppError('News not found', HTTP_STATUS.NOT_FOUND);

    if (requesterRole === ROLES.DEPARTMENT_ADMIN && news.departmentId.toString() !== requesterDeptId) {
      throw new AppError('You can only delete news in your department', HTTP_STATUS.FORBIDDEN);
    }

    if (news.featuredImageId) {
      try {
        await r2Service.deleteFile(news.featuredImageId);
      } catch {
        logger.warn(`Failed to delete news image from Drive`);
      }
    }

    await newsRepository.deleteById(id);
    logger.info(`News deleted: ${id}`);
  }
}

export const newsService = new NewsService();
