import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';

interface EmailResult {
  success: boolean;
  message?: string;
  messageId?: string;
  error?: string;
}

const isProduction = process.env.NODE_ENV === 'production';
const debugLog = (...args: unknown[]) => {
  if (!isProduction) {
    // Debug logging disabled in production
  }
};

// Initialize email transporter
const normalizeEnv = (value?: string) => {
  if (!value) return undefined;
  return value.trim().replace(/^['"]|['"]$/g, '');
};

const transporter: Transporter = nodemailer.createTransport({
  service: normalizeEnv(process.env.EMAIL_SERVICE) || 'gmail',
  auth: {
    user: normalizeEnv(process.env.EMAIL_USER),
    pass: normalizeEnv(process.env.EMAIL_PASSWORD),
  },
});

// Verify transporter configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('Email Transporter Verification Error:', error.message);
    console.error('Make sure to use Gmail App-Specific Password (not your regular password)');
    console.error('Setup: https://myaccount.google.com/apppasswords');
  } else if (success) {
    debugLog('Email transporter ready to send emails');
  }
});

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email: string, resetToken: string): Promise<EmailResult> => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error('Email credentials not configured. Set EMAIL_USER and EMAIL_PASSWORD in .env');
    }

    const resetLink = `${process.env.CLIENT_URL}/auth/reset-password?token=${resetToken}`;
    
    const mailOptions: SendMailOptions = {
      from: process.env.EMAIL_USER,
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

    const result = await transporter.sendMail(mailOptions);
    debugLog('Password reset email sent successfully to:', email);
    return { success: true, message: 'Reset email sent successfully', messageId: result.messageId };
  } catch (error: any) {
    console.error('❌ Email sending error:', error.message);
    console.error('Error details:', error.code || error);
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
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error('Email credentials not configured. Set EMAIL_USER and EMAIL_PASSWORD in .env');
    }

    const mailOptions: SendMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      html: htmlBody,
    };

    const result = await transporter.sendMail(mailOptions);
    debugLog('Direct email sent successfully to:', email);
    return { success: true, message: 'Email sent successfully', messageId: result.messageId };
  } catch (error: any) {
    console.error('❌ Direct email sending error:', error.message);
    console.error('Error details:', error.code || error);
    return { success: false, error: error.message };
  }
};

/**
 * Send password reset success email
 */
export const sendPasswordResetSuccessEmail = async (email: string): Promise<EmailResult> => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error('Email credentials not configured. Set EMAIL_USER and EMAIL_PASSWORD in .env');
    }

    const mailOptions: SendMailOptions = {
      from: process.env.EMAIL_USER,
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

    const result = await transporter.sendMail(mailOptions);
    debugLog('Password reset success email sent to:', email);
    return { success: true, message: 'Confirmation email sent successfully', messageId: result.messageId };
  } catch (error: any) {
    console.error('❌ Confirmation email sending error:', error.message);
    console.error('Error details:', error.code || error);
    return { success: false, error: error.message };
  }
};

/**
 * Send employee account setup email
 */
