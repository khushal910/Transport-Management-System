import response from '../../response/response.js';
import User from '../../models/user.schema.js';
import bcrypt from 'bcryptjs';
import joi from 'joi';

// Setup password validation schema
const setupPasswordValidatorSchema = joi.object({
  token: joi.string().trim().required().messages({
    'string.empty': 'Setup token is required',
    'any.required': 'Setup token is required',
  }),
  password: joi
    .string()
    .min(3)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/)
    .regex(/[!@#$%^&*]/)
    .trim()
    .required()
    .messages({
      'string.min': 'Password must be at least 3 characters long',
      'string.pattern.base':
        'Password must contain uppercase, lowercase, number, and special character',
      'any.required': 'Password is required',
    }),
  passwordConfirm: joi.string().valid(joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match',
    'any.required': 'Password confirmation is required',
  }),
});

const setupPassword = async (req, res) => {
  try {
    // Validate input
    const { error, value } = setupPasswordValidatorSchema.validate(req.body);

    if (error) {
      return response(res, 400, false, error.details[0].message.replace(/"/g, ''));
    }

    const { token, password, passwordConfirm } = value;

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
      return response(res, 401, false, 'Invalid or expired setup link');
    }

    // Check if token has expired
    if (user.passwordResetExpires < Date.now()) {
      return response(res, 401, false, 'Setup link has expired');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and clear setup token fields
    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await user.save();

    return response(res, 200, true, 'Password set successfully. You can now login with your credentials.');
  } catch (err) {
    console.error('Setup Password Error:', err);
    return response(res, 500, false, 'Failed to set password');
  }
};

export default setupPassword;
