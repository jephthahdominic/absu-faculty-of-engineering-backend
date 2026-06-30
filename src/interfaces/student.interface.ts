import { Document, Types } from 'mongoose';
import { IDepartment } from './department.interface';

export interface IStudent {
  fullName: string;
  email: string;
  password: string;
  role: string;
  matricNumber: string;
  level: string;
  departmentId: Types.ObjectId | IDepartment;
  profileImage?: string;
  profileImageId?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IStudentDocument extends IStudent, Document {
  _id: Types.ObjectId;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IStudentResponse {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  matricNumber: string;
  level: string;
  departmentId: IDepartment | Types.ObjectId;
  profileImage?: string | null;
  isActive: boolean;
  lastLogin?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}
