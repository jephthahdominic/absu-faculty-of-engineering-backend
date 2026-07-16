import { body, param, query } from 'express-validator';

const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/;

const validateIdArray = (value: unknown): boolean => {
  const ids = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',').map((v) => v.trim()).filter(Boolean)
      : [];
  if (ids.length === 0) return true; // optional — requiredness is enforced in the service
  return ids.every((id) => OBJECT_ID_RE.test(String(id)));
};

export const createLectureNoteValidator = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ min: 3, max: 200 }),
  body('courseCode').trim().notEmpty().withMessage('Course code is required').isLength({ min: 3, max: 15 }),
  body('level').isIn(['100', '200', '300', '400', '500']).withMessage('Level must be 100, 200, 300, 400, or 500'),
  body('semester').isIn(['first', 'second']).withMessage('Semester must be first or second'),
  // Required for admin/dean/HOD (who create on behalf of a lecturer); ignored and
  // auto-filled from the authenticated account when a lecturer creates their own note.
  body('lecturerId').optional().isMongoId().withMessage('Valid lecturer ID is required'),
  // Array of department IDs (a lecturer may teach — and upload notes for — more
  // than one department). Accepts repeated form fields, a JSON array string, or a
  // comma-separated string. department_admin's own department is auto-applied
  // server-side regardless of what's submitted here.
  body('departmentIds').optional().custom(validateIdArray).withMessage('Each departmentId must be a valid ID'),
];

export const updateLectureNoteValidator = [
  param('id').isMongoId().withMessage('Invalid lecture note ID'),
  body('title').optional().trim().isLength({ min: 3, max: 200 }),
  body('courseCode').optional().trim().isLength({ min: 3, max: 15 }),
  body('level').optional().isIn(['100', '200', '300', '400', '500']),
  body('semester').optional().isIn(['first', 'second']),
  body('lecturerId').optional().isMongoId(),
  body('departmentIds').optional().custom(validateIdArray).withMessage('Each departmentId must be a valid ID'),
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
