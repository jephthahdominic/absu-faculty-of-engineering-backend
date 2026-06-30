import { body } from 'express-validator';

export const updateSessionValidator = [
  body('session')
    .trim()
    .notEmpty()
    .withMessage('Session is required')
    .matches(/^\d{4}\/\d{4}$/)
    .withMessage('Session must be in format YYYY/YYYY (e.g. 2026/2027)'),
];
