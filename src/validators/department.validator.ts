import { body, param, query } from 'express-validator';

export const createDepartmentValidator = [
  body('name').trim().notEmpty().withMessage('Department name is required').isLength({ min: 2, max: 100 }),
  body('code').trim().notEmpty().withMessage('Department code is required').isLength({ min: 2, max: 10 }).matches(/^[A-Za-z0-9]+$/).withMessage('Code must be alphanumeric'),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ min: 10, max: 500 }),
];

export const updateDepartmentValidator = [
  param('id').isMongoId().withMessage('Invalid department ID'),
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('code').optional().trim().isLength({ min: 2, max: 10 }).matches(/^[A-Za-z0-9]+$/),
  body('description').optional().trim().isLength({ min: 10, max: 500 }),
];

export const getDepartmentValidator = [
  param('id').isMongoId().withMessage('Invalid department ID'),
];

export const getDepartmentsValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('sort').optional().isString(),
  query('order').optional().isIn(['asc', 'desc']),
];
