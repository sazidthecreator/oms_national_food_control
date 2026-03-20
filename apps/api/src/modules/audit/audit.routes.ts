import { Router } from 'express';
import { auditController } from './audit.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { rbac } from '../../middleware/rbac.middleware';

const router = Router();
router.use(authMiddleware);

router.get('/export', rbac('SUPER_ADMIN'), auditController.exportCsv);
router.get('/:id', rbac('SUPER_ADMIN', 'DISTRICT_OFFICER'), auditController.getById);
router.get('/', rbac('SUPER_ADMIN', 'DISTRICT_OFFICER'), auditController.list);

export default router;
