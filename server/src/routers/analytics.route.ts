import { Router } from 'express';
import getAnalytics from '../controllers/analytics/get.analytics';
import requiredRole from '../middlewares/role.middleware';

const analyticsRouter = Router();

// Get analytics data (overview, fuel, ROI, utilization, financial)
analyticsRouter.get('/dashboard', requiredRole('manager', 'financial_analyst'), getAnalytics);

export default analyticsRouter;