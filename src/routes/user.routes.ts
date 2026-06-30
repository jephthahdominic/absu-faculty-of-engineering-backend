/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */
import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middlewares/authenticate.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { validate } from '../middlewares/validate.middleware';
import { uploadImage } from '../middlewares/upload.middleware';
import { uploadRateLimiter } from '../middlewares/rateLimiter.middleware';
import { ROLES, SUPER_LEVEL_ROLES } from '../constants/roles';
import {
  createUserValidator,
  updateUserValidator,
  getUserValidator,
  getUsersValidator,
  getDeanValidator,
} from '../validators/user.validator';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User profile
 */
router.get('/profile', userController.getProfile);

/**
 * @swagger
 * /users/dean:
 *   get:
 *     summary: Get current dean (Super Admin and Dean only)
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Dean details
 */
router.get(
  '/dean',
  authorize(...SUPER_LEVEL_ROLES),
  userController.getDean,
);

/**
 * @swagger
 * /users/dean/{id}:
 *   delete:
 *     summary: Delete dean account (Super Admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Dean deleted
 */
router.delete(
  '/dean/:id',
  authorize(ROLES.SUPER_ADMIN),
  getDeanValidator,
  validate,
  userController.deleteDean,
);

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Update current user profile
 *     tags: [Users]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName: { type: string }
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put('/profile', userController.updateProfile);

/**
 * @swagger
 * /users/profile/image:
 *   post:
 *     summary: Upload profile image
 *     tags: [Users]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile image updated
 */
router.post('/profile/image', uploadRateLimiter, uploadImage, userController.updateProfileImage);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: departmentId
 *         schema: { type: string }
 *       - in: query
 *         name: level
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Users list
 */
router.get(
  '/',
  authorize(ROLES.SUPER_ADMIN, ROLES.DEAN, ROLES.DEPARTMENT_ADMIN),
  getUsersValidator,
  validate,
  userController.getUsers,
);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create user (Admin only)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, role]
 *             properties:
 *               fullName: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, description: 'Required for all roles except dean (auto-generated)' }
 *               role: { type: string, enum: [super_admin, dean, department_admin, student] }
 *               departmentId: { type: string }
 *               matricNumber: { type: string }
 *               level: { type: string, enum: ['100','200','300','400','500'] }
 *     responses:
 *       201:
 *         description: User created
 */
router.post(
  '/',
  authorize(ROLES.SUPER_ADMIN, ROLES.DEAN, ROLES.DEPARTMENT_ADMIN),
  createUserValidator,
  validate,
  userController.createUser,
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User details
 */
router.get('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.DEAN, ROLES.DEPARTMENT_ADMIN), getUserValidator, validate, userController.getUserById);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user (Admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User updated
 */
router.put('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.DEAN, ROLES.DEPARTMENT_ADMIN), updateUserValidator, validate, userController.updateUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User deleted
 */
router.delete('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.DEAN, ROLES.DEPARTMENT_ADMIN), getUserValidator, validate, userController.deleteUser);

export default router;
