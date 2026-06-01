import { baseEmailTemplate } from './base.template';

/**
 * Welcome email template
 */
export const welcomeEmailTemplate = (name: string) => {
  const content = `
    <h2>Welcome to RestT App!</h2>
    <p>Hi ${name},</p>
    <p>Thank you for registering with RestT App. We're excited to have you on board!</p>
    <p>You can now access all features of our platform. If you have any questions or need assistance, feel free to reach out to our support team.</p>
    <p>Best regards,<br>The RestT Team</p>
  `;
  return baseEmailTemplate(content, 'Welcome to RestT App');
};

/**
 * Email verification template
 */
export const emailVerificationTemplate = (name: string, verificationLink: string) => {
  const content = `
    <h2>Verify Your Email Address</h2>
    <p>Hi ${name},</p>
    <p>Thank you for registering with RestT App. To complete your registration, please verify your email address by clicking the button below:</p>
    <p style="text-align: center;">
      <a href="${verificationLink}" class="button">Verify Email Address</a>
    </p>
    <p class="text-muted">Or copy and paste this link into your browser:</p>
    <p class="text-muted" style="word-break: break-all;">${verificationLink}</p>
    <p class="text-muted">This link will expire in 24 hours.</p>
    <p>If you didn't create an account with us, please ignore this email.</p>
    <p>Best regards,<br>The RestT Team</p>
  `;
  return baseEmailTemplate(content, 'Verify Your Email');
};

/**
 * Password reset template
 */
export const passwordResetTemplate = (name: string, resetLink: string) => {
  const content = `
    <h2>Reset Your Password</h2>
    <p>Hi ${name},</p>
    <p>We received a request to reset your password. Click the button below to create a new password:</p>
    <p style="text-align: center;">
      <a href="${resetLink}" class="button">Reset Password</a>
    </p>
    <p class="text-muted">Or copy and paste this link into your browser:</p>
    <p class="text-muted" style="word-break: break-all;">${resetLink}</p>
    <p class="text-muted">This link will expire in 1 hour.</p>
    <p><strong>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</strong></p>
    <p>Best regards,<br>The RestT Team</p>
  `;
  return baseEmailTemplate(content, 'Reset Your Password');
};

/**
 * Password changed confirmation template
 */
export const passwordChangedTemplate = (name: string) => {
  const content = `
    <h2>Password Changed Successfully</h2>
    <p>Hi ${name},</p>
    <p>This email confirms that your password was successfully changed.</p>
    <p>If you made this change, no further action is required.</p>
    <p><strong>If you didn't change your password, please contact our support team immediately.</strong></p>
    <p>Best regards,<br>The RestT Team</p>
  `;
  return baseEmailTemplate(content, 'Password Changed');
};

/**
 * Account deactivation template
 */
export const accountDeactivatedTemplate = (name: string) => {
  const content = `
    <h2>Account Deactivated</h2>
    <p>Hi ${name},</p>
    <p>Your account has been successfully deactivated as requested.</p>
    <p>If you wish to reactivate your account in the future, please contact our support team.</p>
    <p>We're sorry to see you go. If you have any feedback about your experience, we'd love to hear from you.</p>
    <p>Best regards,<br>The RestT Team</p>
  `;
  return baseEmailTemplate(content, 'Account Deactivated');
};

/**
 * Login from new device template
 */
export const newDeviceLoginTemplate = (name: string, device: string, location: string, time: string) => {
  const content = `
    <h2>New Device Login Detected</h2>
    <p>Hi ${name},</p>
    <p>We detected a login to your account from a new device:</p>
    <ul>
      <li><strong>Device:</strong> ${device}</li>
      <li><strong>Location:</strong> ${location}</li>
      <li><strong>Time:</strong> ${time}</li>
    </ul>
    <p>If this was you, no action is needed.</p>
    <p><strong>If you don't recognize this activity, please secure your account immediately by changing your password.</strong></p>
    <p>Best regards,<br>The RestT Team</p>
  `;
  return baseEmailTemplate(content, 'New Device Login');
};
