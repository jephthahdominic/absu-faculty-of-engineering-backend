import { IPaginationQuery, IPaginationResult } from '../interfaces/pagination.interface';

export const parsePaginationQuery = (query: Record<string, unknown>): IPaginationQuery => {
  return {
    page: Math.max(1, parseInt(String(query.page || '1'), 10)),
    limit: Math.min(100, Math.max(1, parseInt(String(query.limit || '20'), 10))),
    search: query.search ? String(query.search).trim() : undefined,
    sort: query.sort ? String(query.sort) : 'createdAt',
    order: query.order === 'asc' ? 'asc' : 'desc',
    departmentId: query.departmentId ? String(query.departmentId) : undefined,
    level: query.level ? String(query.level) : undefined,
    publicationYear: query.publicationYear ? parseInt(String(query.publicationYear), 10) : undefined,
    semester: query.semester ? String(query.semester) : undefined,
    isPublished: query.isPublished !== undefined ? query.isPublished === 'true' : undefined,
    category: query.category ? String(query.category) : undefined,
  };
};

export const buildPaginationResult = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): IPaginationResult<T> => {
  const totalPages = Math.ceil(total / limit);
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

export const getSkip = (page: number, limit: number): number => (page - 1) * limit;
