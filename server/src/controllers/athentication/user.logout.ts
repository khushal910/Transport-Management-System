// @ts-nocheck
import response from '../../response/response';

const userLogout = (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
  } catch (error) {
    return response(res, 500, false, 'Error during logout');
  }
  return response(res, 200, true, 'User logged out successfully');
};

export default userLogout;

