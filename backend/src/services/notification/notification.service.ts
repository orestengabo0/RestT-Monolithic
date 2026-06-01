import { emailService } from '../email/email.service';
import {
  welcomeEmailTemplate,
  emailVerificationTemplate,
  passwordResetTemplate,
  passwordChangedTemplate,
  accountDeactivatedTemplate,
  newDeviceLoginTemplate,
} from '../email/templates/auth.templates';
import { logger } from '../../config/logger';

export class NotificationService {
  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    try {
      return await emailService.sendEmail({
        to: email,
        subject: 'Welcome to RestT App!',
        html: welcomeEmailTemplate(name),
      });
    } catch (error) {
      logger.error('Failed to send welcome email:', error);
      return false;
    }
  }

  /**
   * Send email verification link
   */
  async sendEmailVerification(email: string, name: string, verificationToken: string): Promise<boolean> {
    try {
      const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
      
      return await emailService.sendEmail({
        to: email,
        subject: 'Verify Your Email Address',
        html: emailVerificationTemplate(name, verificationLink),
      });
    } catch (error) {
      logger.error('Failed to send email verification:', error);
      return false;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string, name: string, resetToken: string): Promise<boolean> {
    try {
      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      
      return await emailService.sendEmail({
        to: email,
        subject: 'Reset Your Password',
        html: passwordResetTemplate(name, resetLink),
      });
    } catch (error) {
      logger.error('Failed to send password reset email:', error);
      return false;
    }
  }

  /**
   * Send password changed confirmation
   */
  async sendPasswordChangedConfirmation(email: string, name: string): Promise<boolean> {
    try {
      return await emailService.sendEmail({
        to: email,
        subject: 'Password Changed Successfully',
        html: passwordChangedTemplate(name),
      });
    } catch (error) {
      logger.error('Failed to send password changed confirmation:', error);
      return false;
    }
  }

  /**
   * Send account deactivation confirmation
   */
  async sendAccountDeactivated(email: string, name: string): Promise<boolean> {
    try {
      return await emailService.sendEmail({
        to: email,
        subject: 'Account Deactivated',
        html: accountDeactivatedTemplate(name),
      });
    } catch (error) {
      logger.error('Failed to send account deactivation email:', error);
      return false;
    }
  }

  /**
   * Send new device login notification
   */
  async sendNewDeviceLogin(
    email: string,
    name: string,
    device: string,
    location: string
  ): Promise<boolean> {
    try {
      const time = new Date().toLocaleString();
      
      return await emailService.sendEmail({
        to: email,
        subject: 'New Device Login Detected',
        html: newDeviceLoginTemplate(name, device, location, time),
      });
    } catch (error) {
      logger.error('Failed to send new device login notification:', error);
      return false;
    }
  }

  /**
   * Send custom email (for future use)
   */
  async sendCustomEmail(
    email: string | string[],
    subject: string,
    html: string
  ): Promise<boolean> {
    try {
      return await emailService.sendEmail({
        to: email,
        subject,
        html,
      });
    } catch (error) {
      logger.error('Failed to send custom email:', error);
      return false;
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
