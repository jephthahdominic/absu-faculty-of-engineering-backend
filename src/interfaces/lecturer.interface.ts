import { Document, Types } from 'mongoose';
import { IDepartment } from './department.interface';

export interface ILecturer {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  staffId: string;
  designation: string;
  role: string;
  profileImage?: string;
  profileImageId?: string;
  bio?: string;
  departmentId: Types.ObjectId | IDepartment;
  isVerified: boolean;
  verifiedBy?: Types.ObjectId;
  verifiedAt?: Date;
  isActive: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ILecturerDocument extends ILecturer, Document {
  _id: Types.ObjectId;
  comparePassword(candidatePassword: string): Promise<boolean>;
}
