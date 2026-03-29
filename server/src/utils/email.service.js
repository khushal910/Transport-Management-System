import nodemailer from 'nodemailer';

// Initialize email transporter
// Using Gmail SMTP - You can configure with your email provider
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify transporter configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('Email Transporter Verification Error:', error.message);
    console.error('Make sure to use Gmail App-Specific Password (not your regular password)');
    console.error('Setup: https://myaccount.google.com/apppasswords');
  } else if (success) {
    console.log('✓ Email transporter ready to send emails');
  }
});

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} resetToken - Reset token to include in link
 * @returns {Promise} - Email sending result
 */
export const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error('Email credentials not configured. Set EMAIL_USER and EMAIL_PASSWORD in .env');
    }

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
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
    console.log('✓ Password reset email sent successfully to:', email);
    return { success: true, message: 'Reset email sent successfully', messageId: result.messageId };
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    console.error('Error details:', error.code || error);
    return { success: false, error: error.message };
  }
};

/**
 * Send password reset success email
 * @param {string} email - Recipient email
 * @returns {Promise} - Email sending result
 */
export const sendPasswordResetSuccessEmail = async (email) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error('Email credentials not configured. Set EMAIL_USER and EMAIL_PASSWORD in .env');
    }

    const mailOptions = {
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
    console.log('✓ Success confirmation email sent to:', email);
    return { success: true, message: 'Confirmation email sent successfully', messageId: result.messageId };
  } catch (error) {
    console.error('❌ Confirmation email sending error:', error.message);
    console.error('Error details:', error.code || error);
    return { success: false, error: error.message };
  }
};

/**
 * Send employee account setup email
 * @param {string} email - Recipient email
 * @param {string} name - Employee name
 * @param {string} setupToken - Setup token to include in link
 * @returns {Promise} - Email sending result
 */
export const sendEmployeeSetupEmail = async (email, name, setupToken) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error('Email credentials not configured. Set EMAIL_USER and EMAIL_PASSWORD in .env');
    }

    const setupLink = `${process.env.CLIENT_URL}/setup-password?token=${setupToken}`;
    
    const mailOptions = {
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

    const result = await transporter.sendMail(mailOptions);
    console.log('✓ Employee setup email sent successfully to:', email);
    return { success: true, message: 'Setup email sent successfully', messageId: result.messageId };
  } catch (error) {
    console.error('❌ Employee setup email sending error:', error.message);
    console.error('Error details:', error.code || error);
    return { success: false, error: error.message };
  }
};
