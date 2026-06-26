import { Document, Types } from 'mongoose';

export interface IEvent {
  title: string;
  slug: string;
  description: string;
  venue: string;
  eventDate: Date;
  featuredImage: string;
  featuredImageId?: string;
  isPublished: boolean;
  departmentId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IEventDocument extends IEvent, Document {
  _id: Types.ObjectId;
}
