// @ts-nocheck
import response from '../../response/response';
import User from '../../models/user.schema';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import joi from 'joi';
import { sendPasswordResetEmail } from '../../utils/email.service';
import runtimeConfig from '../../config/runtime';

// Email validation schema
const emailValidatorSchema = joi.object({
  email: joi.string().email().trim().required(),
});

const userForgotPassword = async (req, res) => {
  try {
    // Validate email
    const { error, value } = emailValidatorSchema.validate(req.body);

    if (error) {
      return response(res, 400, false, error.details[0].message.replace(/"/g, ''));
    }

    const { email } = value;

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      // Return generic message for security (don't reveal if email exists)
      return response(res, 200, true, 'If email exists in system, reset link will be sent');
    }

    if (user.isDeleted || user.isActive === false || !user.password) {
      return response(res, 200, true, 'If email exists in system, reset link will be sent');
    }

    // Generate reset token (64 character random string)
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash the token for storage
    const hashedToken = await bcrypt.hash(resetToken, 10);

    // Set token expiration based on runtime configuration
    const tokenExpiry = new Date(Date.now() + runtimeConfig.passwordResetExpiryHours * 60 * 60 * 1000);

    // Update user with reset token and expiry
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = tokenExpiry;

    await user.save();

    // Send reset email
    const emailResult = await sendPasswordResetEmail(email, resetToken);

    if (!emailResult.success) {
      // Revert token storage if email fails
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await user.save();

      return response(res, 500, false, 'Failed to send reset email. Please try again later.');
    }

    return response(res, 200, true, 'Password reset link sent to your email. Please check your inbox.');
  } catch (err) {
    console.error('Forgot Password Error:', err);
    return response(res, 500, false, 'Failed to process password reset request');
  }
};

export default userForgotPassword;

