import { Router } from 'express';
import getDashboardKPIs from '../controllers/dashboard/dashboard.getKPIs';
import getSafetyMetrics from '../controllers/dashboard/dashboard.getSafetyMetrics';
import requiredRole from '../middlewares/role.middleware';

const dashboardRouter = Router();

// Get dashboard KPIs and trips data
dashboardRouter.get(
  '/kpis',
  requiredRole('manager', 'dispatcher'),
  getDashboardKPIs
);

// Get safety metrics for safety officer dashboard
dashboardRouter.get(
  '/safety-metrics',
  requiredRole('safety_officer'),
  getSafetyMetrics
);

export default dashboardRouter;