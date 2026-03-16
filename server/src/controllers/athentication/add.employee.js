import User from '../../models/user.schema.js';
import response from '../../response/response.js';
import addEmployeeValidatorSchema from '../../validations/add.employee.validator.js';
import bcrypt from 'bcryptjs';

const addEmployee = async (req, res) => {
  try {
    const { error, value } = addEmployeeValidatorSchema.validate(req.body);

    if (error) {
      return response(res, 400, false, error.details[0].message.replace(/"/g, ""));
    }

    const { name, email, password, role } = value;
    const managerCompanyId = req.user.companyId;

    // Check if user already exists
    const isUserExist = await User.findOne({ email });
    if (isUserExist) {
      return response(res, 400, false, 'Email already exists');
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

    return response(res, 201, true, 'Employee added successfully', {
      id: newEmployee._id,
      name: newEmployee.name,
      email: newEmployee.email,
      role: newEmployee.role,
      companyId: newEmployee.company,
    });
  } catch (err) {
    if (err.code === 11000) {
      return response(res, 400, false, 'Email already exists');
    }

    console.error('Add employee error:', err);
    return response(res, 500, false, 'Failed to add employee');
  }
};

export default addEmployee;
