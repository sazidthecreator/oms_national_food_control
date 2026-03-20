import { Response, NextFunction } from 'express';
import { analyticsService } from './analytics.service';
import { AuthRequest } from '../../middleware/auth.middleware';

/** Analytics controller */
export const analyticsController = {
  /** GET /api/v1/analytics/dashboard */
  async dashboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getDashboard();
      res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
  },

  /** GET /api/v1/analytics/leakage-trend */
  async leakageTrend(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getLeakageTrend();
      res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
  },

  /** GET /api/v1/analytics/demand-forecast */
  async demandForecast(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getDemandForecast();
      res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
  },

  /** GET /api/v1/analytics/dealer-risk */
  async dealerRisk(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getDealerRisk();
      res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
  },

  /** GET /api/v1/analytics/anomalies */
  async anomalies(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getAnomalies();
      res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
  },
};
