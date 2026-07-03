import { Request, Response } from 'express';
import { departmentService } from '../services/department.service';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response.util';
import { asyncHandler } from '../utils/asyncHandler.util';
import { parsePaginationQuery } from '../utils/pagination.util';
import { DEPARTMENT_MESSAGES } from '../constants/messages';

export const createDepartment = asyncHandler(async (req: Request, res: Response) => {
  const dept = await departmentService.createDepartment(req.body);
  sendCreated(res, DEPARTMENT_MESSAGES.CREATED, dept);
});

export const getPublicDepartments = asyncHandler(async (_req: Request, res: Response) => {
  const departments = await departmentService.getPublicDepartments();
  sendSuccess(res, DEPARTMENT_MESSAGES.FETCHED, departments);
});

export const getDepartments = asyncHandler(async (req: Request, res: Response) => {
  const query = parsePaginationQuery(req.query as Record<string, unknown>);
  const result = await departmentService.getDepartments(query);
  sendPaginated(res, DEPARTMENT_MESSAGES.FETCHED, result.data, result.pagination);
});

export const getDepartmentById = asyncHandler(async (req: Request, res: Response) => {
  const dept = await departmentService.getDepartmentById(req.params.id);
  sendSuccess(res, DEPARTMENT_MESSAGES.FETCHED_ONE, dept);
});

export const updateDepartment = asyncHandler(async (req: Request, res: Response) => {
  const dept = await departmentService.updateDepartment(req.params.id, req.body);
  sendSuccess(res, DEPARTMENT_MESSAGES.UPDATED, dept);
});

export const deleteDepartment = asyncHandler(async (req: Request, res: Response) => {
  await departmentService.deleteDepartment(req.params.id);
  sendSuccess(res, DEPARTMENT_MESSAGES.DELETED);
});
