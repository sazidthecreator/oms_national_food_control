import { prisma } from '../../lib/prisma';
import { CreateBeneficiaryInput, UpdateBeneficiaryInput, PaginationInput } from './beneficiaries.dto';

/** Service handling all beneficiary business logic */
export const beneficiariesService = {
  /**
   * Retrieves a paginated list of beneficiaries with optional filtering.
   */
  async findAll(query: PaginationInput) {
    const { page, limit, search, category } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(category ? { category } : {}),
      ...(search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { beneficiaryCode: { contains: search, mode: 'insensitive' as const } },
          { nid: { contains: search } },
        ],
      } : {}),
    };

    const [data, total] = await Promise.all([
      prisma.beneficiary.findMany({ where, skip, take: limit, orderBy: { enrolledAt: 'desc' } }),
      prisma.beneficiary.count({ where }),
    ]);

    return { data, total, page, limit, hasNext: skip + data.length < total };
  },

  /**
   * Creates a new beneficiary record.
   */
  async create(input: CreateBeneficiaryInput) {
    const existing = await prisma.beneficiary.findFirst({
      where: { OR: [{ nid: input.nid }, { beneficiaryCode: input.beneficiaryCode }] },
    });
    if (existing) {
      throw Object.assign(new Error('Beneficiary with this NID or code already exists'), { statusCode: 409, code: 'DUPLICATE' });
    }
    return prisma.beneficiary.create({ data: { ...input, monthlyQuotaKg: input.monthlyQuotaKg, enrolledAt: new Date() } });
  },

  /**
   * Retrieves a single beneficiary by ID.
   */
  async findById(id: string) {
    const b = await prisma.beneficiary.findUnique({ where: { id } });
    if (!b) throw Object.assign(new Error('Beneficiary not found'), { statusCode: 404, code: 'NOT_FOUND' });
    return b;
  },

  /**
   * Returns the current month's quota usage status for a beneficiary.
   */
  async getQuotaStatus(beneficiaryCode: string) {
    const b = await prisma.beneficiary.findUnique({ where: { beneficiaryCode } });
    if (!b) throw Object.assign(new Error('Beneficiary not found'), { statusCode: 404, code: 'NOT_FOUND' });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const distributions = await prisma.distribution.findMany({
      where: { beneficiaryId: b.id, status: 'ACCEPTED', createdAt: { gte: startOfMonth } },
    });

    const usedKg = distributions.reduce((sum, d) => sum + Number(d.quantityKg), 0);
    const remainingKg = Number(b.monthlyQuotaKg) - usedKg;

    return {
      beneficiaryCode,
      monthlyQuotaKg: b.monthlyQuotaKg,
      usedKg,
      remainingKg,
      percentage: Math.round((usedKg / Number(b.monthlyQuotaKg)) * 100),
    };
  },

  /**
   * Records face biometric enrollment for a beneficiary.
   * In production, this would store actual face embeddings.
   */
  async enrollFace(id: string, faceData: Buffer) {
    await this.findById(id);
    return prisma.beneficiary.update({
      where: { id },
      data: { faceEmbedding: faceData, enrolledAt: new Date() },
    });
  },
};

// Satisfy TypeScript — UpdateBeneficiaryInput is available for future use
export type { UpdateBeneficiaryInput };
