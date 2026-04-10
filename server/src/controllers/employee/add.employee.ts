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

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      // If user is active: reject (duplicate email)
      if (!existingUser.isDeleted) {
        return response(res, 400, false, 'Email already exists');
      }

      // If user is deleted AND belongs to the same company: RECOVER them
      if (existingUser.isDeleted && String(existingUser.company) === String(managerCompanyId)) {
        console.log('[AddEmployee] Recovering deleted employee:', email);
        
        // Update user data (recovery)
        let recoveryData;
        if (environmentConfig.isDevelopment) {
          const defaultPassword = environmentConfig.getDefaultPassword();
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(defaultPassword, salt);

          recoveryData = {
            name,
            role,
            password: hashedPassword,
            isPasswordSet: true,
            isActive: true,
            isDeleted: false,
          };
        } else {
          const setupToken = crypto.randomBytes(32).toString('hex');
          const hashedSetupToken = await bcrypt.hash(setupToken, 10);
          const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

          recoveryData = {
            name,
            role,
            password: null,
            isPasswordSet: false,
            isActive: false,
            isDeleted: false,
            passwordResetToken: hashedSetupToken,
            passwordResetExpires: tokenExpiry,
          };
        }

        const recoveredEmployee = await User.findByIdAndUpdate(
          existingUser._id,
          recoveryData,
          { new: true }
        );

        // If role changed to driver or was driver before, ensure driver record exists
        if (role === 'driver' && licenseNumber) {
          // Check if driver record exists
          let driverRecord = await Driver.findOne({ user: recoveredEmployee._id });
          
          if (!driverRecord) {
            // Create driver record if it doesn't exist
            driverRecord = await Driver.create({
              user: recoveredEmployee._id,
              licenseNumber,
              licenseExpiry: new Date(licenseExpiry),
              licenseCategory,
              status: 'off_duty',
            });
          } else {
            // Update existing driver record
            await Driver.findByIdAndUpdate(driverRecord._id, {
              licenseNumber,
              licenseExpiry: new Date(licenseExpiry),
              licenseCategory,
            });
          }
        }

        // Send email based on environment
        let emailResult = { success: true };
        if (environmentConfig.isDevelopment) {
          console.info(`✅ [DEV MODE] Employee recovered with default password: ${environmentConfig.getDefaultPassword()}`);
        } else {
          const setupToken = crypto.randomBytes(32).toString('hex');
          emailResult = await sendEmployeeSetupEmail(email, name, setupToken);
          if (!emailResult.success) {
            console.warn('Failed to send employee recovery email:', emailResult.error);
          }
        }

        return response(res, 200, true, 'Employee recovered successfully', {
          id: recoveredEmployee._id,
          name: recoveredEmployee.name,
          email: recoveredEmployee.email,
          role: recoveredEmployee.role,
          isActive: recoveredEmployee.isActive,
          companyId: recoveredEmployee.company,
          message: 'Employee account recovered from deletion',
        });
      }

      // If user is deleted but belongs to different company: reject
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
  }
};

export default addEmployee;

