import mongoose, { Schema } from 'mongoose';
import { IPublicationDocument } from '../interfaces/publication.interface';

const publicationSchema = new Schema<IPublicationDocument>(
  {
    title: { type: String, required: true, trim: true },
    journal: { type: String, required: true, trim: true },
    publicationYear: { type: Number, required: true },
    publicationUrl: { type: String, required: true, trim: true },
    authors: [{ type: String, required: true, trim: true }],
    lecturerId: { type: Schema.Types.ObjectId, ref: 'Lecturer', required: true },
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

publicationSchema.index({ departmentId: 1 });
publicationSchema.index({ lecturerId: 1 });
publicationSchema.index({ publicationYear: 1 });
publicationSchema.index({ title: 'text', journal: 'text' });

export const PublicationModel = mongoose.model<IPublicationDocument>('Publication', publicationSchema);
