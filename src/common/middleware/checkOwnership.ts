import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../errors';
import { RoleType } from '@prisma/client';
import { prisma } from '../../config/database';

/**
 * Check if user owns the resource or is an admin
 * Useful for routes like "update my profile" or "delete my post"
 */
export const checkOwnership = (resourceIdParam: string = 'id') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      const resourceId = req.params[resourceIdParam];
      const userId = req.user.userId;

      // Get user's role
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
      });

      if (!user) {
        throw new ForbiddenError('User not found');
      }

      // Admins can access any resource
      if (user.role.name === RoleType.ADMIN) {
        next();
        return;
      }

      // Regular users can only access their own resources
      if (resourceId !== userId) {
        throw new ForbiddenError('You can only access your own resources');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user can modify the resource
 * Admins and Moderators can modify any resource
 * Regular users can only modify their own resources
 */
export const checkModifyPermission = (resourceIdParam: string = 'id') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      const resourceId = req.params[resourceIdParam];
      const userId = req.user.userId;

      // Get user's role
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
      });

      if (!user) {
        throw new ForbiddenError('User not found');
      }

      // Admins and Moderators can modify any resource
      if (user.role.name === RoleType.ADMIN || user.role.name === RoleType.MODERATOR) {
        next();
        return;
      }

      // Regular users can only modify their own resources
      if (resourceId !== userId) {
        throw new ForbiddenError('You can only modify your own resources');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
