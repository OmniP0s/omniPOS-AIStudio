/**
 * OmniPOS Enterprise AI Agents & Autonomous Automation Types
 * Sprint 3.2
 */

// ============================================================================
// 1. MULTI-AGENT FRAMEWORK & COMMUNICATION PROTOCOL
// ============================================================================

export type AgentRole =
  | 'PLANNER'
  | 'EXECUTOR'
  | 'REVIEWER'
  | 'VALIDATOR'
  | 'CRITIC'
  | 'SUPERVISOR';

export interface AgentDefinition {
  id: string;
  name: string;
  nameAr: string;
  role: AgentRole;
  description: string;
  capabilities: string[];
  systemPrompt: string;
  maxConcurrency: number;
  temperature: number;
  status: 'IDLE' | 'BUSY' | 'PAUSED' | 'ERROR';
  tasksCompleted: number;
  avgLatencyMs: number;
  accuracyScore: number;
}

export type MessageIntent =
  | 'TASK_DELEGATION'
  | 'STEP_EXECUTION'
  | 'CRITIQUE_REQUEST'
  | 'CRITIQUE_RESPONSE'
  | 'VALIDATION_REQUEST'
  | 'VALIDATION_RESULT'
  | 'SUPERVISORY_DIRECTIVE'
  | 'APPROVAL_REQUEST'
  | 'STATUS_UPDATE'
  | 'ERROR_ESCALATION';

export interface AgentMessageEnvelope {
  messageId: string;
  correlationId: string;
  traceId: string;
  senderAgentId: string;
  senderRole: AgentRole;
  recipientAgentId: string;
  recipientRole: AgentRole;
  intent: MessageIntent;
  timestamp: string;
  payload: Record<string, any>;
  metadata: {
    tenantId: string;
    priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
    requiresAck: boolean;
    ttlMs: number;
    securityClassification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
  };
  signature?: string;
}

// ============================================================================
// 2. DAG WORKFLOW & ORCHESTRATION ENGINE
// ============================================================================

export type WorkflowStatus =
  | 'DRAFT'
  | 'QUEUED'
  | 'RUNNING'
  | 'PAUSED_FOR_APPROVAL'
  | 'COMPLETED'
  | 'FAILED'
  | 'COMPENSATING'
  | 'CANCELLED';

export type TaskStepStatus =
  | 'PENDING'
  | 'WAITING_DEPENDENCIES'
  | 'IN_PROGRESS'
  | 'AWAITING_APPROVAL'
  | 'SUCCESS'
  | 'FAILED'
  | 'SKIPPED'
  | 'ROLLED_BACK';

export interface WorkflowStepNode {
  id: string;
  name: string;
  nameAr: string;
  assignedAgent: AgentRole;
  toolToExecute?: string;
  parameters: Record<string, any>;
  dependencies: string[]; // Step IDs that must succeed before this step runs
  requiresHumanApproval: boolean;
  approvalConditionDescription?: string;
  approvalThresholdSar?: number;
  timeoutMs: number;
  retryCount: number;
  maxRetries: number;
  status: TaskStepStatus;
  output?: any;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  compensationStepId?: string; // Rollback step if workflow fails downstream
}

export interface DagWorkflowPlan {
  workflowId: string;
  tenantId: string;
  workflowName: string;
  category: 'INVENTORY' | 'PROCUREMENT' | 'SCHEDULING' | 'MARKETING' | 'FINANCE' | 'CUSTOM';
  objective: string;
  status: WorkflowStatus;
  steps: WorkflowStepNode[];
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  totalDurationMs?: number;
  estimatedCostSar: number;
  actualCostSar: number;
  currentStepId?: string;
  approvalGateId?: string;
  executionLogs: {
    timestamp: string;
    stepId?: string;
    agentRole: AgentRole;
    level: 'INFO' | 'WARN' | 'ERROR' | 'AUDIT';
    message: string;
    data?: any;
  }[];
}

// ============================================================================
// 3. LONG RUNNING AUTONOMOUS TASKS
// ============================================================================

export interface LongRunningTaskState {
  taskId: string;
  tenantId: string;
  workflowId: string;
  taskTitle: string;
  progressPercent: number;
  status: WorkflowStatus;
  checkpointState: Record<string, any>;
  lastHeartbeat: string;
  activeAgentsCount: number;
  estimatedTimeRemainingSec: number;
  retryAttempts: number;
}

// ============================================================================
// 4. HUMAN APPROVAL GATES (HITL)
// ============================================================================

export type ApprovalDecision = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

