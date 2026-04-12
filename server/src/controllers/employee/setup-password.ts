// @ts-nocheck
import response from '../../response/response';
import User from '../../models/user.schema';
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

    console.log('🔐 Setup Password Request - Token received (length:', token.length, ')');

    // Find user with valid setup token and non-expired token
    const users = await User.find({
      passwordResetExpires: { $gt: Date.now() },
      password: null, // User hasn't set password yet
    });

    console.log(`📋 Found ${users.length} users with pending password setup`);

    let user = null;

    // Compare plain token with stored hashed tokens
    for (const u of users) {
      if (u.passwordResetToken) {
        const tokenMatch = await bcrypt.compare(token, u.passwordResetToken);
        if (tokenMatch) {
          user = u;
          console.log('✅ Token matched for user:', u.email);
          break;
        }
      }
    }

    if (!user) {
      console.log('❌ Token not found or no match. Attempting to check token validity...');
      
      // Additional check: Find if there are ANY tokens (even expired ones) for debugging
      const allUsers = await User.find({ passwordResetToken: { $exists: true, $ne: null } });
      console.log(`📊 Total users with tokens in system: ${allUsers.length}`);
      
      return response(res, 401, false, 'Invalid or expired setup link. Please request a new one.');
    }

    // Check if token has expired (double-check, shouldn't reach here if query is correct)
    if (user.passwordResetExpires < Date.now()) {
      console.log('⏰ Token has expired for user:', user.email);
      return response(res, 401, false, 'Setup link has expired. Please request a new one.');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password, activate account, and clear setup token fields
    user.password = hashedPassword;
    user.isPasswordSet = true; // Mark password as set
    user.isActive = true; // Activate the employee account
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await user.save();

    console.log('✅ Password set and account activated for user:', user.email);
    return response(res, 200, true, 'Password set successfully. You can now login with your credentials.');
  } catch (err) {
    console.error('❌ Setup Password Error:', err.message);
    return response(res, 500, false, 'Failed to set password. Please try again.');
  }
};

export default setupPassword;

