import { Router } from "express";
import requiredRole from "../middlewares/role.middleware.js";
import createMaintenance from "../controllers/maintenance/create.maintenance.js";
import getMaintenanceList from "../controllers/maintenance/maintenance.getList.js";

const maintenanceRouter = Router();

// Both manager and dispatcher can create and view maintenance logs
maintenanceRouter.post('/create', requiredRole('manager', 'dispatcher'), createMaintenance);
maintenanceRouter.get('/list', requiredRole('manager', 'dispatcher'), getMaintenanceList);

export default maintenanceRouter;
