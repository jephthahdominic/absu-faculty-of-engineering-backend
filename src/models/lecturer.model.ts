import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { ILecturerDocument } from '../interfaces/lecturer.interface';
import { ROLES } from '../constants/roles';

const lecturerSchema = new Schema<ILecturerDocument>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, minlength: 8, select: false },
    staffId: { type: String, required: true, unique: true, trim: true },
    designation: { type: String, required: true, trim: true },
    role: { type: String, default: ROLES.LECTURER, immutable: true },
    profileImage: { type: String, default: null },
    profileImageId: { type: String, default: null },
    bio: { type: String, default: null },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    isVerified: { type: Boolean, default: false },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    verifiedAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret['password'];
        delete ret['__v'];
        return ret;
      },
    },
  },
);

lecturerSchema.index({ departmentId: 1 });
lecturerSchema.index({ role: 1 });
lecturerSchema.index({ isVerified: 1 });

lecturerSchema.pre<ILecturerDocument>('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

lecturerSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password as string);
};

export const LecturerModel = mongoose.model<ILecturerDocument>('Lecturer', lecturerSchema);
