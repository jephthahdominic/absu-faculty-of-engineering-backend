/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Event management
 */
import { Router } from 'express';
import * as eventController from '../controllers/event.controller';
import { authenticate } from '../middlewares/authenticate.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { validate } from '../middlewares/validate.middleware';
import { uploadImage, uploadOptionalImage } from '../middlewares/upload.middleware';
import { uploadRateLimiter } from '../middlewares/rateLimiter.middleware';
import { ROLES } from '../constants/roles';
import {
  createEventValidator,
  updateEventValidator,
  getEventValidator,
  getEventsValidator,
} from '../validators/event.validator';

const router = Router();

router.use(authenticate);

router.get('/', getEventsValidator, validate, eventController.getEvents);
router.get('/:id', getEventValidator, validate, eventController.getEventById);

router.post(
  '/',
  authorize(ROLES.SUPER_ADMIN, ROLES.DEAN, ROLES.DEPARTMENT_ADMIN),
  uploadRateLimiter,
  uploadImage,
  createEventValidator,
  validate,
  eventController.createEvent,
);

router.put(
  '/:id',
  authorize(ROLES.SUPER_ADMIN, ROLES.DEAN, ROLES.DEPARTMENT_ADMIN),
  uploadRateLimiter,
  uploadOptionalImage,
  updateEventValidator,
  validate,
  eventController.updateEvent,
);

router.delete(
  '/:id',
  authorize(ROLES.SUPER_ADMIN, ROLES.DEAN, ROLES.DEPARTMENT_ADMIN),
  getEventValidator,
  validate,
  eventController.deleteEvent,
);

export default router;
