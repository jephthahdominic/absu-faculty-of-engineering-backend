import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response.util';
import { asyncHandler } from '../utils/asyncHandler.util';
import { parsePaginationQuery } from '../utils/pagination.util';
import { DEAN_MESSAGES, USER_MESSAGES } from '../constants/messages';
import { Role } from '../constants/roles';

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body, req.user!.role as Role);
  sendCreated(res, USER_MESSAGES.CREATED, user);
});

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const query = parsePaginationQuery(req.query as Record<string, unknown>);
  const result = await userService.getUsers(query, req.user!.role as Role, req.user!.departmentId?.toString());
  sendPaginated(res, USER_MESSAGES.FETCHED, result.data, result.pagination);
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getUserById(req.params.id);
  sendSuccess(res, USER_MESSAGES.FETCHED_ONE, user);
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getUserById(req.user!._id.toString());
  sendSuccess(res, USER_MESSAGES.FETCHED_ONE, user);
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.updateUser(req.params.id, req.body);
  sendSuccess(res, USER_MESSAGES.UPDATED, user);
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.updateUser(req.user!._id.toString(), req.body);
  sendSuccess(res, USER_MESSAGES.UPDATED, user);
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  await userService.deleteUser(req.params.id, req.user!._id.toString(), req.user!.role as Role);
  sendSuccess(res, USER_MESSAGES.DELETED);
});

export const getDean = asyncHandler(async (req: Request, res: Response) => {
  const dean = await userService.getDean();
  sendSuccess(res, DEAN_MESSAGES.FETCHED, dean);
});

export const deleteDean = asyncHandler(async (req: Request, res: Response) => {
  await userService.deleteDean(req.params.id, req.user!.role as Role);
  sendSuccess(res, DEAN_MESSAGES.DELETED);
});

export const updateProfileImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new Error('No file provided');
  }
  const user = await userService.updateProfileImage(req.user!._id.toString(), req.file);
  sendSuccess(res, USER_MESSAGES.PROFILE_IMAGE_UPDATED, user);
});
