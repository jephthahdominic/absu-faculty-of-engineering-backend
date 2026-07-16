import { Document, Types } from 'mongoose';

export interface IPublication {
  title: string;
  journal: string;
  publicationYear: number;
  publicationUrl: string;
  authors: string[];
  lecturerId: Types.ObjectId;
  departmentId: Types.ObjectId;
  isPublished: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPublicationDocument extends IPublication, Document {
  _id: Types.ObjectId;
}
