import { Router } from 'express';
import getDriverList from '../controllers/employee/get.drivers';
import requiredRole from '../middlewares/role.middleware';

const driverRouter = Router();

// Get drivers with performance metrics (performance page)
driverRouter.get('/performance', requiredRole('manager', 'safety_officer'), getDriverList);

export default driverRouter;