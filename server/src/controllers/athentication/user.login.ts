// @ts-nocheck
import response from '../../response/response';
import loginValidatorSchema from '../../validations/login.validator';
import User from '../../models/user.schema';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userLoggedIn } from '../../services/gpsSimulator';
import runtimeConfig from '../../config/runtime';
import { buildAuthCookieOptions } from '../../config/cookieOptions';
import { sendEmployeeFirstLoginSecurityEmail } from '../../utils/email.service';

const userLogin = async (req, res) => {
  try {
    // Validate login data
    const { error, value } = loginValidatorSchema.validate(req.body);

    if (error) {
      return response(res, 400, false, error.details[0].message.replace(/"/g, ""));
    }

    const { email, password } = value;

    const user = await User.findOne({ email }).populate('company', 'name registrationNumber address phone email _id');

    if (!user || user.isDeleted) {
      return response(res, 401, false, 'Invalid Email or Password ');
    }

    if (!user.password) {
      return response(
        res,
        403,
        false,
        'Account setup is incomplete. Please set your password using the setup link sent to your email.'
      );
    }

    if (user.isActive === false) {
      return response(res, 403, false, 'Your account is inactive. Please contact your manager.');
    }

    if (user.loginLockUntil && user.loginLockUntil.getTime() > Date.now()) {
      const minutesRemaining = Math.max(
        1,
        Math.ceil((user.loginLockUntil.getTime() - Date.now()) / (60 * 1000)),
      );
      return response(
        res,
        423,
        false,
        `Account is temporarily locked due to multiple failed login attempts. Try again in ${minutesRemaining} minute(s).`,
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      const nextFailedAttempts = (user.failedLoginAttempts ?? 0) + 1;

      if (nextFailedAttempts >= runtimeConfig.maxFailedLoginAttempts) {
        user.failedLoginAttempts = 0;
        user.loginLockUntil = new Date(Date.now() + runtimeConfig.loginLockMinutes * 60 * 1000);
      } else {
        user.failedLoginAttempts = nextFailedAttempts;
        user.loginLockUntil = null;
      }

      await user.save();
      return response(res, 401, false, 'Invalid Email or Password ');
    }

    if (user.isPasswordSet === false) {
      user.isPasswordSet = true;
    }

    // If user doesn't have a company (shouldn't happen if company is required), return error
    if (!user.company) {
      return response(res, 400, false, 'User company not found');
    }

    const loginTimestamp = new Date();
    const isFirstEmployeeLogin = user.role !== 'manager' && !user.firstLoginEmailSentAt;

    user.failedLoginAttempts = 0;
    user.loginLockUntil = null;
    user.lastLoginAt = loginTimestamp;

    if (isFirstEmployeeLogin) {
      const firstLoginEmailResult = await sendEmployeeFirstLoginSecurityEmail(user.email, user.name, {
        loginAt: loginTimestamp,
        ipAddress: req.ip || req.socket?.remoteAddress,
        userAgent: typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined,
      });

      if (firstLoginEmailResult.success) {
        user.firstLoginEmailSentAt = loginTimestamp;
      } else {
        console.warn('Failed to send first login security email:', firstLoginEmailResult.error);
      }
    }

    await user.save();

    const configuredSessionHours = Number(runtimeConfig.sessionDurationHours ?? 12);
    const sessionHours = Number.isFinite(configuredSessionHours) && configuredSessionHours > 0
      ? configuredSessionHours
      : 12;
    const sessionSeconds = Math.floor(sessionHours * 60 * 60);
    const secretKey = runtimeConfig.secretKey;

    if (!secretKey) {
      return response(res, 500, false, 'Server configuration error');
    }

    // create jwt with company ID
    const payload = { id: user._id, role: user.role, companyId: user.company._id };
    const token = jwt.sign(payload, secretKey, {
      expiresIn: sessionSeconds,
    });

    userLoggedIn();

    return res
      .cookie('token', token, buildAuthCookieOptions(sessionSeconds * 1000))
      .status(200)
      .json({
        success: true,
        message: 'User Login successfully',
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyId: user.company._id,
          company: user.company,
        },
      });
  } catch (err) {
    console.error('Login Error:', err);
    return response(res, 500, false, 'Failed to Login');
  }
};

export default userLogin;

