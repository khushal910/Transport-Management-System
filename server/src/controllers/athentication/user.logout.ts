// @ts-nocheck
import response from '../../response/response';
import { userLoggedOut } from '../../services/gpsSimulator';
import { buildAuthCookieOptions } from '../../config/cookieOptions';

const userLogout = (req, res) => {
  try {
    res.clearCookie('token', buildAuthCookieOptions());
  } catch (error) {
    return response(res, 500, false, 'Error during logout');
  }

  userLoggedOut();
  return response(res, 200, true, 'User logged out successfully');
};

export default userLogout;

