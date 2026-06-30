import { body, param, query } from 'express-validator';

export const createPublicationValidator = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ min: 5, max: 300 }),
  body('journal').trim().notEmpty().withMessage('Journal is required').isLength({ min: 2, max: 200 }),
  body('publicationYear')
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage(`Publication year must be between 1900 and ${new Date().getFullYear() + 1}`),
  body('publicationUrl').optional().isURL().withMessage('Valid publication URL is required'),
  body('authors').custom((value) => {
    if (typeof value === 'string' && value.trim().length > 0) return true;
    if (Array.isArray(value) && value.length > 0) return true;
    throw new Error('At least one author is required');
  }),
  body('lecturerId').isMongoId().withMessage('Valid lecturer ID is required'),
  body('departmentId').isMongoId().withMessage('Valid department ID is required'),
];

export const updatePublicationValidator = [
  param('id').isMongoId().withMessage('Invalid publication ID'),
  body('title').optional().trim().isLength({ min: 5, max: 300 }),
  body('journal').optional().trim().isLength({ min: 2, max: 200 }),
  body('publicationYear').optional().isInt({ min: 1900, max: new Date().getFullYear() + 1 }),
  body('publicationUrl').optional().isURL(),
  body('authors').optional().isArray({ min: 1 }),
  body('lecturerId').optional().isMongoId(),
];

export const getPublicationValidator = [
  param('id').isMongoId().withMessage('Invalid publication ID'),
];

export const getPublicationsValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('departmentId').optional().isMongoId(),
  query('publicationYear').optional().isInt({ min: 1900 }),
  query('sort').optional().isString(),
  query('order').optional().isIn(['asc', 'desc']),
];
