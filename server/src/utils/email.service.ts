import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';
import { gmail_v1, google } from 'googleapis';
import gmailOAuth2Manager from './gmail-oauth2';
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

/**
 * Gmail API client - initialized on-demand with OAuth2 credentials
 */
let gmailClient: gmail_v1.Gmail | null = null;

/**
 * Initialize Gmail API client with OAuth2 credentials
 */
const initializeGmailClient = async (): Promise<boolean> => {
  try {
    if (gmailClient) {
      return true; // Already initialized
    }

    const tokenResult = await gmailOAuth2Manager.getAccessToken();
    if (!tokenResult.success) {
      emailLogger.error(`Failed to get Gmail OAuth2 token: ${tokenResult.error}`);
      return false;
    }

    const auth = new google.auth.OAuth2(
      runtimeConfig.googleClientId,
      runtimeConfig.googleClientSecret,
      runtimeConfig.googleRedirectUrl,
    );

    auth.setCredentials({
      access_token: tokenResult.accessToken,
    });

    gmailClient = google.gmail({ version: 'v1', auth });
    return true;
  } catch (error: any) {
    emailLogger.error(`Failed to initialize Gmail client: ${error.message}`);
    return false;
  }
};

/**
 * Encode email message to RFC 5322 base64 format required by Gmail API
 */
const encodeMessage = (message: string): string => {
  return Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

/**
 * Build RFC 5322 formatted email message
 */
const buildRFC5322Message = (from: string, to: string, subject: string, htmlBody: string): string => {
  const headers = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
  ].join('\r\n');

  return `${headers}\r\n\r\n${htmlBody}`;
};

/**
 * Send email via Gmail API
 * Replaces transporter.sendMail() for OAuth2-based Gmail sending
 */
const sendMailViaGmailAPI = async (
  to: string,
  subject: string,
  htmlBody: string,
  operationName: string,
): Promise<EmailResult> => {
  try {
    // Initialize Gmail client if needed
    const initialized = await initializeGmailClient();
    if (!initialized) {
      return {
        success: false,
        error: 'Failed to initialize Gmail API client',
        statusCode: 503,
      };
    }

    const from = runtimeConfig.emailUser!;
    const message = buildRFC5322Message(from, to, subject, htmlBody);
    const encodedMessage = encodeMessage(message);

    console.log(`[EmailService-GMAIL] Sending ${operationName} email via Gmail API to: ${to}`);

    const result = await gmailClient!.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    console.log(`[EmailService-GMAIL] ✅ ${operationName} email sent successfully via Gmail API`);
    console.log(`[EmailService-GMAIL] Message ID: ${result.data.id}`);
    emailLogger.info(`${operationName} email sent successfully to: ${to} (messageId: ${result.data.id})`);

    return {
      success: true,
      message: `${operationName} email sent successfully`,
      messageId: result.data.id ?? undefined,
    };
  } catch (error: any) {
    console.log(`[EmailService-GMAIL] ❌ FAILED to send ${operationName} email via Gmail API`);
    console.log('[EmailService-ERROR]', error?.message || JSON.stringify(error));
    emailLogger.error(`Failed to send ${operationName} email via Gmail API to ${to}:`, error.message);

    return {
      success: false,
      error: error.message || `Failed to send ${operationName} email`,
      statusCode: 503,
    };
  }
};

/**
 * Validate Gmail API email configuration
 */
const validateGmailConfig = (): { valid: boolean; error?: string } => {
  if (!runtimeConfig.emailUser) {
    return { valid: false, error: 'EMAIL_USER not configured' };
  }

  if (!runtimeConfig.googleClientId || !runtimeConfig.googleClientSecret) {
    return { valid: false, error: 'Gmail OAuth2 credentials not configured' };
  }

  if (!gmailClient) {
    return { valid: false, error: 'Gmail API client not initialized' };
  }

  return { valid: true };
};

/**
 * Verify Gmail API connection and OAuth2 token validity
 * Replaces transporter.verify() for Gmail API
 */
