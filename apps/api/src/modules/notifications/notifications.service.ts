import { prisma } from '../../lib/prisma';
import { logger } from '../../lib/logger';

/** Notifications service for SMS and system alerts */
export const notificationsService = {
  /**
   * Sends an SMS notification and logs it to the database.
   * In production, integrates with an SMS gateway API.
   */
  async sendSms(recipient: string, message: string, type: string) {
    logger.info('Sending SMS', { recipient, type });

    // In production: call actual SMS gateway (e.g., SSL Wireless, Robi)
    const status = 'SENT'; // Simulate sent status

    return prisma.smsLog.create({
      data: { recipient, message, type, status, gateway: 'SIMULATED' },
    });
  },

  /**
   * Retrieves paginated SMS log entries.
   */
  async getSmsLog(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.smsLog.findMany({ skip, take: limit, orderBy: { sentAt: 'desc' } }),
      prisma.smsLog.count(),
    ]);
    return { data, total, page, limit, hasNext: skip + data.length < total };
  },

  /**
   * Returns system alerts based on recent anomalies and critical events.
   */
  async getAlerts() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [duplicateBlocks, failedSms, suspendedDealers] = await Promise.all([
      prisma.duplicateBlock.count({ where: { attemptedAt: { gte: today } } }),
      prisma.smsLog.count({ where: { status: 'FAILED', sentAt: { gte: today } } }),
      prisma.dealer.count({ where: { status: 'SUSPENDED' } }),
    ]);

    const alerts = [];
    if (duplicateBlocks > 10) {
      alerts.push({ type: 'WARNING', message: `${duplicateBlocks} duplicate distribution attempts blocked today`, code: 'HIGH_DUPLICATE_ATTEMPTS' });
    }
    if (failedSms > 0) {
      alerts.push({ type: 'ERROR', message: `${failedSms} SMS messages failed to deliver today`, code: 'SMS_FAILURES' });
    }
    if (suspendedDealers > 0) {
      alerts.push({ type: 'INFO', message: `${suspendedDealers} dealers currently suspended`, code: 'SUSPENDED_DEALERS' });
    }

    return alerts;
  },
};
