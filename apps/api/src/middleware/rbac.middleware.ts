import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

/**
 * Role-based access control middleware factory.
 * Returns middleware that allows only users with specified roles.
 * @param allowedRoles - Roles that are permitted to access the route
 */
export function rbac(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated', code: 'UNAUTHORIZED' });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false, 
        error: `Access denied. Required roles: ${allowedRoles.join(', ')}`, 
        code: 'FORBIDDEN' 
      });
      return;
    }
    next();
  };
}
