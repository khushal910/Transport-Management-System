// @ts-nocheck
import response from '../../response/response';
import User from '../../models/user.schema';
import Company from '../../models/company.schema';
import jwt from 'jsonwebtoken';
import updateCompanyValidatorSchema from '../../validations/update.company.validator';

/**
 * Update authenticated manager's company details
 * Endpoint: PUT /api/auth/company
 * Authentication: Required (JWT token from cookie)
 * Authorization: Manager role only
 */
const updateCompany = async (req, res) => {
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

    // Verify user is a manager
    const user = await User.findById(userId);
    if (!user) {
      return response(res, 404, false, 'User not found');
    }

    if (user.role !== 'manager') {
      return response(res, 403, false, 'Only managers can update company information');
    }

    // Verify user has a company
    if (!user.company) {
      return response(res, 403, false, 'User does not have an associated company');
    }

    // Validate request body
    const { error, value } = updateCompanyValidatorSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return response(res, 400, false, error.details[0].message.replace(/"/g, ''));
    }

    const updateFields = {};
    if (value.name) updateFields.name = value.name;
    if (value.address) updateFields.address = value.address;
    if (value.phone) updateFields.phone = value.phone;
    if (value.email) {
      const trimmedEmail = value.email.toLowerCase();
      // Check if email is already used by another company
      const existingCompany = await Company.findOne({
        email: trimmedEmail,
        _id: { $ne: user.company._id },
      });

      if (existingCompany) {
        return response(res, 409, false, 'Email already in use by another company');
      }

      updateFields.email = trimmedEmail;
    }

    if (!Object.keys(updateFields).length) {
      return response(res, 400, false, 'No valid fields provided for update');
    }

    // Update company details
    const updatedCompany = await Company.findByIdAndUpdate(
      user.company._id,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedCompany) {
      return response(res, 404, false, 'Company not found');
    }

    // Fetch updated user profile with company details
    const updatedUser = await User.findById(userId).populate(
      'company',
      'name registrationNumber address phone email status _id'
    );

    return response(res, 200, true, 'Company information updated successfully', {
      company: {
        id: updatedCompany._id,
        name: updatedCompany.name,
        registrationNumber: updatedCompany.registrationNumber,
        address: updatedCompany.address,
        phone: updatedCompany.phone,
        email: updatedCompany.email,
        status: updatedCompany.status,
      }
    });
  } catch (err) {
    console.error('Update Company Error:', err);
    return response(res, 500, false, 'Failed to update company information');
  }
};

export default updateCompany;
