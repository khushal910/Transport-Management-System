// @ts-nocheck
import User from '../../models/user.schema';
import Driver from '../../models/driver.schema';
import response from '../../response/response';
import addEmployeeValidatorSchema from '../../validations/add.employee.validator';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { sendEmployeeSetupEmail } from '../../utils/email.service';
import environmentConfig from '../../config/environment';

const isProduction = process.env.NODE_ENV === 'production';
const debugLog = (...args: any[]) => {
  if (!isProduction) {
    // Debug logging disabled in production
  }
};

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
        debugLog('[AddEmployee] Recovering deleted employee:', email);
        
        const hasEmailCredentials = !!(
          process.env.EMAIL_USER &&
          process.env.EMAIL_PASSWORD &&
          process.env.CLIENT_URL
        );

        // Generate setup token once for recovery if email should be sent
        let plainRecoveryToken = '';
        let recoveryData;

        if (environmentConfig.isDevelopment && !hasEmailCredentials) {
          const defaultPassword = environmentConfig.getDefaultPassword();
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(defaultPassword, salt);

          recoveryData = {
            name,
            role,
            password: hashedPassword,
            isPasswordSet: true,
            isActive: true,
            passwordChangedAt: new Date(),
            isDeleted: false,
          };
        } else {
          // Send password setup email when email is configured or in production
          plainRecoveryToken = crypto.randomBytes(32).toString('hex');
          const hashedSetupToken = await bcrypt.hash(plainRecoveryToken, 10);
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

        let emailResult = { success: true };
        if (hasEmailCredentials) {
          debugLog('[AddEmployee Recovery] Sending recovery setup email to:', email);
          debugLog('[AddEmployee Recovery] Recovery token generated:', !!plainRecoveryToken);
          emailResult = await sendEmployeeSetupEmail(email, name, plainRecoveryToken);
          debugLog('[AddEmployee Recovery] Email result:', emailResult);
          if (!emailResult.success) {
            console.warn('❌ Failed to send employee recovery email:', emailResult.error);
            return response(res, 500, false, 'Employee recovered but failed to send setup email. Check email configuration.');
          }
          console.info('✅ Recovery email sent successfully');
        } else if (environmentConfig.isDevelopment) {
          console.info(`✅ [DEV MODE] Employee recovered with default password: ${environmentConfig.getDefaultPassword()}`);
        } else {
          console.warn('❌ Email credentials are missing in production mode. Recovery setup email cannot be sent.');
          return response(res, 500, false, 'Email configuration is missing. Cannot send recovery setup email.');
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

    const hasEmailCredentials = !!(
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASSWORD &&
      process.env.CLIENT_URL
    );

    let plainSetupToken = '';
    let userData;

    if (environmentConfig.isDevelopment && !hasEmailCredentials) {
      const defaultPassword = environmentConfig.getDefaultPassword();
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(defaultPassword, salt);

      userData = {
        name,
        email,
        password: hashedPassword,
        isPasswordSet: true,
        isActive: true,
        passwordChangedAt: new Date(),
        role,
        company: managerCompanyId,
        isDeleted: false,
      };
    } else {
      // When email is configured or in production, use the password setup flow
      plainSetupToken = crypto.randomBytes(32).toString('hex');
      const hashedSetupToken = await bcrypt.hash(plainSetupToken, 10);
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      userData = {
        name,
        email,
        password: null,
        isPasswordSet: false,
        isActive: false,
        role,
        company: managerCompanyId,
        isDeleted: false,
        passwordResetToken: hashedSetupToken,
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

    // Send email when SMTP configuration is available
    let emailResult = { success: true };
    debugLog('[AddEmployee] Environment:', environmentConfig.environment);
    debugLog('[AddEmployee] hasEmailCredentials:', hasEmailCredentials);

    if (hasEmailCredentials) {
      debugLog('[AddEmployee] Sending setup email to:', email);
      debugLog('[AddEmployee] Employee name:', name);
      debugLog('[AddEmployee] Setup token generated:', !!plainSetupToken);

      emailResult = await sendEmployeeSetupEmail(email, name, plainSetupToken);
      debugLog('[AddEmployee] Email result:', emailResult);

      if (!emailResult.success) {
        console.warn('❌ Failed to send employee setup email:', emailResult.error);
        return response(res, 500, false, 'Employee created but failed to send setup email. Please check email configuration.');
      }

      console.info('✅ Setup email sent successfully');
    } else if (environmentConfig.isDevelopment) {
      console.info(`✅ [DEV MODE] Employee created with default password: ${environmentConfig.getDefaultPassword()}`);
    } else {
      console.warn('❌ Email credentials are missing in production mode. Password setup email cannot be sent.');
      return response(res, 500, false, 'Email configuration is missing. Cannot send setup email.');
    }

    return response(res, 201, true, 'Employee added successfully.', {
      id: newEmployee._id,
      name: newEmployee.name,
      email: newEmployee.email,
      role: newEmployee.role,
      isActive: newEmployee.isActive,
      companyId: newEmployee.company,
      message: hasEmailCredentials
        ? 'Setup link sent to email.'
        : `✅ Dev Mode: Employee is active with default password "${environmentConfig.getDefaultPassword()}"`,
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