export interface HumanApprovalGate {
  gateId: string;
  tenantId: string;
  workflowId: string;
  stepId: string;
  requestedByAgent: AgentRole;
  actionTitle: string;
  actionSummary: string;
  financialImpactSar?: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  policyTriggered: string;
  requiredRole: 'BRANCH_MANAGER' | 'PROCUREMENT_DIRECTOR' | 'CFO' | 'SYSTEM_ADMIN';
  status: ApprovalDecision;
  requestedAt: string;
  decidedAt?: string;
  decidedByUserId?: string;
  decidedByUserName?: string;
  decisionNotes?: string;
  autoExpireAt: string;
  payloadSnapshot: Record<string, any>;
}

// ============================================================================
// 5. ENTERPRISE TOOL MARKETPLACE
// ============================================================================

export interface ToolParameterSchema {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  defaultValue?: any;
}

export interface EnterpriseTool {
  toolId: string;
  name: string;
  nameAr: string;
  category: 'ERP_ZATCA' | 'INVENTORY' | 'STAFF' | 'CRM_MARKETING' | 'FINANCE' | 'SYSTEM';
  version: string;
  description: string;
  requiredPermission: string;
  riskTier: 'READ_ONLY' | 'LOW_MUTATION' | 'HIGH_MUTATION' | 'FINANCIAL_IMPACT';
  parameters: ToolParameterSchema[];
  isInstalled: boolean;
  rateLimitPerMin: number;
  usageCount: number;
  avgExecutionMs: number;
}

export interface ToolExecutionResult {
  toolId: string;
  executionId: string;
  success: boolean;
  statusCode: number;
  output: any;
  executionTimeMs: number;
  timestamp: string;
  auditHash: string;
}

// ============================================================================
// 6. AUTONOMOUS BUSINESS WORKFLOW MODELS
// ============================================================================

// 6.1 Inventory Auto Ordering
export interface InventoryAutoOrderResult {
  executionId: string;
  branchId: string;
  itemsAnalyzedCount: number;
  itemsNeedingReorder: {
    itemId: string;
    itemName: string;
    currentStock: number;
    reorderThreshold: number;
    recommendedOrderQty: number;
    unitPriceSar: number;
    totalCostSar: number;
    supplierId: string;
    supplierName: string;
    urgency: 'CRITICAL' | 'MODERATE' | 'ROUTINE';
  }[];
  generatedPurchaseOrders: {
    poNumber: string;
    supplierName: string;
    totalAmountSar: number;
    status: 'AUTO_APPROVED' | 'AWAITING_HUMAN_APPROVAL';
    approvalGateId?: string;
  }[];
  totalOrderValueSar: number;
  projectedStockoutAvoidanceHours: number;
}

// 6.2 Automatic Purchase Orders & 3-Way Matching
export interface ThreeWayMatchingResult {
  invoiceId: string;
  poNumber: string;
  supplierName: string;
  grnNumber: string; // Goods Received Note
  poAmountSar: number;
  grnAmountSar: number;
  invoiceAmountSar: number;
  varianceSar: number;
  variancePercentage: number;
  matchStatus: 'PERFECT_MATCH' | 'MINOR_VARIANCE_TOLERATED' | 'DISCREPANCY_FLAGGED';
  actionTaken: 'AUTO_PAID' | 'DISPUTE_RAISED' | 'PENDING_AUDIT';
  discrepancies: string[];
}

// 6.3 Smart Staff Scheduling
export interface SmartStaffScheduleResult {
  branchId: string;
  weekStartDate: string;
  totalLaborHours: number;
  projectedSalesSar: number;
  targetLaborCostPercentage: number;
  projectedLaborCostPercentage: number;
  shiftsGenerated: {
    shiftId: string;
    role: string;
    employeeId: string;
    employeeName: string;
    startTime: string;
    endTime: string;
    totalHours: number;
    isOvertime: boolean;
    saudiLaborLawCompliant: boolean;
  }[];
  complianceCheck: {
    maxWeeklyHoursEnforced: boolean;
    mandatoryRestHoursEnforced: boolean;
    saudizationRatioMet: boolean;
    currentSaudizationPct: number;
    targetSaudizationPct: number;
  };
}

// 6.4 Marketing Campaign Automation
export interface MarketingCampaignAutomationResult {
  campaignId: string;
  campaignName: string;
  targetSegment: 'CHAMPIONS' | 'LOYALISTS' | 'AT_RISK_VIP' | 'LAPSED';
  targetAudienceCount: number;
  offerType: 'DISCOUNT_PERCENT' | 'FREE_ITEM' | 'DOUBLE_POINTS';
  offerValue: string;
  channel: 'WHATSAPP' | 'SMS' | 'PUSH_NOTIFICATION';
  projectedUpliftGmvSar: number;
  marginSafetyApproved: boolean;
  dispatchStatus: 'TRIGGERED_TEST_RUN' | 'AWAITING_APPROVAL' | 'DISPATCHED';
}

