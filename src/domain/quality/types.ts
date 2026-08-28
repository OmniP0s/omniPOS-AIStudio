export type QualityTab =
  | 'TEST_MANAGEMENT'
  | 'SYNTHETIC_TRANSACTIONS'
  | 'SOAK_TESTING'
  | 'MASSIVE_SCALE'
  | 'API_CERTIFICATION'
  | 'DATABASE_CERTIFICATION'
  | 'SECURITY_CERTIFICATION'
  | 'ACCESSIBILITY_CERTIFICATION'
  | 'UX_CERTIFICATION'
  | 'READINESS_SCORE'
  | 'PHASE11_GLOBAL_RELEASE';

export type TestCategory = 'SMOKE' | 'SANITY' | 'REGRESSION' | 'RISK_BASED' | 'E2E' | 'INTEGRATION' | 'UNIT';
export type TestStatus = 'PASSED' | 'FAILED' | 'BLOCKED' | 'SKIPPED' | 'RUNNING' | 'PENDING';
export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface TestCase {
  id: string;
  code: string;
  titleEn: string;
  titleAr: string;
  suiteId: string;
  category: TestCategory;
  riskLevel: RiskLevel;
  rpn: number; // Risk Priority Number (Severity x Occurrence x Detection)
  automated: boolean;
  status: TestStatus;
  executionTimeMs: number;
  lastExecuted: string;
  assertions: number;
  passedAssertions: number;
  errorMessage?: string;
  tags: string[];
}

export interface TestSuite {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  planId: string;
  category: TestCategory;
  totalCases: number;
  passedCases: number;
  failedCases: number;
  durationSeconds: number;
  coveragePercentage: number;
}

export interface TestPlan {
  id: string;
  nameEn: string;
  nameAr: string;
  version: string;
  targetRelease: string;
  status: 'DRAFT' | 'ACTIVE' | 'APPROVED' | 'COMPLETED';
  suitesCount: number;
  totalCases: number;
  passRate: number;
  leadEngineer: string;
}

export interface SyntheticWorker {
  id: string;
  name: string;
  branchName: string;
  terminalId: string;
  currentStep: 'LOGIN' | 'OPEN_SHIFT' | 'CREATE_ORDER' | 'SEND_KITCHEN' | 'PAY_MADA' | 'PRINT_RECEIPT' | 'ZATCA_INVOICE' | 'CLOSE_SHIFT' | 'IDLE';
  status: 'RUNNING' | 'PAUSED' | 'FAILED' | 'COMPLETED';
  completedCycles: number;
  avgCycleTimeSec: number;
  slaPassRate: number;
  lastCycleLatencyMs: number;
  activeSince: string;
  logs: { timestamp: string; step: string; latencyMs: number; success: boolean; details: string }[];
}

export interface SoakTestMetrics {
  durationDays: number;
  targetDays: 7 | 30;
  status: 'RUNNING' | 'COMPLETED' | 'PAUSED';
  startTime: string;
  uptimePercentage: number;
  totalOrdersProcessed: number;
  memoryRssMb: number;
  memoryHeapUsedMb: number;
  heapGrowthSlope: number; // MB per day (near zero = healthy)
  leakDetected: boolean;
  activeThreads: number;
  threadStabilityScore: number;
  queueDepthRedis: number;
  queueDepthKafka: number;
  queueStabilityScore: number;
  gcPauseAverageMs: number;
  openFileDescriptors: number;
  timeSeries: { timestamp: string; rss: number; heap: number; threads: number; queue: number }[];
}

export interface MassiveScaleMetrics {
  targetBranches: number; // 10,000
  targetDevices: number; // 100,000
  targetOrdersPerDay: number; // 5,000,000
  targetConcurrentKitchens: number; // 25,000
  simulatedCustomers: number; // 12,500,000
  currentTps: number;
  peakTpsAchieved: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  errorRatePercent: number;
  cpuSaturationPercent: number;
  dbPoolSaturationPercent: number;
  networkThroughputGbps: number;
  status: 'WARMUP' | 'ACTIVE_STRESS' | 'PEAK_SPIKE' | 'COOLDOWN' | 'COMPLETED';
  activeBottleneck: string | null;
}

export interface ApiCertificationItem {
  id: string;
  protocol: 'REST' | 'OPENAPI_3_1' | 'GRAPHQL' | 'ASYNCAPI' | 'GRPC';
  contractName: string;
  status: 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT';
  specVersion: string;
  endpointsChecked: number;
  breakingChangesDetected: number;
  schemaValidationScore: number;
  latencySlaMs: number;
  details: string;
}

export interface DatabaseCertificationItem {
  id: string;
  category: 'INDEXES' | 'VACUUM' | 'BLOAT' | 'REPLICATION' | 'LOCKS' | 'PARTITIONS' | 'QUERY_PLANS';
  nameEn: string;
  nameAr: string;
  status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
  metricValue: string;
  threshold: string;
  recommendation: string;
  details: string;
}

export interface SecurityCertificationItem {
  id: string;
  standard: 'OWASP_ASVS_L4' | 'API_SECURITY_TOP_10' | 'SECRET_SCAN' | 'DEPENDENCY_AUDIT' | 'TLS_1_3' | 'CERTIFICATE_LIFECYCLE';
  code: string;
  titleEn: string;
  titleAr: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  cveOrRuleId: string;
  verifiedAt: string;
  remediation: string;
}

export interface AccessibilityCertificationItem {
  id: string;
  criterion: 'WCAG_2_2_AA' | 'KEYBOARD_NAV' | 'SCREEN_READER' | 'COLOR_CONTRAST' | 'RTL_LTR_PARITY';
  nameEn: string;
  nameAr: string;
  status: 'COMPLIANT' | 'WARNING' | 'FAILED';
  score: number;
  elementsChecked: number;
  violationsFound: number;
  details: string;
}

export interface UxCertificationMetrics {
  averageClicksPerOrder: number;
  orderWorkflowTimeSec: number;
  cashierSpeedOrdersPerMin: number;
  kitchenPrepAvgMinutes: number;
  operatorErrorRatePercent: number;
  cognitiveLoadIndex: number; // 0-100 (lower is better)
  operatorEfficiencyScore: number; // 0-100
  touchTargetCompliancePercent: number;
  darkLightModeParityScore: number;
}

export interface ProductionReadinessCategory {
  id: string;
  nameEn: string;
  nameAr: string;
  weight: number; // e.g. 10%
  score: number; // 0-100
  status: 'EXCELLENT' | 'GOOD' | 'NEEDS_WORK' | 'CRITICAL';
  strengthsEn: string[];
  strengthsAr: string[];
  deficienciesEn: string[];
  deficienciesAr: string[];
}

export interface ProductionReadinessReport {
  overallScore: number; // 0 - 100
  verdict: 'READY_FOR_GA' | 'CONDITIONAL_APPROVAL' | 'RELEASE_BLOCKED';
  evaluatedAt: string;
  categories: ProductionReadinessCategory[];
  executiveSummaryEn: string;
  executiveSummaryAr: string;
}

export interface GlobalReleaseGate {
  id: string;
  stepNumber: number;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  status: 'LOCKED' | 'IN_PROGRESS' | 'PASSED' | 'FAILED';
  signedOffBy: string | null;
  signedOffAt: string | null;
  mandatory: boolean;
  artifacts: string[];
}
