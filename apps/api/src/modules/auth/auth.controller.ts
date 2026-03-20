import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { LoginDto, RefreshDto } from './auth.dto';
import { AuthRequest } from '../../middleware/auth.middleware';

/** Auth controller handling HTTP requests for authentication */
export const authController = {
  /**
   * POST /api/v1/auth/login
   * Authenticates user credentials and returns JWT tokens.
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = LoginDto.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: parsed.error.message, code: 'VALIDATION_ERROR' });
        return;
      }
      const result = await authService.login(parsed.data);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/auth/refresh
   * Generates a new access token using a valid refresh token.
   */
  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = RefreshDto.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: parsed.error.message, code: 'VALIDATION_ERROR' });
        return;
      }
      const result = await authService.refresh(parsed.data.refreshToken);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/auth/logout
   * Revokes the user's refresh token.
   */
  async logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Not authenticated', code: 'UNAUTHORIZED' });
        return;
      }
      await authService.logout(req.user.id);
      res.status(200).json({ success: true, data: { message: 'Logged out successfully' } });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/auth/me
   * Returns the currently authenticated user's profile.
   */
  async me(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Not authenticated', code: 'UNAUTHORIZED' });
        return;
      }
      res.status(200).json({ success: true, data: req.user });
    } catch (err) {
      next(err);
    }
  },
};
