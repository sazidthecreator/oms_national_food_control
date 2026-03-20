import { prisma } from '../../lib/prisma';
import { DispenseInput, ExceptionInput, SyncInput } from './distribution.dto';
import { randomUUID } from 'crypto';

/** Face verification thresholds (Rule 6) */
const FACE_ACCEPT_THRESHOLD = 0.85;
const FACE_FLAG_THRESHOLD = 0.70;

/**
 * Generates a unique transaction ID with prefix TXN
 */
function generateTxnId(): string {
  return `TXN${Date.now()}${randomUUID().slice(0, 8).toUpperCase()}`;
}

/**
 * Checks if a beneficiary has already received distribution today (Rule 1).
 * @returns The original transaction ID if a duplicate exists, null otherwise
 */
async function checkDuplicateToday(beneficiaryId: string): Promise<string | null> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const existing = await prisma.distribution.findFirst({
    where: {
      beneficiaryId,
      status: 'ACCEPTED',
      createdAt: { gte: startOfDay, lte: endOfDay },
    },
  });

  return existing ? existing.txnId : null;
}

/**
 * Checks if adding quantityKg would exceed the monthly quota (Rule 2).
 * @returns true if quota would be exceeded
 */
async function checkMonthlyQuota(beneficiaryId: string, requestedKg: number): Promise<boolean> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const beneficiary = await prisma.beneficiary.findUnique({ where: { id: beneficiaryId } });
  if (!beneficiary) return true;

  const distributions = await prisma.distribution.findMany({
    where: { beneficiaryId, status: 'ACCEPTED', createdAt: { gte: startOfMonth } },
  });

  const usedKg = distributions.reduce((sum, d) => sum + Number(d.quantityKg), 0);
  return usedKg + requestedKg > Number(beneficiary.monthlyQuotaKg);
}

