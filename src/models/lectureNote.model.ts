import mongoose, { Schema } from 'mongoose';
import { ILectureNoteDocument } from '../interfaces/lectureNote.interface';

const lectureNoteSchema = new Schema<ILectureNoteDocument>(
  {
    title: { type: String, required: true, trim: true },
    courseCode: { type: String, required: true, uppercase: true, trim: true },
    level: { type: String, required: true, trim: true },
    semester: { type: String, required: true, trim: true },
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

lectureNoteSchema.index({ departmentIds: 1 });
lectureNoteSchema.index({ lecturerId: 1 });
lectureNoteSchema.index({ level: 1 });
lectureNoteSchema.index({ semester: 1 });
lectureNoteSchema.index({ courseCode: 1 });
lectureNoteSchema.index({ title: 'text', courseCode: 'text' });

export const LectureNoteModel = mongoose.model<ILectureNoteDocument>('LectureNote', lectureNoteSchema);
