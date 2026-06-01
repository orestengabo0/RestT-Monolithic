import { createEmailTransporter, emailConfig } from './email.config';
import { logger } from '../../config/logger';
import type { Transporter } from 'nodemailer';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
  }>;
}

export class EmailService {
  private transporter: Transporter | null;

  constructor() {
    this.transporter = createEmailTransporter();
  }

  /**
   * Send email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // If no transporter (development without SMTP), log email
      if (!this.transporter) {
        logger.info('Email would be sent:', {
          to: options.to,
          subject: options.subject,
          preview: options.text?.substring(0, 100) || options.html?.substring(0, 100),
        });
        return true;
      }

      const mailOptions = {
        from: `${emailConfig.from.name} <${emailConfig.from.email}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);

      logger.info('Email sent successfully:', {
        messageId: info.messageId,
        to: options.to,
        subject: options.subject,
      });

      return true;
    } catch (error) {
      logger.error('Failed to send email:', error);
      return false;
    }
  }

  /**
   * Send email to multiple recipients
   */
  async sendBulkEmail(recipients: string[], options: Omit<EmailOptions, 'to'>): Promise<{
    success: number;
    failed: number;
  }> {
    let success = 0;
    let failed = 0;

    for (const recipient of recipients) {
      const sent = await this.sendEmail({
        ...options,
        to: recipient,
      });

      if (sent) {
        success++;
      } else {
        failed++;
      }
    }

    return { success, failed };
  }
}

// Export singleton instance
export const emailService = new EmailService();
