import { Router } from 'express';
import getAnalytics from '../controllers/analytics/get.analytics.js';
import requiredRole from '../middlewares/role.middleware.js';

const analyticsRouter = Router();

// Get analytics data (overview, fuel, ROI, utilization, financial)
analyticsRouter.get('/dashboard', requiredRole('manager'), getAnalytics);

export default analyticsRouter;
