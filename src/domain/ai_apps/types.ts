/**
 * OmniPOS Enterprise AI Applications (Sprint 3.1)
 * TypeScript Definitions for all 10 Enterprise AI Pillars
 */

// ==========================================
// 1. EXECUTIVE AI COPILOT TYPES
// ==========================================

export interface KpiMetricQuery {
  metric: 'GMV' | 'EBITDA' | 'PRIME_COST' | 'NET_PROFIT' | 'REVPASH' | 'AVERAGE_ORDER_VALUE' | 'LABOR_COST_PERCENT';
  currentValue: number;
  targetValue: number;
  period: string;
  trend: 'UP' | 'DOWN' | 'STABLE';
  variancePercent: number;
  unit: string;
}

export interface RootCauseAnalysisResult {
  id: string;
  issueTitle: string;
  detectedImpact: string;
  primaryDrivers: Array<{
    factor: string;
    contributionPercent: number;
    evidence: string;
    branchId?: string;
  }>;
  recommendedActions: Array<{
    action: string;
    expectedRecoverySar: number;
    timeframe: string;
    confidence: number;
  }>;
  analyzedAt: string;
}

export interface WhatIfSimulationInput {
  beefCostChangePercent: number;
  chickenCostChangePercent: number;
  menuPriceAdjustmentPercent: number;
  laborWageChangePercent: number;
  marketingSpendChangePercent: number;
  projectedWeeks: number;
}

export interface WhatIfSimulationResult {
  projectedGmvSar: number;
  projectedEbitdaSar: number;
  projectedEbitdaMarginPercent: number;
  projectedPrimeCostPercent: number;
  grossMarginDeltaPercent: number;
  customerVolumeImpactPercent: number;
  breakEvenWeeks: number;
  riskRating: 'LOW' | 'MODERATE' | 'HIGH';
  keyInsights: string[];
}

export interface PredictiveRecommendation {
  id: string;
  category: 'REVENUE' | 'COST_SAVING' | 'EXPANSION' | 'PRICING' | 'PROCUREMENT';
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  expectedAnnualImpactSar: number;
  confidenceScore: number;
  effortLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED';
}

// ==========================================
// 2. RESTAURANT OPERATIONS COPILOT TYPES
// ==========================================

export interface KitchenOptimizationInsight {
  stationId: string;
  stationName: string;
  currentQueueDepth: number;
  averagePrepTimeMinutes: number;
  targetPrepTimeMinutes: number;
  bottleneckRisk: 'NORMAL' | 'WARNING' | 'CRITICAL';
  recommendedReallocation: string;
}

export interface WaitTimePrediction {
  partySize: number;
  currentWaitingParties: number;
  estimatedWaitMinutes: number;
  confidenceLowMinutes: number;
  confidenceHighMinutes: number;
  suggestedAction: string;
}

export interface StaffScheduleOptimization {
  branchId: string;
  branchName: string;
  date: string;
  hourlyRecommendations: Array<{
    hour: number;
    predictedGuestVolume: number;
    currentStaffAssigned: number;
    optimalStaffCount: number;
    variance: number;
    action: 'ADD_STAFF' | 'REDUCE_STAFF' | 'BALANCED';
  }>;
  totalLaborSavingsSar: number;
}

export interface BranchPerformanceRank {
  branchId: string;
  branchName: string;
  city: string;
  operationalScore: number; // 0-100
  tableTurnoverRate: number; // turns per hour
  orderAccuracyPercent: number;
  avgDeliveryPrepTimeMins: number;
  kdsSlaBreachRatePercent: number;
  aiSuggestedFix: string;
}

// ==========================================
// 3. CASHIER AI ASSISTANT TYPES
// ==========================================

export interface CashierVoiceTranscript {
  rawAudioText: string;
  detectedLanguage: 'ar-SA' | 'en-US' | 'ar-EG';
  intent: 'ADD_ITEM' | 'REMOVE_ITEM' | 'MODIFY_ITEM' | 'APPLY_DISCOUNT' | 'CHECKOUT' | 'QUERY_PRICE';
  extractedItems: Array<{
    sku: string;
    name: string;
    quantity: number;
    modifiers: string[];
    unitPriceSar: number;
  }>;
  confidence: number;
}

