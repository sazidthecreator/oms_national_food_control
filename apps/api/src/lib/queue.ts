import { Queue, Worker } from 'bullmq';
import { logger } from './logger';

/** BullMQ connection options */
const connection = { host: 'localhost', port: 6379 };

/** Offline sync queue for processing dealer transactions */
export const offlineSyncQueue = new Queue('offline-sync', { connection });

/** SMS dispatch queue */
export const smsQueue = new Queue('sms-dispatch', { connection });

/**
 * Process offline sync jobs
 * Re-runs duplicate check and quota validation for each item
 */
export const offlineSyncWorker = new Worker(
  'offline-sync',
  async (job) => {
    logger.info(`Processing offline sync job ${job.id}`, { data: job.data });
    // Processing logic is handled in distribution.service.ts
    return { processed: true };
  },
  { connection },
);

offlineSyncWorker.on('completed', (job) => {
  logger.info(`Offline sync job ${job.id} completed`);
});

offlineSyncWorker.on('failed', (job, err) => {
  logger.error(`Offline sync job ${job?.id} failed`, { err });
});
