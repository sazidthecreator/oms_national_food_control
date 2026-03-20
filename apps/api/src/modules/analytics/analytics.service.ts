import { prisma } from '../../lib/prisma';

/** Analytics service providing dashboard metrics and intelligence reports */
export const analyticsService = {
  /**
   * Returns aggregated dashboard statistics.
   */
  async getDashboard() {
    const [totalBeneficiaries, activeDealers, todayDistributions, exceptions, duplicateBlocks] = await Promise.all([
      prisma.beneficiary.count({ where: { isActive: true } }),
      prisma.dealer.count({ where: { status: 'ACTIVE' } }),
      prisma.distribution.count({ where: { createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) }, status: 'ACCEPTED' } }),
      prisma.distribution.count({ where: { status: 'EXCEPTION' } }),
      prisma.duplicateBlock.count({ where: { attemptedAt: { gte: new Date(new Date().setHours(0,0,0,0)) } } }),
    ]);

    const complianceData = await prisma.dealer.aggregate({ _avg: { complianceScore: true }, where: { status: 'ACTIVE' } });

    return {
      totalBeneficiaries,
      activeDealers,
      todayDistributions,
      exceptions,
      duplicateBlocks,
      avgComplianceScore: complianceData._avg.complianceScore ?? 0,
    };
  },

  /**
   * Returns leakage trend data for the past 30 days.
   */
  async getLeakageTrend() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const blocks = await prisma.duplicateBlock.findMany({
      where: { attemptedAt: { gte: thirtyDaysAgo } },
      orderBy: { attemptedAt: 'asc' },
    });

    // Group by date
    const grouped = blocks.reduce((acc: Record<string, number>, block) => {
      const date = block.attemptedAt.toISOString().split('T')[0]!;
      acc[date] = (acc[date] ?? 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped).map(([date, count]) => ({ date, blockedAttempts: count }));
  },

  /**
   * Returns demand forecast based on historical distribution data.
   */
  async getDemandForecast() {
    const distributions = await prisma.distribution.groupBy({
      by: ['productType'],
      _sum: { quantityKg: true },
      where: { status: 'ACCEPTED', createdAt: { gte: new Date(new Date().setDate(1)) } },
    });

    return distributions.map(d => ({
      productType: d.productType,
      currentMonthKg: d._sum.quantityKg ?? 0,
      forecastNextMonthKg: Number(d._sum.quantityKg ?? 0) * 1.05,
    }));
  },

  /**
   * Returns dealer risk assessment based on compliance scores and exception rates.
   */
  async getDealerRisk() {
    const dealers = await prisma.dealer.findMany({
      where: { status: 'ACTIVE', complianceScore: { lt: 80 } },
      orderBy: { complianceScore: 'asc' },
      take: 20,
    });

    return dealers.map(d => ({
      id: d.id,
      dealerCode: d.dealerCode,
      name: d.name,
      complianceScore: d.complianceScore,
      riskLevel: Number(d.complianceScore) < 60 ? 'HIGH' : 'MEDIUM',
    }));
  },

  /**
   * Returns anomaly detections (dealers with unusual distribution patterns).
   */
  async getAnomalies() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const highVolumeDistributions = await prisma.distribution.groupBy({
      by: ['dealerId'],
      _count: { id: true },
      _sum: { quantityKg: true },
      where: { createdAt: { gte: today } },
      having: { id: { _count: { gt: 100 } } },
    });

    return highVolumeDistributions.map(d => ({
      dealerId: d.dealerId,
      transactionCount: d._count.id,
      totalKg: d._sum.quantityKg ?? 0,
      anomalyType: 'HIGH_VOLUME',
    }));
  },
};
