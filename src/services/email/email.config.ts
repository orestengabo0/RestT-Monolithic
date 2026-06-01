import nodemailer from 'nodemailer';
import { logger } from '../../config/logger';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: {
    name: string;
    email: string;
  };
}

// Email configuration from environment variables
export const emailConfig: EmailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  from: {
    name: process.env.EMAIL_FROM_NAME || 'RestT App',
    email: process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@example.com',
  },
};

// Create reusable transporter
export const createEmailTransporter = () => {
  // In development, use ethereal email for testing if no SMTP is configured
  if (process.env.NODE_ENV === 'development' && !process.env.SMTP_USER) {
    logger.warn('No SMTP configuration found. Emails will be logged to console only.');
    return null;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: emailConfig.auth,
    });

    // Verify connection (only in production)
    if (process.env.NODE_ENV === 'production') {
      transporter.verify((error) => {
        if (error) {
          logger.error('Email transporter verification failed:', error);
        } else {
          logger.info('Email transporter is ready');
        }
      });
    }

    return transporter;
  } catch (error) {
    logger.error('Failed to create email transporter:', error);
    return null;
  }
};
