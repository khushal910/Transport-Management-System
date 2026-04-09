// @ts-nocheck
import response from '../../response/response';
import User from '../../models/user.schema';
import Driver from '../../models/driver.schema';
import jwt from 'jsonwebtoken';

/**
 * Get user profile with personal and company details
 * Endpoint: GET /api/auth/profile
 * Authentication: Required (JWT token from cookie)
 */
const getProfile = async (req, res) => {
  try {
    // Extract token from cookie
    const token = req.cookies.token;

    if (!token) {
      return response(res, 401, false, 'No token provided');
    }

    // Verify and decode JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
      console.error('Token verification failed:', err);
      return response(res, 401, false, 'Invalid or expired token');
    }

    const userId = decoded.id;

    // Fetch user with populated company data
    const user = await User.findById(userId).populate(
      'company',
      'name registrationNumber address phone email status _id'
    );

    if (!user) {
      return response(res, 401, false, 'Your account no longer exists. Please return to the landing page.');
    }

    // If user is a driver, fetch additional driver details
    let driverDetails = null;
    if (user.role === 'driver') {
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

    // Build profile response
    const profileData = {
      // Personal Details
      personal: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isPasswordSet: user.isPasswordSet,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },

      // Company Details
      company: user.company
        ? {
            id: user.company._id,
            name: user.company.name,
            registrationNumber: user.company.registrationNumber,
            address: user.company.address,
            phone: user.company.phone,
            email: user.company.email,
            status: user.company.status,
          }
        : null,

      // Driver-specific details (if applicable)
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
    };

    return response(res, 200, true, 'Profile retrieved successfully', profileData);
  } catch (err) {
    console.error('Get Profile Error:', err);
    return response(res, 500, false, 'Failed to retrieve profile');
  }
};

export default getProfile;
