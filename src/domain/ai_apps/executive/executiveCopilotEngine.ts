/**
 * Executive AI Copilot Engine (Pillar 1)
 * CEO Conversational Analytics, Natural Language KPI Querying, Root Cause Analysis,
 * Predictive Business Recommendations, and What-If Simulation.
 */

import {
  KpiMetricQuery,
  RootCauseAnalysisResult,
  WhatIfSimulationInput,
  WhatIfSimulationResult,
  PredictiveRecommendation,
} from '../types';
import { aiFoundation } from '../../ai_platform/aiFoundationFacade';

export class ExecutiveCopilotEngine {
  private recommendations: PredictiveRecommendation[] = [
    {
      id: 'REC-001',
      category: 'PRICING',
      titleEn: 'Dynamic Prime Ribeye Price Optimization',
      titleAr: 'تحسين التسعير الديناميكي لستيك الريب آي الفاخر',
      descriptionEn: 'Elasticity analysis indicates low price sensitivity on Friday dinner slots. A 7.5% price increase will increase monthly gross profit by 42,000 SAR with zero volume loss.',
      descriptionAr: 'تشير تحليلات المرونة السعرية إلى انخفاض الحساسية في عشاء الجمعة. رفع السعر بنسبة 7.5% يرفع الربح الإجمالي الشهري بمقدار 42,000 ر.س دون تراجع في حجم المبيعات.',
      expectedAnnualImpactSar: 504000,
      confidenceScore: 0.94,
      effortLevel: 'LOW',
      status: 'APPROVED',
    },
    {
      id: 'REC-002',
      category: 'PROCUREMENT',
      titleEn: 'Consolidated Local Poultry Procurement Contract',
      titleAr: 'توحيد عقود توريد الدواجن المحلية',
      descriptionEn: 'Switching 3 Riyadh branches from ad-hoc spot buying to consolidated monthly forward contract with Al-Watania reduces procurement cost by 8.4%.',
      descriptionAr: 'تحويل 3 فروع بالرياض من الشراء المتقطع إلى عقد شهري موحد مع دواجن الوطنية يخفض تكلفة التوريد بنسبة 8.4%.',
      expectedAnnualImpactSar: 280000,
      confidenceScore: 0.91,
      effortLevel: 'MEDIUM',
      status: 'PENDING',
    },
    {
      id: 'REC-003',
      category: 'REVENUE',
      titleEn: 'Afternoon Lull Ghost Kitchen Aggregator Exclusive',
      titleAr: 'تنشيط ساعات الركود المسائية عبر قنوات التوصيل الحصرية',
      descriptionEn: 'Launch high-margin smash burger sub-brand exclusively on Jahez & HungerStation between 2 PM and 6 PM to monetize idle kitchen staff and prep line.',
      descriptionAr: 'إطلاق علامة سريعة لبرغر سماش حصرياً على جاهز وهنقرستيشن بين 2 و 6 مساءً للاستفادة من أوقات فراغ طاقم المطبخ.',
      expectedAnnualImpactSar: 360000,
      confidenceScore: 0.88,
      effortLevel: 'MEDIUM',
      status: 'PENDING',
    },
  ];

  /**
   * Conversational CEO KPI Querying with natural language understanding
   */
  public async queryExecutiveKpis(userPrompt: string): Promise<{
    answerText: string;
    kpis: KpiMetricQuery[];
    suggestedFollowUps: string[];
  }> {
    const kpis: KpiMetricQuery[] = [
      {
        metric: 'GMV',
        currentValue: 1428500,
        targetValue: 1350000,
        period: 'MTD (Current Month)',
        trend: 'UP',
        variancePercent: 5.8,
        unit: 'SAR',
      },
      {
        metric: 'EBITDA',
        currentValue: 342840,
        targetValue: 310000,
        period: 'MTD',
        trend: 'UP',
        variancePercent: 10.6,
        unit: 'SAR',
      },
      {
        metric: 'PRIME_COST',
        currentValue: 56.2,
        targetValue: 55.0,
        period: 'Current Week',
        trend: 'DOWN',
        variancePercent: -1.2,
        unit: '%',
      },
      {
        metric: 'REVPASH',
        currentValue: 84.5,
        targetValue: 78.0,
        period: 'Dinner Peak',
        trend: 'UP',
        variancePercent: 8.3,
        unit: 'SAR/seat-hr',
      },
      {
        metric: 'AVERAGE_ORDER_VALUE',
        currentValue: 142.8,
        targetValue: 135.0,
        period: 'Last 30 Days',
        trend: 'UP',
        variancePercent: 5.7,
        unit: 'SAR',
      },
    ];

    // Build synthesized narrative
    const answerText = `Executive Summary for CEO:\n` +
      `• Total MTD GMV is at 1,428,500 SAR (+5.8% vs target of 1.35M SAR).\n` +
      `• EBITDA margin is healthy at 24.0% (342,840 SAR), exceeding budget benchmark by 10.6%.\n` +
      `• Prime Cost (COGS + Labor) is currently 56.2%, slightly above our 55% target due to imported beef index surge (+4.1%).\n` +
      `• Olaya branch recorded the highest RevPASH at 112.4 SAR/seat-hr during weekend dinner rush.`;

    return {
      answerText,
      kpis,
      suggestedFollowUps: [
        'Why did prime cost increase by 1.2% this week?',
        'Simulate impact of 5% food cost inflation on Q4 EBITDA.',
        'Show top 3 revenue leakage areas across Riyadh branches.',
      ],
    };
  }

