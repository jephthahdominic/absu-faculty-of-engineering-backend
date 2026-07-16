import { Document, Types } from 'mongoose';

export interface ILectureNote {
  title: string;
  courseCode: string;
  level: string;
  semester: string;
  fileUrl: string;
  fileId?: string;
  lecturerId: Types.ObjectId;
  departmentIds: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ILectureNoteDocument extends ILectureNote, Document {
  _id: Types.ObjectId;
}
