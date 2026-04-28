import { Router } from 'express';
import getDriverList from '../controllers/employee/get.drivers';
import assignVehicleToDriver from '../controllers/employee/assign-vehicle';
import removeVehicleFromDriver from '../controllers/employee/remove-vehicle';
import requiredRole from '../middlewares/role.middleware';

const driverRouter = Router();

// Get all drivers with performance metrics (for dashboards and employee pages)
driverRouter.get('/list', requiredRole('manager', 'dispatcher', 'safety_officer'), getDriverList);

// Get drivers with performance metrics (performance page)
driverRouter.get('/performance', requiredRole('manager', 'safety_officer'), getDriverList);

// Assign vehicle to driver (only managers)
driverRouter.post('/assign-vehicle', requiredRole('manager'), assignVehicleToDriver);

// Remove vehicle from driver (only managers)
driverRouter.post('/remove-vehicle', requiredRole('manager'), removeVehicleFromDriver);

export default driverRouter;