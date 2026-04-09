// @ts-nocheck
import response from '../../response/response';
import User from '../../models/user.schema';
import Driver from '../../models/driver.schema';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * Verify email change with OTP token
 * Endpoint: POST /api/auth/verify-email-change
 * Authentication: Required (JWT token)
 */
const verifyEmailChange = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return response(res, 401, false, 'Unauthorized: No token');
    }

    const { verificationToken } = req.body;

    // Validate verification token
    if (!verificationToken || typeof verificationToken !== 'string') {
      return response(res, 400, false, 'Verification code is required');
    }

    const userId = req.user?.id;
    if (!userId) {
      return response(res, 401, false, 'User not authenticated');
    }

    // Find user with pending email change
    const user = await User.findById(userId);
    if (!user) {
      return response(res, 404, false, 'User not found');
    }

    // Check if user has a pending email change
    if (!user.pendingNewEmail || !user.emailVerificationOTP || !user.emailVerificationExpires) {
      return response(res, 400, false, 'No pending email change request found. Please request verification first.');
    }

    // Check if token has expired
    if (new Date() > user.emailVerificationExpires) {
      // Clear expired token
      user.pendingNewEmail = null;
      user.emailVerificationToken = null;
      user.emailVerificationOTP = null;
      user.emailVerificationExpires = null;
      await user.save();

      return response(res, 400, false, 'Verification code has expired. Please request a new one.');
    }

    // Compare provided OTP with stored hashed OTP
    const isOTPValid = await bcrypt.compare(verificationToken, user.emailVerificationOTP);
    if (!isOTPValid) {
      return response(res, 400, false, 'Invalid verification code');
    }

    // Double-check the new email is not already taken (in case of race condition)
    const existingUser = await User.findOne({
      email: user.pendingNewEmail,
      _id: { $ne: userId },
    });

    if (existingUser) {
      return response(res, 409, false, 'Email already registered in the system');
    }

    // Update user email
    const oldEmail = user.email;
    user.email = user.pendingNewEmail;
    user.pendingNewEmail = null;
    user.emailVerificationToken = null;
    user.emailVerificationOTP = null;
    user.emailVerificationExpires = null;

    await user.save();

    // Populate company and driver info for response
    const updatedUser = await User.findById(userId).populate(
      'company',
      'name registrationNumber address phone email status _id'
    );

    let driverDetails = null;
    if (updatedUser.role === 'driver') {
      driverDetails = await Driver.findOne({ user: userId }, {
        licenseNumber: 1,
        licenseExpiry: 1,
        licenseCategory: 1,
        safetyScore: 1,
        status: 1,
        assignedTrips: 1,
        completedTrips: 1,
        completionRate: 1,
      });
    }

    return response(res, 200, true, `Email successfully verified and updated to ${updatedUser.email}`, {
      personal: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isPasswordSet: updatedUser.isPasswordSet,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
      company: updatedUser.company
        ? {
            id: updatedUser.company._id,
            name: updatedUser.company.name,
            registrationNumber: updatedUser.company.registrationNumber,
            address: updatedUser.company.address,
            phone: updatedUser.company.phone,
            email: updatedUser.company.email,
            status: updatedUser.company.status,
          }
        : null,
      ...(driverDetails && {
        driver: {
          licenseNumber: driverDetails.licenseNumber,
          licenseExpiry: driverDetails.licenseExpiry,
          licenseCategory: driverDetails.licenseCategory,
          safetyScore: driverDetails.safetyScore,
          status: driverDetails.status,
          assignedTrips: driverDetails.assignedTrips,
          completedTrips: driverDetails.completedTrips,
          completionRate: driverDetails.completionRate,
        },
      }),
    });
  } catch (err) {
    console.error('Verify Email Change Error:', err);
    return response(res, 500, false, 'Failed to verify email change');
  }
};

export default verifyEmailChange;
