import { body, param, query } from 'express-validator';

export const createEventValidator = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ min: 5, max: 200 }),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ min: 20 }),
  body('venue').trim().notEmpty().withMessage('Venue is required').isLength({ min: 3, max: 200 }),
  body('eventDate').isISO8601().withMessage('Valid event date is required (ISO 8601 format)'),
  body('isPublished').optional().isBoolean().withMessage('isPublished must be boolean'),
  body('departmentId').isMongoId().withMessage('Valid department ID is required'),
];

export const updateEventValidator = [
  param('id').isMongoId().withMessage('Invalid event ID'),
  body('title').optional().trim().isLength({ min: 5, max: 200 }),
  body('description').optional().trim().isLength({ min: 20 }),
  body('venue').optional().trim().isLength({ min: 3, max: 200 }),
  body('eventDate').optional().isISO8601(),
  body('isPublished').optional().isBoolean(),
];

export const getEventValidator = [
  param('id').isMongoId().withMessage('Invalid event ID'),
];

export const getEventsValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('departmentId').optional().isMongoId(),
  query('isPublished').optional().isBoolean(),
  query('sort').optional().isString(),
  query('order').optional().isIn(['asc', 'desc']),
];
