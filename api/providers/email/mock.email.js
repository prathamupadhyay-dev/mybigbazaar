/**
 * @file apps/api/providers/email/mock.email.js
 * @description Resilient email provider with Nodemailer support and console logging fallback
 */

import nodemailer from 'nodemailer';
import env from '../../config/env.js';

export class EmailProvider {
  constructor() {
    this.transporter = null;
    if (env.EMAIL && env.PASSWORD) {
      try {
        this.transporter = nodemailer.createTransport({
          host: env.EMAIL_HOST,
          port: env.EMAIL_PORT,
          secure: env.EMAIL_PORT === 465,
          auth: {
            user: env.EMAIL,
            pass: env.PASSWORD
          },
          tls: {
            rejectUnauthorized: env.NODE_ENV === 'production'
          }
        });
      } catch (err) {
        console.warn('[EMAIL] Failed to initialize SMTP transport, fallback to mock logger:', err.message);
      }
    }
  }

  async sendEmail({ to, subject, html, text }) {
    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from: env.EMAIL_FROM,
          to,
          subject,
          text: text || '',
          html: html || ''
        });
        console.log(`[EMAIL] Dispatched live email to ${to} (MessageID: ${info.messageId})`.green);
        return { success: true, messageId: info.messageId };
      } catch (err) {
        console.warn(`[EMAIL] SMTP dispatch failed for ${to} (${err.message}). Falling back to local logging.`.yellow);
      }
    }

    // Fallback: local dev logging
    console.log(`\n================== [MOCK EMAIL] ==================`.magenta);
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Time:    ${new Date().toISOString()}`);
    console.log(`--------------------------------------------------`);
    console.log(text || '(HTML Email Content)');
    console.log(`==================================================\n`.magenta);

    return { success: true, messageId: `mock_email_${Date.now()}` };
  }

  async sendOtpEmail(to, otp, purpose = 'Verification') {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a; margin-bottom: 8px;">MyBigBazaar ${purpose}</h2>
        <p style="color: #475569; font-size: 14px;">Please use the following 4-digit verification code to complete your request:</p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #2563eb; background: #eff6ff; padding: 12px 24px; border-radius: 8px; border: 1px dashed #93c5fd; display: inline-block;">
            ${otp}
          </span>
        </div>
        <p style="color: #64748b; font-size: 13px;">This code will expire in 10 minutes. If you did not make this request, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px;">© ${new Date().getFullYear()} MyBigBazaar. Hyperlocal Marketplace & Services.</p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `[MyBigBazaar] Your ${purpose} Code: ${otp}`,
      text: `Your MyBigBazaar ${purpose} code is: ${otp}. Valid for 10 minutes.`,
      html
    });
  }
}

export default new EmailProvider();
