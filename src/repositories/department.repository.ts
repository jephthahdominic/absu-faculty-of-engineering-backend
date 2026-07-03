import { FilterQuery } from 'mongoose';
import { BaseRepository } from './base.repository';
import { DepartmentModel } from '../models/department.model';
import { IDepartmentDocument } from '../interfaces/department.interface';

export class DepartmentRepository extends BaseRepository<IDepartmentDocument> {
  constructor() {
    super(DepartmentModel);
  }

  async findByCode(code: string): Promise<IDepartmentDocument | null> {
    return DepartmentModel.findOne({ code: code.toUpperCase() }).exec();
  }

  async findAllPublic(): Promise<IDepartmentDocument[]> {
    return DepartmentModel.find({}, 'name code').sort({ name: 1 }).exec();
  }

  async findPaginated(
    filter: FilterQuery<IDepartmentDocument>,
    page: number,
    limit: number,
    sort: Record<string, 1 | -1>,
  ): Promise<{ data: IDepartmentDocument[]; total: number }> {
    return this.paginate(filter, page, limit, sort);
  }
}

export const departmentRepository = new DepartmentRepository();
