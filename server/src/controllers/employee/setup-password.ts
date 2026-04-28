// @ts-nocheck
import response from '../../response/response';
import User from '../../models/user.schema';
import bcrypt from 'bcryptjs';
import joi from 'joi';
import environmentConfig from '../../config/environment';

// Setup password validation schema
const getSetupPasswordValidatorSchema = () => {
  const minLength = environmentConfig.getMinPasswordLength();
  const isDev = environmentConfig.isDevelopment;

  let passwordRule = joi.string().trim();

  if (isDev) {
    passwordRule = passwordRule.min(1).required().messages({
      'string.min': 'Password must be at least 1 character',
      'any.required': 'Password is required',
    });
  } else {
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
        'string.empty': 'Setup token is required',
        'string.pattern.base': 'Setup token format is invalid',
        'any.required': 'Setup token is required',
      }),
    password: passwordRule,
    passwordConfirm: joi.string().valid(joi.ref('password')).required().messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Password confirmation is required',
    }),
  });
};

const setupPasswordValidatorSchema = getSetupPasswordValidatorSchema();

const setupPassword = async (req, res) => {
  try {
    // Validate input
    const { error, value } = setupPasswordValidatorSchema.validate(req.body);

    if (error) {
      return response(res, 400, false, error.details[0].message.replace(/"/g, ''));
    }

    const { token, password } = value;

    // Find user with valid setup token and non-expired token
    const users = await User.find({
      passwordResetExpires: { $gt: Date.now() },
      password: null, // User hasn't set password yet
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
      return response(res, 401, false, 'Invalid or expired setup link. Please request a new one.');
    }

    // Check if token has expired (double-check, shouldn't reach here if query is correct)
    if (user.passwordResetExpires < Date.now()) {
      return response(res, 401, false, 'Setup link has expired. Please request a new one.');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password, activate account, and clear setup token fields
    user.password = hashedPassword;
    user.isPasswordSet = true; // Mark password as set
    user.isActive = true; // Activate the employee account
    user.lifecycleStatus = 'active'; // Mark lifecycle as active
    user.passwordChangedAt = new Date();
    user.failedLoginAttempts = 0;
    user.loginLockUntil = null;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await user.save();

    return response(res, 200, true, 'Password set successfully. You can now login with your credentials.');
  } catch (err) {
    console.error('❌ Setup Password Error:', err.message);
    return response(res, 500, false, 'Failed to set password. Please try again.');
  }
};

export default setupPassword;

