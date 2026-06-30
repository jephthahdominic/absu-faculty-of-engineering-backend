/**
 * @swagger
 * tags:
 *   name: Departments
 *   description: Department management (Super Admin only)
 */
import { Router } from 'express';
import * as deptController from '../controllers/department.controller';
import { authenticate } from '../middlewares/authenticate.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { validate } from '../middlewares/validate.middleware';
import { ROLES, SUPER_LEVEL_ROLES } from '../constants/roles';
import {
  createDepartmentValidator,
  updateDepartmentValidator,
  getDepartmentValidator,
  getDepartmentsValidator,
} from '../validators/department.validator';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /departments:
 *   get:
 *     summary: Get all departments
 *     tags: [Departments]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: sort
 *         schema: { type: string, default: createdAt }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *     responses:
 *       200:
 *         description: Departments list
 */
router.get('/', getDepartmentsValidator, validate, deptController.getDepartments);

/**
 * @swagger
 * /departments/{id}:
 *   get:
 *     summary: Get department by ID
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Department details
 *       404:
 *         description: Department not found
 */
router.get('/:id', getDepartmentValidator, validate, deptController.getDepartmentById);

/**
 * @swagger
 * /departments:
 *   post:
 *     summary: Create department (Super Admin)
 *     tags: [Departments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, code, description]
 *             properties:
 *               name: { type: string, example: Computer Science }
 *               code: { type: string, example: CSC }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Department created
 */
router.post('/', authorize(...SUPER_LEVEL_ROLES), createDepartmentValidator, validate, deptController.createDepartment);

/**
 * @swagger
 * /departments/{id}:
 *   put:
 *     summary: Update department (Super Admin)
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               code: { type: string }
 *               description: { type: string }
 *     responses:
 *       200:
 *         description: Department updated
 */
router.put('/:id', authorize(...SUPER_LEVEL_ROLES), updateDepartmentValidator, validate, deptController.updateDepartment);

/**
 * @swagger
 * /departments/{id}:
 *   delete:
 *     summary: Delete department (Super Admin)
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Department deleted
 */
router.delete('/:id', authorize(...SUPER_LEVEL_ROLES), getDepartmentValidator, validate, deptController.deleteDepartment);

export default router;
