import mongoose, { Schema } from 'mongoose';
import slugify from 'slugify';
import { INewsDocument, NEWS_CATEGORIES } from '../interfaces/news.interface';

const newsSchema = new Schema<INewsDocument>(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, unique: true, sparse: true, lowercase: true },
    summary: { type: String, trim: true, maxlength: 300 },
    content: { type: String, required: true },
    category: { type: String, enum: NEWS_CATEGORIES, default: 'General' },
    imageUrl: { type: String, default: null },
    imageId: { type: String, default: null },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date, default: null },
    isFeatured: { type: Boolean, default: false },
    metaTitle: { type: String, trim: true, maxlength: 80 },
    metaDescription: { type: String, trim: true, maxlength: 180 },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
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

newsSchema.index({ slug: 1 });
newsSchema.index({ isPublished: 1 });
newsSchema.index({ isFeatured: 1 });
newsSchema.index({ category: 1 });
newsSchema.index({ createdAt: -1 });
newsSchema.index({ title: 'text', content: 'text', summary: 'text' });

newsSchema.pre('save', async function (next) {
  if (this.isModified('title') || !this.slug) {
    const base = slugify(this.title, { lower: true, strict: true, trim: true });
    let candidate = base;
    let suffix = 2;

    while (
      await mongoose.models.News.exists({ slug: candidate, _id: { $ne: this._id } })
    ) {
      candidate = `${base}-${suffix}`;
      suffix += 1;
    }

    this.slug = candidate;
  }

  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  next();
});

export const NewsModel = mongoose.model<INewsDocument>('News', newsSchema);
