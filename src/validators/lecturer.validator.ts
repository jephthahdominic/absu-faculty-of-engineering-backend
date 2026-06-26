import { body, param, query } from 'express-validator';

export const createLecturerValidator = [
  body('firstName').trim().notEmpty().withMessage('First name is required').isLength({ min: 2, max: 50 }),
  body('lastName').trim().notEmpty().withMessage('Last name is required').isLength({ min: 2, max: 50 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('designation').trim().notEmpty().withMessage('Designation is required').isLength({ min: 2, max: 100 }),
  body('bio').optional().trim().isLength({ max: 1000 }).withMessage('Bio must be under 1000 characters'),
  body('departmentId').isMongoId().withMessage('Valid department ID is required'),
];

export const updateLecturerValidator = [
  param('id').isMongoId().withMessage('Invalid lecturer ID'),
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('designation').optional().trim().isLength({ min: 2, max: 100 }),
  body('bio').optional().trim().isLength({ max: 1000 }),
];

export const getLecturerValidator = [
  param('id').isMongoId().withMessage('Invalid lecturer ID'),
];

export const getLecturersValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('departmentId').optional().isMongoId(),
  query('sort').optional().isString(),
  query('order').optional().isIn(['asc', 'desc']),
];
