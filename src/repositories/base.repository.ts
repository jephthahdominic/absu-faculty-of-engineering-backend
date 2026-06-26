import { Document, FilterQuery, Model, UpdateQuery, QueryOptions } from 'mongoose';

export abstract class BaseRepository<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filter).exec();
  }

  async findAll(
    filter: FilterQuery<T> = {},
    options: QueryOptions = {},
  ): Promise<T[]> {
    return this.model.find(filter, null, options).exec();
  }

  async create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }

  async updateById(id: string, update: UpdateQuery<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, update, { new: true, runValidators: true }).exec();
  }

  async deleteById(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec();
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }

  async exists(filter: FilterQuery<T>): Promise<boolean> {
    const doc = await this.model.exists(filter);
    return doc !== null;
  }

  async paginate(
    filter: FilterQuery<T>,
    page: number,
    limit: number,
    sort: Record<string, 1 | -1>,
    populate?: string | string[],
  ): Promise<{ data: T[]; total: number }> {
    const skip = (page - 1) * limit;
    let query = this.model.find(filter).sort(sort).skip(skip).limit(limit);
    if (populate) {
      if (Array.isArray(populate)) {
        populate.forEach((p) => { query = query.populate(p); });
      } else {
        query = query.populate(populate);
      }
    }
    const [data, total] = await Promise.all([query.exec(), this.model.countDocuments(filter).exec()]);
    return { data, total };
  }
}
