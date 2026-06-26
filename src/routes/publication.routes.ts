/**
 * @swagger
 * tags:
 *   name: Publications
 *   description: Publication management
 */
import { Router } from 'express';
import * as pubController from '../controllers/publication.controller';
import { authenticate } from '../middlewares/authenticate.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { validate } from '../middlewares/validate.middleware';
import { ROLES } from '../constants/roles';
import {
  createPublicationValidator,
  updatePublicationValidator,
  getPublicationValidator,
  getPublicationsValidator,
} from '../validators/publication.validator';

const router = Router();

router.use(authenticate);

router.get('/', getPublicationsValidator, validate, pubController.getPublications);
router.get('/:id', getPublicationValidator, validate, pubController.getPublicationById);

router.post(
  '/',
  authorize(ROLES.SUPER_ADMIN, ROLES.DEPARTMENT_ADMIN),
  createPublicationValidator,
  validate,
  pubController.createPublication,
);

router.put(
  '/:id',
  authorize(ROLES.SUPER_ADMIN, ROLES.DEPARTMENT_ADMIN),
  updatePublicationValidator,
  validate,
  pubController.updatePublication,
);

router.delete(
  '/:id',
  authorize(ROLES.SUPER_ADMIN, ROLES.DEPARTMENT_ADMIN),
  getPublicationValidator,
  validate,
  pubController.deletePublication,
);

export default router;
