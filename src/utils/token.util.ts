import jwt from 'jsonwebtoken';
import { env } from '../config/environment';
import { ITokenPayload } from '../interfaces/auth.interface';

export const generateAccessToken = (payload: ITokenPayload): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const generateRefreshToken = (payload: ITokenPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const verifyAccessToken = (token: string): ITokenPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as ITokenPayload;
};

export const verifyRefreshToken = (token: string): ITokenPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as ITokenPayload;
};

export const generatePasswordResetToken = (payload: { userId: string }): string => {
  return jwt.sign(payload, env.PASSWORD_RESET_SECRET, {
    expiresIn: env.PASSWORD_RESET_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const verifyPasswordResetToken = (token: string): { userId: string } => {
  return jwt.verify(token, env.PASSWORD_RESET_SECRET) as { userId: string };
};
