import { Document, Types } from 'mongoose';
import { Role } from '../constants/roles';
import { IDepartment } from './department.interface';

export interface IUser {
  fullName: string;
  email: string;
  password: string;
  role: Role;
  departmentId?: Types.ObjectId | IDepartment;
  matricNumber?: string;
  level?: string;
  profileImage?: string;
  profileImageId?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserResponse {
  _id: string;
  fullName: string;
  email: string;
  role: Role;
  departmentId?: IDepartment;
  matricNumber?: string;
  level?: string;
  profileImage?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  staffId?: string;
  designation?: string;
  isVerified?: boolean;
}
