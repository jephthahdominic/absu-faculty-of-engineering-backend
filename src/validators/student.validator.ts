import { body, param, query } from 'express-validator';

export const createStudentValidator = [
  body('fullName').trim().notEmpty().withMessage('Full name is required').isLength({ min: 2, max: 100 }).withMessage('Full name must be 2-100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase and number'),
  body('matricNumber').trim().notEmpty().withMessage('Matriculation number is required').isLength({ min: 3, max: 30 }).withMessage('Matric number must be 3-30 characters'),
  body('departmentId').isMongoId().withMessage('Valid department ID is required'),
];

export const createStudentsBulkValidator = [
  body().isArray({ min: 1 }).withMessage('Request body must be a non-empty array of students'),
  body('*.fullName').trim().notEmpty().withMessage('Full name is required').isLength({ min: 2, max: 100 }).withMessage('Full name must be 2-100 characters'),
  body('*.email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('*.password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase and number'),
  body('*.matricNumber').trim().notEmpty().withMessage('Matriculation number is required').isLength({ min: 3, max: 30 }).withMessage('Matric number must be 3-30 characters'),
  body('*.departmentId').isMongoId().withMessage('Valid department ID is required'),
];

export const updateStudentValidator = [
  param('id').isMongoId().withMessage('Invalid student ID'),
  body('fullName').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Full name must be 2-100 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('level').optional().isIn(['100', '200', '300', '400', '500', '600']).withMessage('Level must be 100, 200, 300, 400, 500, or 600'),
  body('matricNumber').optional().trim().isLength({ min: 3, max: 20 }).withMessage('Matric number must be 3-20 characters'),
  body('departmentId').optional().isMongoId().withMessage('Invalid department ID'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

export const getStudentValidator = [
  param('id').isMongoId().withMessage('Invalid student ID'),
];

export const getStudentsValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  query('search').optional().isString(),
  query('departmentId').optional().isMongoId().withMessage('Invalid department ID'),
  query('level').optional().isIn(['100', '200', '300', '400', '500', '600']).withMessage('Invalid level'),
  query('sort').optional().isString(),
  query('order').optional().isIn(['asc', 'desc']),
];
