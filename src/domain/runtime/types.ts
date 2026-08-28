// Enterprise Runtime Intelligence & Autonomous Operations Types
export type RuntimeTab =
  | 'DIAGNOSTICS'
  | 'AUTO_HEALING'
  | 'PROFILER'
  | 'ANALYZER'
  | 'CAPACITY_PLANNING'
  | 'PERFORMANCE_OPTIMIZER'
  | 'RUNTIME_DASHBOARD'
  | 'RUNTIME_REPLAY'
  | 'FAILURE_SIMULATION'
  | 'SECURITY_INTELLIGENCE';

// 1. Diagnostics Types
export interface ThreadPoolMetrics {
  poolName: string;
  coreSize: number;
  maxSize: number;
  activeThreads: number;
  queuedTasks: number;
  completedTasks: number;
  rejectedTasks: number;
  utilizationPct: number;
  threadState: 'OPTIMAL' | 'STRESSED' | 'SATURATED';
}

export interface EventLoopMetrics {
  lagMs: number;
  latencyP50: number;
  latencyP95: number;
  latencyP99: number;
  tickCount: number;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
}

export interface MemoryMetrics {
  rssMB: number;
  heapTotalMB: number;
  heapUsedMB: number;
  externalMB: number;
  arrayBuffersMB: number;
  fragmentationRatio: number;
  pressureLevel: 'NORMAL' | 'ELEVATED' | 'CRITICAL';
}

export interface GCMetrics {
  scavengeMinorCount: number;
  scavengeAvgPauseMs: number;
  markSweepMajorCount: number;
  markSweepAvgPauseMs: number;
  totalTimeReclaimedMB: number;
  gcOverheadPct: number;
}

export interface DBPoolMetrics {
  poolId: string;
  databaseName: string;
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  waitingThreads: number;
  saturationPct: number;
  avgAcquisitionTimeMs: number;
  maxLifetimeMinutes: number;
}

export interface KafkaLagMetrics {
  topic: string;
  partition: number;
  consumerGroup: string;
  currentOffset: number;
  logEndOffset: number;
  lag: number;
  consumptionRateMsgSec: number;
  status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL_LAG';
}

export interface RedisHealthMetrics {
  host: string;
  port: number;
  connectedClients: number;
  usedMemoryMB: number;
  maxMemoryMB: number;
  hitRatePct: number;
  evictionsPerSec: number;
  opsPerSec: number;
  p99LatencyMs: number;
  role: 'MASTER' | 'REPLICA';
}

export interface QueueDepthMetrics {
  queueName: string;
  engine: 'Kafka' | 'BullMQ' | 'RabbitMQ';
  depth: number;
  deadLetterCount: number;
  processingRatePerSec: number;
  slaBreach: boolean;
}

export interface SocketMetrics {
  totalOpenDescriptors: number;
  activeWebSockets: number;
  establishedTCP: number;
  timeWaitTCP: number;
  tlsHandshakesPerSec: number;
  packetDropRatePct: number;
}

// 2. Intelligent Auto-Healing Types
export type HealingActionType =
  | 'RESTART_POD'
  | 'EXPONENTIAL_RETRY'
  | 'CIRCUIT_BREAK'
  | 'TENANT_ISOLATION'
  | 'TRAFFIC_SHIFT'
  | 'AUTOMATIC_RECOVERY'
  | 'GRACEFUL_DEGRADATION';

export interface HealingPolicy {
  id: string;
  name: string;
  targetService: string;
  triggerCondition: string;
  action: HealingActionType;
  cooldownSeconds: number;
  maxAutoRetries: number;
  enabled: boolean;
  lastTriggered?: string;
  successRatePct: number;
}

export interface HealingExecutionEvent {
  id: string;
  timestamp: string;
  service: string;
  incidentType: string;
  actionTaken: HealingActionType;
  status: 'IN_PROGRESS' | 'RECOVERED' | 'ESCALATED_SOC';
  recoveryTimeMs: number;
  details: string;
  affectedTenants: string[];
}

// 3. Runtime Profiler Types
export interface SlowApiRecord {
  id: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  durationMs: number;
  p99ThresholdMs: number;
  timestamp: string;
  traceId: string;
  rootCause: string;
}

