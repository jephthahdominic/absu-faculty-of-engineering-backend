import { Document, Types } from 'mongoose';

export interface INews {
  title: string;
  slug: string;
  content: string;
  featuredImage: string;
  featuredImageId?: string;
  category: string;
  isPublished: boolean;
  publishedAt?: Date;
  departmentId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface INewsDocument extends INews, Document {
  _id: Types.ObjectId;
}
