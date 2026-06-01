import { z } from 'zod';

/**
 * Base pagination query schema
 */
export const paginationQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

/**
 * User list query schema with filters
 */
export const userListQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    sortBy: z.enum(['createdAt', 'email', 'firstName', 'lastName', 'status']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
    search: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
    role: z.enum(['ADMIN', 'USER', 'MODERATOR']).optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
  }),
});

/**
 * Generic list query schema factory
 * Creates a schema with custom sortBy fields
 */
export const createListQuerySchema = (sortByFields: string[]) => {
  return z.object({
    query: z.object({
      page: z.string().optional().default('1'),
      limit: z.string().optional().default('10'),
      sortBy: z.enum(sortByFields as [string, ...string[]]).optional(),
      sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
      search: z.string().optional(),
    }),
  });
};
