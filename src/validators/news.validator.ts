import { body, param, query } from 'express-validator';
import { NEWS_CATEGORIES } from '../interfaces/news.interface';

export const createNewsValidator = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 120 }).withMessage('Title must be at most 120 characters'),
  body('summary').optional().trim().isLength({ max: 300 }).withMessage('Summary must be at most 300 characters'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('category').optional().isIn(NEWS_CATEGORIES).withMessage('Invalid category'),
  body('isFeatured').optional().isBoolean().withMessage('isFeatured must be a boolean'),
  body('isPublished').optional().isBoolean().withMessage('isPublished must be a boolean'),
  body('publishedAt').optional().isISO8601().withMessage('publishedAt must be a valid date'),
  body('metaTitle').optional().trim().isLength({ max: 80 }).withMessage('Meta title must be at most 80 characters'),
  body('metaDescription').optional().trim().isLength({ max: 180 }).withMessage('Meta description must be at most 180 characters'),
];

export const updateNewsValidator = [
  param('id').isMongoId().withMessage('Invalid news ID'),
  body('title').optional().trim().isLength({ max: 120 }).withMessage('Title must be at most 120 characters'),
  body('summary').optional().trim().isLength({ max: 300 }).withMessage('Summary must be at most 300 characters'),
  body('content').optional().trim().notEmpty().withMessage('Content cannot be empty'),
  body('category').optional().isIn(NEWS_CATEGORIES).withMessage('Invalid category'),
  body('isFeatured').optional().isBoolean().withMessage('isFeatured must be a boolean'),
  body('isPublished').optional().isBoolean().withMessage('isPublished must be a boolean'),
  body('publishedAt').optional().isISO8601().withMessage('publishedAt must be a valid date'),
  body('metaTitle').optional().trim().isLength({ max: 80 }).withMessage('Meta title must be at most 80 characters'),
  body('metaDescription').optional().trim().isLength({ max: 180 }).withMessage('Meta description must be at most 180 characters'),
];

export const getNewsValidator = [
  param('id').isMongoId().withMessage('Invalid news ID'),
];

export const getNewsListValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('category').optional().isIn(NEWS_CATEGORIES),
  query('isPublished').optional().isBoolean(),
  query('isFeatured').optional().isBoolean(),
  query('sort').optional().isString(),
];
