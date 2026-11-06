/**
 * @swagger
 * tags:
 *   name: Assignments
 *   description: Lecturer assignments, student PDF submissions and scoring (out of 10)
 */
import { Router } from 'express';
import * as assignmentController from '../controllers/assignment.controller';
import { authenticate } from '../middlewares/authenticate.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { requireVerifiedLecturer } from '../middlewares/requireVerifiedLecturer.middleware';
import { validate } from '../middlewares/validate.middleware';
import { uploadPdf } from '../middlewares/upload.middleware';
import { uploadRateLimiter } from '../middlewares/rateLimiter.middleware';
import { ROLES } from '../constants/roles';
import {
  createAssignmentValidator,
  updateAssignmentValidator,
  assignmentIdValidator,
  getAssignmentsValidator,
  scoreSubmissionValidator,
} from '../validators/assignment.validator';

const router = Router();

const STAFF = [ROLES.SUPER_ADMIN, ROLES.DEAN, ROLES.DEPARTMENT_ADMIN, ROLES.LECTURER] as const;

router.use(authenticate);
router.use(requireVerifiedLecturer);

// Score a submission (0–10). Declared before '/:id' routes for clarity.
router.patch(
  '/submissions/:submissionId/score',
  authorize(...STAFF),
  scoreSubmissionValidator,
  validate,
  assignmentController.scoreSubmission,
);

router.get('/', getAssignmentsValidator, validate, assignmentController.getAssignments);
router.get('/:id', assignmentIdValidator, validate, assignmentController.getAssignmentById);

router.post(
  '/',
  authorize(...STAFF),
  uploadRateLimiter,
  uploadPdf,
  createAssignmentValidator,
  validate,
  assignmentController.createAssignment,
);

router.put(
  '/:id',
  authorize(...STAFF),
  uploadRateLimiter,
  uploadPdf,
  updateAssignmentValidator,
  validate,
  assignmentController.updateAssignment,
);

router.delete('/:id', authorize(...STAFF), assignmentIdValidator, validate, assignmentController.deleteAssignment);

// Student: submit / view own solution
router.post(
  '/:id/submissions',
  authorize(ROLES.STUDENT),
  uploadRateLimiter,
  uploadPdf,
  assignmentIdValidator,
  validate,
  assignmentController.submitSolution,
);
router.get('/:id/my-submission', authorize(ROLES.STUDENT), assignmentIdValidator, validate, assignmentController.getMySubmission);

// Staff: all submissions for an assignment
router.get('/:id/submissions', authorize(...STAFF), assignmentIdValidator, validate, assignmentController.getSubmissions);

export default router;
