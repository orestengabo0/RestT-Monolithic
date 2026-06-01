import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../../config/database';
import { JwtService } from '../../config/jwt';
import { notificationService } from '../../services/notification/notification.service';
import { 
  BadRequestError, 
  UnauthorizedError, 
  ConflictError,
  NotFoundError 
} from '../../common/errors';
import { UserStatus } from '@prisma/client';

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  // Register new user
  async register(data: RegisterInput) {
    const { email, password, firstName, lastName } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Get default USER role
    const userRole = await prisma.role.findUnique({
      where: { name: 'USER' },
    });

    if (!userRole) {
      throw new BadRequestError('Default user role not found. Please run database seed.');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        roleId: userRole.id,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        emailVerified: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
      },
    });

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedVerificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
    
    // Set token expiration (24 hours from now)
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Store verification token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: hashedVerificationToken,
        emailVerificationExpires: verificationExpires,
      },
    });

    // Generate tokens
    const accessToken = JwtService.generateAccessToken({
      userId: user.id,
      email: user.email,
      roleId: user.role.id,
    });

    const refreshToken = JwtService.generateRefreshToken({
      userId: user.id,
      email: user.email,
      roleId: user.role.id,
    });

    // Store refresh token
    await this.storeRefreshToken(user.id, refreshToken);

    // Send welcome email (non-blocking)
    notificationService.sendWelcomeEmail(user.email, user.firstName).catch((error) => {
      // Log error but don't fail registration
      console.error('Failed to send welcome email:', error);
    });

    // Send email verification (non-blocking)
    notificationService
      .sendEmailVerification(user.email, user.firstName, verificationToken)
      .catch((error) => {
        console.error('Failed to send verification email:', error);
      });

    return {
      user,
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  // Login user
  async login(data: LoginInput) {
    const { email, password } = data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check if user is active
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedError('Account is not active');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const accessToken = JwtService.generateAccessToken({
      userId: user.id,
      email: user.email,
      roleId: user.role.id,
    });

    const refreshToken = JwtService.generateRefreshToken({
      userId: user.id,
      email: user.email,
      roleId: user.role.id,
    });

    // Store refresh token
    await this.storeRefreshToken(user.id, refreshToken);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: {
        ...userWithoutPassword,
        role: {
          id: user.role.id,
          name: user.role.name,
        },
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  // Refresh access token
  async refreshToken(refreshToken: string) {
    // Verify refresh token
    const payload = JwtService.verifyRefreshToken(refreshToken);

    // Check if refresh token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: {
        user: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!storedToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Check if token is expired
    if (storedToken.expiresAt < new Date()) {
      // Delete expired token
      await prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });
      throw new UnauthorizedError('Refresh token expired');
    }

    // Check if user is still active
    if (storedToken.user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedError('Account is not active');
    }

    // Generate new access token
    const newAccessToken = JwtService.generateAccessToken({
      userId: storedToken.user.id,
      email: storedToken.user.email,
      roleId: storedToken.user.roleId,
    });

    return {
      accessToken: newAccessToken,
    };
  }

  // Logout user
  async logout(refreshToken: string) {
    // Delete refresh token from database
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });

    return { message: 'Logged out successfully' };
  }

  // Logout from all devices
  async logoutAll(userId: string) {
    // Delete all refresh tokens for user
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });

    return { message: 'Logged out from all devices' };
  }

  // Get current user profile
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

  // Store refresh token in database
  private async storeRefreshToken(userId: string, token: string) {
    const expiresAt = new Date(Date.now() + JwtService.getRefreshTokenExpiration());

    await prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
  }

  // Clean up expired tokens (can be run as a cron job)
  async cleanupExpiredTokens() {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return { deletedCount: result.count };
  }

  // Forgot password - send reset token to email
  async forgotPassword(email: string) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Don't reveal if user exists or not for security
    if (!user) {
      return { 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      };
    }

    // Check if user is active
    if (user.status !== UserStatus.ACTIVE) {
      return { 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      };
    }

    // Generate reset token (32 bytes = 64 hex characters)
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash the token before storing in database
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set token expiration (1 hour from now)
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

    // Store hashed token in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpires: resetExpires,
      },
    });

    // Send reset email with unhashed token (non-blocking)
    notificationService
      .sendPasswordReset(user.email, user.firstName, resetToken)
      .catch((error) => {
        console.error('Failed to send password reset email:', error);
      });

    return { 
      message: 'If an account with that email exists, a password reset link has been sent.' 
    };
  }

  // Reset password with token
  async resetPassword(token: string, newPassword: string) {
    // Hash the provided token to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: {
          gt: new Date(), // Token not expired
        },
      },
    });

    if (!user) {
      throw new BadRequestError('Invalid or expired reset token');
    }

    // Check if user is active
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedError('Account is not active');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    // Invalidate all refresh tokens (logout from all devices)
    await prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    });

    // Send password changed confirmation email (non-blocking)
    notificationService
      .sendPasswordChangedConfirmation(user.email, user.firstName)
      .catch((error) => {
        console.error('Failed to send password changed confirmation:', error);
      });

    return { 
      message: 'Password has been reset successfully. Please login with your new password.' 
    };
  }

  // Verify email with token
  async verifyEmail(token: string) {
    // Hash the provided token to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid verification token
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: hashedToken,
        emailVerificationExpires: {
          gt: new Date(), // Token not expired
        },
      },
    });

    if (!user) {
      throw new BadRequestError('Invalid or expired verification token');
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return { 
        message: 'Email is already verified.' 
      };
    }

    // Update user to mark email as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    return { 
      message: 'Email verified successfully!' 
    };
  }

  // Resend verification email
  async resendVerificationEmail(email: string) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Don't reveal if user exists or not for security
    if (!user) {
      return { 
        message: 'If an account with that email exists and is not verified, a verification email has been sent.' 
      };
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return { 
        message: 'Email is already verified.' 
      };
    }

    // Check if user is active
    if (user.status !== UserStatus.ACTIVE) {
      return { 
        message: 'If an account with that email exists and is not verified, a verification email has been sent.' 
      };
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedVerificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
    
    // Set token expiration (24 hours from now)
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Update verification token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: hashedVerificationToken,
        emailVerificationExpires: verificationExpires,
      },
    });

    // Send verification email (non-blocking)
    notificationService
      .sendEmailVerification(user.email, user.firstName, verificationToken)
      .catch((error) => {
        console.error('Failed to send verification email:', error);
      });

    return { 
      message: 'If an account with that email exists and is not verified, a verification email has been sent.' 
    };
  }
}

export const authService = new AuthService();
