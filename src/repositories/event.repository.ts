import { FilterQuery } from 'mongoose';
import { BaseRepository } from './base.repository';
import { EventModel } from '../models/event.model';
import { IEventDocument } from '../interfaces/event.interface';

export class EventRepository extends BaseRepository<IEventDocument> {
  constructor() {
    super(EventModel);
  }

  async findBySlug(slug: string): Promise<IEventDocument | null> {
    return EventModel.findOne({ slug }).exec();
  }

  async findPaginated(
    filter: FilterQuery<IEventDocument>,
    page: number,
    limit: number,
    sort: Record<string, 1 | -1>,
  ): Promise<{ data: IEventDocument[]; total: number }> {
    return this.paginate(filter, page, limit, sort, 'departmentId');
  }
}

export const eventRepository = new EventRepository();
