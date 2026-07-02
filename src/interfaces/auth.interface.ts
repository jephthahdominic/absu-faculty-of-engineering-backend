import { Types } from 'mongoose';
import { IUserResponse } from './user.interface';
import { IDepartment } from './department.interface';

export interface IAuthUser {
  _id: Types.ObjectId;
  role: string;
  departmentId?: Types.ObjectId | IDepartment;
  isActive: boolean;
  isVerified?: boolean;
}

export interface ILoginPayload {
  matricNo:string;
  password: string;
}

export interface ILoginAdminPayload {
  email: string;
  password: string;
}

export interface ITokenPayload {
  userId: string;
  role: string;
  departmentId?: string;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ILoginResponse {
  user: IUserResponse;
  tokens: IAuthTokens;
}

export interface IRefreshTokenPayload {
  refreshToken: string;
}

export interface IChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface IForgotPasswordPayload {
  email: string;
}

export interface IResetPasswordPayload {
  token: string;
  newPassword: string;
}
