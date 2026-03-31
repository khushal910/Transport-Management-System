import { Router } from 'express';
import requiredRole from '../middlewares/role.middleware';
import createMaintenance from '../controllers/maintenance/create.maintenance';
import getMaintenanceList from '../controllers/maintenance/maintenance.getList';
import updateMaintenanceStatus from '../controllers/maintenance/update.maintenance.status';

const maintenanceRouter = Router();

// Both manager and dispatcher can create and view maintenance logs (safety_officer can view)
maintenanceRouter.post('/create', requiredRole('manager', 'dispatcher'), createMaintenance);
maintenanceRouter.get('/list', requiredRole('manager', 'dispatcher', 'safety_officer'), getMaintenanceList);

// Only manager and safety_officer can update maintenance status
maintenanceRouter.patch('/status/:maintenanceId', requiredRole('manager', 'safety_officer'), updateMaintenanceStatus);

export default maintenanceRouter;