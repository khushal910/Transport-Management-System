import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';
import runtimeConfig from '../config/runtime';

interface EmailResult {
  success: boolean;
  message?: string;
  messageId?: string;
  error?: string;
  statusCode?: number;
  errorCode?: string;
  details?: Record<string, unknown>;
}

interface FirstLoginSecurityContext {
  loginAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Production-aware logger - logs everything to console in production for visibility
 */
const emailLogger = {
  error: (...args: unknown[]) => {
    console.error('[EmailService]', ...args);
  },
  warn: (...args: unknown[]) => {
    console.warn('[EmailService]', ...args);
  },
  info: (...args: unknown[]) => {
    console.info('[EmailService]', ...args);
  },
  debug: (...args: unknown[]) => {
    if (!runtimeConfig.isProduction) {
      console.debug('[EmailService]', ...args);
    }
  },
};

const SMTP_HOST = runtimeConfig.smtpHost;
const SMTP_PORT = runtimeConfig.smtpPort;
const SMTP_TIMEOUT_MS = 5000;

const buildSmtpFailure = (operation: string, error: any): EmailResult => {
  const errorCode = error?.code as string | undefined;
  const message = error?.message || 'SMTP request failed';

  if (errorCode === 'ETIMEDOUT') {
    return {
      success: false,
      error: `${operation} timed out while connecting to Gmail SMTP: ${message}`,
      statusCode: 504,
      errorCode,
      details: {
        command: error?.command,
        host: SMTP_HOST,
        port: SMTP_PORT,
        timeoutMs: SMTP_TIMEOUT_MS,
      },
    };
  }

  if (errorCode === 'EAUTH') {
    return {
      success: false,
      error: `${operation} authentication failed: ${message}`,
      statusCode: 503,
      errorCode,
      details: {
        host: SMTP_HOST,
        port: SMTP_PORT,
        hint: 'Use a Gmail App Password, not your normal Google password.',
      },
    };
  }

  return {
    success: false,
    error: `${operation} failed: ${message}`,
    statusCode: 503,
    errorCode,
    details: {
      host: SMTP_HOST,
      port: SMTP_PORT,
      command: error?.command,
    },
  };
};

/**
 * Initialize email transporter with runtime config
 * Email credentials must be set in deployment environment variables
 */
const initializeTransporter = (): Transporter | null => {
  try {
    emailLogger.info('Initializing email transporter');

    if (!runtimeConfig.emailUser || !runtimeConfig.emailPassword) {
      emailLogger.error(
        'Email credentials not configured.',
        'EMAIL_USER and EMAIL_PASSWORD must be set in environment variables.',
      );
      return null;
    }

    emailLogger.debug(`Initializing email transporter for service: gmail on ${SMTP_HOST}:${SMTP_PORT}`);

    const transporter: Transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: runtimeConfig.smtpSecure,
      auth: {
        user: runtimeConfig.emailUser,
        pass: runtimeConfig.emailPassword,
      },
      connectionTimeout: SMTP_TIMEOUT_MS,
      greetingTimeout: SMTP_TIMEOUT_MS,
      socketTimeout: SMTP_TIMEOUT_MS,
      logger: true,
      debug: true,
      pool: true,
      tls: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true,
      },
    } as any);

    console.log('[EmailService] VERIFYING SMTP TRANSPORTER ON STARTUP');
    transporter.verify((error, success) => {
      if (error) {
        console.error('[EmailService] SMTP VERIFY ERROR', {
          message: error.message,
          code: (error as any)?.code,
          command: (error as any)?.command,
        });
        emailLogger.error('Email Transporter Verification Failed:', error.message);
        emailLogger.error(
          'Gmail requires an App-Specific Password (not your regular password).',
          'Get it at: https://myaccount.google.com/apppasswords',
        );
        if ((error as any).code === 'EAUTH') {
          emailLogger.error('Authentication error - check EMAIL_USER and EMAIL_PASSWORD are correct');
        }
      } else if (success) {
        console.log('[EmailService] SMTP TRANSPORTER VERIFIED ON STARTUP');
        emailLogger.info('Email transporter initialized and verified successfully');
      }
    });

    return transporter;
  } catch (error: any) {
    emailLogger.error('Failed to initialize email transporter:', error.message);
    return null;
  }
};

const transporter = initializeTransporter();

/**
 * Validate email service is configured before sending
 */
const validateEmailConfig = (): { valid: boolean; error?: string } => {
  if (!transporter) {
    emailLogger.error('Email service validation failed: transporter not initialized');
    return {
      valid: false,
      error: 'Email service not initialized. Check EMAIL_USER and EMAIL_PASSWORD in environment variables.',
    };
  }

  if (!runtimeConfig.emailUser || !runtimeConfig.emailPassword) {
    emailLogger.error('Email service validation failed: missing EMAIL_USER or EMAIL_PASSWORD');
    return {
      valid: false,
      error: 'Email credentials not configured in environment variables.',
    };
  }

  if (!runtimeConfig.clientUrl) {
    emailLogger.error('Email service validation failed: CLIENT_URL is missing');
    return {
      valid: false,
      error: 'CLIENT_URL not configured in environment variables.',
    };
  }

  emailLogger.info('Email service validation passed');
  return { valid: true };
};

export const verifySmtpConnection = async (operation = 'SMTP verification'): Promise<EmailResult> => {
  if (!transporter) {
    return {
      success: false,
      error: 'SMTP transporter is not initialized. Check EMAIL_USER and EMAIL_PASSWORD.',
      statusCode: 503,
      details: {
        host: SMTP_HOST,
        port: SMTP_PORT,
      },
    };
  }

  try {
    console.log(`[EmailService-VERIFY] VERIFYING SMTP FOR ${operation}`);
    await transporter.verify();
    console.log(`[EmailService-VERIFY] SMTP VERIFIED FOR ${operation}`);
    return {
      success: true,
      message: `SMTP verified for ${operation}`,
      statusCode: 200,
      details: {
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: true,
        smtpSecure: runtimeConfig.smtpSecure,
        timeoutMs: SMTP_TIMEOUT_MS,
      },
    };
  } catch (error: any) {
    console.error(`[EmailService-VERIFY] SMTP VERIFICATION FAILED FOR ${operation}`, {
      message: error?.message,
      code: error?.code,
      command: error?.command,
    });
    return buildSmtpFailure(operation, error);
  }
};