// 6.5 Financial Closing Assistant
export interface FinancialClosingResult {
  closingDate: string;
  branchId: string;
  totalPosGrossSalesSar: number;
  zatcaReportedSalesSar: number;
  salesDiscrepancySar: number;
  cashExpectedSar: number;
  cashCountedSar: number;
  cashVarianceSar: number;
  cardSettlementSar: number;
  deliveryAggregatorSettlementSar: number;
  vatCollectedSar: number;
  glEntriesGeneratedCount: number;
  reconciliationStatus: 'BALANCED_AND_CLOSED' | 'VARIANCE_WITHIN_TOLERANCE' | 'ESCALATED_TO_AUDITOR';
  zatcaComplianceVerified: boolean;
}

// ============================================================================
// 7. ENTERPRISE KNOWLEDGE GRAPH
// ============================================================================

export type KnowledgeNodeType =
  | 'BRANCH'
  | 'MENU_ITEM'
  | 'INGREDIENT'
  | 'SUPPLIER'
  | 'EMPLOYEE'
  | 'POLICY'
  | 'ZATCA_REGULATION'
  | 'CAMPAIGN';

export type KnowledgeEdgeType =
  | 'SUPPLIES'
  | 'CONTAINS_INGREDIENT'
  | 'LOCATED_AT'
  | 'EMPLOYS'
  | 'GOVERNS'
  | 'TARGETS'
  | 'DEPENDS_ON';

export interface KnowledgeGraphNode {
  id: string;
  type: KnowledgeNodeType;
  label: string;
  labelAr: string;
  properties: Record<string, any>;
}

export interface KnowledgeGraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  type: KnowledgeEdgeType;
  weight: number;
  properties?: Record<string, any>;
}

export interface KnowledgeGraphQueryResult {
  query: string;
  nodesFound: KnowledgeGraphNode[];
  edgesFound: KnowledgeGraphEdge[];
  insights: string[];
  executionTimeMs: number;
}

// ============================================================================
// 8. AI EVALUATION FRAMEWORK
// ============================================================================

export interface EvaluationBenchmarkMetric {
  metricName: string;
  category: 'ACCURACY' | 'HALLUCINATION' | 'SAFETY' | 'COST' | 'LATENCY';
  targetScore: number;
  achievedScore: number;
  unit: string;
  status: 'PASS' | 'WARNING' | 'FAIL';
  benchmarkDetails: string;
}

export interface AiEvaluationRunReport {
  runId: string;
  timestamp: string;
  totalTestCases: number;
  passRatePercentage: number;
  accuracyScorePct: number;
  hallucinationRatePct: number;
  safetyScorePct: number;
  piiContainmentPct: number;
  costPer1kTokensSar: number;
  p50LatencyMs: number;
  p90LatencyMs: number;
  p99LatencyMs: number;
  metrics: EvaluationBenchmarkMetric[];
  overallCertificationGrade: 'AAA' | 'AA' | 'A' | 'B';
}

// ============================================================================
// 9. AI GOVERNANCE CENTER
// ============================================================================

export interface GovernancePolicyRule {
  ruleId: string;
  ruleName: string;
  ruleNameAr: string;
  category: 'FINANCIAL' | 'DATA_PRIVACY' | 'ZATCA_COMPLIANCE' | 'HR_LEGAL' | 'AUTONOMOUS_ACTIONS';
  conditionStatement: string;
  severity: 'BLOCKING' | 'REQUIRES_APPROVAL' | 'AUDIT_LOG_ONLY';
  isActive: boolean;
  lastEvaluatedAt: string;
  timesTriggered: number;
}

export interface MerkleAuditBlock {
  blockIndex: number;
  timestamp: string;
  tenantId: string;
  agentRole: AgentRole;
  actionTaken: string;
  payloadHash: string;
  previousHash: string;
  blockHash: string;
}

export interface TenantAiBudgetSummary {
  tenantId: string;
  monthlyBudgetSar: number;
  spentThisMonthSar: number;
  budgetUtilizationPct: number;
  projectedMonthEndSpendSar: number;
  costPerDepartment: {
    department: string;
    spendSar: number;
    tokenCount: number;
  }[];
  isThrottled: boolean;
}

// ============================================================================
// 10. AGENT MONITORING TELEMETRY
// ============================================================================

export interface AgentFleetTelemetry {
  activeAgents: number;
  queuedTasksCount: number;
  runningTasksCount: number;
  pendingApprovalsCount: number;
  completedTasksToday: number;
  avgWorkflowCompletionSec: number;
  totalTokensConsumedToday: number;
  totalCostIncurredSarToday: number;
  systemHealthScorePct: number;
}
