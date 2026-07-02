/**
 * @swagger
 * tags:
 *   name: Lecturers
 *   description: Lecturer management
 */
import { Router } from 'express';
import * as lecturerController from '../controllers/lecturer.controller';
import { authenticate } from '../middlewares/authenticate.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { requireVerifiedLecturer } from '../middlewares/requireVerifiedLecturer.middleware';
import { validate } from '../middlewares/validate.middleware';
import { uploadImage } from '../middlewares/upload.middleware';
import { uploadRateLimiter } from '../middlewares/rateLimiter.middleware';
import { ROLES } from '../constants/roles';
import {
  createLecturerValidator,
  registerLecturerValidator,
  verifyLecturerValidator,
  updateLecturerValidator,
  getLecturerValidator,
  getLecturersValidator,
} from '../validators/lecturer.validator';

const router = Router();

router.post(
  '/register',
  uploadRateLimiter,
  uploadImage,
  registerLecturerValidator,
  validate,
  lecturerController.registerLecturer,
);

router.use(authenticate);
router.use(requireVerifiedLecturer);

router.get('/', getLecturersValidator, validate, lecturerController.getLecturers);
router.get('/:id', getLecturerValidator, validate, lecturerController.getLecturerById);

router.post(
  '/',
  authorize(ROLES.SUPER_ADMIN, ROLES.DEAN, ROLES.DEPARTMENT_ADMIN),
  createLecturerValidator,
  validate,
  lecturerController.createLecturer,
);

router.patch(
  '/:id/verify',
  authorize(ROLES.SUPER_ADMIN, ROLES.DEAN, ROLES.DEPARTMENT_ADMIN),
  verifyLecturerValidator,
  validate,
  lecturerController.verifyLecturer,
);

router.put(
  '/:id',
  authorize(ROLES.SUPER_ADMIN, ROLES.DEAN, ROLES.DEPARTMENT_ADMIN),
  updateLecturerValidator,
  validate,
  lecturerController.updateLecturer,
);

router.delete(
  '/:id',
  authorize(ROLES.SUPER_ADMIN, ROLES.DEAN, ROLES.DEPARTMENT_ADMIN),
  getLecturerValidator,
  validate,
  lecturerController.deleteLecturer,
);

router.post(
  '/:id/profile-image',
  authorize(ROLES.SUPER_ADMIN, ROLES.DEAN, ROLES.DEPARTMENT_ADMIN),
  uploadRateLimiter,
  uploadImage,
  lecturerController.updateLecturerProfileImage,
);

export default router;
