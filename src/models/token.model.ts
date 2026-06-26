import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITokenDocument extends Document {
  userId: Types.ObjectId;
  refreshToken: string;
  isRevoked: boolean;
  expiresAt: Date;
}

const tokenSchema = new Schema<ITokenDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    refreshToken: { type: String, required: true, unique: true },
    isRevoked: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

tokenSchema.index({ userId: 1 });
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const TokenModel = mongoose.model<ITokenDocument>('Token', tokenSchema);