export interface SlowQueryRecord {
  id: string;
  querySummary: string;
  executionTimeMs: number;
  lockWaitTimeMs: number;
  rowsExamined: number;
  rowsReturned: number;
  planCost: number;
  table: string;
  missingIndexSuggestion?: string;
}

export interface MemoryLeakProfile {
  targetComponent: string;
  growthRateMBPerHour: number;
  retainedObjectTypes: { type: string; instances: number; sizeMB: number }[];
  confidenceScore: number;
  leakRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface LockContentionRecord {
  id: string;
  lockResource: string;
  holdingThread: string;
  waitingThreads: number;
  maxWaitTimeMs: number;
  severity: 'WARNING' | 'CRITICAL';
}

export interface DeadlockNode {
  id: string;
  threadName: string;
  holdingLock: string;
  waitingForLock: string;
  transactionId: string;
}

// 4. Runtime Analyzer Types
export interface BottleneckAnalysis {
  category: 'API' | 'DATABASE' | 'CACHE' | 'QUEUE' | 'NETWORK' | 'SERIALIZATION';
  component: string;
  impactScore: number; // 0 - 100
  metricObserved: string;
  recommendedFix: string;
  estimatedImprovementPct: number;
  autoFixAvailable: boolean;
}

// 5. Capacity Planning Types
export interface ResourceProjection {
  resourceName: string;
  unit: string;
  currentUsage: number;
  projected30Days: number;
  projected90Days: number;
  hardLimit: number;
  saturationDate: string;
  status: 'SUFFICIENT' | 'UPGRADE_RECOMMENDED' | 'CRITICAL_LIMIT';
  trendGrowthPct: number;
}

// 6. Automatic Optimization Types
export interface OptimizationRecommendation {
  id: string;
  type: 'INDEX' | 'CACHE' | 'QUERY_REWRITE' | 'PARTITION' | 'COMPRESSION';
  target: string;
  description: string;
  generatedCodeOrDDL: string;
  estimatedGain: string;
  applied: boolean;
}

// 7. Runtime Dashboard Types
export interface LiveTelemetrySnapshot {
  timestamp: string;
  tps: number;
  rps: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  errorRatePct: number;
  availabilitySLA: number;
  globalQueueSize: number;
  activeUsers: number;
  connectedPOSDevices: number;
  branchHealthScore: number;
  tenantHealthScore: number;
}

// 8. Runtime Replay Types
export interface ReplayEvent {
  stepIndex: number;
  timestamp: string;
  type: 'API_REQUEST' | 'DOMAIN_EVENT' | 'KAFKA_MESSAGE' | 'SAGA_STEP' | 'AUDIT_TRAIL';
  source: string;
  action: string;
  payload: Record<string, any>;
  status: 'SUCCESS' | 'FAILURE';
  durationMs: number;
}

export interface ReplayScenario {
  id: string;
  nameEn: string;
  nameAr: string;
  description: string;
  totalSteps: number;
  recordedAt: string;
  events: ReplayEvent[];
}

// 9. Failure Simulation Types
export type FailureChaosType =
  | 'DB_CRASH'
  | 'REDIS_FAILURE'
  | 'KAFKA_PARTITION_LOSS'
  | 'PAYMENT_MADA_TIMEOUT'
  | 'ZATCA_EGS_TIMEOUT'
  | 'REGION_NETWORK_PARTITION'
  | 'PACKET_LOSS_JITTER';

export interface ChaosExperiment {
  type: FailureChaosType;
  nameEn: string;
  nameAr: string;
  description: string;
  intensity: 'LOW' | 'MEDIUM' | 'SEVERE';
  active: boolean;
  expectedBehavior: string;
  actualObservedRecovery: string;
  recoveredInMs: number;
}

// 10. Security Intelligence Types
export interface SecurityThreatAlert {
  id: string;
  timestamp: string;
  threatType:
    | 'SESSION_HIJACKING'
    | 'TOKEN_REPLAY'
    | 'PRIVILEGE_ESCALATION'
    | 'SUSPICIOUS_API_USAGE'
    | 'INSIDER_THREAT'
    | 'CREDENTIAL_STUFFING'
    | 'API_ABUSE';
  severity: 'MEDIUM' | 'HIGH' | 'CRITICAL';
  sourceIp: string;
  userAgent: string;
  targetAccountOrTenant: string;
  evidence: string;
  automatedResponse: string;
  status: 'INTERCEPTED' | 'QUARANTINED' | 'BLOCKED';
}
