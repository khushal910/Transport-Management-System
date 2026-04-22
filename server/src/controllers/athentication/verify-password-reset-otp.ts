// @ts-nocheck
import response from '../../response/response';
import User from '../../models/user.schema';
import bcrypt from 'bcryptjs';
import joi from 'joi';
import { sendPasswordResetSuccessEmail } from '../../utils/email.service';
import environmentConfig from '../../config/environment';

/**
 * Verify password reset OTP and set new password
 * Endpoint: POST /api/auth/verify-password-reset-otp
 * Authentication: Not required (public endpoint)
 */
const getVerifyPasswordResetSchema = () => {
  const minLength = environmentConfig.getMinPasswordLength();
  const isDev = environmentConfig.isDevelopment;

  let passwordRule = joi.string().trim();

  if (isDev) {
    // Development mode: minimal requirements
    passwordRule = passwordRule.min(1).required().messages({
      'string.min': 'Password must be at least 1 character',
      'any.required': 'Password is required',
    });
  } else {
    // Production mode: strict requirements
    passwordRule = passwordRule
      .min(minLength)
      .regex(/[A-Z]/)
      .regex(/[a-z]/)
      .regex(/[0-9]/)
      .regex(/[!@#$%^&*]/)
      .required()
      .messages({
        'string.min': `Password must be at least ${minLength} characters long`,
        'string.pattern.base':
          'Password must contain uppercase, lowercase, number, and special character',
        'any.required': 'Password is required',
      });
  }

  return joi.object({
    email: joi.string().email().trim().required().messages({
      'string.email': 'Valid email is required',
      'any.required': 'Email is required',
    }),
    otp: joi
      .string()
      .trim()
      .pattern(/^\d{6}$/)
      .required()
      .messages({
        'string.empty': 'Password reset code is required',
        'string.pattern.base': 'Password reset code must be a 6-digit number',
        'any.required': 'Password reset code is required',
      }),
    password: passwordRule,
    passwordConfirm: joi.string().valid(joi.ref('password')).required().messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Password confirmation is required',
    }),
  });
};

const verifyPasswordResetSchema = getVerifyPasswordResetSchema();

const verifyPasswordResetOTP = async (req, res) => {
  try {
    // Validate input
    const { error, value } = verifyPasswordResetSchema.validate(req.body);

    if (error) {
      return response(res, 400, false, error.details[0].message.replace(/"/g, ''));
    }

    const { email, otp, password, passwordConfirm } = value;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return response(res, 401, false, 'Invalid email or reset code');
    }

    // Check if user has a valid OTP request
    if (!user.passwordResetToken || !user.passwordResetExpires) {
      return response(res, 401, false, 'No password reset request found. Please request a new reset code.');
    }

    // Check if OTP has expired
    if (new Date() > user.passwordResetExpires) {
      // Clear expired OTP
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      user.passwordResetReference = null;
      await user.save();

      return response(res, 401, false, 'Reset code has expired. Please request a new one.');
    }

    // Compare provided OTP with stored hashed OTP
    const isOTPValid = await bcrypt.compare(otp, user.passwordResetToken);
    if (!isOTPValid) {
      return response(res, 401, false, 'Invalid password reset code');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and clear OTP fields
    user.password = hashedPassword;
    user.isPasswordSet = true;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.passwordResetReference = null;

    await user.save();

    // Send password reset success email
    await sendPasswordResetSuccessEmail(user.email);

    return response(res, 200, true, 'Password has been reset successfully. You can now sign in with your new password.');
  } catch (err) {
    console.error('Verify Password Reset OTP Error:', err);
    return response(res, 500, false, 'Failed to reset password');
  }
};

export default verifyPasswordResetOTP;
