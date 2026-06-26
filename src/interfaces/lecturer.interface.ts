import { Document, Types } from 'mongoose';

export interface ILecturer {
  firstName: string;
  lastName: string;
  email: string;
  designation: string;
  profileImage?: string;
  profileImageId?: string;
  bio?: string;
  departmentId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ILecturerDocument extends ILecturer, Document {
  _id: Types.ObjectId;
}
