import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../errors';
import { RoleType } from '@prisma/client';

/**
 * Authorization middleware - checks if user has required role(s)
 * Must be used after authenticate middleware
 */
export const authorize = (...allowedRoles: RoleType[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // User should be attached by authenticate middleware
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      // Get user's role from database to ensure it's current
      const { prisma } = await import('../../config/database');
      
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: { role: true },
      });

      if (!user) {
        throw new ForbiddenError('User not found');
      }

      // Check if user's role is in allowed roles
      if (!allowedRoles.includes(user.role.name)) {
        throw new ForbiddenError('Insufficient permissions');
      }

      // Attach full role info to request for use in route handlers
      req.user.roleId = user.role.id;

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user is admin
 */
export const isAdmin = authorize(RoleType.ADMIN);

/**
 * Check if user is admin or moderator
 */
export const isAdminOrModerator = authorize(RoleType.ADMIN, RoleType.MODERATOR);

/**
 * Allow any authenticated user
 */
export const isAuthenticated = authorize(RoleType.ADMIN, RoleType.MODERATOR, RoleType.USER);
