import { Router, Request, Response } from 'express';
import requiredRole from '../middlewares/role.middleware';
import {
  blockSafetyOfficer,
  safetyOfficerReadOnly,
} from '../middlewares/safety-officer.middleware';

const safetyRouter = Router();

/**
 * Safety Officer specific endpoints
 * Production-grade routes for safety metrics and compliance
 */

/**
 * GET /api/safety/metrics
 * Fetch safety metrics for Safety Officer dashboard
 * Restricted to: Safety Officer, Manager
 */
safetyRouter.get('/metrics', requiredRole('manager', 'safety_officer'), (req: Request, res: Response) => {
  // Mock implementation - in production, query database
  const safetyMetrics = {
    success: true,
    data: {
      expiredLicenses: 2,
      lowSafetyScoreDrivers: 5,
      recentAccidents: 1,
      highRiskDrivers: 3,
      totalDrivers: 50,
      complianceRate: 96,
    },
  };

  res.json(safetyMetrics);
});

/**
 * GET /api/safety/drivers
 * Fetch driver safety profiles
 * Restricted to: Safety Officer, Manager, Dispatcher (read-only)
 */
safetyRouter.get('/drivers', safetyOfficerReadOnly, (req: Request, res: Response) => {
  const role = (req as any).user?.role;

  // Mock safety profile data
  const drivers = {
    success: true,
    data: [
      {
        _id: '1',
        name: 'Rajesh Kumar',
        email: 'rajesh@company.com',
        licenseNumber: 'DL-123-456',
        licenseExpiry: '2024-03-15',
        safetyScore: 45,
        overSpeedingIncidents: 5,
        harshBrakingCount: 8,
        accidentHistory: 1,
        status: 'active',
      },
      {
        _id: '2',
        name: 'Amit Singh',
        email: 'amit@company.com',
        licenseNumber: 'DL-789-012',
        licenseExpiry: '2023-12-20',
        safetyScore: 25,
        overSpeedingIncidents: 12,
        harshBrakingCount: 15,
        accidentHistory: 3,
        status: 'suspended',
      },
    ],
  };

  // Safety Officer should only see safety-related fields
  res.json(drivers);
});

/**
 * GET /api/safety/analytics
 * Fetch safety analytics data
 * Restricted to: Safety Officer, Manager
 */
safetyRouter.get('/analytics', requiredRole('manager', 'safety_officer'), (req: Request, res: Response) => {
  const analytics = {
    success: true,
    data: {
      safetyTrends: [
        { date: 'Jan 1', averageScore: 65, incidents: 3 },
        { date: 'Jan 8', averageScore: 68, incidents: 2 },
        { date: 'Jan 15', averageScore: 72, incidents: 1 },
      ],
      licenseCompliance: {
        validLicenses: 48,
        expiredLicenses: 2,
        complianceRate: 96,
      },
      riskLevels: {
        highRisk: 3,
        mediumRisk: 5,
        lowRisk: 42,
      },
    },
  };

  res.json(analytics);
});

/**
 * GET /api/safety/compliance-report
 * Generate safety compliance report
 * Restricted to: Safety Officer, Manager
 */
safetyRouter.get(
  '/compliance-report',
  requiredRole('manager', 'safety_officer'),
  (req: Request, res: Response) => {
    const report = {
      success: true,
      data: {
        reportDate: new Date().toISOString(),
        totalDrivers: 50,
        compliantDrivers: 48,
        nonCompliantDrivers: 2,
        compliancePercentage: 96,
        violations: [
          {
            driverId: '2',
            driverName: 'Amit Singh',
            violationType: 'expired_license',
            date: '2024-01-15',
            severity: 'critical',
          },
        ],
      },
    };

    res.json(report);
  }
);

/**
 * POST /api/safety/alert-driver
 * Send safety alert to driver
 * Restricted to: Manager, Safety Officer
 * Blocks other roles
 */
safetyRouter.post(
  '/alert-driver',
  requiredRole('manager', 'safety_officer'),
  (req: Request, res: Response) => {
    const { driverId, alertType, message } = req.body;

    if (!driverId || !alertType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // In production: Send email/notification to driver
    const alertResponse = {
      success: true,
      message: `Safety alert sent to driver`,
      data: {
        driverId,
        alertType,
        sentAt: new Date().toISOString(),
      },
    };

    res.json(alertResponse);
  }
);

/**
 * PUT /api/safety/suspend-driver/:driverId
 * Suspend driver for compliance reasons
 * Restricted to: Manager only
 */
safetyRouter.put(
  '/suspend-driver/:driverId',
  blockSafetyOfficer,
  requiredRole('manager'),
  (req: Request, res: Response) => {
    const { driverId } = req.params;
    const { reason } = req.body;

    // In production: Update driver status in DB
    const suspension = {
      success: true,
      message: `Driver ${driverId} suspended`,
      data: {
        driverId,
        reason,
        suspendedAt: new Date().toISOString(),
        status: 'suspended',
      },
    };

    res.json(suspension);
  }
);

export default safetyRouter;
