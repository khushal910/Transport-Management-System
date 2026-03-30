import User from '../../models/user.schema.js';
import Driver from '../../models/driver.schema.js';
import response from '../../response/response.js';
import addEmployeeValidatorSchema from '../../validations/add.employee.validator.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { sendEmployeeSetupEmail } from '../../utils/email.service.js';

const addEmployee = async (req, res) => {
  try {
    const { error, value } = addEmployeeValidatorSchema.validate(req.body);

    if (error) {
      return response(res, 400, false, error.details[0].message.replace(/"/g, ""));
    }

    const { name, email, role, licenseNumber, licenseExpiry, licenseCategory } = value;
    const managerCompanyId = req.user.companyId;

    // Check if user already exists
    const isUserExist = await User.findOne({ email });
    if (isUserExist) {
      return response(res, 400, false, 'Email already exists');
    }

    // Check if license number already exists (only for drivers)
    if (role === 'driver') {
      const isLicenseExist = await Driver.findOne({ licenseNumber });
      if (isLicenseExist) {
        return response(res, 400, false, 'License number already exists');
      }
    }

    // Generate password setup token (64 character random string)
    const setupToken = crypto.randomBytes(32).toString('hex');
    const hashedSetupToken = await bcrypt.hash(setupToken, 10);
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const userData = {
      name,
      email,
      password: null, // No password until employee sets it
      isPasswordSet: false, // Employee hasn't set password yet
      role,
      company: managerCompanyId,
      passwordResetToken: hashedSetupToken, // Reuse field for setup token
      passwordResetExpires: tokenExpiry,
    };

    // Create user
    const newEmployee = await User.create(userData);

    // If role is driver, create driver record with license info
    let driverRecord = null;
    if (role === 'driver') {
      driverRecord = await Driver.create({
        user: newEmployee._id,
        licenseNumber,
        licenseExpiry: new Date(licenseExpiry),
        licenseCategory,
        status: 'off_duty', // Default status for new drivers
      });
    }

    // Send password setup email
    const emailResult = await sendEmployeeSetupEmail(email, name, setupToken);
    if (!emailResult.success) {
      console.warn('Failed to send employee setup email:', emailResult.error);
    }

    return response(res, 201, true, 'Employee added successfully. Setup link sent to email.', {
      id: newEmployee._id,
      name: newEmployee.name,
      email: newEmployee.email,
      role: newEmployee.role,
      companyId: newEmployee.company,
      ...(role === 'driver' && {
        driver: {
          driverId: driverRecord._id,
          licenseNumber: driverRecord.licenseNumber,
          licenseCategory: driverRecord.licenseCategory,
          licenseExpiry: driverRecord.licenseExpiry,
          status: driverRecord.status,
        },
      }),
    });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const message = field === 'email' ? 'Email already exists' : `${field} already exists`;
      return response(res, 400, false, message);
    }

    console.error('Add employee error:', err.message);
    
    return response(res, 500, false, 'Failed to add employee');
  }
};

export default addEmployee;
