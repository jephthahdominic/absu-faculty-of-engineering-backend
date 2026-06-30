/**
 * @swagger
 * tags:
 *   name: News
 *   description: News management
 */
import { Router } from 'express';
import * as newsController from '../controllers/news.controller';
import { authenticate } from '../middlewares/authenticate.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { validate } from '../middlewares/validate.middleware';
import { uploadImage, uploadOptionalImage } from '../middlewares/upload.middleware';
import { uploadRateLimiter } from '../middlewares/rateLimiter.middleware';
import { ROLES } from '../constants/roles';
import {
  createNewsValidator,
  updateNewsValidator,
  getNewsValidator,
  getNewsListValidator,
} from '../validators/news.validator';

const router = Router();

router.get('/', getNewsListValidator, validate, newsController.getNews);
router.get('/slug/:slug', newsController.getNewsBySlug);
router.get('/:id', getNewsValidator, validate, newsController.getNewsById);

router.post(
  '/',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.DEAN, ROLES.DEPARTMENT_ADMIN),
  uploadRateLimiter,
  uploadImage,
  createNewsValidator,
  validate,
  newsController.createNews,
);

router.put(
  '/:id',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.DEAN, ROLES.DEPARTMENT_ADMIN),
  uploadRateLimiter,
  uploadOptionalImage,
  updateNewsValidator,
  validate,
  newsController.updateNews,
);

router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.DEAN, ROLES.DEPARTMENT_ADMIN),
  getNewsValidator,
  validate,
  newsController.deleteNews,
);

export default router;
