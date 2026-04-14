// @ts-nocheck
import response from '../../response/response';
import User from '../../models/user.schema';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import joi from 'joi';
import { sendPasswordResetOTP } from '../../utils/email.service';

/**
 * Request password reset OTP via email
 * Endpoint: POST /api/auth/request-password-reset-otp
 * Authentication: Not required (public endpoint)
 */
const emailValidatorSchema = joi.object({
  email: joi.string().email().trim().required(),
});

const requestPasswordResetOTP = async (req, res) => {
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
      return response(res, 200, true, 'If email exists in system, password reset code will be sent to your inbox');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash the OTP for storage
    const hashedOTP = await bcrypt.hash(otp, 10);

    // Set OTP expiration (15 minutes)
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

    // Generate reference token for tracking (not sent to user)
    const resetToken = crypto.randomBytes(16).toString('hex');

    // Update user with OTP and expiry
    user.passwordResetToken = hashedOTP;
    user.passwordResetExpires = otpExpiry;
    user.passwordResetReference = resetToken; // Store reference for tracking

    await user.save();

    // Send password reset OTP email
    const emailResult = await sendPasswordResetOTP(email, otp);

    if (!emailResult.success) {
      // Revert OTP storage if email fails
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      user.passwordResetReference = null;
      await user.save();

      return response(res, 500, false, 'Failed to send reset code. Please try again later.');
    }

    return response(res, 200, true, 'Password reset code has been sent to your email. Please check your inbox and spam folder.');
  } catch (err) {
    console.error('Request Password Reset OTP Error:', err);
    return response(res, 500, false, 'Failed to process password reset request');
  }
};

export default requestPasswordResetOTP;
