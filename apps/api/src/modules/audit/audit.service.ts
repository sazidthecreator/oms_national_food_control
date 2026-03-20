import { prisma } from '../../lib/prisma';

/** Audit service for immutable audit log access (Rule 4 — no UPDATE/DELETE) */
export const auditService = {
  /**
   * Retrieves paginated audit log entries.
   * Audit logs are read-only — no modifications allowed.
   */
  async findAll(page: number, limit: number, entityType?: string) {
    const skip = (page - 1) * limit;
    const where = entityType ? { entityType } : {};

    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.auditLog.count({ where }),
    ]);

    return { data, total, page, limit, hasNext: skip + data.length < total };
  },

  /**
   * Retrieves a single audit log entry by ID.
   */
  async findById(id: string) {
    const log = await prisma.auditLog.findUnique({ where: { id } });
    if (!log) throw Object.assign(new Error('Audit log not found'), { statusCode: 404, code: 'NOT_FOUND' });
    return log;
  },

  /**
   * Exports audit logs as CSV for compliance reporting.
   */
  async exportCsv(): Promise<string> {
    const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 10000 });

    const header = 'id,eventCode,action,entityType,entityId,userId,ipAddress,result,hashChain,createdAt\n';
    const rows = logs.map(log =>
      [log.id, log.eventCode, log.action, log.entityType, log.entityId ?? '', log.userId, log.ipAddress ?? '', log.result, log.hashChain ?? '', log.createdAt.toISOString()].join(','),
    );

    return header + rows.join('\n');
  },
};
