import mongoose, { Schema } from 'mongoose';
import { ISubmissionDocument } from '../interfaces/assignment.interface';

const submissionSchema = new Schema<ISubmissionDocument>(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    fileUrl: { type: String, required: true },
    fileId: { type: String, default: null },
    submittedAt: { type: Date, default: Date.now },
    score: { type: Number, min: 0, max: 10, default: null },
    feedback: { type: String, trim: true, default: null },
    gradedAt: { type: Date, default: null },
    gradedBy: { type: Schema.Types.ObjectId, ref: 'Lecturer', default: null },
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

// One submission per student per assignment (resubmitting replaces it).
submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });
submissionSchema.index({ studentId: 1 });

export const SubmissionModel = mongoose.model<ISubmissionDocument>('Submission', submissionSchema);
