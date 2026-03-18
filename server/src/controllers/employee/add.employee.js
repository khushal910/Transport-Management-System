import User from '../../models/user.schema.js';
import Driver from '../../models/driver.schema.js';
import response from '../../response/response.js';
import addEmployeeValidatorSchema from '../../validations/add.employee.validator.js';
import bcrypt from 'bcryptjs';

const addEmployee = async (req, res) => {
  try {
    const { error, value } = addEmployeeValidatorSchema.validate(req.body);

    if (error) {
      return response(res, 400, false, error.details[0].message.replace(/"/g, ""));
    }

    const { name, email, password, role, licenseNumber, licenseExpiry, licenseCategory } = value;
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

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
      role,
      company: managerCompanyId,
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

    return response(res, 201, true, 'Employee added successfully', {
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
