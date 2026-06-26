import multer from 'multer';
import { Request } from 'express';
import { AppError } from '../services/auth.service';
import { HTTP_STATUS } from '../constants/httpStatus';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_DOC_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_DOC_SIZE = 50 * 1024 * 1024;

const imageFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback): void => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only JPEG, PNG, and WebP images are allowed', HTTP_STATUS.BAD_REQUEST));
  }
};

const documentFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback): void => {
  if ([...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only PDF, Word, PowerPoint, and image files are allowed', HTTP_STATUS.BAD_REQUEST));
  }
};

export const uploadImage = multer({
  storage: multer.memoryStorage(),
  fileFilter: imageFilter,
  limits: { fileSize: MAX_IMAGE_SIZE },
}).single('image');

export const uploadDocument = multer({
  storage: multer.memoryStorage(),
  fileFilter: documentFilter,
  limits: { fileSize: MAX_DOC_SIZE },
}).single('file');

export const uploadOptionalImage = multer({
  storage: multer.memoryStorage(),
  fileFilter: imageFilter,
  limits: { fileSize: MAX_IMAGE_SIZE },
}).single('image');
