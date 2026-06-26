import { Document, Types } from 'mongoose';

export interface IDepartment {
  name: string;
  code: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IDepartmentDocument extends IDepartment, Document {
  _id: Types.ObjectId;
}
