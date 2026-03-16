import jwt from 'jsonwebtoken';
import response from '../response/response.js';

const requiredRole = (...allowedRole) => {
  return (req, res, next) => {
    try {
      const token = req.cookies.token;

      if (!token) {
        return response(res, 401, false, 'Unauthorized: No token');
      }

      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      const role = decoded.role;
      const companyId = decoded.companyId;

      if (!allowedRole.includes(role)) {
        return response(res, 403, false, 'Forbidden: Access denied');
      }

      req.user = {
        id: decoded.id,
        role: decoded.role,
        companyId: companyId,
      };

      next();
    } catch (err) {
      return response(res, 401, false, 'Invalid or expired token');
    }
  };
};

export default requiredRole;
