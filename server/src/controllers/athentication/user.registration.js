import User from '../../models/user.schema.js';
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

    const { password } = value;

    const isUserExist = await User.findOne({ email: value.email });
    if (isUserExist) {
      return response(res, 400, false, "Email already exists");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userData = {
      ...value,
      password: hashedPassword,
    };

    // Create user
    const userCreated = await User.create(userData);

    return response(res, 201, true, 'User Register', {
      id: userCreated._id,
      name: userCreated.name,
      email: userCreated.email,
      role: userCreated.role,
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
