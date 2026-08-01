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
  const host = process.env.SMTP_HOST;
  const apiKey = process.env.SMTP_PASS;
  const senderEmail = process.env.SMTP_USER;

  // If using Brevo, send via HTTPS API to bypass Render's outbound port restrictions!
  if (host === 'smtp-relay.brevo.com' && apiKey && (apiKey.startsWith('xsmtpsib-') || apiKey.startsWith('xkeysib-'))) {
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: {
            name: 'AnimySaku Store',
            email: senderEmail,
          },
          to: [
            {
              email: to,
            },
          ],
          subject: subject,
          htmlContent: html,
          textContent: text || subject || 'AnimySaku Store',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        logger.info(`Email sent successfully via Brevo HTTP API: ${data.messageId || 'Success'}`);
        return true;
      } else {
        logger.error(`Error sending email via Brevo HTTP API: ${JSON.stringify(data)}`);
        return false;
      }
    } catch (error) {
      logger.error(`Error sending email to ${to} via Brevo API: ${error.message}`);
      return false;
    }
  }

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

/**
 * Send Welcome Email on Sign Up
 */
export const sendWelcomeEmail = async (email, name) => {
  const subject = 'Welcome to AnimySaku Store! 🌟';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ee1010; border-radius: 10px; background-color: #1a1a18; color: #c9c9c9;">
      <h2 style="color: #ee1010; border-bottom: 2px solid #ee1010; padding-bottom: 10px; text-transform: uppercase; letter-spacing: 2px; text-align: center;">Welcome to AnimySaku Store</h2>
      <p>Hi ${name || 'Otaku'},</p>
      <p>Thank you for joining **AnimySaku Store**! Your account has been successfully created and you're now part of our community.</p>
      
      <div style="background-color: #000; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid rgba(238, 16, 16, 0.4); font-size: 14px;">
        <strong>Registered Email/Login ID:</strong> ${email}
      </div>

      <p>Explore our premium collections of anime posters, stickers, combopacks, and more, all styled with our signature high-end neon aesthetic.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" style="background-color: #ee1010; color: #000; font-weight: bold; text-decoration: none; padding: 12px 25px; border-radius: 5px; text-transform: uppercase; letter-spacing: 1px; display: inline-block; border: 1px solid #ee1010;">Start Shopping</a>
      </div>
      <p>If you have any questions or feedback, feel free to reply to this email.</p>
      <p style="border-top: 1px solid #ee1010; padding-top: 10px; font-size: 12px; color: #999; text-align: center;">
        This is an automated email, please do not reply.
      </p>
    </div>
  `;
  const text = `Hi ${name || 'Otaku'},\n\nWelcome to AnimySaku Store! Your account has been created successfully.\n\nRegistered Email/Login ID: ${email}\n\nStart shopping here: ${process.env.CLIENT_URL || 'http://localhost:5173'}\n\nThank you,\nAnimySaku Store`;

  return await sendEmail({ to: email, subject, html, text });
};

/**
 * Send Security Alert / Login Notification Email
 */
export const sendLoginNotificationEmail = async (email, name, ip, userAgent) => {
  const subject = 'Security Alert: New Login - AnimySaku Store';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ee1010; border-radius: 10px; background-color: #1a1a18; color: #c9c9c9;">
      <h2 style="color: #ee1010; border-bottom: 2px solid #ee1010; padding-bottom: 10px; text-transform: uppercase; letter-spacing: 2px;">New Account Login</h2>
      <p>Hi ${name || 'Otaku'},</p>
      <p>We detected a new login to your **AnimySaku Store** account.</p>
      <div style="background-color: #000; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid rgba(238, 16, 16, 0.4); font-size: 14px; line-height: 1.6;">
        <strong>Time:</strong> ${new Date().toUTCString()}<br/>
        <strong>IP Address:</strong> ${ip || 'Unknown'}<br/>
        <strong>Browser/Device:</strong> ${userAgent || 'Unknown'}
      </div>
      <p>If this was you, no action is needed. If you do not recognize this login, please reset your password immediately using the "Forgot Password" feature on our website.</p>
      <p style="border-top: 1px solid #ee1010; padding-top: 10px; font-size: 12px; color: #999;">
        This is an automated security email, please do not reply.
      </p>
    </div>
  `;
  const text = `Hi ${name || 'Otaku'},\n\nWe detected a new login to your AnimySaku Store account.\n\nTime: ${new Date().toUTCString()}\nIP: ${ip || 'Unknown'}\nDevice: ${userAgent || 'Unknown'}\n\nIf this wasn't you, reset your password immediately.`;

  return await sendEmail({ to: email, subject, html, text });
};
