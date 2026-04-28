import express from 'express';
import roleMiddleware from '../middlewares/role.middleware';
import {
  updateDriverStatus,
  getDriverStatusHistory,
  getDriversByStatus,
  updateDriverStatusSelf,
} from '../controllers/employee/updateDriverStatus';

const driverStatusRouter = express.Router();

/**
 * Get driver status change history
 * GET /driver-status/history/:driverId
 * Must be BEFORE the /:driverId route to avoid route conflicts
 */
driverStatusRouter.get(
  '/history/:driverId',
  roleMiddleware('manager', 'dispatcher', 'driver', 'safety_officer'),
  getDriverStatusHistory
);

/**
 * Driver self status toggle (MUST be before /:driverId to match first)
 * POST /driver-status/self
 * Body: { status: 'available' | 'off_duty' }
 */
driverStatusRouter.post(
  '/self',
  roleMiddleware('driver'),
  updateDriverStatusSelf
);

/**
 * Update driver status manually (admin/manager only)
 * POST /driver-status/:driverId
 * Body: { status: 'available' | 'off_duty' | 'suspended' }
 */
driverStatusRouter.post(
  '/:driverId',
  roleMiddleware('manager', 'dispatcher'),
  updateDriverStatus
);

/**
 * Get drivers filtered by status
 * GET /driver-status?status=available
 */
driverStatusRouter.get(
  '/',
  roleMiddleware('manager', 'dispatcher', 'safety_officer'),
  getDriversByStatus
);

export default driverStatusRouter;