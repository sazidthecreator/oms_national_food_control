import { prisma } from '../../lib/prisma';
import { CreateDealerInput, UpdateDealerInput, PaginationInput } from './dealers.dto';

/** Service handling all dealer business logic */
export const dealersService = {
  /**
   * Retrieves a paginated list of dealers with optional filtering.
   */
  async findAll(query: PaginationInput) {
    const { page, limit, search, status } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(status ? { status } : {}),
      ...(search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { dealerCode: { contains: search, mode: 'insensitive' as const } },
          { phone: { contains: search } },
        ],
      } : {}),
    };

    const [data, total] = await Promise.all([
      prisma.dealer.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.dealer.count({ where }),
    ]);

    return { data, total, page, limit, hasNext: skip + data.length < total };
  },

  /**
   * Creates a new dealer record.
   */
  async create(input: CreateDealerInput) {
    const existing = await prisma.dealer.findUnique({ where: { dealerCode: input.dealerCode } });
    if (existing) {
      throw Object.assign(new Error('Dealer code already exists'), { statusCode: 409, code: 'DUPLICATE_DEALER_CODE' });
    }
    return prisma.dealer.create({ data: input });
  },

  /**
   * Retrieves a single dealer by ID.
   */
  async findById(id: string) {
    const dealer = await prisma.dealer.findUnique({ where: { id } });
    if (!dealer) {
      throw Object.assign(new Error('Dealer not found'), { statusCode: 404, code: 'NOT_FOUND' });
    }
    return dealer;
  },

  /**
   * Updates a dealer's details.
   */
  async update(id: string, input: UpdateDealerInput) {
    await this.findById(id);
    return prisma.dealer.update({ where: { id }, data: input });
  },

  /**
   * Approves a pending dealer.
   */
  async approve(id: string, approverId: string) {
    const dealer = await this.findById(id);
    if (dealer.status !== 'PENDING') {
      throw Object.assign(new Error('Only pending dealers can be approved'), { statusCode: 400, code: 'INVALID_STATUS' });
    }
    return prisma.dealer.update({
      where: { id },
      data: { status: 'ACTIVE', approvedBy: approverId, approvedAt: new Date() },
    });
  },

  /**
   * Suspends an active dealer.
   */
  async suspend(id: string) {
    const dealer = await this.findById(id);
    if (dealer.status !== 'ACTIVE') {
      throw Object.assign(new Error('Only active dealers can be suspended'), { statusCode: 400, code: 'INVALID_STATUS' });
    }
    return prisma.dealer.update({ where: { id }, data: { status: 'SUSPENDED' } });
  },

  /**
   * Retrieves all distribution transactions for a specific dealer.
   */
  async getTransactions(dealerId: string, query: PaginationInput) {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.distribution.findMany({
        where: { dealerId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.distribution.count({ where: { dealerId } }),
    ]);

    return { data, total, page, limit, hasNext: skip + data.length < total };
  },
};
