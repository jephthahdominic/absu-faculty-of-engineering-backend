export interface IPaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  departmentId?: string;
  level?: string;
  publicationYear?: number;
  semester?: string;
  isPublished?: boolean;
  category?: string;
}

export interface IPaginationResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
