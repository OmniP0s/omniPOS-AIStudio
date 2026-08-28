export interface ExecutiveKpiSummary {
  totalRevenueSar: number;
  grossMarginPct: number;
  ebitdaMarginPct: number;
  activeBranchesCount: number;
  franchiseRoyaltiesEarnedSar: number;
  averageTableTurnMinutes: number;
  customerLtvSar: number;
  zatcaTotalTaxCollectedSar: number;
  kitchenPrepSpeedAvgMin: number;
  deliveryOnTimeRatePct: number;
}

export class EnterpriseOperationalIntelligenceEngine {
  public getExecutiveSummary(): ExecutiveKpiSummary {
    return {
      totalRevenueSar: 2480500.00,
      grossMarginPct: 68.4,
      ebitdaMarginPct: 24.2,
      activeBranchesCount: 18,
      franchiseRoyaltiesEarnedSar: 124025.00,
      averageTableTurnMinutes: 38.5,
      customerLtvSar: 840.00,
      zatcaTotalTaxCollectedSar: 372075.00,
      kitchenPrepSpeedAvgMin: 7.8,
      deliveryOnTimeRatePct: 98.2,
    };
  }
}

export const operationalIntelligenceEngine = new EnterpriseOperationalIntelligenceEngine();
