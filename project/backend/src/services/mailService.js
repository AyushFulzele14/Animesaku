import nodemailer from 'nodemailer';
import { logger } from '../config/logger.js';

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    logger.warn('SMTP settings missing in env. Mail service operating in offline/console log mode.');
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    return transporter;
  } catch (error) {
    logger.error(`Failed to create nodemailer transporter: ${error.message}`);
    return null;
  }
};

/**
 * Send email helper
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  const mailClient = getTransporter();

  if (!mailClient) {
    logger.info(`================ [EMAIL SENT (OFFLINE MOCK)] ================`);
    logger.info(`To:      ${to}`);
    logger.info(`Subject: ${subject}`);
    logger.info(`Content: ${text || 'HTML body provided'}`);
    logger.info(`===========================================================`);
    return true;
  }

  try {
    const info = await mailClient.sendMail({
      from: process.env.SMTP_FROM || '"AnimySaku Store" <noreply@animysaku.com>',
      to,
      subject,
      text,
      html,
    });
    logger.info(`Email sent successfully: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error(`Error sending email to ${to}: ${error.message}`);
    return false;
  }
};

/**
 * Send OTP Verification Email
 */
export const sendOtpEmail = async (email, name, otpCode) => {
  const subject = 'Reset Your Password - AnimySaku Store';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ee1010; border-radius: 10px; background-color: #1a1a18; color: #c9c9c9;">
      <h2 style="color: #ee1010; border-bottom: 2px solid #ee1010; padding-bottom: 10px; text-transform: uppercase; letter-spacing: 2px;">AnimySaku Store</h2>
      <p>Hi ${name || 'Otaku'},</p>
      <p>We received a request to reset your password. Use the verification OTP code below to proceed with your password recovery. This code is valid for <strong>15 minutes</strong>.</p>
      <div style="background-color: #000; color: #ee1010; font-size: 32px; font-weight: bold; text-align: center; padding: 15px; margin: 20px 0; border-radius: 5px; letter-spacing: 5px; border: 1px solid rgba(238, 16, 16, 0.4);">
        ${otpCode}
      </div>
      <p>If you didn't request this code, you can safely ignore this email.</p>
      <p style="border-top: 1px solid #ee1010; padding-top: 10px; font-size: 12px; color: #999;">
        This is an automated email, please do not reply.
      </p>
    </div>
  `;
  const text = `Hi ${name || 'Otaku'},\n\nYour OTP code to reset password is: ${otpCode}\n\nThis OTP is valid for 15 minutes.\n\nThank you,\nAnimySaku Store`;

  return await sendEmail({ to: email, subject, html, text });
};
