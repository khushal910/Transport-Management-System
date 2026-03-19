import { Router } from 'express';
import getDriverList from '../controllers/employee/get.drivers.js';
import requiredRole from '../middlewares/role.middleware.js';

const driverRouter = Router();

// Get drivers with performance metrics (performance page)
driverRouter.get('/performance', requiredRole('manager'), getDriverList);

export default driverRouter;
