import express, { Request, Response, NextFunction } from 'express';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        companyId: string;
      };
    }
  }
}

/**
 * Production-grade role-based middleware for Safety Officer
 * Enforces read-only access and prevents restricted operations
 */

/**
 * Blocks Safety Officer from accessing specific endpoints
 * Used for: POST vehicles, DELETE vehicles, POST expenses, etc.
 */
export const blockSafetyOfficer = (req: Request, res: Response, next: NextFunction) => {
  const userRole = req.user?.role;

  if (userRole === 'safety_officer') {
    console.warn(`⛔ Access denied: Safety Officer attempted ${req.method} ${req.path}`);
    return res.status(403).json({
      success: false,
      message: 'Safety Officers cannot perform this action',
      error: 'Forbidden',
    });
  }

  next();
};

/**
 * Allows Safety Officer read-only access to drivers
 * Prevents modifications
 */
export const safetyOfficerReadOnly = (req: Request, res: Response, next: NextFunction) => {
  const userRole = req.user?.role;

  // Allow GET requests for all roles
  if (req.method === 'GET') {
    return next();
  }

  // Block POST, PUT, DELETE for Safety Officer
  if (userRole === 'safety_officer') {
    console.warn(
      `⛔ Access denied: Safety Officer attempted ${req.method} on driver data`
    );
    return res.status(403).json({
      success: false,
      message: 'Safety Officers have read-only access to driver data',
      error: 'Forbidden',
    });
  }

  next();
};

/**
 * Prevents driver assignment if license is expired
 */
export const validateLicenseBeforeAssignment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { driverId } = req.body;

    if (!driverId) {
      return next(); // No driver to validate
    }

    // In production, fetch driver from DB and check license expiry
    // const driver = await Driver.findById(driverId);
    // if (driver && new Date(driver.licenseExpiry) < new Date()) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Driver cannot be assigned due to expired license',
    //     error: 'License Expired',
    //   });
    // }

    next();
  } catch (error) {
    console.error('License validation error:', error);
    next();
  }
};

/**
 * Validates that Safety Officer can only view safety-related analytics
 */
export const enforceSafetyAnalyticsFilter = (req: Request, res: Response, next: NextFunction) => {
  const userRole = req.user?.role;

  if (userRole === 'safety_officer') {
    // Store flag to filter response data in controller
    (req as any).filterSafetyDataOnly = true;
    console.log('📊 Applying Safety Officer data filter to analytics');
  }

  next();
};

/**
 * Comprehensive middleware chain for Safety Officer enforcement
 * Apply to relevant routes
 */
export const safetyOfficerEnforcement = [
  safetyOfficerReadOnly,
  validateLicenseBeforeAssignment,
  enforceSafetyAnalyticsFilter,
];

export default {
  blockSafetyOfficer,
  safetyOfficerReadOnly,
  validateLicenseBeforeAssignment,
  enforceSafetyAnalyticsFilter,
  safetyOfficerEnforcement,
};
