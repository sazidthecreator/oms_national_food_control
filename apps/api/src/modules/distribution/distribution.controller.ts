import { Request, Response, NextFunction } from 'express';
import { distributionService } from './distribution.service';
import { VerifyDto, DispenseDto, ExceptionDto, SyncDto } from './distribution.dto';
import { AuthRequest } from '../../middleware/auth.middleware';

/** Distribution controller */
export const distributionController = {
  /** POST /api/v1/distribution/verify */
  async verify(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = VerifyDto.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: parsed.error.message, code: 'VALIDATION_ERROR' });
        return;
      }
      const { beneficiaryCode, dealerId, faceMatchScore } = parsed.data;
      const result = await distributionService.verify(beneficiaryCode, dealerId, faceMatchScore);
      res.status(200).json({ success: true, data: result });
    } catch (err) { next(err); }
  },

  /** POST /api/v1/distribution/dispense */
  async dispense(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = DispenseDto.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: parsed.error.message, code: 'VALIDATION_ERROR' });
        return;
      }
      const distribution = await distributionService.dispense(parsed.data);
      res.status(201).json({ success: true, data: distribution });
    } catch (err) { next(err); }
  },

  /** POST /api/v1/distribution/exception */
  async exception(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = ExceptionDto.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: parsed.error.message, code: 'VALIDATION_ERROR' });
        return;
      }
      const result = await distributionService.exception(parsed.data);
      res.status(201).json({ success: true, data: result });
    } catch (err) { next(err); }
  },

  /** POST /api/v1/distribution/sync */
  async sync(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = SyncDto.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: parsed.error.message, code: 'VALIDATION_ERROR' });
        return;
      }
      const results = await distributionService.sync(parsed.data);
      res.status(200).json({ success: true, data: results });
    } catch (err) { next(err); }
  },

  /**
   * GET /api/v1/distribution/live-feed
   * Server-Sent Events endpoint for real-time distribution feed.
   */
  async liveFeed(req: Request, res: Response): Promise<void> {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const sendFeed = async () => {
      try {
        const data = await distributionService.getLiveFeed();
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      } catch (err) {
        res.write(`data: ${JSON.stringify({ error: String(err) })}\n\n`);
      }
    };

    await sendFeed();
    const interval = setInterval(sendFeed, 5000);

    req.on('close', () => {
      clearInterval(interval);
      res.end();
    });
  },
};
