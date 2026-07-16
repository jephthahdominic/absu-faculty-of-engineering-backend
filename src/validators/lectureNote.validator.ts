import { body, param, query } from 'express-validator';

export const createLectureNoteValidator = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ min: 3, max: 200 }),
  body('courseCode').trim().notEmpty().withMessage('Course code is required').isLength({ min: 3, max: 15 }),
  body('level').isIn(['100', '200', '300', '400', '500']).withMessage('Level must be 100, 200, 300, 400, or 500'),
  body('semester').isIn(['first', 'second']).withMessage('Semester must be first or second'),
  // Required for admin/dean/HOD (who create on behalf of a lecturer); ignored and
  // auto-filled from the authenticated account when a lecturer creates their own note.
  body('lecturerId').optional().isMongoId().withMessage('Valid lecturer ID is required'),
  body('departmentId').optional().isMongoId().withMessage('Valid department ID is required'),
];

export const updateLectureNoteValidator = [
  param('id').isMongoId().withMessage('Invalid lecture note ID'),
  body('title').optional().trim().isLength({ min: 3, max: 200 }),
  body('courseCode').optional().trim().isLength({ min: 3, max: 15 }),
  body('level').optional().isIn(['100', '200', '300', '400', '500']),
  body('semester').optional().isIn(['first', 'second']),
  body('lecturerId').optional().isMongoId(),
];

export const getLectureNoteValidator = [
  param('id').isMongoId().withMessage('Invalid lecture note ID'),
];

export const getLectureNotesValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('departmentId').optional().isMongoId(),
  query('level').optional().isIn(['100', '200', '300', '400', '500']),
  query('semester').optional().isIn(['first', 'second']),
  query('sort').optional().isString(),
  query('order').optional().isIn(['asc', 'desc']),
];
