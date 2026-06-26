import mongoose, { Schema } from 'mongoose';
import { INewsDocument } from '../interfaces/news.interface';

const newsSchema = new Schema<INewsDocument>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    content: { type: String, required: true },
    featuredImage: { type: String, required: true },
    featuredImageId: { type: String, default: null },
    category: { type: String, required: true, trim: true },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date, default: null },
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

newsSchema.index({ departmentId: 1 });
newsSchema.index({ isPublished: 1 });
newsSchema.index({ category: 1 });
newsSchema.index({ title: 'text', content: 'text' });

export const NewsModel = mongoose.model<INewsDocument>('News', newsSchema);
