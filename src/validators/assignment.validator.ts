import { body, param, query } from 'express-validator';

const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/;
const LEVELS = ['100', '200', '300', '400', '500'];

const toList = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.map(String)
    : typeof value === 'string'
      ? value.split(',').map((v) => v.trim()).filter(Boolean)
      : [];

const validateIdArray = (value: unknown): boolean => toList(value).every((id) => OBJECT_ID_RE.test(id));
const validateLevels = (value: unknown): boolean => toList(value).every((l) => LEVELS.includes(l));

export const createAssignmentValidator = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ min: 3, max: 200 }),
  body('description').optional().trim().isLength({ max: 5000 }),
  body('courseCode').optional({ values: 'falsy' }).trim().isLength({ min: 3, max: 15 }),
  body('dueDate').isISO8601().withMessage('A valid due date is required'),
  body('levels').custom(validateLevels).withMessage('Levels must be 100, 200, 300, 400 or 500'),
  body('lecturerId').optional().isMongoId().withMessage('Valid lecturer ID is required'),
  body('departmentIds').optional().custom(validateIdArray).withMessage('Each departmentId must be a valid ID'),
];

export const updateAssignmentValidator = [
  param('id').isMongoId().withMessage('Invalid assignment ID'),
  body('title').optional().trim().isLength({ min: 3, max: 200 }),
  body('description').optional().trim().isLength({ max: 5000 }),
  body('courseCode').optional({ values: 'falsy' }).trim().isLength({ min: 3, max: 15 }),
  body('dueDate').optional().isISO8601(),
  body('levels').optional().custom(validateLevels).withMessage('Levels must be 100, 200, 300, 400 or 500'),
  body('departmentIds').optional().custom(validateIdArray).withMessage('Each departmentId must be a valid ID'),
];

export const assignmentIdValidator = [param('id').isMongoId().withMessage('Invalid assignment ID')];

export const getAssignmentsValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('departmentId').optional().isMongoId(),
  query('level').optional().isIn(LEVELS),
  query('sort').optional().isString(),
  query('order').optional().isIn(['asc', 'desc']),
];

export const scoreSubmissionValidator = [
  param('submissionId').isMongoId().withMessage('Invalid submission ID'),
  body('score')
    .isFloat({ min: 0, max: 10 })
    .withMessage('Score must be a number between 0 and 10'),
  body('feedback').optional({ values: 'null' }).isString().trim().isLength({ max: 2000 }),
];

export const submissionIdValidator = [param('submissionId').isMongoId().withMessage('Invalid submission ID')];