const sendMailWithDebug = async (mailOptions: SendMailOptions, operation: string): Promise<EmailResult> => {
  if (!transporter) {
    return {
      success: false,
      error: 'SMTP transporter is not initialized. Check EMAIL_USER and EMAIL_PASSWORD.',
      statusCode: 503,
    };
  }

  try {
    console.log(`[EmailService-SEND] Sending ${operation}`);
    const result = await transporter.sendMail(mailOptions);
    console.log(`[EmailService-SEND] ✅ ${operation} sent successfully`);
    console.log('[EmailService-SEND] Message ID:', result.messageId);
    return {
      success: true,
      message: `${operation} sent successfully`,
      messageId: result.messageId,
      statusCode: 200,
    };
  } catch (error: any) {
    const failure = buildSmtpFailure(operation, error);
    console.error(`[EmailService-SEND] ❌ FAILED to send ${operation}`, {
      message: error?.message,
      code: error?.code,
      command: error?.command,
    });
    if (error?.code === 'EAUTH') {
      console.error('[EmailService-AUTH] Gmail authentication failed - use a valid App Password');
    }
    if (error?.code === 'ETIMEDOUT') {
      console.error('[EmailService-TIMEOUT] SMTP connection timeout while sending', {
        host: SMTP_HOST,
        port: SMTP_PORT,
      });
    }
    return failure;
  }
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email: string, resetToken: string): Promise<EmailResult> => {
  try {
    emailLogger.info(`Starting password reset email flow for: ${email}`);
    console.log('[EmailService-VERIFY] VERIFYING SMTP BEFORE PASSWORD RESET');
    try {
      await transporter!.verify();
      console.log('[EmailService-VERIFY] ✅ SMTP VERIFIED FOR PASSWORD RESET');
      emailLogger.info('[EmailService-VERIFY] SMTP connection verified successfully for password reset');
    } catch (verifyError: any) {
      console.log('[EmailService-VERIFY] ❌ SMTP VERIFICATION FAILED FOR PASSWORD RESET');
      console.log('[EmailService-ERROR]', verifyError?.message || JSON.stringify(verifyError));
      emailLogger.error('[EmailService-VERIFY] SMTP verification failed for password reset:', verifyError?.message);
      return { success: false, error: `SMTP verification failed: ${verifyError?.message}` };
    }

    const validation = validateEmailConfig();
    if (!validation.valid) {
      const error = validation.error || 'Email service not configured';
      emailLogger.error(`Failed to send password reset to ${email}: ${error}`);
      return { success: false, error };
    }

    const resetLink = `${runtimeConfig.clientUrl}/reset-password?token=${resetToken}`;

    const mailOptions: SendMailOptions = {
      from: runtimeConfig.emailUser!,
      to: email,
      subject: 'Password Reset Request - Fleet Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f0f4f8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">Password Reset Request</h2>
            <p style="color: #4b5563; font-size: 14px;">
              We received a request to reset your password for your Fleet Management System account.
            </p>
          </div>

          <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #374151; margin-bottom: 20px;">
              Click the button below to reset your password. This link will expire in <strong>24 hours</strong>.
            </p>

            <a href="${resetLink}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-bottom: 20px;">
              Reset Password
            </a>

            <p style="color: #6b7280; font-size: 12px; margin-bottom: 10px;">
              Or copy and paste this link in your browser:
            </p>
            <p style="color: #3b82f6; font-size: 12px; word-break: break-all;">
              ${resetLink}
            </p>
          </div>

          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
            <p style="color: #92400e; font-size: 13px; margin: 0;">
              <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email or contact support. Your account remains secure.
            </p>
          </div>

          <div style="color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            <p style="margin: 5px 0;">This is an automated message. Please do not reply directly to this email.</p>
            <p style="margin: 5px 0;">© 2026 Fleet Management System. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    console.log('[EmailService-SEND] Sending PASSWORD RESET email to:', email);
    const result = await transporter!.sendMail(mailOptions);
    console.log('[EmailService-SEND] ✅ PASSWORD RESET email sent successfully');
    console.log('[EmailService-SEND] Message ID:', result.messageId);
    emailLogger.info(`Password reset email sent successfully to: ${email} (messageId: ${result.messageId})`);
    return { success: true, message: 'Reset email sent successfully', messageId: result.messageId };
  } catch (error: any) {
    console.log('[EmailService-SEND] ❌ FAILED to send PASSWORD RESET email');
    console.log('[EmailService-ERROR]', error?.message || JSON.stringify(error));
    emailLogger.error(`Failed to send password reset email to ${email}:`, error.message);
    if (error?.code === 'EAUTH') {
      console.log('[EmailService-AUTH] Authentication failed - check EMAIL_USER and EMAIL_PASSWORD');
      emailLogger.error('Authentication failed - verify EMAIL_USER and EMAIL_PASSWORD');
    }
    if (error?.code === 'ETIMEDOUT') {
      console.log('[EmailService-TIMEOUT] SMTP connection timeout - server not responding');
    }
    return { success: false, error: error.message };
  }
};

/**
 * Send generic direct user-to-user email
 */
export const sendDirectEmail = async (
  email: string,
  subject: string,
  htmlBody: string
): Promise<EmailResult> => {
  try {
    emailLogger.info(`Starting direct email flow for: ${email} | subject: ${subject}`);
    console.log('[EmailService-VERIFY] VERIFYING SMTP BEFORE DIRECT EMAIL');
    try {
      await transporter!.verify();
      console.log('[EmailService-VERIFY] ✅ SMTP VERIFIED FOR DIRECT EMAIL');
      emailLogger.info('[EmailService-VERIFY] SMTP connection verified successfully for direct email');
    } catch (verifyError: any) {
      console.log('[EmailService-VERIFY] ❌ SMTP VERIFICATION FAILED FOR DIRECT EMAIL');
      console.log('[EmailService-ERROR]', verifyError?.message || JSON.stringify(verifyError));
      emailLogger.error('[EmailService-VERIFY] SMTP verification failed for direct email:', verifyError?.message);
      return { success: false, error: `SMTP verification failed: ${verifyError?.message}` };
    }

    const validation = validateEmailConfig();
    if (!validation.valid) {
      const error = validation.error || 'Email service not configured';
      emailLogger.error(`Failed to send email to ${email}: ${error}`);
      return { success: false, error };
    }

    const mailOptions: SendMailOptions = {
      from: runtimeConfig.emailUser!,
      to: email,
      subject,
      html: htmlBody,
    };

    console.log('[EmailService-SEND] Sending DIRECT email to:', email);
    const result = await transporter!.sendMail(mailOptions);
    console.log('[EmailService-SEND] ✅ DIRECT email sent successfully');
    console.log('[EmailService-SEND] Message ID:', result.messageId);
    emailLogger.info(`Direct email sent successfully to: ${email} (messageId: ${result.messageId})`);
    return { success: true, message: 'Email sent successfully', messageId: result.messageId };
  } catch (error: any) {
    console.log('[EmailService-SEND] ❌ FAILED to send DIRECT email');
    console.log('[EmailService-ERROR]', error?.message || JSON.stringify(error));
    emailLogger.error(`Failed to send direct email to ${email}:`, error.message);
    if (error?.code === 'EAUTH') {
      console.log('[EmailService-AUTH] Authentication failed - check EMAIL_USER and EMAIL_PASSWORD');
      emailLogger.error('Authentication failed - verify EMAIL_USER and EMAIL_PASSWORD');
    }
    if (error?.code === 'ETIMEDOUT') {
      console.log('[EmailService-TIMEOUT] SMTP connection timeout - server not responding');
    }
    return { success: false, error: error.message };
  }
};

/**
 * Send password reset success email
 */
export const sendPasswordResetSuccessEmail = async (email: string): Promise<EmailResult> => {
  try {
    emailLogger.info(`Starting password reset success email flow for: ${email}`);
    console.log('[EmailService-VERIFY] VERIFYING SMTP BEFORE PASSWORD RESET SUCCESS');
    try {
      await transporter!.verify();
      console.log('[EmailService-VERIFY] ✅ SMTP VERIFIED FOR PASSWORD RESET SUCCESS');
      emailLogger.info('[EmailService-VERIFY] SMTP connection verified successfully for password reset success');
    } catch (verifyError: any) {
      console.log('[EmailService-VERIFY] ❌ SMTP VERIFICATION FAILED FOR PASSWORD RESET SUCCESS');
      console.log('[EmailService-ERROR]', verifyError?.message || JSON.stringify(verifyError));
      emailLogger.error('[EmailService-VERIFY] SMTP verification failed for password reset success:', verifyError?.message);
      return { success: false, error: `SMTP verification failed: ${verifyError?.message}` };
    }

    const validation = validateEmailConfig();
    if (!validation.valid) {
      const error = validation.error || 'Email service not configured';
      emailLogger.error(`Failed to send password reset success email to ${email}: ${error}`);
      return { success: false, error };
    }

    const mailOptions: SendMailOptions = {
      from: runtimeConfig.emailUser!,
      to: email,
      subject: 'Password Changed Successfully - Fleet Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f0f4f8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">Password Changed Successfully</h2>
            <p style="color: #4b5563; font-size: 14px;">
              Your password has been successfully reset.
            </p>
          </div>

          <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
            <p style="color: #065f46; font-size: 13px; margin: 0;">
              ✓ Your account is now secured with your new password.
            </p>
          </div>

          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #374151; margin-bottom: 15px;">
              You can now log in to the Fleet Management System with your new password.
            </p>
            <p style="color: #6b7280; font-size: 13px;">
              If you didn't make this change or if you have any concerns about your account security, please contact our support team immediately.
            </p>
          </div>

          <div style="color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            <p style="margin: 5px 0;">This is an automated message. Please do not reply directly to this email.</p>
            <p style="margin: 5px 0;">© 2026 Fleet Management System. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    console.log('[EmailService-SEND] Sending PASSWORD RESET SUCCESS email to:', email);
    const result = await transporter!.sendMail(mailOptions);
    console.log('[EmailService-SEND] ✅ PASSWORD RESET SUCCESS email sent successfully');
    console.log('[EmailService-SEND] Message ID:', result.messageId);
    emailLogger.info(`Password reset success email sent to: ${email} (messageId: ${result.messageId})`);
    return { success: true, message: 'Confirmation email sent successfully', messageId: result.messageId };
  } catch (error: any) {
    console.log('[EmailService-SEND] ❌ FAILED to send PASSWORD RESET SUCCESS email');
    console.log('[EmailService-ERROR]', error?.message || JSON.stringify(error));
    emailLogger.error(`Failed to send password reset success email to ${email}:`, error.message);
    if (error?.code === 'EAUTH') {
      console.log('[EmailService-AUTH] Authentication failed - check EMAIL_USER and EMAIL_PASSWORD');
      emailLogger.error('Authentication failed - verify EMAIL_USER and EMAIL_PASSWORD');
    }
    if (error?.code === 'ETIMEDOUT') {
      console.log('[EmailService-TIMEOUT] SMTP connection timeout - server not responding');
    }
    return { success: false, error: error.message };
  }
};

/**
 * Send employee account setup email
 */
export const sendEmployeeSetupEmail = async (email: string, name: string, setupToken: string): Promise<EmailResult> => {
  try {
    emailLogger.info(`Starting employee setup email flow for: ${email}`);
    console.log('[EmailService-VERIFY] VERIFYING SMTP BEFORE EMPLOYEE SETUP EMAIL');
    try {
      await transporter!.verify();
      console.log('[EmailService-VERIFY] ✅ SMTP VERIFIED FOR EMPLOYEE SETUP EMAIL');
      emailLogger.info('[EmailService-VERIFY] SMTP connection verified successfully for employee setup');
    } catch (verifyError: any) {
      console.log('[EmailService-VERIFY] ❌ SMTP VERIFICATION FAILED FOR EMPLOYEE SETUP EMAIL');
      console.log('[EmailService-ERROR]', verifyError?.message || JSON.stringify(verifyError));
      emailLogger.error('[EmailService-VERIFY] SMTP verification failed for employee setup:', verifyError?.message);
      return { success: false, error: `SMTP verification failed: ${verifyError?.message}` };
    }

    const validation = validateEmailConfig();
    if (!validation.valid) {
      const error = validation.error || 'Email service not configured';
      emailLogger.error(`Failed to send employee setup email to ${email}: ${error}`);
      return { success: false, error };
    }

    const setupLink = `${runtimeConfig.clientUrl}/auth/setup-password?token=${setupToken}`;

    const mailOptions: SendMailOptions = {
      from: runtimeConfig.emailUser!,
      to: email,
      subject: 'Welcome to Fleet Management System - Set Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f0f4f8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">Welcome to Fleet Management System</h2>
            <p style="color: #4b5563; font-size: 14px;">
              Hi <strong>${name}</strong>, you have been added as an employee. Please set your password to activate your account.
            </p>
          </div>

          <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #374151; margin-bottom: 20px;">
              Click the button below to set your password. This link will expire in <strong>24 hours</strong>.
            </p>

            <a href="${setupLink}" style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-bottom: 20px;">
              Set Your Password
            </a>

            <p style="color: #6b7280; font-size: 12px; margin-bottom: 10px;">
              Or copy and paste this link in your browser:
            </p>
            <p style="color: #10b981; font-size: 12px; word-break: break-all;">
              ${setupLink}
            </p>
          </div>

          <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
            <p style="color: #065f46; font-size: 13px; margin: 0;">
              <strong>Account Activation:</strong> Your account will be inactive until you set your password. Don't forget to use a strong password with uppercase, lowercase, numbers, and special characters.
            </p>
          </div>

          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
            <p style="color: #92400e; font-size: 13px; margin: 0;">
              <strong>Security Tip:</strong> Never share your password with anyone. Your manager will never ask for it.
            </p>
          </div>

          <div style="color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            <p style="margin: 5px 0;">If you did not expect this email, please contact your manager immediately.</p>
            <p style="margin: 5px 0;">This is an automated message. Please do not reply directly to this email.</p>
            <p style="margin: 5px 0;">© 2026 Fleet Management System. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    console.log('[EmailService-SEND] Sending EMPLOYEE SETUP email to:', email);
    const result = await transporter!.sendMail(mailOptions);
    console.log('[EmailService-SEND] ✅ EMPLOYEE SETUP email sent successfully');
    console.log('[EmailService-SEND] Message ID:', result.messageId);
    emailLogger.info(`Employee setup email sent successfully to: ${email} (messageId: ${result.messageId})`);
    return { success: true, message: 'Setup email sent successfully', messageId: result.messageId };
  } catch (error: any) {
    console.log('[EmailService-SEND] ❌ FAILED to send EMPLOYEE SETUP email');
    console.log('[EmailService-ERROR]', error?.message || JSON.stringify(error));
    emailLogger.error(`Failed to send employee setup email to ${email}:`, error.message);
    if (error?.code === 'EAUTH') {
      console.log('[EmailService-AUTH] Authentication failed - check EMAIL_USER and EMAIL_PASSWORD');
      emailLogger.error('Authentication failed - verify EMAIL_USER and EMAIL_PASSWORD');
    }
    if (error?.code === 'ETIMEDOUT') {
      console.log('[EmailService-TIMEOUT] SMTP connection timeout - server not responding');
    }
    return { success: false, error: error.message };
  }
};

/**
 * Send security email on the first successful employee login
 */
export const sendEmployeeFirstLoginSecurityEmail = async (
  email: string,
  name: string,
  context: FirstLoginSecurityContext,
): Promise<EmailResult> => {
  try {
    emailLogger.info(`Starting first login security email flow for: ${email}`);
    console.log('[EmailService-VERIFY] VERIFYING SMTP BEFORE FIRST LOGIN SECURITY EMAIL');
    try {
      await transporter!.verify();
      console.log('[EmailService-VERIFY] ✅ SMTP VERIFIED FOR FIRST LOGIN SECURITY EMAIL');
      emailLogger.info('[EmailService-VERIFY] SMTP connection verified successfully for first login security');
    } catch (verifyError: any) {
      console.log('[EmailService-VERIFY] ❌ SMTP VERIFICATION FAILED FOR FIRST LOGIN SECURITY EMAIL');
      console.log('[EmailService-ERROR]', verifyError?.message || JSON.stringify(verifyError));
      emailLogger.error('[EmailService-VERIFY] SMTP verification failed for first login security:', verifyError?.message);
      return { success: false, error: `SMTP verification failed: ${verifyError?.message}` };
    }

    const validation = validateEmailConfig();
    if (!validation.valid) {
      const error = validation.error || 'Email service not configured';
      emailLogger.error(`Failed to send first login security email to ${email}: ${error}`);
      return { success: false, error };
    }

    const loginTime = context.loginAt.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });

    const deviceInfo = context.userAgent && context.userAgent.trim().length > 0
      ? context.userAgent
      : 'Unknown device';
    const ipAddress = context.ipAddress && context.ipAddress.trim().length > 0
      ? context.ipAddress
      : 'Unavailable';

    const mailOptions: SendMailOptions = {
      from: runtimeConfig.emailUser!,
      to: email,
      subject: 'Security Notice: First Login Detected',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #ecfeff; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #a5f3fc;">
            <h2 style="color: #155e75; margin-top: 0;">First Login Security Notice</h2>
            <p style="color: #0f766e; font-size: 14px; margin-bottom: 0;">
              Hi <strong>${name}</strong>, your employee account has been accessed successfully for the first time.
            </p>
          </div>

          <div style="background-color: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #374151; margin-top: 0; margin-bottom: 14px;"><strong>Login details:</strong></p>
            <p style="color: #4b5563; margin: 6px 0;"><strong>Time:</strong> ${loginTime}</p>
            <p style="color: #4b5563; margin: 6px 0;"><strong>IP Address:</strong> ${ipAddress}</p>
            <p style="color: #4b5563; margin: 6px 0;"><strong>Device:</strong> ${deviceInfo}</p>
          </div>

          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 14px; margin-bottom: 20px; border-radius: 4px;">
            <p style="color: #92400e; font-size: 13px; margin: 0;">
              <strong>Didn't recognize this login?</strong> Reset your password immediately and contact your manager.
            </p>
          </div>

          <div style="color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
            <p style="margin: 5px 0;">This message is sent once on your first successful login to improve account security visibility.</p>
            <p style="margin: 5px 0;">© 2026 Fleet Management System. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    console.log('[EmailService-SEND] Sending FIRST LOGIN SECURITY email to:', email);
    const result = await transporter!.sendMail(mailOptions);
    console.log('[EmailService-SEND] ✅ FIRST LOGIN SECURITY email sent successfully');
    console.log('[EmailService-SEND] Message ID:', result.messageId);
    emailLogger.info(`Employee first login security email sent to: ${email} (messageId: ${result.messageId})`);
    return { success: true, message: 'First login security email sent successfully', messageId: result.messageId };
  } catch (error: any) {
    console.log('[EmailService-SEND] ❌ FAILED to send FIRST LOGIN SECURITY email');
    console.log('[EmailService-ERROR]', error?.message || JSON.stringify(error));
    emailLogger.error(`Failed to send first login security email to ${email}:`, error.message);
    if (error?.code === 'EAUTH') {
      console.log('[EmailService-AUTH] Authentication failed - check EMAIL_USER and EMAIL_PASSWORD');
      emailLogger.error('Authentication failed - verify EMAIL_USER and EMAIL_PASSWORD');
    }
    if (error?.code === 'ETIMEDOUT') {
      console.log('[EmailService-TIMEOUT] SMTP connection timeout - server not responding');
    }
    return { success: false, error: error.message };
  }
};

/**
 * Send employee details updated notification email
 */
export const sendEmployeeDetailsUpdatedEmail = async (
  email: string,
  name: string,
  updatedFields: { name?: string; email?: string; role?: string; password?: boolean }
): Promise<EmailResult> => {
  try {
    emailLogger.info(`Starting employee details updated email flow for: ${email}`);
    console.log('[EmailService-VERIFY] VERIFYING SMTP BEFORE EMPLOYEE DETAILS UPDATED EMAIL');
    try {
      await transporter!.verify();
      console.log('[EmailService-VERIFY] ✅ SMTP VERIFIED FOR EMPLOYEE DETAILS UPDATED EMAIL');
      emailLogger.info('[EmailService-VERIFY] SMTP connection verified successfully for employee details updated');
    } catch (verifyError: any) {
      console.log('[EmailService-VERIFY] ❌ SMTP VERIFICATION FAILED FOR EMPLOYEE DETAILS UPDATED EMAIL');
      console.log('[EmailService-ERROR]', verifyError?.message || JSON.stringify(verifyError));
      emailLogger.error('[EmailService-VERIFY] SMTP verification failed for employee details updated:', verifyError?.message);
      return { success: false, error: `SMTP verification failed: ${verifyError?.message}` };
    }

    const validation = validateEmailConfig();
    if (!validation.valid) {
      const error = validation.error || 'Email service not configured';
      emailLogger.error(`Failed to send employee details updated email to ${email}: ${error}`);
      return { success: false, error };
    }

    const fieldsList = [];
    if (updatedFields.name) fieldsList.push(`<li style="color: #4b5563; margin: 8px 0;"><strong>Name:</strong> ${updatedFields.name}</li>`);
    if (updatedFields.email) fieldsList.push(`<li style="color: #4b5563; margin: 8px 0;"><strong>Email:</strong> ${updatedFields.email}</li>`);
    if (updatedFields.role) fieldsList.push(`<li style="color: #4b5563; margin: 8px 0;"><strong>Role:</strong> ${updatedFields.role.charAt(0).toUpperCase() + updatedFields.role.slice(1)}</li>`);
    if (updatedFields.password) fieldsList.push(`<li style="color: #4b5563; margin: 8px 0;"><strong>Password:</strong> Updated</li>`);

    const mailOptions: SendMailOptions = {
      from: runtimeConfig.emailUser!,
      to: email,
      subject: 'Your Account Details Have Been Updated',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #0c4a6e; margin-top: 0;">Account Details Updated</h2>
            <p style="color: #0c4a6e; font-size: 14px;">
              Hi <strong>${name}</strong>, your account information has been updated by your manager.
            </p>
          </div>

          <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #374151; margin-bottom: 15px;">
              <strong>Updated Information:</strong>
            </p>
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
              <ul style="margin: 0; padding-left: 0; list-style: none;">
                ${fieldsList.join('')}
              </ul>
            </div>

            <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; border-radius: 4px;">
              <p style="color: #15803d; font-size: 13px; margin: 0;">
                ✓ Your account has been updated successfully. If you updated your email, you may need to log in again with your new credentials.
              </p>
            </div>
          </div>

          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #374151; font-size: 13px; margin-bottom: 10px;">
              <strong>Need Help?</strong>
            </p>
            <p style="color: #6b7280; font-size: 13px; margin: 0;">
              If you didn't authorize these changes or have any questions, please contact your manager or support team immediately.
            </p>
          </div>

          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
            <p style="color: #92400e; font-size: 13px; margin: 0;">
              <strong>Security Note:</strong> Your account security is important to us. If you notice any suspicious activity, please alert your security team immediately.
            </p>
          </div>

          <div style="color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            <p style="margin: 5px 0;">This is an automated message. Please do not reply directly to this email.</p>
            <p style="margin: 5px 0;">© 2026 Fleet Management System. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    console.log('[EmailService-SEND] Sending EMPLOYEE DETAILS UPDATED email to:', email);
    const result = await transporter!.sendMail(mailOptions);
    console.log('[EmailService-SEND] ✅ EMPLOYEE DETAILS UPDATED email sent successfully');
    console.log('[EmailService-SEND] Message ID:', result.messageId);
    emailLogger.info(`Employee details updated email sent to: ${email} (messageId: ${result.messageId})`);
    return { success: true, message: 'Update notification sent successfully', messageId: result.messageId };
  } catch (error: any) {
    console.log('[EmailService-SEND] ❌ FAILED to send EMPLOYEE DETAILS UPDATED email');
    console.log('[EmailService-ERROR]', error?.message || JSON.stringify(error));
    emailLogger.error(`Failed to send employee details updated email to ${email}:`, error.message);
    if (error?.code === 'EAUTH') {
      console.log('[EmailService-AUTH] Authentication failed - check EMAIL_USER and EMAIL_PASSWORD');
      emailLogger.error('Authentication failed - verify EMAIL_USER and EMAIL_PASSWORD');
    }
    if (error?.code === 'ETIMEDOUT') {
      console.log('[EmailService-TIMEOUT] SMTP connection timeout - server not responding');
    }
    return { success: false, error: error.message };
  }
};

/**
 * Send employee account deletion email
 */
export const sendEmployeeDeletedEmail = async (email: string, name: string, companyName: string): Promise<EmailResult> => {
  try {
    emailLogger.info(`Starting employee deleted email flow for: ${email}`);
    console.log('[EmailService-VERIFY] VERIFYING SMTP BEFORE EMPLOYEE DELETED EMAIL');
    try {
      await transporter!.verify();
      console.log('[EmailService-VERIFY] ✅ SMTP VERIFIED FOR EMPLOYEE DELETED EMAIL');
      emailLogger.info('[EmailService-VERIFY] SMTP connection verified successfully for employee deleted');
    } catch (verifyError: any) {
      console.log('[EmailService-VERIFY] ❌ SMTP VERIFICATION FAILED FOR EMPLOYEE DELETED EMAIL');
      console.log('[EmailService-ERROR]', verifyError?.message || JSON.stringify(verifyError));
      emailLogger.error('[EmailService-VERIFY] SMTP verification failed for employee deleted:', verifyError?.message);
      return { success: false, error: `SMTP verification failed: ${verifyError?.message}` };
    }

    const validation = validateEmailConfig();
    if (!validation.valid) {
      const error = validation.error || 'Email service not configured';
      emailLogger.error(`Failed to send employee deleted email to ${email}: ${error}`);
      return { success: false, error };
    }

    const mailOptions: SendMailOptions = {
      from: runtimeConfig.emailUser!,
      to: email,
      subject: 'Employee Account Deactivated - Fleet Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #7f1d1d; margin-top: 0;">Account Deactivated</h2>
            <p style="color: #991b1b; font-size: 14px;">
              Hi <strong>${name}</strong>, your employee account has been deactivated by your manager.
            </p>
          </div>

          <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #374151; margin-bottom: 15px;">
              <strong>Account Information:</strong>
            </p>
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
              <p style="color: #4b5563; margin: 5px 0;"><strong>Name:</strong> ${name}</p>
              <p style="color: #4b5563; margin: 5px 0;"><strong>Company:</strong> ${companyName}</p>
              <p style="color: #4b5563; margin: 5px 0;"><strong>Status:</strong> <span style="color: #dc2626; font-weight: bold;">Deactivated</span></p>
              <p style="color: #4b5563; margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <p style="color: #374151; margin-bottom: 10px;">
              Your access to the Fleet Management System has been removed. You will no longer be able to log in to your account.
            </p>
          </div>

          <div style="background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
            <p style="color: #7f1d1d; font-size: 13px; margin: 0;">
              <strong>Important:</strong> If you believe this action was taken in error or if you have questions, please contact your manager or HR department.
            </p>
          </div>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #374151; font-size: 13px; margin: 0;">
              We appreciate your efforts with the Fleet Management System. If you were employed by us, we hope to work with you again in the future.
            </p>
          </div>

          <div style="color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            <p style="margin: 5px 0;">This is an automated message from your Fleet Management System.</p>
            <p style="margin: 5px 0;">© 2026 Fleet Management System. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    console.log('[EmailService-SEND] Sending EMPLOYEE DELETED email to:', email);
    const result = await transporter!.sendMail(mailOptions);
    console.log('[EmailService-SEND] ✅ EMPLOYEE DELETED email sent successfully');
    console.log('[EmailService-SEND] Message ID:', result.messageId);
    emailLogger.info(`Employee deleted email sent to: ${email} (messageId: ${result.messageId})`);
    return { success: true, message: 'Deletion notification sent successfully', messageId: result.messageId };
  } catch (error: any) {
    console.log('[EmailService-SEND] ❌ FAILED to send EMPLOYEE DELETED email');
    console.log('[EmailService-ERROR]', error?.message || JSON.stringify(error));
    emailLogger.error(`Failed to send employee deleted email to ${email}:`, error.message);
    if (error?.code === 'EAUTH') {
      console.log('[EmailService-AUTH] Authentication failed - check EMAIL_USER and EMAIL_PASSWORD');
      emailLogger.error('Authentication failed - verify EMAIL_USER and EMAIL_PASSWORD');
    }
    if (error?.code === 'ETIMEDOUT') {
      console.log('[EmailService-TIMEOUT] SMTP connection timeout - server not responding');
    }
    return { success: false, error: error.message };
  }
};

/**
 * Send email notification for employee account recovery
 */
export const sendEmployeeRecoveredEmail = async (
  email: string,
  name: string,
  companyName: string
): Promise<EmailResult> => {
  try {
    emailLogger.info(`Starting employee recovered email flow for: ${email}`);
    console.log('[EmailService-VERIFY] VERIFYING SMTP BEFORE EMPLOYEE RECOVERED EMAIL');
    try {
      await transporter!.verify();
      console.log('[EmailService-VERIFY] ✅ SMTP VERIFIED FOR EMPLOYEE RECOVERED EMAIL');
      emailLogger.info('[EmailService-VERIFY] SMTP connection verified successfully for employee recovered');
    } catch (verifyError: any) {
      console.log('[EmailService-VERIFY] ❌ SMTP VERIFICATION FAILED FOR EMPLOYEE RECOVERED EMAIL');
      console.log('[EmailService-ERROR]', verifyError?.message || JSON.stringify(verifyError));
      emailLogger.error('[EmailService-VERIFY] SMTP verification failed for employee recovered:', verifyError?.message);
      return { success: false, error: `SMTP verification failed: ${verifyError?.message}` };
    }

    const validation = validateEmailConfig();
    if (!validation.valid) {
      const error = validation.error || 'Email service not configured';
      emailLogger.error(`Failed to send employee recovered email to ${email}: ${error}`);
      return { success: false, error };
    }

    const mailOptions: SendMailOptions = {
      from: runtimeConfig.emailUser!,
      to: email,
      subject: 'Employee Account Restored - Fleet Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #ebf8ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1d4ed8; margin-top: 0;">Account Restored</h2>
            <p style="color: #1e40af; font-size: 14px;">
              Hi <strong>${name}</strong>, your account has been restored by your manager.
            </p>
          </div>

          <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #374151; margin-bottom: 15px;">
              <strong>Account Details:</strong>
            </p>
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
              <p style="color: #475569; margin: 5px 0;"><strong>Name:</strong> ${name}</p>
              <p style="color: #475569; margin: 5px 0;"><strong>Company:</strong> ${companyName}</p>
              <p style="color: #475569; margin: 5px 0;"><strong>Status:</strong> <span style="color: #0f766e; font-weight: bold;">Restored</span></p>
            </div>

            <p style="color: #374151; margin-bottom: 10px;">
              Your access to the Fleet Management System has been restored. You can now log in again with your existing credentials.
            </p>
          </div>

          <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
            <p style="color: #065f46; font-size: 13px; margin: 0;">
              <strong>Security Reminder:</strong> If you did not expect this action or notice anything suspicious, please contact your manager immediately.
            </p>
          </div>

          <div style="color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            <p style="margin: 5px 0;">This is an automated message from your Fleet Management System.</p>
            <p style="margin: 5px 0;">© 2026 Fleet Management System. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    console.log('[EmailService-SEND] Sending EMPLOYEE RECOVERED email to:', email);
    const result = await transporter!.sendMail(mailOptions);
    console.log('[EmailService-SEND] ✅ EMPLOYEE RECOVERED email sent successfully');
    console.log('[EmailService-SEND] Message ID:', result.messageId);
    emailLogger.info(`Employee recovered email sent to: ${email} (messageId: ${result.messageId})`);
    return { success: true, message: 'Recovery notification sent successfully', messageId: result.messageId };
  } catch (error: any) {
    console.log('[EmailService-SEND] ❌ FAILED to send EMPLOYEE RECOVERED email');
    console.log('[EmailService-ERROR]', error?.message || JSON.stringify(error));
    emailLogger.error(`Failed to send employee recovered email to ${email}:`, error.message);
    if (error?.code === 'EAUTH') {
      console.log('[EmailService-AUTH] Authentication failed - check EMAIL_USER and EMAIL_PASSWORD');
      emailLogger.error('Authentication failed - verify EMAIL_USER and EMAIL_PASSWORD');
    }
    if (error?.code === 'ETIMEDOUT') {
      console.log('[EmailService-TIMEOUT] SMTP connection timeout - server not responding');
    }
    return { success: false, error: error.message };
  }
};

/**
 * Send email verification OTP for email change
 */
export const sendEmailVerificationOTP = async (newEmail: string, otp: string, verificationToken: string, userName: string): Promise<EmailResult> => {
  try {
    emailLogger.info(`Starting email verification OTP flow for: ${newEmail}`);
    console.log('[EmailService-VERIFY] VERIFYING SMTP BEFORE EMAIL VERIFICATION OTP');
    try {
      await transporter!.verify();
      console.log('[EmailService-VERIFY] ✅ SMTP VERIFIED FOR EMAIL VERIFICATION OTP');
      emailLogger.info('[EmailService-VERIFY] SMTP connection verified successfully for email verification OTP');
    } catch (verifyError: any) {
      console.log('[EmailService-VERIFY] ❌ SMTP VERIFICATION FAILED FOR EMAIL VERIFICATION OTP');
      console.log('[EmailService-ERROR]', verifyError?.message || JSON.stringify(verifyError));
      emailLogger.error('[EmailService-VERIFY] SMTP verification failed for email verification OTP:', verifyError?.message);
      return { success: false, error: `SMTP verification failed: ${verifyError?.message}` };
    }

    const validation = validateEmailConfig();
    if (!validation.valid) {
      const error = validation.error || 'Email service not configured';
      emailLogger.error(`Failed to send email verification OTP to ${newEmail}: ${error}`);
      return { success: false, error };
    }

    // Use the 6-character OTP directly
    const displayOTP = otp.toUpperCase();

    const mailOptions: SendMailOptions = {
      from: runtimeConfig.emailUser!,
      to: newEmail,
      subject: 'Email Verification Code - Fleet Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f0f4f8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">Email Verification Code</h2>
            <p style="color: #4b5563; font-size: 14px;">
              Hi <strong>${userName}</strong>, you requested to change your email address. Please verify your new email using the code below.
            </p>
          </div>

          <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #374151; margin-bottom: 20px;">
              Your email verification code is (expires in <strong>30 minutes</strong>):
            </p>

            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; text-align: center; margin-bottom: 25px; border: 2px solid #e5e7eb;">
              <p style="font-size: 40px; font-weight: bold; color: #1f2937; margin: 0; letter-spacing: 8px;">
                ${displayOTP}
              </p>
              <p style="color: #6b7280; font-size: 12px; margin-top: 10px;">
                Copy this code to verify your email address
              </p>
            </div>

            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
              <p style="color: #92400e; font-size: 13px; margin: 0;">
                <strong>Security Note:</strong> This code will expire in 30 minutes. If you didn't request this change, please ignore this email.
              </p>
            </div>
          </div>

          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #4b5563; margin-bottom: 10px;">
              <strong>What happens next:</strong>
            </p>
            <ul style="color: #4b5563; margin: 10px 0; padding-left: 20px;">
              <li style="margin: 8px 0;">Enter this code in the verification field on Fleet Management System</li>
              <li style="margin: 8px 0;">Your email will be updated once verified</li>
              <li style="margin: 8px 0;">You may need to log in again with your new email address</li>
            </ul>
          </div>

          <div style="color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            <p style="margin: 5px 0;">This is an automated message. Please do not reply directly to this email.</p>
            <p style="margin: 5px 0;">© 2026 Fleet Management System. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    console.log('[EmailService-SEND] Sending EMAIL VERIFICATION OTP to:', newEmail);
    const result = await transporter!.sendMail(mailOptions);
    console.log('[EmailService-SEND] ✅ EMAIL VERIFICATION OTP sent successfully');
    console.log('[EmailService-SEND] Message ID:', result.messageId);
    emailLogger.info(`Email verification code sent to: ${newEmail} (messageId: ${result.messageId})`);
    return { success: true, message: 'Verification code sent successfully', messageId: result.messageId };
  } catch (error: any) {
    console.log('[EmailService-SEND] ❌ FAILED to send EMAIL VERIFICATION OTP');
    console.log('[EmailService-ERROR]', error?.message || JSON.stringify(error));
    emailLogger.error(`Failed to send email verification OTP to ${newEmail}:`, error.message);
    if (error?.code === 'EAUTH') {
      console.log('[EmailService-AUTH] Authentication failed - check EMAIL_USER and EMAIL_PASSWORD');
      emailLogger.error('Authentication failed - verify EMAIL_USER and EMAIL_PASSWORD');
    }
    if (error?.code === 'ETIMEDOUT') {
      console.log('[EmailService-TIMEOUT] SMTP connection timeout - server not responding');
    }
    return { success: false, error: error.message };
  }
};

/**
 * Send password reset OTP via email
 */
export const sendPasswordResetOTP = async (email: string, otp: string): Promise<EmailResult> => {
  try {
    emailLogger.info(`Starting password reset OTP flow for: ${email}`);
    console.log('[EmailService-VERIFY] VERIFYING SMTP BEFORE PASSWORD RESET OTP');
    try {
      await transporter!.verify();
      console.log('[EmailService-VERIFY] ✅ SMTP VERIFIED FOR PASSWORD RESET OTP');
      emailLogger.info('[EmailService-VERIFY] SMTP connection verified successfully for password reset OTP');
    } catch (verifyError: any) {
      console.log('[EmailService-VERIFY] ❌ SMTP VERIFICATION FAILED FOR PASSWORD RESET OTP');
      console.log('[EmailService-ERROR]', verifyError?.message || JSON.stringify(verifyError));
      emailLogger.error('[EmailService-VERIFY] SMTP verification failed for password reset OTP:', verifyError?.message);
      return { success: false, error: `SMTP verification failed: ${verifyError?.message}` };
    }

    const validation = validateEmailConfig();
    if (!validation.valid) {
      const error = validation.error || 'Email service not configured';
      emailLogger.error(`Failed to send password reset OTP to ${email}: ${error}`);
      return { success: false, error };
    }

    const mailOptions: SendMailOptions = {
      from: runtimeConfig.emailUser!,
      to: email,
      subject: 'Password Reset Code - Fleet Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f0f4f8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">Password Reset Code</h2>
            <p style="color: #4b5563; font-size: 14px;">
              We received a request to reset the password for your Fleet Management System account.
            </p>
          </div>

          <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #374151; margin-bottom: 20px;">
              Your password reset code is (expires in <strong>15 minutes</strong>):
            </p>

            <div style="background-color: #f3f4f6; padding: 25px; border-radius: 6px; text-align: center; margin-bottom: 25px; border: 2px solid #e5e7eb;">
              <p style="font-size: 48px; font-weight: bold; color: #1f2937; margin: 0; letter-spacing: 10px;">
                ${otp}
              </p>
              <p style="color: #6b7280; font-size: 12px; margin-top: 10px;">
                Copy this code to reset your password
              </p>
            </div>

            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
              <p style="color: #92400e; font-size: 13px; margin: 0;">
                <strong>Security Notice:</strong> This code will expire in 15 minutes. If you didn't request a password reset, please ignore this email or contact support immediately.
              </p>
            </div>
          </div>

          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #4b5563; margin-bottom: 10px;">
              <strong>Next steps:</strong>
            </p>
            <ul style="color: #4b5563; margin: 10px 0; padding-left: 20px;">
              <li style="margin: 8px 0;">Enter this code on the password reset page</li>
              <li style="margin: 8px 0;">Create a strong new password (min 8 characters with uppercase, lowercase, number, and special character)</li>
              <li style="margin: 8px 0;">Confirm your password</li>
              <li style="margin: 8px 0;">You can now sign in with your new password</li>
            </ul>
          </div>

          <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
            <p style="color: #065f46; font-size: 13px; margin: 0;">
              <strong>Account Security:</strong> Never share your password reset code with anyone. Our support team will never ask for this code.
            </p>
          </div>

          <div style="color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            <p style="margin: 5px 0;">This is an automated message. Please do not reply directly to this email.</p>
            <p style="margin: 5px 0;">© 2026 Fleet Management System. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    console.log('[EmailService-SEND] Sending PASSWORD RESET OTP to:', email);
    const result = await transporter!.sendMail(mailOptions);
    console.log('[EmailService-SEND] ✅ PASSWORD RESET OTP sent successfully');
    console.log('[EmailService-SEND] Message ID:', result.messageId);
    emailLogger.info(`Password reset code sent to: ${email} (messageId: ${result.messageId})`);
    return { success: true, message: 'Reset code sent successfully', messageId: result.messageId };
  } catch (error: any) {
    console.log('[EmailService-SEND] ❌ FAILED to send PASSWORD RESET OTP');
    console.log('[EmailService-ERROR]', error?.message || JSON.stringify(error));
    emailLogger.error(`Failed to send password reset OTP to ${email}:`, error.message);
    if (error?.code === 'EAUTH') {
      console.log('[EmailService-AUTH] Authentication failed - check EMAIL_USER and EMAIL_PASSWORD');
      emailLogger.error('Authentication failed - verify EMAIL_USER and EMAIL_PASSWORD');
    }
    if (error?.code === 'ETIMEDOUT') {
      console.log('[EmailService-TIMEOUT] SMTP connection timeout - server not responding');
    }
    return { success: false, error: error.message };
  }
};
