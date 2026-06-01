import { Router } from 'express';
import { asyncHandler } from '../../common/middleware/asyncHandler';
import { validate } from '../../common/validators/validate';
import { authenticate } from '../../common/middleware/authenticate';
import { isAdmin, isAdminOrModerator } from '../../common/middleware/authorize';
import { checkOwnership } from '../../common/middleware/checkOwnership';
import { getUserSchema } from '../../common/validators/exampleSchema';
import { updateProfileSchema, changePasswordSchema, deactivateAccountSchema } from './user.validators';
import { userListQuerySchema } from '../../common/validators/paginationSchema';
import { ApiResponse } from '../../common/responses/apiResponse';
import { userService } from './user.service';
import { z } from 'zod';
import './user.swagger'; // Import Swagger documentation

const router = Router();

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users
 *     description: Get paginated list of all users with filtering and sorting (Admin/Moderator only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page (max 100)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, email, firstName, lastName, status]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in email, firstName, lastName
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, SUSPENDED]
 *         description: Filter by user status
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ADMIN, USER, MODERATOR]
 *         description: Filter by user role
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter users created from this date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter users created until this date
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         data:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/User'
 *                         pagination:
 *                           $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
// Get all users with pagination, sorting, and filtering (Admin and Moderator only)
router.get(
  '/',
  authenticate,
  isAdminOrModerator,
  validate(userListQuerySchema),
  asyncHandler(async (req, res) => {
    const result = await userService.getAllUsers(req.query);

    return ApiResponse.success(res, result, 'Users retrieved successfully');
  })
);

// Get user statistics (Admin only)
router.get(
  '/stats',
  authenticate,
  isAdmin,
  asyncHandler(async (req, res) => {
    const stats = await userService.getUserStats();

    return ApiResponse.success(res, stats, 'User statistics retrieved');
  })
);

// Get user by ID (Admin and Moderator only)
router.get(
  '/:id',
  authenticate,
  isAdminOrModerator,
  validate(getUserSchema),
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;

    const user = await userService.getUserById(id);

    return ApiResponse.success(res, user, 'User retrieved successfully');
  })
);

// Update user profile (Owner or Admin)
router.patch(
  '/:id/profile',
  authenticate,
  checkOwnership('id'),
  validate(updateProfileSchema),
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const { firstName, lastName } = req.body;

    const user = await userService.updateProfile(id, { firstName, lastName });

    return ApiResponse.success(res, user, 'Profile updated successfully');
  })
);

// Change password (Owner only)
router.patch(
  '/:id/password',
  authenticate,
  checkOwnership('id'),
  validate(changePasswordSchema),
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const { currentPassword, newPassword } = req.body;

    const result = await userService.changePassword(id, currentPassword, newPassword);

    return ApiResponse.success(res, result, 'Password changed successfully');
  })
);

// Deactivate account (Owner only)
router.post(
  '/:id/deactivate',
  authenticate,
  checkOwnership('id'),
  validate(deactivateAccountSchema),
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const { password } = req.body;

    const result = await userService.deactivateAccount(id, password);

    return ApiResponse.success(res, result, 'Account deactivated successfully');
  })
);

// Update user status (Admin only)
const updateStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID'),
  }),
  body: z.object({
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
  }),
});

router.patch(
  '/:id/status',
  authenticate,
  isAdmin,
  validate(updateStatusSchema),
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const { status } = req.body;

    const user = await userService.updateUserStatus(id, status);

    return ApiResponse.success(res, user, 'User status updated successfully');
  })
);

// Delete user (Admin only)
router.delete(
  '/:id',
  authenticate,
  isAdmin,
  validate(getUserSchema),
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;

    const result = await userService.deleteUser(id);

    return ApiResponse.success(res, result, 'User deleted successfully');
  })
);

export default router;
