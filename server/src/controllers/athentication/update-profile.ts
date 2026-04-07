// @ts-nocheck
import response from '../../response/response';
import User from '../../models/user.schema';
import Driver from '../../models/driver.schema';
import jwt from 'jsonwebtoken';
import updateProfileValidatorSchema from '../../validations/update.profile.validator';

/**
 * Update authenticated user's personal profile details
 * Endpoint: PUT /api/auth/profile
 * Authentication: Required (JWT token from cookie)
 */
const updateProfile = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return response(res, 401, false, 'Unauthorized: No token');
    }

    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) {
      return response(res, 500, false, 'Server configuration error');
    }

    let decoded;
    try {
      decoded = jwt.verify(token, secretKey);
    } catch (err) {
      console.error('Token verification failed:', err);
      return response(res, 401, false, 'Invalid or expired token');
    }

    const userId = decoded.id;

    const { error, value } = updateProfileValidatorSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return response(res, 400, false, error.details[0].message.replace(/"/g, ''));
    }

    const updateFields = {};
    if (value.name) updateFields.name = value.name;
    if (value.email) updateFields.email = value.email.toLowerCase();

    if (!Object.keys(updateFields).length) {
      return response(res, 400, false, 'No valid fields provided for update');
    }

    if (updateFields.email) {
      const existingUser = await User.findOne({
        email: updateFields.email,
        _id: { $ne: userId },
      });

      if (existingUser) {
        return response(res, 409, false, 'Email already in use');
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    ).populate('company', 'name registrationNumber address phone email status _id');

    if (!updatedUser) {
      return response(res, 404, false, 'User not found');
    }

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

    return response(res, 200, true, 'Profile updated successfully', {
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
    console.error('Update Profile Error:', err);
    return response(res, 500, false, 'Failed to update profile');
  }
};

export default updateProfile;
