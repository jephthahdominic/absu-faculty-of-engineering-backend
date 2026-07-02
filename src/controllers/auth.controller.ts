import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess } from '../utils/response.util';
import { asyncHandler } from '../utils/asyncHandler.util';
import { AUTH_MESSAGES } from '../constants/messages';
import { ROLES } from '../constants/roles';

export const loginAdmin = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body, [ROLES.SUPER_ADMIN, ROLES.DEAN, ROLES.DEPARTMENT_ADMIN]);
  sendSuccess(res, AUTH_MESSAGES.LOGIN_SUCCESS, result);
});

export const loginStudent = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.loginStudent(req.body);
  sendSuccess(res, AUTH_MESSAGES.LOGIN_SUCCESS, result);
});

export const loginLecturer = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.loginLecturer(req.body);
  sendSuccess(res, AUTH_MESSAGES.LOGIN_SUCCESS, result);
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const tokens = await authService.refreshToken(req.body.refreshToken);
  sendSuccess(res, AUTH_MESSAGES.TOKEN_REFRESHED, tokens);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  await authService.logout(req.body.refreshToken);
  sendSuccess(res, AUTH_MESSAGES.LOGOUT_SUCCESS);
});

export const logoutAll = asyncHandler(async (req: Request, res: Response) => {
  await authService.logoutAll(req.user!._id.toString());
  sendSuccess(res, 'All sessions terminated successfully');
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user!._id.toString(), currentPassword, newPassword);
  sendSuccess(res, AUTH_MESSAGES.PASSWORD_CHANGED);
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.forgotPassword(req.body.email);
  sendSuccess(res, AUTH_MESSAGES.PASSWORD_RESET_EMAIL_SENT);
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  await authService.resetPassword(token, newPassword);
  sendSuccess(res, AUTH_MESSAGES.PASSWORD_RESET_SUCCESS);
});
