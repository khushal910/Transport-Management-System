import { Router } from 'express';
import requiredRole from '../middlewares/role.middleware';
import gpsController from '../controllers/gps/gps.controller';

const gpsRouter = Router();

/**
 * GPS Tracking Routes
 * RBAC: All authenticated roles can view GPS data for trips they have access to
 * - Manager: Can view all trips in company
 * - Dispatcher: Can view all trips they created
 * - Driver: Can view only their own trip
 * - Safety Officer: Can view all trips in company (read-only)
 * - Financial Analyst: Can view all trips in company (read-only)
 */

// Get active trips list (for search/selection)
gpsRouter.get(
  '/active-trips',
  requiredRole('manager', 'dispatcher', 'driver', 'safety_officer', 'financial_analyst'),
  gpsController.getActiveTrips
);

// Get latest GPS location for specific trip
gpsRouter.get(
  '/trip/:tripId/latest',
  requiredRole('manager', 'dispatcher', 'driver', 'safety_officer', 'financial_analyst'),
  gpsController.getTripLatestLocation
);

// Get GPS history/trail for specific trip
gpsRouter.get(
  '/trip/:tripId/history',
  requiredRole('manager', 'dispatcher', 'driver', 'safety_officer', 'financial_analyst'),
  gpsController.getTripLocationHistory
);

// Get all active trips with latest GPS data
gpsRouter.get(
  '/all-active',
  requiredRole('manager', 'dispatcher', 'driver', 'safety_officer', 'financial_analyst'),
  gpsController.getAllActiveTripsGPS
);

export default gpsRouter;
