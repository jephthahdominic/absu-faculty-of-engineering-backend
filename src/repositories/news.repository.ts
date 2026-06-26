import { FilterQuery } from 'mongoose';
import { BaseRepository } from './base.repository';
import { NewsModel } from '../models/news.model';
import { INewsDocument } from '../interfaces/news.interface';

export class NewsRepository extends BaseRepository<INewsDocument> {
  constructor() {
    super(NewsModel);
  }

  async findBySlug(slug: string): Promise<INewsDocument | null> {
    return NewsModel.findOne({ slug }).exec();
  }

  async findPaginated(
    filter: FilterQuery<INewsDocument>,
    page: number,
    limit: number,
    sort: Record<string, 1 | -1>,
  ): Promise<{ data: INewsDocument[]; total: number }> {
    return this.paginate(filter, page, limit, sort, 'departmentId');
  }
}

export const newsRepository = new NewsRepository();
