// @ts-nocheck
import User from '../../models/user.schema';
import Driver from '../../models/driver.schema';
import response from '../../response/response';
import addEmployeeValidatorSchema from '../../validations/add.employee.validator';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { sendEmployeeSetupEmail } from '../../utils/email.service';
import environmentConfig from '../../config/environment';

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

    // In development mode: set default password and mark as active
    let userData;
    if (environmentConfig.isDevelopment) {
      const defaultPassword = environmentConfig.getDefaultPassword();
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(defaultPassword, salt);

      userData = {
        name,
        email,
        password: hashedPassword, // Set default password
        isPasswordSet: true, // Mark password as set
        isActive: true, // Automatically activate in dev mode
        role,
        company: managerCompanyId,
        isDeleted: false,
      };
    } else {
      // Production mode: require email setup
      const setupToken = crypto.randomBytes(32).toString('hex');
      const hashedSetupToken = await bcrypt.hash(setupToken, 10);
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      userData = {
        name,
        email,
        password: null, // No password until employee sets it
        isPasswordSet: false, // Employee hasn't set password yet
        isActive: false, // Requires email activation
        role,
        company: managerCompanyId,
        isDeleted: false,
        passwordResetToken: hashedSetupToken, // Reuse field for setup token
        passwordResetExpires: tokenExpiry,
      };
    }

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

    // Send email based on environment
    let emailResult = { success: true };
    if (environmentConfig.isDevelopment) {
      // In dev mode: just log it, don't require email
      console.info(`✅ [DEV MODE] Employee created with default password: ${environmentConfig.getDefaultPassword()}`);
    } else {
      // In production: send password setup email
      const setupToken = crypto.randomBytes(32).toString('hex');
      emailResult = await sendEmployeeSetupEmail(email, name, setupToken);
      if (!emailResult.success) {
        console.warn('Failed to send employee setup email:', emailResult.error);
      }
    }

    return response(res, 201, true, 'Employee added successfully.', {
      id: newEmployee._id,
      name: newEmployee.name,
      email: newEmployee.email,
      role: newEmployee.role,
      isActive: newEmployee.isActive,
      companyId: newEmployee.company,
      message: environmentConfig.isDevelopment 
        ? `✅ Dev Mode: Employee is active with default password "${environmentConfig.getDefaultPassword()}"`
        : 'Setup link sent to email.',
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
    console.error('Add employee error details:', err);
    return response(res, 500, false, 'Failed to add employee');
    
    return response(res, 500, false, 'Failed to add employee');
  }
};

export default addEmployee;

