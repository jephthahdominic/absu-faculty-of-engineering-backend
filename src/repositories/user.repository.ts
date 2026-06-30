import { FilterQuery } from 'mongoose';
import { BaseRepository } from './base.repository';
import { UserModel } from '../models/user.model';
import { IUserDocument } from '../interfaces/user.interface';

export class UserRepository extends BaseRepository<IUserDocument> {
  constructor() {
    super(UserModel);
  }

  async findById(id: string): Promise<IUserDocument | null> {
    return UserModel.findById(id).populate('departmentId').exec();
  }

  async findByEmail(email: string): Promise<IUserDocument | null> {
    return UserModel.findOne({ email: email.toLowerCase() }).select('+password').populate('departmentId').exec();
  }

  async findByEmailWithoutPassword(email: string): Promise<IUserDocument | null> {
    return UserModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findByMatricNumber(matricNumber: string): Promise<IUserDocument | null> {
    return UserModel.findOne({ matricNumber }).exec();
  }

  async findByIdWithPassword(id: string): Promise<IUserDocument | null> {
    return UserModel.findById(id).select('+password').exec();
  }

  async findPaginated(
    filter: FilterQuery<IUserDocument>,
    page: number,
    limit: number,
    sort: Record<string, 1 | -1>,
  ): Promise<{ data: IUserDocument[]; total: number }> {
    return this.paginate(filter, page, limit, sort, 'departmentId');
  }

  async updateLastLogin(id: string): Promise<void> {
    await UserModel.findByIdAndUpdate(id, { lastLogin: new Date() }).exec();
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await UserModel.findByIdAndUpdate(id, { password: hashedPassword }).exec();
  }
}

export const userRepository = new UserRepository();
