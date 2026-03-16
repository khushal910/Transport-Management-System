import User from '../../models/user.schema.js';
import Company from '../../models/company.schema.js';
import response from '../../response/response.js';
import authValidatorSchema from '../../validations/auth.validator.js';
import bcrypt from 'bcryptjs';

const userRegister = async (req, res) => {
  try {
    // Validate request
    const { error, value } = authValidatorSchema.validate(req.body);

    if (error) {
      return response(res, 400, false, error.details[0].message.replace(/"/g, ""));
    }

    const { password, role, company: companyData } = value;

    const isUserExist = await User.findOne({ email: value.email });
    if (isUserExist) {
      return response(res, 400, false, "Email already exists");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // If user is a manager, create user and company for them
    if (role !== 'manager') {
      return response(res, 400, false, 'Only managers can register directly. Other users must be invited.');
    }

    if (!companyData) {
      return response(res, 400, false, 'Managers must provide company information during registration.');
    }

    const requiredCompanyFields = ['name', 'registrationNumber', 'address', 'phone', 'email'];
    const missingFields = requiredCompanyFields.filter(field => !companyData[field]);
    if (missingFields.length > 0) {
      return response(res, 400, false, `Missing company fields: ${missingFields.join(', ')}`);
    }
    const userData = {
      ...value,
      password: hashedPassword,
      company: null, // Will be set after company creation
    };

    // Create user first
    const userCreated = await User.create(userData);

    // Then create company with the data provided by the manager
    const company = await Company.create({
      name: companyData.name,
      registrationNumber: companyData.registrationNumber,
      address: companyData.address,
      phone: companyData.phone,
      email: companyData.email,
      createdBy: userCreated._id,
    });

    // Update user with company reference
    await User.findByIdAndUpdate(userCreated._id, { company: company._id });

    const companyId = company._id;

    return response(res, 201, true, 'User Register', {
      id: userCreated._id,
      name: userCreated.name,
      email: userCreated.email,
      role: userCreated.role,
      companyId: companyId,
    });
  } catch (err) {

    if (err.code === 11000) {
      return response(res, 400, false, "Email already exists");
    }

    console.error('User registration error:', err);
    return response(res, 500, false, 'Failed to register');
  }
};

export default userRegister;
