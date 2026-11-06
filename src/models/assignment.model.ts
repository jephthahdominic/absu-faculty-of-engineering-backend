import mongoose, { Schema } from 'mongoose';
import { IAssignmentDocument } from '../interfaces/assignment.interface';

const assignmentSchema = new Schema<IAssignmentDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    courseCode: { type: String, uppercase: true, trim: true, default: '' },
    levels: {
      type: [{ type: String, enum: ['100', '200', '300', '400', '500'] }],
      required: true,
      validate: {
        validator: (arr: unknown[]) => Array.isArray(arr) && arr.length > 0,
        message: 'At least one level is required',
      },
    },
    dueDate: { type: Date, required: true },
    fileUrl: { type: String, required: true },
    fileId: { type: String, default: null },
    lecturerId: { type: Schema.Types.ObjectId, ref: 'Lecturer', required: true },
    departmentIds: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Department' }],
      required: true,
      validate: {
        validator: (arr: unknown[]) => Array.isArray(arr) && arr.length > 0,
        message: 'At least one department is required',
      },
    },
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

assignmentSchema.index({ departmentIds: 1 });
assignmentSchema.index({ lecturerId: 1 });
assignmentSchema.index({ levels: 1 });
assignmentSchema.index({ title: 'text', courseCode: 'text' });

export const AssignmentModel = mongoose.model<IAssignmentDocument>('Assignment', assignmentSchema);
