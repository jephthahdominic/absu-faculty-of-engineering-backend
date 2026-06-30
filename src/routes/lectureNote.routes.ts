/**
 * @swagger
 * tags:
 *   name: LectureNotes
 *   description: Lecture note management
 */
import { Router } from 'express';
import * as noteController from '../controllers/lectureNote.controller';
import { authenticate } from '../middlewares/authenticate.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { validate } from '../middlewares/validate.middleware';
import { uploadDocument } from '../middlewares/upload.middleware';
import { uploadRateLimiter } from '../middlewares/rateLimiter.middleware';
import { ROLES } from '../constants/roles';
import {
  createLectureNoteValidator,
  updateLectureNoteValidator,
  getLectureNoteValidator,
  getLectureNotesValidator,
} from '../validators/lectureNote.validator';

const router = Router();

router.use(authenticate);

router.get('/', getLectureNotesValidator, validate, noteController.getLectureNotes);
router.get('/:id', getLectureNoteValidator, validate, noteController.getLectureNoteById);

router.post(
  '/',
  authorize(ROLES.SUPER_ADMIN, ROLES.DEAN, ROLES.DEPARTMENT_ADMIN),
  uploadRateLimiter,
  uploadDocument,
  createLectureNoteValidator,
  validate,
  noteController.createLectureNote,
);

router.put(
  '/:id',
  authorize(ROLES.SUPER_ADMIN, ROLES.DEAN, ROLES.DEPARTMENT_ADMIN),
  uploadRateLimiter,
  uploadDocument,
  updateLectureNoteValidator,
  validate,
  noteController.updateLectureNote,
);

router.delete(
  '/:id',
  authorize(ROLES.SUPER_ADMIN, ROLES.DEAN, ROLES.DEPARTMENT_ADMIN),
  getLectureNoteValidator,
  validate,
  noteController.deleteLectureNote,
);

export default router;
