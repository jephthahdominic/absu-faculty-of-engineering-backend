import { body, param, query } from 'express-validator';

const passwordValidator = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .withMessage('Password must contain uppercase, lowercase and number');

export const createLecturerValidator = [
  body('firstName').trim().notEmpty().withMessage('First name is required').isLength({ min: 2, max: 50 }),
  body('lastName').trim().notEmpty().withMessage('Last name is required').isLength({ min: 2, max: 50 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('staffId').optional({ checkFalsy: true }).trim().isLength({ min: 2, max: 30 }),
  body('designation').trim().notEmpty().withMessage('Designation is required').isLength({ min: 2, max: 100 }),
  body('bio').optional().trim().isLength({ max: 1000 }).withMessage('Bio must be under 1000 characters'),
  body('departmentId').isMongoId().withMessage('Valid department ID is required'),
  body('password').optional().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

export const registerLecturerValidator = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .custom((value: string) => value.trim().split(/\s+/).length >= 2)
    .withMessage('Please provide your full name (first and last name)'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('staffId').optional({ checkFalsy: true }).trim().isLength({ min: 2, max: 30 }),
  body('departmentId').isMongoId().withMessage('Valid department ID is required'),
  body('designation').trim().notEmpty().withMessage('Rank/Position is required').isLength({ min: 2, max: 100 }),
  passwordValidator,
];

export const verifyLecturerValidator = [
  param('id').isMongoId().withMessage('Invalid lecturer ID'),
];

export const updateLecturerValidator = [
  param('id').isMongoId().withMessage('Invalid lecturer ID'),
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('staffId').optional({ checkFalsy: true }).trim().isLength({ min: 2, max: 30 }),
  body('designation').optional().trim().isLength({ min: 2, max: 100 }),
  body('bio').optional().trim().isLength({ max: 1000 }),
];

export const getLecturerValidator = [
  param('id').isMongoId().withMessage('Invalid lecturer ID'),
];

export const getLecturersValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 500 }),
  query('search').optional().isString(),
  query('departmentId').optional().isMongoId(),
  query('sort').optional().isString(),
  query('order').optional().isIn(['asc', 'desc']),
];
