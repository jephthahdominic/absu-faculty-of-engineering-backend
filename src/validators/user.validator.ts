import { body, param, query } from 'express-validator';
import { ROLES } from '../constants/roles';

const CREATABLE_ROLES = [ROLES.SUPER_ADMIN, ROLES.DEAN, ROLES.DEPARTMENT_ADMIN];

export const getDeanValidator = [
  param('id').isMongoId().withMessage('Invalid dean ID'),
];

export const createUserValidator = [
  body('fullName').trim().notEmpty().withMessage('Full name is required').isLength({ min: 2, max: 100 }).withMessage('Full name must be 2-100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .optional()
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase and number'),
  body('role')
    .isIn(CREATABLE_ROLES)
    .withMessage(`Role must be one of: ${CREATABLE_ROLES.join(', ')}`),
  body('departmentId').optional().isMongoId().withMessage('Invalid department ID'),
];

export const updateUserValidator = [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('fullName').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Full name must be 2-100 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('departmentId').optional().isMongoId().withMessage('Invalid department ID'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
];

export const getUserValidator = [
  param('id').isMongoId().withMessage('Invalid user ID'),
];

export const getUsersValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  query('search').optional().isString(),
  query('sort').optional().isString(),
  query('order').optional().isIn(['asc', 'desc']),
  query('departmentId').optional().isMongoId().withMessage('Invalid department ID'),
];
