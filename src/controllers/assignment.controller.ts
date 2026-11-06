import { Request, Response } from 'express';
import { assignmentService, IRequester } from '../services/assignment.service';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response.util';
import { asyncHandler } from '../utils/asyncHandler.util';
import { parsePaginationQuery } from '../utils/pagination.util';
import { normalizeIdArray } from '../utils/arrayField.util';
import { ASSIGNMENT_MESSAGES } from '../constants/messages';
import { Role } from '../constants/roles';
import { AppError } from '../services/auth.service';
import { HTTP_STATUS } from '../constants/httpStatus';

const requesterFrom = (req: Request): IRequester => ({
  id: req.user!._id.toString(),
  role: req.user!.role as Role,
  departmentId: req.user!.departmentId?.toString(),
  level: (req.user as unknown as { level?: string }).level,
});

export const createAssignment = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw new AppError('Assignment brief (PDF) is required', HTTP_STATUS.BAD_REQUEST);
  const assignment = await assignmentService.createAssignment(
    {
      ...req.body,
      departmentIds: normalizeIdArray(req.body.departmentIds),
      levels: normalizeIdArray(req.body.levels),
    },
    req.file,
    requesterFrom(req),
  );
  sendCreated(res, ASSIGNMENT_MESSAGES.CREATED, assignment);
});

export const getAssignments = asyncHandler(async (req: Request, res: Response) => {
  const query = parsePaginationQuery(req.query as Record<string, unknown>);
  const result = await assignmentService.getAssignments(query, requesterFrom(req));
  sendPaginated(res, ASSIGNMENT_MESSAGES.FETCHED, result.data, result.pagination);
});

export const getAssignmentById = asyncHandler(async (req: Request, res: Response) => {
  const assignment = await assignmentService.getAssignmentById(req.params.id, requesterFrom(req));
  sendSuccess(res, ASSIGNMENT_MESSAGES.FETCHED_ONE, assignment);
});

export const updateAssignment = asyncHandler(async (req: Request, res: Response) => {
  const body = { ...req.body };
  if (body.departmentIds !== undefined) body.departmentIds = normalizeIdArray(body.departmentIds);
  if (body.levels !== undefined) body.levels = normalizeIdArray(body.levels);
  const assignment = await assignmentService.updateAssignment(req.params.id, body, req.file, requesterFrom(req));
  sendSuccess(res, ASSIGNMENT_MESSAGES.UPDATED, assignment);
});

export const deleteAssignment = asyncHandler(async (req: Request, res: Response) => {
  await assignmentService.deleteAssignment(req.params.id, requesterFrom(req));
  sendSuccess(res, ASSIGNMENT_MESSAGES.DELETED);
});

export const submitSolution = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw new AppError('Solution file (PDF) is required', HTTP_STATUS.BAD_REQUEST);
  const submission = await assignmentService.submitSolution(req.params.id, req.file, requesterFrom(req));
  sendCreated(res, ASSIGNMENT_MESSAGES.SUBMITTED, submission);
});

export const getMySubmission = asyncHandler(async (req: Request, res: Response) => {
  const submission = await assignmentService.getMySubmission(req.params.id, requesterFrom(req));
  sendSuccess(res, ASSIGNMENT_MESSAGES.SUBMISSION_FETCHED, submission);
});

export const getSubmissions = asyncHandler(async (req: Request, res: Response) => {
  const submissions = await assignmentService.getSubmissions(req.params.id, requesterFrom(req));
  sendSuccess(res, ASSIGNMENT_MESSAGES.SUBMISSIONS_FETCHED, submissions);
});

export const scoreSubmission = asyncHandler(async (req: Request, res: Response) => {
  const submission = await assignmentService.scoreSubmission(
    req.params.submissionId,
    { score: Number(req.body.score), feedback: req.body.feedback },
    requesterFrom(req),
  );
  sendSuccess(res, ASSIGNMENT_MESSAGES.SCORED, submission);
});
