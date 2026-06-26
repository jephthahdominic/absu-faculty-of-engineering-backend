import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IStudentDocument } from '../interfaces/student.interface';

const studentSchema = new Schema<IStudentDocument>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, default: 'student', immutable: true },
    matricNumber: { type: String, required: true, unique: true, trim: true },
    level: { type: String, required: true, enum: ['100', '200', '300', '400', '500'] },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    profileImage: { type: String, default: null },
    profileImageId: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
  },
  {
    timestamps: true,
    collection: 'students',
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret['password'];
        delete ret['__v'];
        return ret;
      },
    },
  },
);

studentSchema.index({ departmentId: 1 });
studentSchema.index({ matricNumber: 1 });

studentSchema.pre<IStudentDocument>('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

studentSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password as string);
};

export const StudentModel = mongoose.model<IStudentDocument>('Student', studentSchema);
