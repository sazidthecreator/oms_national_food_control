/**
 * Tests for distribution business rules.
 * Rules 1–6 are tested here.
 */

// Mock prisma
jest.mock('../../../lib/prisma', () => ({
  prisma: {
    beneficiary: { findUnique: jest.fn() },
    distribution: { findFirst: jest.fn(), findMany: jest.fn(), create: jest.fn() },
    duplicateBlock: { create: jest.fn() },
    offlineSyncQueue: { create: jest.fn() },
  },
}));

import { distributionService } from '../distribution.service';
import { prisma } from '../../../lib/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const mockBeneficiary = {
  id: 'ben-1',
  beneficiaryCode: 'BEN001',
  name: 'Test User',
  nameBn: null,
  nid: '1234567890',
  phone: null,
  area: 'Dhaka',
  officeId: 'off-1',
  programId: null,
  category: 'WIDOW' as const,
  monthlyQuotaKg: 30,
  faceEmbedding: null,
  isActive: true,
  enrolledAt: new Date(),
};

describe('Distribution Business Rules', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('Rule 1 — Duplicate Prevention', () => {
    it('blocks distribution if beneficiary already received today', async () => {
      (mockPrisma.distribution.findFirst as jest.Mock).mockResolvedValue({
        id: 'dist-1',
        txnId: 'TXN_EXISTING',
        status: 'ACCEPTED',
        createdAt: new Date(),
      });
      (mockPrisma.duplicateBlock.create as jest.Mock).mockResolvedValue({});

      await expect(
        distributionService.dispense({
          beneficiaryId: 'ben-1',
          dealerId: 'dealer-1',
          productType: 'RICE',
          quantityKg: 10,
          verificationMethod: 'FACE',
          faceMatchScore: 0.95,
        }),
      ).rejects.toMatchObject({ statusCode: 409, code: 'DUPLICATE_DISTRIBUTION' });

      expect(mockPrisma.duplicateBlock.create).toHaveBeenCalled();
    });

    it('allows distribution if no previous distribution today', async () => {
      (mockPrisma.distribution.findFirst as jest.Mock).mockResolvedValue(null);
      (mockPrisma.distribution.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.beneficiary.findUnique as jest.Mock).mockResolvedValue(mockBeneficiary);
      (mockPrisma.distribution.create as jest.Mock).mockResolvedValue({ id: 'dist-new', txnId: 'TXN123', status: 'ACCEPTED' });

      const result = await distributionService.dispense({
        beneficiaryId: 'ben-1',
        dealerId: 'dealer-1',
        productType: 'RICE',
        quantityKg: 10,
        verificationMethod: 'FACE',
        faceMatchScore: 0.95,
      });

      expect(result.status).toBe('ACCEPTED');
    });
  });

  describe('Rule 2 — Monthly Quota', () => {
    it('blocks when monthly quota would be exceeded', async () => {
      (mockPrisma.distribution.findFirst as jest.Mock).mockResolvedValue(null);
      (mockPrisma.beneficiary.findUnique as jest.Mock).mockResolvedValue({ ...mockBeneficiary, monthlyQuotaKg: 10 });
      (mockPrisma.distribution.findMany as jest.Mock).mockResolvedValue([
        { quantityKg: 8, status: 'ACCEPTED' },
      ]);

      await expect(
        distributionService.dispense({
          beneficiaryId: 'ben-1',
          dealerId: 'dealer-1',
          productType: 'RICE',
          quantityKg: 5, // would exceed 10kg quota (8+5=13)
          verificationMethod: 'FACE',
          faceMatchScore: 0.95,
        }),
      ).rejects.toMatchObject({ statusCode: 422, code: 'QUOTA_EXCEEDED' });
    });
  });

  describe('Rule 6 — Face Verification Thresholds', () => {
    beforeEach(() => {
      (mockPrisma.distribution.findFirst as jest.Mock).mockResolvedValue(null);
      (mockPrisma.beneficiary.findUnique as jest.Mock).mockResolvedValue(mockBeneficiary);
      (mockPrisma.distribution.findMany as jest.Mock).mockResolvedValue([]);
    });

    it('accepts distribution with face score >= 0.85', async () => {
      (mockPrisma.distribution.create as jest.Mock).mockResolvedValue({ id: 'dist-1', txnId: 'TXN1', status: 'ACCEPTED' });

      const result = await distributionService.dispense({
        beneficiaryId: 'ben-1',
        dealerId: 'dealer-1',
        productType: 'RICE',
        quantityKg: 10,
        verificationMethod: 'FACE',
        faceMatchScore: 0.90,
      });

      expect(result.status).toBe('ACCEPTED');
    });

    it('flags distribution with face score 0.70-0.84 as EXCEPTION', async () => {
      (mockPrisma.distribution.create as jest.Mock).mockResolvedValue({ id: 'dist-1', txnId: 'TXN1', status: 'EXCEPTION' });

      const result = await distributionService.dispense({
        beneficiaryId: 'ben-1',
        dealerId: 'dealer-1',
        productType: 'RICE',
        quantityKg: 10,
        verificationMethod: 'FACE',
        faceMatchScore: 0.75,
      });

      expect(mockPrisma.distribution.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: 'EXCEPTION' }) }),
      );
    });

    it('rejects distribution with face score < 0.70', async () => {
      await expect(
        distributionService.dispense({
          beneficiaryId: 'ben-1',
          dealerId: 'dealer-1',
          productType: 'RICE',
          quantityKg: 10,
          verificationMethod: 'FACE',
          faceMatchScore: 0.65,
        }),
      ).rejects.toMatchObject({ statusCode: 400, code: 'FACE_SCORE_LOW' });
    });
  });

  describe('Rule 3 — Offline Sync Conflict', () => {
    it('marks sync item as CONFLICT if duplicate detected', async () => {
      (mockPrisma.distribution.findFirst as jest.Mock).mockResolvedValue({ txnId: 'EXISTING_TXN' });
      (mockPrisma.offlineSyncQueue.create as jest.Mock).mockResolvedValue({});

      const results = await distributionService.sync({
        items: [{
          beneficiaryId: 'ben-1',
          dealerId: 'dealer-1',
          productType: 'RICE',
          quantityKg: 10,
          verificationMethod: 'FACE',
          offlineCreatedAt: new Date().toISOString(),
          deviceId: 'device-1',
        }],
      });

      expect(results[0]).toMatchObject({ status: 'CONFLICT', reason: 'DUPLICATE_TODAY' });
      expect(mockPrisma.offlineSyncQueue.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: 'CONFLICT' }) }),
      );
    });
  });
});
