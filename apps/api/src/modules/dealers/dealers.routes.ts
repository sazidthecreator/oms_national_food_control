import { Router } from 'express';
import { dealersController } from './dealers.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { rbac } from '../../middleware/rbac.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', rbac('SUPER_ADMIN', 'DISTRICT_OFFICER', 'UPAZILA_OFFICER'), dealersController.list);
router.post('/', rbac('SUPER_ADMIN', 'DISTRICT_OFFICER'), dealersController.create);
router.get('/:id', rbac('SUPER_ADMIN', 'DISTRICT_OFFICER', 'UPAZILA_OFFICER', 'DEALER'), dealersController.getById);
router.patch('/:id', rbac('SUPER_ADMIN', 'DISTRICT_OFFICER'), dealersController.update);
router.post('/:id/approve', rbac('SUPER_ADMIN', 'DISTRICT_OFFICER'), dealersController.approve);
router.post('/:id/suspend', rbac('SUPER_ADMIN', 'DISTRICT_OFFICER'), dealersController.suspend);
router.get('/:id/transactions', rbac('SUPER_ADMIN', 'DISTRICT_OFFICER', 'DEALER'), dealersController.transactions);

export default router;
