import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import response from '../response/response';
import User from '../models/user.schema';

// Extend Express Request to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        userId?: string;
        role: string;
        companyId: string;
      };
    }
  }
}

interface DecodedToken {
  id: string;
  role: string;
  companyId: string;
}

/**
 * Role-based access control middleware
 * Verifies JWT token and checks if user has required role
 * 
 * @param allowedRoles - Roles permitted to access the endpoint
 * @returns Middleware function
 */
const requiredRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): any => {
    try {
      const token = req.cookies.token;

      if (!token) {
        return response(res, 401, false, 'Unauthorized: No token');
      }

      const secretKey = process.env.SECRET_KEY;
      if (!secretKey) {
        return response(res, 500, false, 'Server configuration error');
      }

      const decoded = jwt.verify(token, secretKey) as DecodedToken;
      const role = decoded.role;
      const companyId = decoded.companyId;

      // Verify the user still exists and has not been deleted
      const user = await User.findById(decoded.id).select('_id role company');
      if (!user) {
        res.clearCookie('token', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Strict',
          path: '/',
        });
        return response(res, 401, false, 'Your account no longer exists. Please return to the landing page.');
      }

      if (!allowedRoles.includes(role)) {
        return response(res, 403, false, 'Forbidden: Access denied');
      }

      req.user = {
        id: decoded.id,
        userId: decoded.id,
        role: decoded.role,
        companyId: companyId,
      };

      next();
    } catch (err: any) {
      return response(res, 401, false, 'Invalid or expired token');
    }
  };
};

export default requiredRole;
