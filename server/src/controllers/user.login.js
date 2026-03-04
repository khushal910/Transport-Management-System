import response from '../response/response.js';
import loginValidatorSchema from '../validations/login.validator.js';
import User from '../models/user.schema.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userLogin = async (req, res) => {
  try {
    // Validate login data
    const { error, value } = loginValidatorSchema.validate(req.body);

    if (error) {
      return response(res, 400, false, error.details[0].message.replace(/"/g, ""));
    }

    const { email, password } = value;

    const user = await User.findOne({ email });

    if (!user) {
      return response(res, 401, false, 'Invalid Email or Password ');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return response(res, 401, false, 'Invalid Email or Password ');
    }

    // create jwt
    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.SECRET_KEY, {
      expiresIn: '1h',
    });

    return res
      .cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 3600000,
      })
      .status(200)
      .json({
        success: true,
        message: 'User Login successfully',
        data: {
          id: user._id,
          name: user.name,
          role: user.role,
        },
      });
  } catch (err) {
    console.error('Login Error:', err);
    return response(res, 500, false, 'Failed to Login');
  }
};

export default userLogin;
