import { Document, Types } from 'mongoose';

export const NEWS_CATEGORIES = [
  'General',
  'Announcement',
  'Academic',
  'Research',
  'Events',
  'Student News',
] as const;

export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

export interface INews {
  title: string;
  slug: string;
  summary?: string;
  content: string;
  category: NewsCategory;
  imageUrl?: string;
  imageId?: string;
  isPublished: boolean;
  publishedAt?: Date | null;
  isFeatured: boolean;
  metaTitle?: string;
  metaDescription?: string;
  author: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface INewsDocument extends INews, Document {
  _id: Types.ObjectId;
}
