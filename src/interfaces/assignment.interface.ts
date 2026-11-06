import { Document, Types } from 'mongoose';

export interface IAssignment {
  title: string;
  description?: string;
  courseCode?: string;
  levels: string[];
  dueDate: Date;
  fileUrl: string;
  fileId?: string;
  lecturerId: Types.ObjectId;
  departmentIds: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAssignmentDocument extends IAssignment, Document {
  _id: Types.ObjectId;
}

export interface ISubmission {
  assignmentId: Types.ObjectId;
  studentId: Types.ObjectId;
  fileUrl: string;
  fileId?: string;
  submittedAt: Date;
  score: number | null;
  feedback?: string | null;
  gradedAt?: Date | null;
  gradedBy?: Types.ObjectId | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISubmissionDocument extends ISubmission, Document {
  _id: Types.ObjectId;
}
