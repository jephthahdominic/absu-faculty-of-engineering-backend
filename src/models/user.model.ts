import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUserDocument } from '../interfaces/user.interface';
import { ROLES } from '../constants/roles';

const userSchema = new Schema<IUserDocument>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: {
      type: String,
      enum: [ROLES.SUPER_ADMIN, ROLES.DEPARTMENT_ADMIN],
      required: true,
    },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', default: null },
    matricNumber: { type: String, sparse: true, unique: true },
    level: { type: String, default: null },
    profileImage: { type: String, default: null },
    profileImageId: { type: String, default: null },
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

userSchema.index({ departmentId: 1 });
userSchema.index({ role: 1 });

userSchema.pre<IUserDocument>('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password as string);
};

export const UserModel = mongoose.model<IUserDocument>('User', userSchema);
