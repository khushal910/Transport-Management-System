import { Router } from 'express';
import getDashboardKPIs from '../controllers/dashboard/dashboard.getKPIs';
import requiredRole from '../middlewares/role.middleware';

const dashboardRouter = Router();

// Get dashboard KPIs and trips data
dashboardRouter.get(
  '/kpis',
  requiredRole('manager', 'dispatcher'),
  getDashboardKPIs
);

export default dashboardRouter;