export const sendEmployeeSetupEmail = async (email: string, name: string, setupToken: string): Promise<EmailResult> => {
  try {
    debugLog('[EmailService] Starting sendEmployeeSetupEmail');
    debugLog('[EmailService] Email recipient:', email);
    debugLog('[EmailService] Email config - USER set:', !!process.env.EMAIL_USER);
    debugLog('[EmailService] Email config - PASSWORD set:', !!process.env.EMAIL_PASSWORD);
    debugLog('[EmailService] Email config - CLIENT_URL set:', !!process.env.CLIENT_URL);
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      const error = 'Email credentials not configured. Set EMAIL_USER and EMAIL_PASSWORD in .env';
      console.error('❌ [EmailService]', error);
      throw new Error(error);
    }

    if (!process.env.CLIENT_URL) {
      const error = 'CLIENT_URL not configured. Set CLIENT_URL in .env';
      console.error('❌ [EmailService]', error);
      throw new Error(error);
    }

    const setupLink = `${process.env.CLIENT_URL}/auth/setup-password?token=${setupToken}`;
    debugLog('[EmailService] Setup link generated');
    
    const mailOptions: SendMailOptions = {
      from: process.env.EMAIL_USER,
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

    debugLog('[EmailService] Attempting to send email via transporter...');
    const result = await transporter.sendMail(mailOptions);
    debugLog('[EmailService] Employee setup email sent successfully to:', email);
    debugLog('[EmailService] Message ID:', result.messageId);
    return { success: true, message: 'Setup email sent successfully', messageId: result.messageId };
  } catch (error: any) {
    console.error('❌ [EmailService] Employee setup email sending error:', error.message);
    console.error('❌ [EmailService] Error details:', error.code || error);
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
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error('Email credentials not configured. Set EMAIL_USER and EMAIL_PASSWORD in .env');
    }

    const fieldsList = [];
    if (updatedFields.name) fieldsList.push(`<li style="color: #4b5563; margin: 8px 0;"><strong>Name:</strong> ${updatedFields.name}</li>`);
    if (updatedFields.email) fieldsList.push(`<li style="color: #4b5563; margin: 8px 0;"><strong>Email:</strong> ${updatedFields.email}</li>`);
    if (updatedFields.role) fieldsList.push(`<li style="color: #4b5563; margin: 8px 0;"><strong>Role:</strong> ${updatedFields.role.charAt(0).toUpperCase() + updatedFields.role.slice(1)}</li>`);
    if (updatedFields.password) fieldsList.push(`<li style="color: #4b5563; margin: 8px 0;"><strong>Password:</strong> Updated</li>`);

    const mailOptions: SendMailOptions = {
      from: process.env.EMAIL_USER,
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

    const result = await transporter.sendMail(mailOptions);
    debugLog('Employee details updated email sent successfully to:', email);
    return { success: true, message: 'Update notification sent successfully', messageId: result.messageId };
  } catch (error: any) {
    console.error('❌ Employee update email sending error:', error.message);
    console.error('Error details:', error.code || error);
    return { success: false, error: error.message };
  }
};

/**
 * Send employee account deletion email
 */
export const sendEmployeeDeletedEmail = async (email: string, name: string, companyName: string): Promise<EmailResult> => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error('Email credentials not configured. Set EMAIL_USER and EMAIL_PASSWORD in .env');
    }

    const mailOptions: SendMailOptions = {
      from: process.env.EMAIL_USER,
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

    const result = await transporter.sendMail(mailOptions);
    debugLog('Employee deletion email sent successfully to:', email);
    return { success: true, message: 'Deletion notification sent successfully', messageId: result.messageId };
  } catch (error: any) {
    console.error('❌ Employee deletion email sending error:', error.message);
    console.error('Error details:', error.code || error);
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
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error('Email credentials not configured. Set EMAIL_USER and EMAIL_PASSWORD in .env');
    }

    const mailOptions: SendMailOptions = {
      from: process.env.EMAIL_USER,
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

    const result = await transporter.sendMail(mailOptions);
    debugLog('Employee recovery email sent successfully to:', email);
    return { success: true, message: 'Recovery notification sent successfully', messageId: result.messageId };
  } catch (error: any) {
    console.error('❌ Employee recovery email sending error:', error.message);
    console.error('Error details:', error.code || error);
    return { success: false, error: error.message };
  }
};

/**
 * Send email verification OTP for email change
 */
export const sendEmailVerificationOTP = async (newEmail: string, otp: string, verificationToken: string, userName: string): Promise<EmailResult> => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error('Email credentials not configured. Set EMAIL_USER and EMAIL_PASSWORD in .env');
    }

    // Use the 6-character OTP directly
    const displayOTP = otp.toUpperCase();

    const mailOptions: SendMailOptions = {
      from: process.env.EMAIL_USER,
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

    const result = await transporter.sendMail(mailOptions);
    debugLog('Email verification code sent successfully to:', newEmail);
    return { success: true, message: 'Verification code sent successfully', messageId: result.messageId };
  } catch (error: any) {
    console.error('❌ Email verification sending error:', error.message);
    console.error('Error details:', error.code || error);
    return { success: false, error: error.message };
  }
};

/**
 * Send password reset OTP via email
 */
export const sendPasswordResetOTP = async (email: string, otp: string): Promise<EmailResult> => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error('Email credentials not configured. Set EMAIL_USER and EMAIL_PASSWORD in .env');
    }

    const mailOptions: SendMailOptions = {
      from: process.env.EMAIL_USER,
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

    const result = await transporter.sendMail(mailOptions);
    debugLog('Password reset code sent successfully to:', email);
    return { success: true, message: 'Reset code sent successfully', messageId: result.messageId };
  } catch (error: any) {
    console.error('❌ Password reset email sending error:', error.message);
    console.error('Error details:', error.code || error);
    return { success: false, error: error.message };
  }
};
