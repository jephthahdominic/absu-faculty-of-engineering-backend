/**
 * @swagger
 * tags:
 *   name: Academic Session
 *   description: Academic session management (Dean only)
 */
import { Router } from 'express';
import * as sessionController from '../controllers/academicSession.controller';
import { authenticate } from '../middlewares/authenticate.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { requireVerifiedLecturer } from '../middlewares/requireVerifiedLecturer.middleware';
import { validate } from '../middlewares/validate.middleware';
import { ROLES, SUPER_LEVEL_ROLES } from '../constants/roles';
import { updateSessionValidator } from '../validators/academicSession.validator';

const router = Router();

router.use(authenticate);
router.use(requireVerifiedLecturer);

/**
 * @swagger
 * /academic-session:
 *   get:
 *     summary: Get current academic session
 *     tags: [Academic Session]
 *     responses:
 *       200:
 *         description: Current academic session
 */
router.get('/', authorize(...SUPER_LEVEL_ROLES, ROLES.DEPARTMENT_ADMIN), sessionController.getCurrentSession);

/**
 * @swagger
 * /academic-session:
 *   put:
 *     summary: Update academic session (Dean only) — recalculates all student levels
 *     tags: [Academic Session]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [session]
 *             properties:
 *               session:
 *                 type: string
 *                 example: "2026/2027"
 *     responses:
 *       200:
 *         description: Session updated and student levels recalculated
 */
router.put('/', authorize(ROLES.DEAN), updateSessionValidator, validate, sessionController.updateSession);

export default router;