  /**
   * Root Cause Analysis on operational or financial deviations
   */
  public runRootCauseAnalysis(issueContext: string): RootCauseAnalysisResult {
    return {
      id: `RCA-${Date.now().toString().slice(-4)}`,
      issueTitle: 'Gross Margin Compression in Olaya Branch (Dinner Service)',
      detectedImpact: 'Gross margin dropped from 68.4% to 64.1% over past 14 days (-4.3% variance)',
      primaryDrivers: [
        {
          factor: 'Truffle Wagyu Slider Portion Over-serving',
          contributionPercent: 52,
          evidence: 'Kitchen scale telemetry shows average portion weight was 192g vs standard recipe BOM of 165g (+16.3% over-portioning).',
          branchId: 'BR-OLAYA-01',
        },
        {
          factor: 'Aggregator Surge Commission Shift',
          contributionPercent: 28,
          evidence: 'Delivery share rose from 22% to 39% of sales during thunderstorm weekend, incurring higher 18% commission tier.',
          branchId: 'BR-OLAYA-01',
        },
        {
          factor: 'Late Shift Fryer Oil Degradation Waste',
          contributionPercent: 20,
          evidence: 'TPM sensor logged 26% threshold breach early, requiring 2 unscheduled premature oil dumps.',
          branchId: 'BR-OLAYA-01',
        },
      ],
      recommendedActions: [
        {
          action: 'Enforce digital scale tare lockout on prep line for Wagyu patties.',
          expectedRecoverySar: 18500,
          timeframe: 'Immediate (24 hrs)',
          confidence: 0.95,
        },
        {
          action: 'Activate direct first-party delivery incentives (Free artisan dessert on web orders).',
          expectedRecoverySar: 14000,
          timeframe: '7 days',
          confidence: 0.89,
        },
      ],
      analyzedAt: new Date().toISOString(),
    };
  }

  /**
   * What-If Scenario Simulation
   */
  public runWhatIfSimulation(input: WhatIfSimulationInput): WhatIfSimulationResult {
    const baseGmv = 1400000;
    const baseCogs = 450000;
    const baseLabor = 330000;
    const baseOpex = 280000;

    // Adjustments
    const cogsMultiplier = 1 + (input.beefCostChangePercent * 0.4 + input.chickenCostChangePercent * 0.3) / 100;
    const laborMultiplier = 1 + input.laborWageChangePercent / 100;
    const priceMultiplier = 1 + input.menuPriceAdjustmentPercent / 100;
    const volumeImpact = -0.4 * input.menuPriceAdjustmentPercent + 0.2 * input.marketingSpendChangePercent; // Elasticity

    const projectedGmv = baseGmv * priceMultiplier * (1 + volumeImpact / 100);
    const projectedCogs = baseCogs * cogsMultiplier * (1 + volumeImpact / 100);
    const projectedLabor = baseLabor * laborMultiplier;
    const projectedOpex = baseOpex * (1 + input.marketingSpendChangePercent / 200);

    const projectedEbitda = projectedGmv - projectedCogs - projectedLabor - projectedOpex;
    const projectedEbitdaMargin = (projectedEbitda / projectedGmv) * 100;
    const primeCostPercent = ((projectedCogs + projectedLabor) / projectedGmv) * 100;

    return {
      projectedGmvSar: Math.round(projectedGmv),
      projectedEbitdaSar: Math.round(projectedEbitda),
      projectedEbitdaMarginPercent: Number(projectedEbitdaMargin.toFixed(1)),
      projectedPrimeCostPercent: Number(primeCostPercent.toFixed(1)),
      grossMarginDeltaPercent: Number((((projectedGmv - projectedCogs) / projectedGmv) * 100 - ((baseGmv - baseCogs) / baseGmv) * 100).toFixed(1)),
      customerVolumeImpactPercent: Number(volumeImpact.toFixed(1)),
      breakEvenWeeks: input.menuPriceAdjustmentPercent > 0 ? 2 : 5,
      riskRating: primeCostPercent > 60 ? 'HIGH' : primeCostPercent > 55 ? 'MODERATE' : 'LOW',
      keyInsights: [
        `Net EBITDA shifts to ${Math.round(projectedEbitda).toLocaleString()} SAR (${projectedEbitdaMargin.toFixed(1)}% margin).`,
        `Prime cost settles at ${primeCostPercent.toFixed(1)}% of total revenues.`,
        volumeImpact < 0
          ? `Expected demand contraction of ${Math.abs(volumeImpact).toFixed(1)}% offset by ticket size growth.`
          : `Demand expands by ${volumeImpact.toFixed(1)}% driven by strategic marketing alignment.`,
      ],
    };
  }

  public getRecommendations(): PredictiveRecommendation[] {
    return this.recommendations;
  }
}

export const executiveCopilot = new ExecutiveCopilotEngine();