export interface SmartUpsellSuggestion {
  itemSku: string;
  itemNameEn: string;
  itemNameAr: string;
  reasonEn: string;
  reasonAr: string;
  priceSar: number;
  acceptanceProbabilityPercent: number;
  expectedMarginSar: number;
}

export interface SmartCouponRecommendation {
  couponCode: string;
  titleEn: string;
  titleAr: string;
  discountType: 'PERCENT' | 'FIXED_SAR' | 'FREE_ITEM';
  discountValue: number;
  minOrderValueSar: number;
  marginSafetyMarginPercent: number;
  isSafeToApply: boolean;
  justification: string;
}

export interface CashierErrorAlert {
  alertId: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  type: 'DOUBLE_SCAN' | 'EXCESSIVE_DISCOUNT' | 'MISSING_ALLERGEN_WARNING' | 'PRICE_OVERRIDE_ANOMALY';
  messageEn: string;
  messageAr: string;
  suggestedResolution: string;
}

// ==========================================
// 4. INVENTORY INTELLIGENCE TYPES
// ==========================================

export interface PurchaseForecastItem {
  ingredientId: string;
  nameEn: string;
  nameAr: string;
  currentStock: number;
  unit: string;
  predictedUsageNext7Days: number;
  recommendedOrderQty: number;
  supplierName: string;
  leadTimeDays: number;
  estimatedCostSar: number;
  urgency: 'IMMEDIATE' | 'UPCOMING' | 'ADEQUATE';
}

export interface ExpiryPredictionItem {
  batchId: string;
  ingredientName: string;
  quantityRemaining: number;
  unit: string;
  expiryDate: string;
  daysUntilExpiry: number;
  spoilageRiskScore: number; // 0-100
  suggestedAction: 'FIFO_EXPEDITE' | 'TRANSFER_BRANCH' | 'MENU_PROMO_SPECIAL' | 'DISCARD';
}

export interface SupplierRecommendation {
  supplierId: string;
  supplierName: string;
  ingredientCategory: string;
  reliabilityScorePercent: number;
  averagePriceIndex: number; // 1.0 = baseline
  onTimeDeliveryRatePercent: number;
  complianceRating: 'A+' | 'A' | 'B' | 'C';
  savingsOpportunitySar: number;
}

// ==========================================
// 5. FINANCE AI TYPES
// ==========================================

export interface CashFlowForecastDay {
  date: string;
  projectedInflowsSar: number;
  projectedOutflowsSar: number;
  netCashSar: number;
  cumulativeLiquiditySar: number;
  liquidityStatus: 'HEALTHY' | 'TIGHT' | 'DEFICIT_RISK';
}

export interface DishProfitabilityAnalysis {
  menuItemId: string;
  nameEn: string;
  nameAr: string;
  category: string;
  sellingPriceSar: number;
  foodCostSar: number;
  packagingCostSar: number;
  aggregatorFeeSar: number;
  netContributionMarginSar: number;
  marginPercent: number;
  classification: 'STAR' | 'PLOWHORSE' | 'PUZZLE' | 'DOG';
  aiOptimizationAdvice: string;
}

export interface ExpenseAnomaly {
  anomalyId: string;
  expenseCategory: 'UTILITIES' | 'RAW_MATERIALS' | 'MAINTENANCE' | 'AGGREGATOR_COMMISSION' | 'RENT';
  detectedAmountSar: number;
  historicalAverageSar: number;
  deviationPercent: number;
  branchName: string;
  riskSeverity: 'LOW' | 'MEDIUM' | 'HIGH';
  explanation: string;
}

// ==========================================
// 6. HR AI TYPES
// ==========================================

export interface AttendanceAnomaly {
  employeeId: string;
  employeeName: string;
  role: string;
  branchName: string;
  anomalyType: 'CHRONIC_TARDINESS' | 'UNAUTHORIZED_OVERTIME' | 'BUDDY_PUNCHING_SIGNAL' | 'UNUSUAL_ABSENCE';
  occurrenceCount: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendedHrAction: string;
}

export interface EmployeePerformanceInsight {
  employeeId: string;
  employeeName: string;
  role: string;
  branchName: string;
  speedOfServiceScore: number;
  upsellSuccessRatePercent: number;
  attendanceScore: number;
  customerSatisfactionScore: number;
  retentionRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  strengths: string[];
  coachingAreas: string[];
}

