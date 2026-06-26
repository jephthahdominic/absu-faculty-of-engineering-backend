import mongoose, { Schema } from 'mongoose';
import { ILecturerDocument } from '../interfaces/lecturer.interface';

const lecturerSchema = new Schema<ILecturerDocument>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    designation: { type: String, required: true, trim: true },
    profileImage: { type: String, default: null },
    profileImageId: { type: String, default: null },
    bio: { type: String, default: null },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
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

lecturerSchema.index({ departmentId: 1 });

export const LecturerModel = mongoose.model<ILecturerDocument>('Lecturer', lecturerSchema);
