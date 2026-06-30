import { Document } from 'mongoose';

export interface IAcademicSession {
  session: string;
  startYear: number;
  isActive: boolean;
  updatedBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAcademicSessionDocument extends IAcademicSession, Document {}

export interface IAcademicSessionResponse {
  _id: string;
  session: string;
  startYear: number;
  isActive: boolean;
  updatedBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}
