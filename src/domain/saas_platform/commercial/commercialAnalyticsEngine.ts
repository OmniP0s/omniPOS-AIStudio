// ============================================================================
// COMMERCIAL PLATFORM: REVENUE, COGS, LTV & CUSTOMER PLAN ENGINE
// ============================================================================

import { CommercialMetrics } from '../types';

export class CommercialAnalyticsEngine {
  private metrics: CommercialMetrics;

  constructor() {
    this.metrics = {
      mrrSar: 485000,
      arrSar: 5820000,
      nrrPct: 124.5,
      arpuSar: 3450,
      activePaidTenantsCount: 142,
      trialTenantsCount: 38,
      churnRatePct: 0.65,
      grossMarginPct: 84.2,
      monthlyCloudCogsSar: 48200,
      monthlyAiCogsSar: 28400,
      expansionRevenueThisMonthSar: 62400,
      topTenantsByRevenue: [
        {
          tenantId: 'tenant-al-diyafah-sa',
          name: 'Al-Diyafah Hospitality Group',
          branchesCount: 32,
          mrrSar: 18500,
          tier: 'FRANCHISE_GLOBAL',
        },
        {
          tenantId: 'tenant-sultan-burger-ksa',
          name: 'Sultan Burger Chain KSA',
          branchesCount: 24,
          mrrSar: 14200,
          tier: 'ENTERPRISE',
        },
        {
          tenantId: 'tenant-najd-village-rest',
          name: 'Najd Village Heritage Dining',
          branchesCount: 18,
          mrrSar: 11800,
          tier: 'ENTERPRISE',
        },
        {
          tenantId: 'tenant-shawarma-house-intl',
          name: 'Shawarma House International',
          branchesCount: 45,
          mrrSar: 24500,
          tier: 'FRANCHISE_GLOBAL',
        },
        {
          tenantId: 'tenant-roaster-coffee-lab',
          name: 'Specialty Roastery & Coffee Labs',
          branchesCount: 12,
          mrrSar: 8900,
          tier: 'GROWTH',
        },
      ],
    };
  }

  public getCommercialMetrics(): CommercialMetrics {
    return this.metrics;
  }

  public calculateUnitEconomics(tenantBranchesCount: number, monthlyOrdersCount: number): {
    estimatedMonthlyRevenueSar: number;
    estimatedCogsSar: number;
    estimatedGrossMarginSar: number;
    marginPct: number;
  } {
    const baseSubscriptionSar = tenantBranchesCount <= 2 ? 450 : tenantBranchesCount <= 10 ? 1250 : 2850 + (tenantBranchesCount - 10) * 150;
    const paymentGatewayTakeRateSar = monthlyOrdersCount * 0.15; // 15 halalas per order
    const totalRevSar = baseSubscriptionSar + paymentGatewayTakeRateSar;

    // Infrastructure COGS (Database compute + AI tokens + ZATCA signing + bandwidth)
    const computeCogsSar = tenantBranchesCount * 35;
    const aiCogsSar = (monthlyOrdersCount / 1000) * 2.5;
    const totalCogsSar = Math.round(computeCogsSar + aiCogsSar);
    const grossMarginSar = totalRevSar - totalCogsSar;
    const marginPct = parseFloat(((grossMarginSar / totalRevSar) * 100).toFixed(1));

    return {
      estimatedMonthlyRevenueSar: Math.round(totalRevSar),
      estimatedCogsSar: totalCogsSar,
      estimatedGrossMarginSar: Math.round(grossMarginSar),
      marginPct,
    };
  }
}

export const commercialAnalyticsEngine = new CommercialAnalyticsEngine();
