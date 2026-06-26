import mongoose, { Schema } from 'mongoose';
import { IDepartmentDocument } from '../interfaces/department.interface';

const departmentSchema = new Schema<IDepartmentDocument>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, required: true, trim: true },
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

departmentSchema.index({ name: 1 });

export const DepartmentModel = mongoose.model<IDepartmentDocument>('Department', departmentSchema);
