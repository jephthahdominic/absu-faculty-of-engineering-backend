import { Request, Response } from 'express';
import { publicationService } from '../services/publication.service';
import { r2Service } from '../services/r2.service';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response.util';
import { asyncHandler } from '../utils/asyncHandler.util';
import { parsePaginationQuery } from '../utils/pagination.util';
import { PUBLICATION_MESSAGES } from '../constants/messages';
import { Role } from '../constants/roles';
import { AppError } from '../services/auth.service';
import { HTTP_STATUS } from '../constants/httpStatus';

function normalizeAuthors(value: unknown): string[] {
  if (typeof value === 'string') return value.split(',').map((a) => a.trim()).filter(Boolean);
  if (Array.isArray(value)) return (value as string[]).map((a) => a.trim()).filter(Boolean);
  return [];
}

export const createPublication = asyncHandler(async (req: Request, res: Response) => {
  const authors = normalizeAuthors(req.body.authors);

  let publicationUrl: string = req.body.publicationUrl;
  if (!publicationUrl && req.file) {
    const { fileUrl } = await r2Service.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      'publications',
    );
    publicationUrl = fileUrl;
  }

  if (!publicationUrl) {
    throw new AppError('Either publicationUrl or a file must be provided', HTTP_STATUS.BAD_REQUEST);
  }

  const pub = await publicationService.createPublication(
    { ...req.body, authors, publicationUrl },
    req.user!.role as Role,
    req.user!.departmentId?.toString(),
  );
  sendCreated(res, PUBLICATION_MESSAGES.CREATED, pub);
});

export const getPublications = asyncHandler(async (req: Request, res: Response) => {
  const query = parsePaginationQuery(req.query as Record<string, unknown>);
  const result = await publicationService.getPublications(query, req.user!.role as Role, req.user!.departmentId?.toString());
  sendPaginated(res, PUBLICATION_MESSAGES.FETCHED, result.data, result.pagination);
});

export const getPublicationById = asyncHandler(async (req: Request, res: Response) => {
  const pub = await publicationService.getPublicationById(
    req.params.id,
    req.user!.role as Role,
    req.user!.departmentId?.toString(),
  );
  sendSuccess(res, PUBLICATION_MESSAGES.FETCHED_ONE, pub);
});

export const updatePublication = asyncHandler(async (req: Request, res: Response) => {
  const pub = await publicationService.updatePublication(
    req.params.id,
    req.body,
    req.user!.role as Role,
    req.user!.departmentId?.toString(),
  );
  sendSuccess(res, PUBLICATION_MESSAGES.UPDATED, pub);
});

export const deletePublication = asyncHandler(async (req: Request, res: Response) => {
  await publicationService.deletePublication(req.params.id, req.user!.role as Role, req.user!.departmentId?.toString());
  sendSuccess(res, PUBLICATION_MESSAGES.DELETED);
});
