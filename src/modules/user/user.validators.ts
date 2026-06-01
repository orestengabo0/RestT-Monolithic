import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z
      .string()
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name must not exceed 50 characters')
      .trim()
      .optional(),
    lastName: z
      .string()
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name must not exceed 50 characters')
      .trim()
      .optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z
      .string()
      .min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(6, 'New password must be at least 6 characters')
      .max(100, 'New password must not exceed 100 characters'),
  }),
});

export const deactivateAccountSchema = z.object({
  body: z.object({
    password: z
      .string()
      .min(1, 'Password is required for account deactivation'),
  }),
});