export interface EosgCalculationExplanation {
  employeeName: string;
  hireDate: string;
  terminationDate: string;
  yearsOfService: number;
  lastSalarySar: number;
  contractType: 'INDEFINITE' | 'FIXED_TERM';
  terminationReason: 'RESIGNATION' | 'TERMINATION_WITHOUT_CAUSE' | 'ARTICLE_80_DISMISSAL';
  statutoryEosgAmountSar: number;
  saudiLaborLawArticle: string;
  plainTextExplanationAr: string;
  plainTextExplanationEn: string;
}

// ==========================================
// 7. CUSTOMER INTELLIGENCE TYPES
// ==========================================

export interface CustomerSegmentProfile {
  segmentName: 'VIP_CHAMPIONS' | 'LOYAL_REGULARS' | 'POTENTIAL_LOYALISTS' | 'AT_RISK_CHURN' | 'HIBERNATING';
  customerCount: number;
  percentageOfCustomerBase: number;
  averageLtvSar: number;
  preferredOrderChannels: string[];
  recommendedMarketingPlay: string;
}

export interface ChurnPredictionItem {
  customerId: string;
  customerName: string;
  phone: string;
  daysSinceLastVisit: number;
  historicalTotalVisits: number;
  churnProbabilityPercent: number;
  churnDrivers: string[];
  winbackOffer: {
    discountTextAr: string;
    discountTextEn: string;
    incentiveCoupon: string;
  };
}

export interface PersonalizedMarketingCampaign {
  id: string;
  targetSegment: string;
  channel: 'WHATSAPP' | 'SMS' | 'PUSH_NOTIFICATION' | 'EMAIL';
  subjectLineAr?: string;
  subjectLineEn?: string;
  messageBodyAr: string;
  messageBodyEn: string;
  callToAction: string;
  estimatedReach: number;
  projectedRevenueSar: number;
  createdDate: string;
}

// ==========================================
// 8. AI DOCUMENT ASSISTANT TYPES
// ==========================================

export interface DocumentAnalysisResult {
  docId: string;
  docTitle: string;
  docType: 'SUPPLIER_INVOICE' | 'COMMERCIAL_LEASE' | 'SUPPLIER_CONTRACT' | 'KITCHEN_SOP';
  summaryEn: string;
  summaryAr: string;
  keyClauses: Array<{
    clauseTitle: string;
    content: string;
    riskLevel: 'SAFE' | 'ATTENTION' | 'DANGEROUS';
  }>;
  discrepanciesDetected?: Array<{
    field: string;
    expected: string;
    actual: string;
    financialVarianceSar?: number;
  }>;
  extractedMetadata: Record<string, string | number>;
}

// ==========================================
// 9. AI AGENT ORCHESTRATOR TYPES
// ==========================================

export type AgentRole = 'PLANNER' | 'EXECUTOR' | 'REVIEWER' | 'VALIDATOR';

export interface AgentStepTrace {
  stepNumber: number;
  agentRole: AgentRole;
  thought: string;
  actionTaken: string;
  toolInvoked?: string;
  observation: string;
  confidenceScore: number;
  timestamp: string;
}

export interface MultiAgentTaskPlan {
  taskId: string;
  goalPrompt: string;
  planSteps: Array<{
    stepNumber: number;
    description: string;
    assignedAgent: AgentRole;
    status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  }>;
  executionTraces: AgentStepTrace[];
  finalOutput: string;
  selfValidationPassed: boolean;
  totalTokensUsed: number;
  totalDurationMs: number;
}

// ==========================================
// 10. AI VERIFICATION & CERTIFICATION TYPES
// ==========================================

export interface AiFeatureBenchmark {
  featureName: string;
  pillar: string;
  p50LatencyMs: number;
  p95LatencyMs: number;
  tokenEfficiencyScore: number; // 0-100
  factualAccuracyScore: number; // 0-100
  hallucinationRatePercent: number; // 0-100 (lower is better)
  securityScanPassRatePercent: number;
  status: 'CERTIFIED_READY' | 'OPTIMIZATION_REQUIRED';
}

export interface ProductionAiCertificationReport {
  timestamp: string;
  systemVersion: string;
  totalFeaturesAudited: number;
  certifiedFeaturesCount: number;
  overallHealthScore: number;
  zatcaComplianceGrade: 'AAA' | 'AA' | 'A';
  saudiDataResidencyConfirmed: boolean;
  benchmarks: AiFeatureBenchmark[];
  certificationSeal: string;
}
