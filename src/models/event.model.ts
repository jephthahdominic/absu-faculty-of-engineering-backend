import mongoose, { Schema } from 'mongoose';
import { IEventDocument } from '../interfaces/event.interface';

const eventSchema = new Schema<IEventDocument>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    venue: { type: String, required: true, trim: true },
    eventDate: { type: Date, required: true },
    featuredImage: { type: String, required: true },
    featuredImageId: { type: String, default: null },
    isPublished: { type: Boolean, default: false },
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

eventSchema.index({ departmentId: 1 });
eventSchema.index({ isPublished: 1 });
eventSchema.index({ eventDate: 1 });
eventSchema.index({ title: 'text', description: 'text' });

export const EventModel = mongoose.model<IEventDocument>('Event', eventSchema);
