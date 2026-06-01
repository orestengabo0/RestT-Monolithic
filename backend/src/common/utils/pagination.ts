/**
 * Pagination and filtering utilities
 */

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface SortParams {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Parse pagination parameters from query string
 */
export const parsePagination = (query: PaginationQuery): PaginationParams => {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '10', 10))); // Max 100 items per page
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Parse sort parameters from query string
 */
export const parseSort = (
  query: PaginationQuery,
  allowedFields: string[] = [],
  defaultSortBy: string = 'createdAt'
): SortParams => {
  const sortBy = query.sortBy || defaultSortBy;
  const sortOrder = (query.sortOrder?.toLowerCase() === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc';

  // Validate sortBy field if allowedFields is provided
  if (allowedFields.length > 0 && !allowedFields.includes(sortBy)) {
    return {
      sortBy: defaultSortBy,
      sortOrder: 'desc',
    };
  }

  return { sortBy, sortOrder };
};

/**
 * Create paginated response
 */
export const createPaginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrev,
    },
  };
};

/**
 * Build Prisma orderBy object from sort parameters
 */
export const buildOrderBy = (sortParams: SortParams): Record<string, 'asc' | 'desc'> => {
  return {
    [sortParams.sortBy]: sortParams.sortOrder,
  };
};

/**
 * Parse filter parameters from query string
 * Supports: search, status, role, dateFrom, dateTo
 */
export interface FilterParams {
  search?: string;
  status?: string;
  role?: string;
  dateFrom?: Date;
  dateTo?: Date;
  [key: string]: any;
}

export const parseFilters = (query: Record<string, any>): FilterParams => {
  const filters: FilterParams = {};

  // Search filter
  if (query.search && typeof query.search === 'string') {
    filters.search = query.search.trim();
  }

  // Status filter
  if (query.status && typeof query.status === 'string') {
    filters.status = query.status.toUpperCase();
  }

  // Role filter
  if (query.role && typeof query.role === 'string') {
    filters.role = query.role.toUpperCase();
  }

  // Date range filters
  if (query.dateFrom) {
    const dateFrom = new Date(query.dateFrom);
    if (!isNaN(dateFrom.getTime())) {
      filters.dateFrom = dateFrom;
    }
  }

  if (query.dateTo) {
    const dateTo = new Date(query.dateTo);
    if (!isNaN(dateTo.getTime())) {
      filters.dateTo = dateTo;
    }
  }

  // Add any other custom filters
  Object.keys(query).forEach((key) => {
    if (!['page', 'limit', 'sortBy', 'sortOrder', 'search', 'status', 'role', 'dateFrom', 'dateTo'].includes(key)) {
      filters[key] = query[key];
    }
  });

  return filters;
};

/**
 * Build Prisma where clause for user filters
 */
export const buildUserWhereClause = (filters: FilterParams): any => {
  const where: any = {};

  // Search across multiple fields
  if (filters.search) {
    where.OR = [
      { email: { contains: filters.search, mode: 'insensitive' } },
      { firstName: { contains: filters.search, mode: 'insensitive' } },
      { lastName: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  // Status filter
  if (filters.status) {
    where.status = filters.status;
  }

  // Role filter (via relation)
  if (filters.role) {
    where.role = {
      name: filters.role,
    };
  }

  // Date range filter
  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) {
      where.createdAt.gte = filters.dateFrom;
    }
    if (filters.dateTo) {
      where.createdAt.lte = filters.dateTo;
    }
  }

  return where;
};
