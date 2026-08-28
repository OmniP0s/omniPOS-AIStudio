// Enterprise Production Readiness & Governance Types

export interface ProductionCheckItem {
  id: string;
  category: 'ENVIRONMENT' | 'CONFIGURATION' | 'INFRASTRUCTURE' | 'DATABASE' | 'INTEGRATION' | 'SECURITY' | 'PERFORMANCE' | 'COMPLIANCE' | 'DR' | 'OFFLINE';
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  status: 'PASSED' | 'WARNING' | 'FAILED' | 'RUNNING';
  score: number;
  critical: boolean;
  metricValue?: string;
  threshold?: string;
  lastChecked: string;
  details?: string[];
}

export interface ReleaseApprovalRecord {
  id: string;
  version: string;
  releaseCandidate: string;
  environment: 'PRODUCTION' | 'STAGING' | 'DISASTER_RECOVERY';
  requestedBy: string;
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ROLLED_BACK';
  approvals: {
    role: 'VP_ENGINEERING' | 'HEAD_OF_SECURITY' | 'CHIEF_COMPLIANCE_OFFICER' | 'DEV_LEAD';
    approverName: string;
    approvedAt?: string;
    decision: 'APPROVED' | 'REJECTED' | 'PENDING';
    comments?: string;
  }[];
  rollbackPlanValidated: boolean;
  changeTicketRef: string;
}

export interface DynamicConfigItem {
  id: string;
  key: string;
  scope: 'GLOBAL' | 'REGION' | 'BRANCH' | 'DEVICE' | 'FEATURE';
  scopeTarget: string; // e.g. "ALL", "KSA", "BRANCH-001", "POS_MAIN"
  type: 'BOOLEAN' | 'STRING' | 'NUMBER' | 'JSON';
  value: any;
  defaultValue: any;
  version: number;
  environment: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION' | 'DR';
  updatedBy: string;
  updatedAt: string;
  history: {
    version: number;
    value: any;
    changedBy: string;
    changedAt: string;
    reason: string;
  }[];
}

export interface BusinessPolicy {
  id: string;
  nameEn: string;
  nameAr: string;
  category: 'APPROVAL' | 'COMPLIANCE' | 'OPERATIONAL' | 'SECURITY' | 'FINANCIAL';
  version: string;
  enabled: boolean;
  priority: number;
  conditionsJson: string; // Declarative Rule definition
  actionsJson: string;
  lastEvaluated: string;
  evaluationCount: number;
  passCount: number;
  failCount: number;
}

export interface DataEntityLineage {
  id: string;
  entityName: string;
  classification: 'CONFIDENTIAL' | 'PII' | 'FINANCIAL' | 'RESTRICTED' | 'PUBLIC';
  sourceSystem: string;
  storageTarget: string;
  transformations: string[];
  downstreamConsumers: string[];
  qualityScore: number;
  retentionPeriodMonths: number;
  anonymized: boolean;
}

export interface DistributedTraceSpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  serviceName: string;
  operationName: string;
  startTime: number;
  durationMs: number;
  statusCode: 'OK' | 'ERROR' | 'UNSET';
  httpMethod?: string;
  httpRoute?: string;
  dbStatement?: string;
  tags: Record<string, string>;
}

export interface CircuitBreakerStatus {
  name: string;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  successCount: number;
  thresholdFailures: number;
  timeoutMs: number;
  lastStateChange: string;
  avgLatencyMs: number;
  fallbackCalls: number;
}

export interface DeadLetterMessage {
  id: string;
  topic: string;
  originalPayload: string;
  errorReason: string;
  failedAttempts: number;
  firstFailedAt: string;
  lastFailedAt: string;
  status: 'PENDING' | 'REPLAYED' | 'PURGED' | 'RESOLVED';
}

export interface PerformanceHotspot {
  id: string;
  component: string;
  operation: string;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  invocationsPerSec: number;
  cpuCostPct: number;
  memoryAllocKB: number;
  recommendation: string;
  status: 'OPTIMAL' | 'NEEDS_OPTIMIZATION' | 'CRITICAL';
}

export interface SecurityThreatEvent {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';
  eventType: 'BRUTE_FORCE' | 'IMPOSSIBLE_TRAVEL' | 'ZATCA_TAMPERING' | 'UNAUTHORIZED_DRAWER' | 'TOKEN_MANIPULATION' | 'SQL_INJECTION_PROBE' | 'DEVICE_JAILBROKEN';
  sourceIp: string;
  userAgent: string;
  targetTenant: string;
  targetUser?: string;
  timestamp: string;
  mitigationApplied: string;
  status: 'BLOCKED' | 'INVESTIGATING' | 'RESOLVED';
}

export interface ComplianceStandardAudit {
  standard: 'PCI_DSS_V4' | 'ISO_27001' | 'SOC2_TYPE_II' | 'SAUDI_PDPL' | 'OWASP_ASVS_L3';
  title: string;
  totalControls: number;
  passedControls: number;
  failedControls: number;
  complianceScore: number;
  certifiedDate: string;
  auditor: string;
  evidenceItems: {
    controlId: string;
    controlName: string;
    status: 'COMPLIANT' | 'NON_COMPLIANT' | 'NOT_APPLICABLE';
    automatedProof: string;
  }[];
}

export interface DevSecOpsVulnerability {
  id: string;
  tool: 'SAST' | 'DAST' | 'SCA_DEPENDENCY' | 'CONTAINER' | 'SECRET_SCAN' | 'IAC_TERRAFORM';
  cveId?: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  component: string;
  fileLocation: string;
  lineNumber?: number;
  description: string;
  remediation: string;
  status: 'RESOLVED' | 'SUPPRESSED' | 'OPEN';
}

export interface DeploymentRelease {
  id: string;
  version: string;
  commitHash: string;
  strategy: 'BLUE_GREEN' | 'CANARY' | 'GITOPS_PROGRESSIVE';
  trafficSplitPct: number;
  healthStatus: 'HEALTHY' | 'DEGRADED' | 'ROLLING_BACK';
  deployedAt: string;
  canaryMetrics: {
    p99LatencyMs: number;
    errorRatePct: number;
    cpuLoadPct: number;
  };
  releaseNotes: string[];
}

export interface LoadTestScenario {
  concurrentUsers: 100 | 500 | 1000 | 5000 | 10000 | 25000 | 50000;
  throughputTps: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  cpuUtilizationPct: number;
  memoryUsageGB: number;
  dbIops: number;
  redisOpsSec: number;
  kafkaLagMessages: number;
  errorRatePct: number;
  status: 'PASSED' | 'WARNING' | 'FAILED';
}

export interface ChaosExperiment {
  id: string;
  name: string;
  faultType: 'NODE_FAILURE' | 'POD_CRASH' | 'DB_PRIMARY_FAILOVER' | 'REDIS_PARTITION' | 'KAFKA_BROKER_DOWN' | 'NETWORK_LATENCY_200MS' | 'REGION_BLACKOUT' | 'DISK_EXHAUSTION';
  targetSystem: string;
  blastRadiusPct: number;
  steadyStateMetric: string;
  recoveryTimeSec: number;
  slaTargetSec: number;
  result: 'RECOVERED_AUTOMATICALLY' | 'SLA_VIOLATED' | 'MANUAL_INTERVENTION_NEEDED';
  status: 'IDLE' | 'INJECTING' | 'RECOVERING' | 'VERIFIED';
}
