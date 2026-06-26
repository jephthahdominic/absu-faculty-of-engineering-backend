import { Request, Response } from 'express';
import { studentService } from '../services/student.service';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response.util';
import { asyncHandler } from '../utils/asyncHandler.util';
import { parsePaginationQuery } from '../utils/pagination.util';
import { Role } from '../constants/roles';

export const createStudent = asyncHandler(async (req: Request, res: Response) => {
  const student = await studentService.createStudent(
    req.body,
    req.user!.role as Role,
    req.user!.departmentId?.toString(),
  );
  sendCreated(res, 'Student created successfully', student);
});

export const createStudentsBulk = asyncHandler(async (req: Request, res: Response) => {
  const result = await studentService.createStudentsBulk(
    req.body,
    req.user!.role as Role,
    req.user!.departmentId?.toString(),
  );
  sendCreated(res, `Bulk import complete: ${result.created} created, ${result.failed.length} failed`, result);
});

export const getStudents = asyncHandler(async (req: Request, res: Response) => {
  const query = parsePaginationQuery(req.query as Record<string, unknown>);
  const result = await studentService.getStudents(
    query,
    req.user!.role as Role,
    req.user!.departmentId?.toString(),
  );
  sendPaginated(res, 'Students fetched successfully', result.data, result.pagination);
});

export const getStudentById = asyncHandler(async (req: Request, res: Response) => {
  const student = await studentService.getStudentById(
    req.params.id,
    req.user!.role as Role,
    req.user!.departmentId?.toString(),
  );
  sendSuccess(res, 'Student fetched successfully', student);
});

export const updateStudent = asyncHandler(async (req: Request, res: Response) => {
  const student = await studentService.updateStudent(
    req.params.id,
    req.body,
    req.user!.role as Role,
    req.user!.departmentId?.toString(),
  );
  sendSuccess(res, 'Student updated successfully', student);
});

export const deleteStudent = asyncHandler(async (req: Request, res: Response) => {
  await studentService.deleteStudent(
    req.params.id,
    req.user!.role as Role,
    req.user!.departmentId?.toString(),
  );
  sendSuccess(res, 'Student deleted successfully');
});