const verifyGmailConnection = async (operationName: string): Promise<EmailResult> => {
  try {
    const authVerification = await gmailOAuth2Manager.verifyAuthentication();
    if (!authVerification.success) {
      return {
        success: false,
        error: authVerification.error || 'Failed to verify Gmail OAuth2 authentication',
        statusCode: 503,
      };
    }

    // Initialize the Gmail API client without calling a read-scoped endpoint.
    const initialized = await initializeGmailClient();
    if (!initialized) {
      return {
        success: false,
        error: 'Failed to initialize Gmail API client',
        statusCode: 503,
      };
    }

    console.log(`[EmailService-VERIFY] ✅ Gmail OAuth2 verified for ${operationName}`);
    return {
      success: true,
      message: `Gmail API connection verified for ${operationName}`,
    };
  } catch (error: any) {
    console.log(`[EmailService-VERIFY] ❌ Gmail API verification failed: ${error.message}`);
    emailLogger.error(`Gmail API verification failed for ${operationName}:`, error.message);

    return {
      success: false,
      error: `Gmail API verification failed: ${error.message}`,
      statusCode: 503,
    };
  }
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
  emailLogger.debug('SMTP transporter bootstrap disabled; Gmail API is used for all outbound email');
  return null;
};

const transporter = initializeTransporter();

/**
 * Validate email service is configured before sending
 */
const validateEmailConfig = (): { valid: boolean; error?: string } => {
  return validateGmailConfig();
};

