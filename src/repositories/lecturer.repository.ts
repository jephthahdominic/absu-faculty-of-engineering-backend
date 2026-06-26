import { FilterQuery } from 'mongoose';
import { BaseRepository } from './base.repository';
import { LecturerModel } from '../models/lecturer.model';
import { ILecturerDocument } from '../interfaces/lecturer.interface';

export class LecturerRepository extends BaseRepository<ILecturerDocument> {
  constructor() {
    super(LecturerModel);
  }

  async findByEmail(email: string): Promise<ILecturerDocument | null> {
    return LecturerModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findPaginated(
    filter: FilterQuery<ILecturerDocument>,
    page: number,
    limit: number,
    sort: Record<string, 1 | -1>,
  ): Promise<{ data: ILecturerDocument[]; total: number }> {
    return this.paginate(filter, page, limit, sort, 'departmentId');
  }
}

export const lecturerRepository = new LecturerRepository();
