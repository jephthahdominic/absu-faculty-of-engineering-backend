import { FilterQuery } from 'mongoose';
import { BaseRepository } from './base.repository';
import { StudentModel } from '../models/student.model';
import { IStudentDocument } from '../interfaces/student.interface';

export class StudentRepository extends BaseRepository<IStudentDocument> {
  constructor() {
    super(StudentModel);
  }

  async findById(id: string): Promise<IStudentDocument | null> {
    return StudentModel.findById(id).populate('departmentId').exec();
  }

  async findByEmail(email: string): Promise<IStudentDocument | null> {
    return StudentModel.findOne({ email: email.toLowerCase() }).select('+password').exec();
  }

  async findByEmailWithoutPassword(email: string): Promise<IStudentDocument | null> {
    return StudentModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findByMatricNumber(matricNumber: string): Promise<IStudentDocument | null> {
    return StudentModel.findOne({ matricNumber }).select('+password').populate('departmentId').exec();
  }

  async findByIdWithPassword(id: string): Promise<IStudentDocument | null> {
    return StudentModel.findById(id).select('+password').exec();
  }

  async findPaginated(
    filter: FilterQuery<IStudentDocument>,
    page: number,
    limit: number,
    sort: Record<string, 1 | -1>,
  ): Promise<{ data: IStudentDocument[]; total: number }> {
    return this.paginate(filter, page, limit, sort, 'departmentId');
  }

  async updateLastLogin(id: string): Promise<void> {
    await StudentModel.findByIdAndUpdate(id, { lastLogin: new Date() }).exec();
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await StudentModel.findByIdAndUpdate(id, { password: hashedPassword }).exec();
  }
}

export const studentRepository = new StudentRepository();
