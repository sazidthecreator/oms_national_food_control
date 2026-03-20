import { Response, NextFunction } from 'express';
import { notificationsService } from './notifications.service';
import { AuthRequest } from '../../middleware/auth.middleware';

/** Notifications controller */
export const notificationsController = {
  /** POST /api/v1/notifications/sms/send */
  async sendSms(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { recipient, message, type } = req.body as { recipient: string; message: string; type: string };
      if (!recipient || !message || !type) {
        res.status(400).json({ success: false, error: 'recipient, message, and type are required', code: 'VALIDATION_ERROR' });
        return;
      }
      const log = await notificationsService.sendSms(recipient, message, type);
      res.status(201).json({ success: true, data: log });
    } catch (err) { next(err); }
  },

  /** GET /api/v1/notifications/sms/log */
  async smsLog(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 20;
      const data = await notificationsService.getSmsLog(page, limit);
      res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
  },

  /** GET /api/v1/notifications/alerts */
  async alerts(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await notificationsService.getAlerts();
      res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
  },
};
