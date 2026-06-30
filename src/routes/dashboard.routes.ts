/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard statistics
 */
import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/authenticate.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { ROLES } from '../constants/roles';

const router = Router();

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     description: |
 *       Super Admin gets system-wide stats.
 *       Department Admin gets stats for their department only.
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         departments:
 *                           type: integer
 *                         departmentAdmins:
 *                           type: integer
 *                         students:
 *                           type: integer
 *                         lecturers:
 *                           type: integer
 *                         publications:
 *                           type: integer
 *                         lectureNotes:
 *                           type: integer
 *                         news:
 *                           type: integer
 *                         events:
 *                           type: integer
 */
router.get(
  '/stats',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.DEAN, ROLES.DEPARTMENT_ADMIN),
  dashboardController.getDashboardStats,
);

export default router;
