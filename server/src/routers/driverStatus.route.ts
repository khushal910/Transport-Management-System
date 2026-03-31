import express from 'express';
import roleMiddleware from '../middlewares/role.middleware';
import {
  updateDriverStatus,
  getDriverStatusHistory,
  getDriversByStatus,
} from '../controllers/employee/updateDriverStatus';

const driverStatusRouter = express.Router();

/**
 * Get driver status change history
 * GET /driver-status/history/:driverId
 * Must be BEFORE the /:driverId route to avoid route conflicts
 */
driverStatusRouter.get(
  '/history/:driverId',
  roleMiddleware('manager', 'dispatcher', 'driver'),
  getDriverStatusHistory
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
  roleMiddleware('manager', 'dispatcher'),
  getDriversByStatus
);

export default driverStatusRouter;