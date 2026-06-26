import nodemailer from 'nodemailer';
import { env } from '../config/environment';
import { logger } from '../utils/logger.util';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  async sendPasswordResetEmail(to: string, name: string, resetToken: string): Promise<void> {
    const resetUrl = `${env.ALLOWED_ORIGINS[0]}/reset-password?token=${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Dear ${name},</p>
        <p>You requested a password reset for your ABSU Faculty Management account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="
          display: inline-block;
          padding: 12px 24px;
          background-color: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          margin: 16px 0;
        ">Reset Password</a>
        <p>This link expires in 1 hour.</p>
        <p>If you did not request this, ignore this email.</p>
        <hr/>
        <p style="color: #666; font-size: 12px;">ABSU Faculty Management System</p>
      </div>
    `;

    await this.transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject: 'Password Reset - ABSU Faculty Management',
      html,
    });

    logger.info(`Password reset email sent to: ${to}`);
  }

  async sendWelcomeEmail(to: string, name: string, role: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to ABSU Faculty Management</h2>
        <p>Dear ${name},</p>
        <p>Your account has been created successfully.</p>
        <p><strong>Role:</strong> ${role.replace('_', ' ').toUpperCase()}</p>
        <p>You can now log in to the system using your email and password.</p>
        <hr/>
        <p style="color: #666; font-size: 12px;">ABSU Faculty Management System</p>
      </div>
    `;

    await this.transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject: 'Welcome - ABSU Faculty Management',
      html,
    });

    logger.info(`Welcome email sent to: ${to}`);
  }
}

export const emailService = new EmailService();
