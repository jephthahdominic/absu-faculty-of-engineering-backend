import mongoose, { Schema } from 'mongoose';
import { IAcademicSessionDocument } from '../interfaces/academicSession.interface';

const academicSessionSchema = new Schema<IAcademicSessionDocument>(
  {
    session: { type: String, required: true, trim: true },
    startYear: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    updatedBy: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret['__v'];
        return ret;
      },
    },
  },
);

export const AcademicSessionModel = mongoose.model<IAcademicSessionDocument>(
  'AcademicSession',
  academicSessionSchema,
);
