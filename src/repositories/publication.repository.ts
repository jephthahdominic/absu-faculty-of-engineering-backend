import { FilterQuery } from 'mongoose';
import { BaseRepository } from './base.repository';
import { PublicationModel } from '../models/publication.model';
import { IPublicationDocument } from '../interfaces/publication.interface';

export class PublicationRepository extends BaseRepository<IPublicationDocument> {
  constructor() {
    super(PublicationModel);
  }

  async findPaginated(
    filter: FilterQuery<IPublicationDocument>,
    page: number,
    limit: number,
    sort: Record<string, 1 | -1>,
  ): Promise<{ data: IPublicationDocument[]; total: number }> {
    return this.paginate(filter, page, limit, sort, ['lecturerId', 'departmentId']);
  }
}

export const publicationRepository = new PublicationRepository();
