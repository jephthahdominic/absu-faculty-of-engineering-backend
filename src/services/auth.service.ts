import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import { userRepository } from '../repositories/user.repository';
import { tokenRepository } from '../repositories/token.repository';
import { IDepartmentDocument } from '../interfaces/department.interface';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generatePasswordResetToken,
  verifyPasswordResetToken,
} from '../utils/token.util';
import { ILoginPayload, IAuthTokens, ILoginResponse, IAuthUser } from '../interfaces/auth.interface';
import { IUserDocument } from '../interfaces/user.interface';
import { ROLES, Role } from '../constants/roles';
import { studentRepository } from '../repositories/student.repository';
import { emailService } from './email.service';
import { logger } from '../utils/logger.util';
import { HTTP_STATUS } from '../constants/httpStatus';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public errors: unknown[] = [],
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

class AuthService {
  private buildTokenPayload(user: IAuthUser) {
    const deptId = user.departmentId;
    const departmentId = deptId
      ? (deptId instanceof Types.ObjectId ? deptId : (deptId as IDepartmentDocument)._id).toString()
      : undefined;
    return {
      userId: user._id.toString(),
      role: user.role,
      departmentId,
    };
  }

  private async generateTokens(user: IAuthUser): Promise<IAuthTokens> {
    const payload = this.buildTokenPayload(user);
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await tokenRepository.create(user._id.toString(), refreshToken, expiresAt);

    return { accessToken, refreshToken };
  }

  async login(payload: ILoginPayload, allowedRoles?: Role[]): Promise<ILoginResponse> {
    const user = await userRepository.findByEmail(payload.email.trim());

    if (!user) {
      throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
    }

    if (!user.isActive) {
      throw new AppError('Account is disabled. Contact administrator', HTTP_STATUS.FORBIDDEN);
    }

    if (allowedRoles && !allowedRoles.includes(user.role as Role)) {
      throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
    }

    const isPasswordValid = await user.comparePassword(payload.password.trim());
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
    }

    await userRepository.updateLastLogin(user._id.toString());
    const tokens = await this.generateTokens(user);

    logger.info(`User logged in: ${user.email} (${user.role})`);

    const userObj = user.toJSON() as unknown as IUserDocument;

    return {
      user: {
        _id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        departmentId: user.departmentId as IDepartmentDocument | undefined,
        matricNumber: user.matricNumber,
        level: user.level,
        profileImage: user.profileImage,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: (userObj as { createdAt?: Date }).createdAt,
        updatedAt: (userObj as { updatedAt?: Date }).updatedAt,
      },
      tokens,
    };
  }

  async loginStudent(payload: ILoginPayload): Promise<ILoginResponse> {
    const student = await studentRepository.findByMatricNumber(payload.matricNo.trim());

    if (!student) {
      throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
    }

    if (!student.isActive) {
      throw new AppError('Account is disabled. Contact administrator', HTTP_STATUS.FORBIDDEN);
    }

    const isPasswordValid = await student.comparePassword(payload.password.trim());
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
    }

    await studentRepository.updateLastLogin(student._id.toString());
    const tokens = await this.generateTokens(student);

    logger.info(`Student logged in: ${student.email}`);

    const studentObj = student.toJSON() as unknown as { createdAt?: Date; updatedAt?: Date };

    return {
      user: {
        _id: student._id.toString(),
        fullName: student.fullName,
        email: student.email,
        role: student.role as Role,
        departmentId: student.departmentId as unknown as IDepartmentDocument | undefined,
        matricNumber: student.matricNumber,
        level: student.level,
        profileImage: student.profileImage,
        isActive: student.isActive,
        lastLogin: student.lastLogin,
        createdAt: studentObj.createdAt,
        updatedAt: studentObj.updatedAt,
      },
      tokens,
    };
  }

  async refreshToken(refreshToken: string): Promise<IAuthTokens> {
    const tokenDoc = await tokenRepository.findByToken(refreshToken);
    if (!tokenDoc) {
      throw new AppError('Invalid or expired refresh token', HTTP_STATUS.UNAUTHORIZED);
    }

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      await tokenRepository.revokeToken(refreshToken);
      throw new AppError('Invalid or expired refresh token', HTTP_STATUS.UNAUTHORIZED);
    }

    const user = payload.role === ROLES.STUDENT
      ? await studentRepository.findById(payload.userId)
      : await userRepository.findById(payload.userId);

    if (!user || !user.isActive) {
      throw new AppError('User not found or inactive', HTTP_STATUS.UNAUTHORIZED);
    }

    await tokenRepository.revokeToken(refreshToken);
    const tokens = await this.generateTokens(user);

    logger.info(`Token refreshed for: ${payload.userId}`);
    return tokens;
  }

  async logout(refreshToken: string): Promise<void> {
    await tokenRepository.revokeToken(refreshToken);
    logger.info(`User logged out`);
  }

  async logoutAll(userId: string): Promise<void> {
    await tokenRepository.revokeAllUserTokens(userId);
    logger.info(`All sessions revoked for user: ${userId}`);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }

    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      throw new AppError('Current password is incorrect', HTTP_STATUS.BAD_REQUEST);
    }

    const salt = await bcrypt.genSalt(12);
    const hashed = await bcrypt.hash(newPassword, salt);
    await userRepository.updatePassword(userId, hashed);
    await tokenRepository.revokeAllUserTokens(userId);

    logger.info(`Password changed for user: ${userId}`);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await userRepository.findByEmailWithoutPassword(email);
    if (!user) {
      return;
    }

    const resetToken = generatePasswordResetToken({ userId: user._id.toString() });

    try {
      await emailService.sendPasswordResetEmail(user.email, user.fullName, resetToken);
      logger.info(`Password reset email sent for: ${email}`);
    } catch (error) {
      logger.error(`Failed to send password reset email: ${error}`);
      throw new AppError('Failed to send password reset email', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    let payload;
    try {
      payload = verifyPasswordResetToken(token);
    } catch {
      throw new AppError('Invalid or expired reset token', HTTP_STATUS.BAD_REQUEST);
    }

    const user = await userRepository.findById(payload.userId);
    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }

    const salt = await bcrypt.genSalt(12);
    const hashed = await bcrypt.hash(newPassword, salt);
    await userRepository.updatePassword(payload.userId, hashed);
    await tokenRepository.revokeAllUserTokens(payload.userId);

    logger.info(`Password reset for user: ${payload.userId}`);
  }
}

export const authService = new AuthService();