/** Distribution service implementing all 6 critical business rules */
export const distributionService = {
  /**
   * Verifies a beneficiary before dispensing food.
   * Checks duplicate (Rule 1) and validates face score (Rule 6).
   */
  async verify(beneficiaryCode: string, dealerId: string, faceMatchScore: number) {
    const beneficiary = await prisma.beneficiary.findUnique({ where: { beneficiaryCode } });
    if (!beneficiary || !beneficiary.isActive) {
      throw Object.assign(new Error('Beneficiary not found or inactive'), { statusCode: 404, code: 'NOT_FOUND' });
    }

    // Rule 1: Check duplicate today
    const duplicateTxn = await checkDuplicateToday(beneficiary.id);
    if (duplicateTxn) {
      return { allowed: false, reason: 'DUPLICATE_TODAY', originalTxnId: duplicateTxn };
    }

    // Rule 6: Face score thresholds
    if (faceMatchScore >= FACE_ACCEPT_THRESHOLD) {
      return { allowed: true, faceStatus: 'ACCEPTED', beneficiary };
    } else if (faceMatchScore >= FACE_FLAG_THRESHOLD) {
      return { allowed: true, faceStatus: 'FLAGGED_FOR_REVIEW', beneficiary };
    } else {
      return { allowed: false, faceStatus: 'REJECTED', reason: 'FACE_SCORE_TOO_LOW' };
    }
  },

  /**
   * Dispenses food to a beneficiary after passing all validation rules.
   * Implements Rules 1, 2, and 6.
   */
  async dispense(input: DispenseInput) {
    // Rule 1: Duplicate check
    const duplicateTxn = await checkDuplicateToday(input.beneficiaryId);
    if (duplicateTxn) {
      // Create DuplicateBlock record
      await prisma.duplicateBlock.create({
        data: {
          beneficiaryId: input.beneficiaryId,
          dealerId: input.dealerId,
          blockedReason: 'Already received distribution today',
          originalTxnId: duplicateTxn,
        },
      });
      throw Object.assign(
        new Error('Beneficiary has already received distribution today'),
        { statusCode: 409, code: 'DUPLICATE_DISTRIBUTION' },
      );
    }

    // Rule 2: Monthly quota check
    const quotaExceeded = await checkMonthlyQuota(input.beneficiaryId, input.quantityKg);
    if (quotaExceeded) {
      throw Object.assign(
        new Error('Monthly quota would be exceeded'),
        { statusCode: 422, code: 'QUOTA_EXCEEDED' },
      );
    }

    // Rule 6: Face verification thresholds
    let status: 'ACCEPTED' | 'EXCEPTION' = 'ACCEPTED';
    if (input.verificationMethod === 'FACE' && input.faceMatchScore !== undefined) {
      if (input.faceMatchScore < FACE_FLAG_THRESHOLD) {
        throw Object.assign(new Error('Face score too low, manual exception required'), { statusCode: 400, code: 'FACE_SCORE_LOW' });
      }
      if (input.faceMatchScore < FACE_ACCEPT_THRESHOLD) {
        status = 'EXCEPTION';
      }
    }

    const txnId = generateTxnId();
    const distribution = await prisma.distribution.create({
      data: {
        txnId,
        beneficiaryId: input.beneficiaryId,
        dealerId: input.dealerId,
        programId: input.programId,
        productType: input.productType,
        quantityKg: input.quantityKg,
        faceMatchScore: input.faceMatchScore,
        verificationMethod: input.verificationMethod,
        status,
        syncStatus: 'ONLINE',
      },
    });

    return distribution;
  },

  /**
   * Creates a manual exception distribution for cases where face verification fails.
   * Requires authorization from a supervisor.
   */
  async exception(input: ExceptionInput) {
    const txnId = generateTxnId();
    return prisma.distribution.create({
      data: {
        txnId,
        beneficiaryId: input.beneficiaryId,
        dealerId: input.dealerId,
        productType: 'RICE',
        quantityKg: 10,
        verificationMethod: 'EXCEPTION',
        status: 'EXCEPTION',
        syncStatus: 'ONLINE',
      },
    });
  },

  /**
   * Processes offline sync queue items.
   * Re-runs Rules 1, 2, and 3 for each item to detect conflicts.
   */
  async sync(input: SyncInput) {
    const results = [];

    for (const item of input.items) {
      try {
        // Rule 3: Re-run duplicate and quota checks for offline items
        const duplicateTxn = await checkDuplicateToday(item.beneficiaryId);
        if (duplicateTxn) {
          // Mark as CONFLICT — never silently accept
          await prisma.offlineSyncQueue.create({
            data: {
              dealerId: item.dealerId,
              deviceId: item.deviceId,
              payload: JSON.parse(JSON.stringify(item)),
              status: 'CONFLICT',
            },
          });
          results.push({ status: 'CONFLICT', reason: 'DUPLICATE_TODAY', item });
          continue;
        }

        const quotaExceeded = await checkMonthlyQuota(item.beneficiaryId, item.quantityKg);
        if (quotaExceeded) {
          await prisma.offlineSyncQueue.create({
            data: {
              dealerId: item.dealerId,
              deviceId: item.deviceId,
              payload: JSON.parse(JSON.stringify(item)),
              status: 'CONFLICT',
            },
          });
          results.push({ status: 'CONFLICT', reason: 'QUOTA_EXCEEDED', item });
          continue;
        }

        const txnId = generateTxnId();
        await prisma.distribution.create({
          data: {
            txnId,
            beneficiaryId: item.beneficiaryId,
            dealerId: item.dealerId,
            programId: item.programId,
            productType: item.productType,
            quantityKg: item.quantityKg,
            verificationMethod: item.verificationMethod,
            status: 'ACCEPTED',
            syncStatus: 'SYNCED',
            offlineCreatedAt: new Date(item.offlineCreatedAt),
            syncedAt: new Date(),
          },
        });
        results.push({ status: 'SYNCED', txnId, item });
      } catch (err) {
        results.push({ status: 'ERROR', error: String(err), item });
      }
    }

    return results;
  },

  /**
   * Retrieves the live distribution feed (last 50 transactions).
   */
  async getLiveFeed() {
    return prisma.distribution.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
    });
  },
};
