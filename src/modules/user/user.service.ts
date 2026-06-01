import { prisma } from '../../config/database';
import { NotFoundError, BadRequestError } from '../../common/errors';
import { notificationService } from '../../services/notification/notification.service';
import {
  parsePagination,
  parseSort,
  parseFilters,
  buildOrderBy,
  buildUserWhereClause,
  createPaginatedResponse,
  type PaginationQuery,
  type FilterParams,
} from '../../common/utils/pagination';

// Define UserStatus enum locally since Prisma v7 doesn't export it
enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export class UserService {
  // Get all users with pagination, sorting, and filtering
  async getAllUsers(query: PaginationQuery & Record<string, any>) {
    // Parse pagination parameters
    const { page, limit, skip } = parsePagination(query);

    // Parse sort parameters
    const sortParams = parseSort(query, ['createdAt', 'email', 'firstName', 'lastName', 'status'], 'createdAt');

    // Parse filters
    const filters = parseFilters(query);

    // Build where clause
    const where = buildUserWhereClause(filters);

    // Build orderBy clause
    const orderBy = buildOrderBy(sortParams);

    // Fetch users and total count
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          status: true,
          emailVerified: true,
          lastLoginAt: true,
          role: {
            select: {
              id: true,
              name: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return createPaginatedResponse(users, total, page, limit);
  }

  // Get user by ID
  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        emailVerified: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  // Get user by email
  async getUserByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  // Update user status
  async updateUserStatus(id: string, status: UserStatus) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return await prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
      },
    });
  }

  // Delete user
  async deleteUser(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    await prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }

  // Get user statistics
  async getUserStats() {
    const [total, active, inactive, suspended, verified] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
      prisma.user.count({ where: { status: UserStatus.INACTIVE } }),
      prisma.user.count({ where: { status: UserStatus.SUSPENDED } }),
      prisma.user.count({ where: { emailVerified: true } }),
    ]);

    return {
      total,
      active,
      inactive,
      suspended,
      verified,
      unverified: total - verified,
    };
  }

  // Update user profile
  async updateProfile(userId: string, data: { firstName?: string; lastName?: string }) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        emailVerified: true,
        updatedAt: true,
      },
    });
  }

  // Change password
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const bcrypt = await import('bcryptjs');
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      throw new BadRequestError('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Invalidate all refresh tokens (logout from all devices)
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });

    // Send password changed confirmation email (non-blocking)
    notificationService.sendPasswordChangedConfirmation(user.email, user.firstName).catch((error) => {
      console.error('Failed to send password changed email:', error);
    });

    return { message: 'Password changed successfully. Please login again.' };
  }

  // Deactivate account (user self-deactivation)
  async deactivateAccount(userId: string, password: string) {
    const bcrypt = await import('bcryptjs');
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify password for security
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new BadRequestError('Password is incorrect');
    }

    // Set status to INACTIVE
    await prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.INACTIVE },
    });

    // Invalidate all refresh tokens (logout from all devices)
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });

    // Send account deactivation email (non-blocking)
    notificationService.sendAccountDeactivated(user.email, user.firstName).catch((error) => {
      console.error('Failed to send account deactivation email:', error);
    });

    return { message: 'Account deactivated successfully' };
  }
}

export const userService = new UserService();
