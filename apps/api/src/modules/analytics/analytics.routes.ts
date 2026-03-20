import { Router } from 'express';
import { analyticsController } from './analytics.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { rbac } from '../../middleware/rbac.middleware';

const router = Router();
router.use(authMiddleware);

router.get('/dashboard', rbac('SUPER_ADMIN', 'DISTRICT_OFFICER', 'UPAZILA_OFFICER', 'INSPECTOR'), analyticsController.dashboard);
router.get('/leakage-trend', rbac('SUPER_ADMIN', 'DISTRICT_OFFICER'), analyticsController.leakageTrend);
router.get('/demand-forecast', rbac('SUPER_ADMIN', 'DISTRICT_OFFICER'), analyticsController.demandForecast);
router.get('/dealer-risk', rbac('SUPER_ADMIN', 'DISTRICT_OFFICER'), analyticsController.dealerRisk);
router.get('/anomalies', rbac('SUPER_ADMIN', 'DISTRICT_OFFICER'), analyticsController.anomalies);

export default router;