export const verifySmtpConnection = async (operation = 'SMTP verification'): Promise<EmailResult> => {
  return verifyGmailConnection(operation);
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
    const verification = await verifyGmailConnection('Gmail API verification for password reset');
    if (!verification.success) {
      return verification;
    }

    const validation = validateGmailConfig();
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
    return await sendMailViaGmailAPI(email, 'Password Reset Request - Fleet Management System', String(mailOptions.html ?? ''), 'PASSWORD RESET');
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
    const verification = await verifyGmailConnection('Gmail API verification for direct email');
    if (!verification.success) {
      return verification;
    }

    const validation = validateGmailConfig();
    if (!validation.valid) {
      const error = validation.error || 'Email service not configured';
      emailLogger.error(`Failed to send email to ${email}: ${error}`);
      return { success: false, error };
    }

    console.log('[EmailService-SEND] Sending DIRECT email to:', email);
    return await sendMailViaGmailAPI(email, subject, htmlBody, 'DIRECT EMAIL');
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
    const verification = await verifyGmailConnection('Gmail API verification for password reset success');
    if (!verification.success) {
      return verification;
    }

    const validation = validateGmailConfig();
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
    return await sendMailViaGmailAPI(email, 'Password Changed Successfully - Fleet Management System', String(mailOptions.html ?? ''), 'PASSWORD RESET SUCCESS');
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
    console.log('[EmailService-VERIFY] VERIFYING GMAIL API BEFORE EMPLOYEE SETUP EMAIL');

    // Verify Gmail API is accessible
    const verification = await verifyGmailConnection('Gmail API verification for employee setup');
    if (!verification.success) {
      emailLogger.error(`Gmail API verification failed: ${verification.error}`);
      return {
        success: false,
        error: verification.error,
        statusCode: verification.statusCode,
      };
    }

    console.log('[EmailService-VERIFY] ✅ GMAIL API VERIFIED FOR EMPLOYEE SETUP EMAIL');
    emailLogger.info('[EmailService-VERIFY] Gmail API verified for employee setup');

    const validation = validateGmailConfig();
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
    return await sendMailViaGmailAPI(email, 'Welcome to Fleet Management System - Set Your Password', mailOptions.html as string, 'EMPLOYEE SETUP');
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
    console.log('[EmailService-VERIFY] VERIFYING GMAIL API BEFORE FIRST LOGIN SECURITY EMAIL');

    // Verify Gmail API is accessible
    const verification = await verifyGmailConnection('Gmail API verification for first login security');
    if (!verification.success) {
      emailLogger.error(`Gmail API verification failed: ${verification.error}`);
      return {
        success: false,
        error: verification.error,
        statusCode: verification.statusCode,
      };
    }

    console.log('[EmailService-VERIFY] ✅ GMAIL API VERIFIED FOR FIRST LOGIN SECURITY EMAIL');
    emailLogger.info('[EmailService-VERIFY] Gmail API verified for first login security');

    const validation = validateGmailConfig();
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
    return await sendMailViaGmailAPI(email, 'Security Notice: First Login Detected', mailOptions.html as string, 'FIRST LOGIN SECURITY');
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
    console.log('[EmailService-VERIFY] VERIFYING GMAIL API BEFORE EMPLOYEE DETAILS UPDATED EMAIL');

    // Verify Gmail API is accessible
    const verification = await verifyGmailConnection('Gmail API verification for employee details updated');
    if (!verification.success) {
      emailLogger.error(`Gmail API verification failed: ${verification.error}`);
      return {
        success: false,
        error: verification.error,
        statusCode: verification.statusCode,
      };
    }

    console.log('[EmailService-VERIFY] ✅ GMAIL API VERIFIED FOR EMPLOYEE DETAILS UPDATED EMAIL');
    emailLogger.info('[EmailService-VERIFY] Gmail API verified for employee details updated');

    const validation = validateGmailConfig();
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
    return await sendMailViaGmailAPI(email, 'Your Account Details Have Been Updated', mailOptions.html as string, 'EMPLOYEE DETAILS UPDATED');
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
    console.log('[EmailService-VERIFY] VERIFYING GMAIL API BEFORE EMPLOYEE DELETED EMAIL');

    // Verify Gmail API is accessible
    const verification = await verifyGmailConnection('Gmail API verification for employee deleted');
    if (!verification.success) {
      emailLogger.error(`Gmail API verification failed: ${verification.error}`);
      return {
        success: false,
        error: verification.error,
        statusCode: verification.statusCode,
      };
    }

    console.log('[EmailService-VERIFY] ✅ GMAIL API VERIFIED FOR EMPLOYEE DELETED EMAIL');
    emailLogger.info('[EmailService-VERIFY] Gmail API verified for employee deleted');

    const validation = validateGmailConfig();
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
    return await sendMailViaGmailAPI(email, 'Employee Account Deactivated - Fleet Management System', mailOptions.html as string, 'EMPLOYEE DELETED');
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
    console.log('[EmailService-VERIFY] VERIFYING GMAIL API BEFORE EMPLOYEE RECOVERED EMAIL');

    // Verify Gmail API is accessible
    const verification = await verifyGmailConnection('Gmail API verification for employee recovered');
    if (!verification.success) {
      emailLogger.error(`Gmail API verification failed: ${verification.error}`);
      return {
        success: false,
        error: verification.error,
        statusCode: verification.statusCode,
      };
    }

    console.log('[EmailService-VERIFY] ✅ GMAIL API VERIFIED FOR EMPLOYEE RECOVERED EMAIL');
    emailLogger.info('[EmailService-VERIFY] Gmail API verified for employee recovered');

    const validation = validateGmailConfig();
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
    return await sendMailViaGmailAPI(email, 'Employee Account Restored - Fleet Management System', mailOptions.html as string, 'EMPLOYEE RECOVERED');
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
    const verification = await verifyGmailConnection('Gmail API verification for email verification OTP');
    if (!verification.success) {
      return verification;
    }

    const validation = validateGmailConfig();
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
    return await sendMailViaGmailAPI(newEmail, 'Email Verification Code - Fleet Management System', String(mailOptions.html ?? ''), 'EMAIL VERIFICATION OTP');
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
    const verification = await verifyGmailConnection('Gmail API verification for password reset OTP');
    if (!verification.success) {
      return verification;
    }

    const validation = validateGmailConfig();
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
    return await sendMailViaGmailAPI(email, 'Password Reset Code - Fleet Management System', String(mailOptions.html ?? ''), 'PASSWORD RESET OTP');
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
