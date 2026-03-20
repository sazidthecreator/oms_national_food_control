import { Router } from 'express';
import { distributionController } from './distribution.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { rbac } from '../../middleware/rbac.middleware';

const router = Router();
router.use(authMiddleware);

router.post('/verify', rbac('DEALER', 'SUPER_ADMIN'), distributionController.verify);
router.post('/dispense', rbac('DEALER', 'SUPER_ADMIN'), distributionController.dispense);
router.post('/exception', rbac('DEALER', 'SUPER_ADMIN', 'UPAZILA_OFFICER'), distributionController.exception);
router.post('/sync', rbac('DEALER', 'SUPER_ADMIN'), distributionController.sync);
router.get('/live-feed', rbac('SUPER_ADMIN', 'DISTRICT_OFFICER', 'UPAZILA_OFFICER'), distributionController.liveFeed);

export default router;
