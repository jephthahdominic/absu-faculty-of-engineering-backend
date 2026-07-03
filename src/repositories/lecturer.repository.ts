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

  async findByEmailForAuth(email: string): Promise<ILecturerDocument | null> {
    return LecturerModel.findOne({ email: email.toLowerCase() }).select('+password').populate('departmentId').exec();
  }

  async findByStaffId(staffId: string): Promise<ILecturerDocument | null> {
    return LecturerModel.findOne({ staffId }).exec();
  }

  async findPaginated(
    filter: FilterQuery<ILecturerDocument>,
    page: number,
    limit: number,
    sort: Record<string, 1 | -1>,
  ): Promise<{ data: ILecturerDocument[]; total: number }> {
    return this.paginate(filter, page, limit, sort, 'departmentId');
  }

  async updateLastLogin(id: string): Promise<void> {
    await LecturerModel.findByIdAndUpdate(id, { lastLogin: new Date() }).exec();
  }

  async findByIdWithPassword(id: string): Promise<ILecturerDocument | null> {
    return LecturerModel.findById(id).select('+password').exec();
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await LecturerModel.findByIdAndUpdate(id, { password: hashedPassword }).exec();
  }
}

export const lecturerRepository = new LecturerRepository();
