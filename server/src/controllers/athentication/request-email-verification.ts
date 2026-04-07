// @ts-nocheck
import response from '../../response/response';
import User from '../../models/user.schema';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendEmailVerificationOTP } from '../../utils/email.service';

/**
 * Request email verification OTP for changing email
 * Endpoint: POST /api/auth/request-email-verification
 * Authentication: Required (JWT token)
 */
const requestEmailVerification = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return response(res, 401, false, 'Unauthorized: No token');
    }

    const { newEmail } = req.body;

    // Validate new email format
    if (!newEmail || typeof newEmail !== 'string') {
      return response(res, 400, false, 'New email is required');
    }

    const trimmedEmail = newEmail.toLowerCase().trim();

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return response(res, 400, false, 'Invalid email format');
    }

    const userId = req.user?.id;
    if (!userId) {
      return response(res, 401, false, 'User not authenticated');
    }

    // Find current user
    const user = await User.findById(userId);
    if (!user) {
      return response(res, 404, false, 'User not found');
    }

    // Check if new email is the same as current email
    if (user.email === trimmedEmail) {
      return response(res, 400, false, 'New email must be different from current email');
    }

    // Check if new email already exists in the system
    const existingUser = await User.findOne({
      email: trimmedEmail,
      _id: { $ne: userId },
    });

    if (existingUser) {
      return response(res, 409, false, 'Email already registered in the system');
    }

    // Generate verification token (64 character random string)
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Hash the token for storage
    const hashedToken = await bcrypt.hash(verificationToken, 10);

    // Set token expiration (30 minutes for email verification)
    const tokenExpiry = new Date(Date.now() + 30 * 60 * 1000);

    // Store pending email and verification token
    user.pendingNewEmail = trimmedEmail;
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpires = tokenExpiry;

    await user.save();

    // Send verification email with OTP
    const emailResult = await sendEmailVerificationOTP(trimmedEmail, verificationToken, user.name);

    if (!emailResult.success) {
      // Revert token storage if email fails
      user.pendingNewEmail = null;
      user.emailVerificationToken = null;
      user.emailVerificationExpires = null;
      await user.save();

      return response(res, 500, false, 'Failed to send verification email. Please try again later.');
    }

    return response(res, 200, true, 'Verification code sent to your new email address. Please check your inbox.');
  } catch (err) {
    console.error('Request Email Verification Error:', err);
    return response(res, 500, false, 'Failed to process request');
  }
};

export default requestEmailVerification;
