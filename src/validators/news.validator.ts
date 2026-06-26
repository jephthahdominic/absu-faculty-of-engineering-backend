import { body, param, query } from 'express-validator';

export const createNewsValidator = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('content').trim().notEmpty().withMessage('Content is required').isLength({ min: 10 }).withMessage('Content must be at least 10 characters'),
  body('category').trim().notEmpty().withMessage('Category is required').isLength({ min: 2, max: 50 }).withMessage('Category must be between 2 and 50 characters'),
  body('isPublished').optional().isBoolean().withMessage('isPublished must be a boolean'),
  body('departmentId').isMongoId().withMessage('Valid department ID is required'),
];

export const updateNewsValidator = [
  param('id').isMongoId().withMessage('Invalid news ID'),
  body('title').optional().trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('content').optional().trim().isLength({ min: 10 }).withMessage('Content must be at least 10 characters'),
  body('category').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Category must be between 2 and 50 characters'),
  body('isPublished').optional().isBoolean().withMessage('isPublished must be a boolean'),
];

export const getNewsValidator = [
  param('id').isMongoId().withMessage('Invalid news ID'),
];

export const getNewsListValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('departmentId').optional().isMongoId(),
  query('category').optional().isString(),
  query('isPublished').optional().isBoolean(),
  query('sort').optional().isString(),
  query('order').optional().isIn(['asc', 'desc']),
];
