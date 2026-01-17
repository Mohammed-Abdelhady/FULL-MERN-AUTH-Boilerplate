import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { MailOptions } from './interfaces/mail-options.interface';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('smtp.host'),
      port: this.configService.get<number>('smtp.port'),
      secure: this.configService.get<boolean>('smtp.secure', false),
      auth: {
        user: this.configService.get<string>('smtp.user'),
        pass: this.configService.get<string>('smtp.pass'),
      },
    });
  }

  /**
   * Send an email using the configured SMTP server
   * @param options - Mail options including recipient, subject, and content
   * @throws Error if SMTP configuration is missing or sending fails
   */
  async sendMail(options: MailOptions): Promise<void> {
    const from = this.configService.get<string>('smtp.from');

    if (!from) {
      throw new Error('SMTP_FROM environment variable is not configured');
    }

    try {
      await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      this.logger.log(`Email sent successfully to ${options.to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      throw new Error(
        `Failed to send email: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Send an activation code email to a user
   * @param email - Recipient email address
   * @param code - 6-digit activation code
   * @param name - Recipient's name
   */
  async sendActivationCode(
    email: string,
    code: string,
    name: string,
  ): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">Verify Your Email Address</h2>
            <p>Hi ${name},</p>
            <p>Thank you for registering! Please use the following 6-digit verification code to complete your registration:</p>
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #007bff;">${code}</span>
            </div>
            <p>This code will expire in 15 minutes.</p>
            <p>If you didn't request this code, you can safely ignore this email.</p>
            <p>Best regards,<br>The Team</p>
          </div>
        </body>
      </html>
    `;

    const text = `Hi ${name},\n\nThank you for registering! Please use the following 6-digit verification code to complete your registration:\n\n${code}\n\nThis code will expire in 15 minutes.\n\nIf you didn't request this code, you can safely ignore this email.\n\nBest regards,\nThe Team`;

    await this.sendMail({
      to: email,
      subject: 'Verify Your Email Address',
      html,
      text,
    });
  }

  /**
   * Send a password reset code email to a user
   * @param email - Recipient email address
   * @param code - 6-digit password reset code
   * @param name - Recipient's name
   */
  async sendPasswordResetCode(
    email: string,
    code: string,
    name: string,
  ): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">Reset Your Password</h2>
            <p>Hi ${name},</p>
            <p>You requested to reset your password. Please use the following 6-digit code to reset your password:</p>
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #dc3545;">${code}</span>
            </div>
            <p>This code will expire in 15 minutes.</p>
            <p>If you didn't request this code, you can safely ignore this email. Your password will remain unchanged.</p>
            <p>Best regards,<br>The Team</p>
          </div>
        </body>
      </html>
    `;

    const text = `Hi ${name},\n\nYou requested to reset your password. Please use the following 6-digit code to reset your password:\n\n${code}\n\nThis code will expire in 15 minutes.\n\nIf you didn't request this code, you can safely ignore this email. Your password will remain unchanged.\n\nBest regards,\nThe Team`;

    await this.sendMail({
      to: email,
      subject: 'Reset Your Password',
      html,
      text,
    });
  }
}
