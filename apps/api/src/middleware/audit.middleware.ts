import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { prisma } from '../lib/prisma';
import { createHash } from 'crypto';
import { logger } from '../lib/logger';

/** In-memory last hash for chain integrity (should use Redis in production) */
let lastHashChain = '0000000000000000000000000000000000000000000000000000000000000000';

/**
 * Middleware that creates an immutable audit log entry for every write operation.
 * Uses SHA-256 hash chaining for tamper detection (Rule 4).
 */
export function auditMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const originalJson = res.json.bind(res);

  res.json = function (body: unknown) {
    if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method)) {
      setImmediate(async () => {
        try {
          const eventCode = `${req.method}:${req.path}:${Date.now()}`;
          const payload = { body: req.body, query: req.query, params: req.params };
          const timestamp = new Date().toISOString();
          const hashInput = `${lastHashChain}${eventCode}${JSON.stringify(payload)}${timestamp}`;
          const hashChain = createHash('sha256').update(hashInput).digest('hex');
          lastHashChain = hashChain;

          await prisma.auditLog.create({
            data: {
              eventCode,
              action: `${req.method} ${req.path}`,
              entityType: req.path.split('/')[3] ?? 'unknown',
              entityId: req.params['id'],
              userId: req.user?.id ?? 'anonymous',
              deviceId: req.headers['x-device-id'] as string | undefined,
              ipAddress: req.ip,
              payload,
              result: res.statusCode < 400 ? 'SUCCESS' : 'FAILURE',
              hashChain,
            },
          });
        } catch (err) {
          logger.error('Audit log creation failed', { err });
        }
      });
    }
    return originalJson(body);
  };

  next();
}
