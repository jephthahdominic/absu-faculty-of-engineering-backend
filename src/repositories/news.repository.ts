import { FilterQuery } from 'mongoose';
import { BaseRepository } from './base.repository';
import { NewsModel } from '../models/news.model';
import { INewsDocument } from '../interfaces/news.interface';

const AUTHOR_SELECT = 'fullName email';

export class NewsRepository extends BaseRepository<INewsDocument> {
  constructor() {
    super(NewsModel);
  }

  async findById(id: string): Promise<INewsDocument | null> {
    return NewsModel.findById(id)
      .populate('author', AUTHOR_SELECT)
      .populate('updatedBy', AUTHOR_SELECT)
      .exec();
  }

  async findBySlug(slug: string): Promise<INewsDocument | null> {
    return NewsModel.findOne({ slug })
      .populate('author', AUTHOR_SELECT)
      .populate('updatedBy', AUTHOR_SELECT)
      .exec();
  }

  async findPaginated(
    filter: FilterQuery<INewsDocument>,
    page: number,
    limit: number,
    sort: Record<string, 1 | -1>,
  ): Promise<{ data: INewsDocument[]; total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      NewsModel.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('author', AUTHOR_SELECT)
        .populate('updatedBy', AUTHOR_SELECT)
        .exec(),
      NewsModel.countDocuments(filter).exec(),
    ]);
    return { data, total };
  }
}

export const newsRepository = new NewsRepository();
