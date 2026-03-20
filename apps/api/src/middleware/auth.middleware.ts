import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/** Extends Express Request to include authenticated user */
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    officeId: string;
  };
}

/**
 * Middleware that verifies JWT access tokens.
 * Extracts the Bearer token from Authorization header and validates it.
 */
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Missing or invalid Authorization header', code: 'UNAUTHORIZED' });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not configured');
    const payload = jwt.verify(token, secret) as AuthRequest['user'];
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token', code: 'TOKEN_INVALID' });
  }
}
