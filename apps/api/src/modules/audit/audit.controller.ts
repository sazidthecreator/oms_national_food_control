import { Response, NextFunction } from 'express';
import { auditService } from './audit.service';
import { AuthRequest } from '../../middleware/auth.middleware';

/** Audit controller */
export const auditController = {
  /** GET /api/v1/audit */
  async list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 20;
      const entityType = req.query['entityType'] as string | undefined;
      const data = await auditService.findAll(page, limit, entityType);
      res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
  },

  /** GET /api/v1/audit/:id */
  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const log = await auditService.findById(req.params['id']!);
      res.status(200).json({ success: true, data: log });
    } catch (err) { next(err); }
  },

  /** GET /api/v1/audit/export */
  async exportCsv(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const csv = await auditService.exportCsv();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="audit-log.csv"');
      res.status(200).send(csv);
    } catch (err) { next(err); }
  },
};
