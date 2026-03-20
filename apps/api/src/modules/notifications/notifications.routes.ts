import { Router } from 'express';
import { notificationsController } from './notifications.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { rbac } from '../../middleware/rbac.middleware';

const router = Router();
router.use(authMiddleware);

router.post('/sms/send', rbac('SUPER_ADMIN', 'DISTRICT_OFFICER', 'UPAZILA_OFFICER'), notificationsController.sendSms);
router.get('/sms/log', rbac('SUPER_ADMIN', 'DISTRICT_OFFICER'), notificationsController.smsLog);
router.get('/alerts', rbac('SUPER_ADMIN', 'DISTRICT_OFFICER', 'UPAZILA_OFFICER', 'INSPECTOR'), notificationsController.alerts);

export default router;
