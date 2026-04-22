// @ts-nocheck
import response from '../../response/response';
import User from '../../models/user.schema';
import bcrypt from 'bcryptjs';
import joi from 'joi';
import { sendPasswordResetSuccessEmail } from '../../utils/email.service';
import environmentConfig from '../../config/environment';

// Reset password validation schema - uses environment config
const getResetPasswordValidatorSchema = () => {
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
    token: joi
      .string()
      .trim()
      .pattern(/^[a-f0-9]{64}$/i)
      .required()
      .messages({
        'string.empty': 'Reset token is required',
        'string.pattern.base': 'Reset token format is invalid',
        'any.required': 'Reset token is required',
      }),
    password: passwordRule,
    passwordConfirm: joi.string().valid(joi.ref('password')).required().messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Password confirmation is required',
    }),
  });
};

const resetPasswordValidatorSchema = getResetPasswordValidatorSchema();

const userResetPassword = async (req, res) => {
  try {
    // Validate input
    const { error, value } = resetPasswordValidatorSchema.validate(req.body);

    if (error) {
      return response(res, 400, false, error.details[0].message.replace(/"/g, ''));
    }

    const { token, password } = value;

    // Find user with valid reset token and non-expired token
    // We need to find user where token hash matches and expiry is in future
    const users = await User.find({
      passwordResetExpires: { $gt: Date.now() },
    });

    let user = null;

    // Compare plain token with stored hashed tokens
    for (const u of users) {
      if (u.passwordResetToken) {
        const tokenMatch = await bcrypt.compare(token, u.passwordResetToken);
        if (tokenMatch) {
          user = u;
          break;
        }
      }
    }

    if (!user) {
      return response(res, 401, false, 'Invalid or expired reset token');
    }

    if (user.isDeleted || user.isActive === false || !user.password) {
      return response(res, 401, false, 'Invalid or expired reset token');
    }

    // Check if token has expired
    if (user.passwordResetExpires < Date.now()) {
      return response(res, 401, false, 'Reset token has expired');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and clear reset token fields
    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.passwordChangedAt = new Date();
    user.failedLoginAttempts = 0;
    user.loginLockUntil = null;

    await user.save();

    // Send password reset success email
    await sendPasswordResetSuccessEmail(user.email);

    return response(res, 200, true, 'Password reset successfully. You can now login with your new password.');
  } catch (err) {
    console.error('Reset Password Error:', err);
    return response(res, 500, false, 'Failed to reset password');
  }
};

export default userResetPassword;

