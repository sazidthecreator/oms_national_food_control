import { Router } from 'express';
import { beneficiariesController } from './beneficiaries.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { rbac } from '../../middleware/rbac.middleware';

const router = Router();
router.use(authMiddleware);

router.get('/', rbac('SUPER_ADMIN', 'DISTRICT_OFFICER', 'UPAZILA_OFFICER'), beneficiariesController.list);
router.post('/', rbac('SUPER_ADMIN', 'UPAZILA_OFFICER'), beneficiariesController.create);
router.get('/:id', rbac('SUPER_ADMIN', 'DISTRICT_OFFICER', 'UPAZILA_OFFICER', 'DEALER'), beneficiariesController.getById);
router.get('/:code/quota-status', rbac('SUPER_ADMIN', 'DISTRICT_OFFICER', 'UPAZILA_OFFICER', 'DEALER'), beneficiariesController.quotaStatus);
router.post('/:id/face-enroll', rbac('SUPER_ADMIN', 'UPAZILA_OFFICER'), beneficiariesController.faceEnroll);

export default router;
