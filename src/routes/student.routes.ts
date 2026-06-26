/**
 * @swagger
 * tags:
 *   name: Students
 *   description: Student management
 */
import { Router } from 'express';
import * as studentController from '../controllers/student.controller';
import { authenticate } from '../middlewares/authenticate.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { validate } from '../middlewares/validate.middleware';
import { ROLES } from '../constants/roles';
import {
  createStudentValidator,
  createStudentsBulkValidator,
  updateStudentValidator,
  getStudentValidator,
  getStudentsValidator,
} from '../validators/student.validator';

const router = Router();

router.use(authenticate);
router.use(authorize(ROLES.SUPER_ADMIN, ROLES.DEPARTMENT_ADMIN));

/**
 * @swagger
 * /students:
 *   get:
 *     summary: Get all students (paginated)
 *     tags: [Students]
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
 *         description: Search by name, email, or matric number
 *       - in: query
 *         name: departmentId
 *         schema: { type: string }
 *       - in: query
 *         name: level
 *         schema: { type: string, enum: ['100','200','300','400','500'] }
 *     responses:
 *       200:
 *         description: Students list
 */
router.get('/', getStudentsValidator, validate, studentController.getStudents);

/**
 * @swagger
 * /students/{id}:
 *   get:
 *     summary: Get student by ID
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Student details
 */
router.get('/:id', getStudentValidator, validate, studentController.getStudentById);

/**
 * @swagger
 * /students:
 *   post:
 *     summary: Add a single student
 *     tags: [Students]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, password, matricNumber, level, departmentId]
 *             properties:
 *               fullName: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string }
 *               matricNumber: { type: string, example: CSC/2024/001 }
 *               level: { type: string, enum: ['100','200','300','400','500'] }
 *               departmentId: { type: string }
 *     responses:
 *       201:
 *         description: Student created
 */
router.post('/', createStudentValidator, validate, studentController.createStudent);

/**
 * @swagger
 * /students/bulk:
 *   post:
 *     summary: Add multiple students at once
 *     tags: [Students]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               required: [fullName, email, password, matricNumber, level, departmentId]
 *               properties:
 *                 fullName: { type: string }
 *                 email: { type: string, format: email }
 *                 password: { type: string }
 *                 matricNumber: { type: string }
 *                 level: { type: string, enum: ['100','200','300','400','500'] }
 *                 departmentId: { type: string }
 *     responses:
 *       201:
 *         description: Bulk result with created count and failed entries
 */
router.post('/bulk', createStudentsBulkValidator, validate, studentController.createStudentsBulk);

/**
 * @swagger
 * /students/{id}:
 *   put:
 *     summary: Update student
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Student updated
 */
router.put('/:id', updateStudentValidator, validate, studentController.updateStudent);

/**
 * @swagger
 * /students/{id}:
 *   delete:
 *     summary: Delete student
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Student deleted
 */
router.delete('/:id', getStudentValidator, validate, studentController.deleteStudent);

export default router;
