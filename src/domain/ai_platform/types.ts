/**
 * OmniPOS Enterprise AI Platform Foundation (Sprint 3.0)
 * Master Type System & Domain Definitions
 */

// ==========================================
// LEGACY PREDICTIVE TYPES (Backward Compatibility)
// ==========================================

export interface AiPredictionCard {
  id: string;
  task?: string;
  category?: string;
  titleEn: string;
  titleAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  confidenceScore: number;
  impactMetric?: string;
  impactPotential?: 'HIGH' | 'MEDIUM' | 'LOW';
  summaryEn?: string;
  summaryAr?: string;
  actionPayload?: string;
  recommendedActionEn?: string;
  recommendedActionAr?: string;
  status?: string;
  isApplied?: boolean;
}

export interface DemandForecastPoint {
  date: string;
  hour?: number;
  historicalGmv?: number;
  predictedGmv?: number;
  expectedGuestCount?: number;
  expectedRevenueSar?: number;
  upperConfidence?: number;
  lowerConfidence?: number;
  confidenceIntervalLow?: number;
  confidenceIntervalHigh?: number;
  suggestedStaffCount?: number;
  weatherFactor?: string;
  eventFactor?: string;
}

export interface PriceElasticityItem {
  sku?: string;
  menuItemId?: string;
  nameEn?: string;
  nameAr?: string;
  menuItemNameEn?: string;
  menuItemNameAr?: string;
  currentPriceSar: number;
  recommendedPriceSar: number;
  expectedMarginLiftPercent?: number;
  elasticityCoefficient: number;
  predictedVolumeChangePercent?: number;
  predictedRevenueImpactSar?: number;
  competitorBenchmarkSar?: number;
}

export interface FraudAnomalyAlert {
  id: string;
  orderId?: string;
  branchName?: string;
  cashierName: string;
  timestamp: string;
  anomalyType: 'SUSPICIOUS_DISCOUNT' | 'SUSPICIOUS_DISCOUNT_OVERRIDE' | 'VOID_AFTER_PRINT' | 'CASH_DRAWER_EXCESS' | 'NO_SALE_BURST';
  riskScore: number;
  descriptionEn?: string;
  descriptionAr?: string;
  details?: string;
  flaggedAmountSar?: number;
  status?: 'PENDING_REVIEW' | 'FLAGGED' | 'RESOLVED_INNOCENT' | 'CONFIRMED_FRAUD';
}

export interface VoiceOrderResult {
  rawTranscript?: string;
  rawAudioTranscript?: string;
  confidence: number;
  detectedIntent?: string;
  extractedCart?: Array<{
    itemSku: string;
    name: string;
    qty: number;
    modifiers?: string[];
    priceSar: number;
  }>;
  extractedItems?: Array<{
    name: string;
    quantity: number;
    notes?: string;
    unitPriceSar: number;
  }>;
  totalSar?: number;
  identifiedTable?: string;
  sentiment?: 'POSITIVE' | 'NEUTRAL' | 'URGENT';
}

// ==========================================
// 1. PROVIDER & MODEL REGISTRY TYPES
// ==========================================

export type AiProviderId = 'GOOGLE_GEMINI' | 'ANTHROPIC_CLAUDE' | 'OPENAI' | 'DEEPSEEK' | 'LOCAL_EDGE_ONNX';

export type ModelModality = 'TEXT' | 'IMAGE' | 'AUDIO' | 'VIDEO';

export type ModelStatus = 'ACTIVE' | 'DEPRECATED' | 'EXPERIMENTAL' | 'MAINTENANCE' | 'OUTAGE';

export type HealthStatus = 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE';

export interface ModelPricing {
  inputCostPer1kTokensUsd: number;
  outputCostPer1kTokensUsd: number;
  thinkingCostPer1kTokensUsd?: number;
  currencyExchangeRateSar: number; // e.g. 3.75 SAR / USD
}

export interface ModelCapabilities {
  maxContextTokens: number;
  maxOutputTokens: number;
  supportedModalities: ModelModality[];
  supportsToolCalling: boolean;
  supportsStructuredJson: boolean;
  supportsStreaming: boolean;
  supportsThinkingReasoning: boolean;
  supportsVision: boolean;
  supportsAudioInput: boolean;
}

export interface ModelHealth {
  status: HealthStatus;
  latencyP50Ms: number;
  latencyP95Ms: number;
  latencyP99Ms: number;
  successRateLastHour: number; // 0-100%
  lastHeartbeatAt: string;
  consecutiveFailures: number;
}

export interface RegisteredAiModel {
  id: string;
  provider: AiProviderId;
  modelName: string;
  displayName: string;
  version: string;
  aliases: string[];
  status: ModelStatus;
  capabilities: ModelCapabilities;
  pricing: ModelPricing;
  health: ModelHealth;
  descriptionEn: string;
  descriptionAr: string;
}

// ==========================================
// 2. AI GATEWAY & ROUTING TYPES
// ==========================================

export type LoadBalancingStrategy = 'ROUND_ROBIN' | 'WEIGHTED' | 'LEAST_LATENCY' | 'COST_AWARE' | 'PRIMARY_FAILOVER';

export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerConfig {
  failureThreshold: number; // Number of consecutive errors before opening
  cooldownPeriodMs: number; // Time before attempting half-open probe
  halfOpenSuccessThreshold: number; // Successes required to close breaker
}

export interface CircuitBreakerStatus {
  modelId: string;
  state: CircuitBreakerState;
  consecutiveFailures: number;
  lastStateChange: string;
  nextAttemptAllowedAt?: string;
}

export interface AiRequestOptions {
  modelId?: string;
  preferredProvider?: AiProviderId;
  temperature?: number;
  topP?: number;
  topK?: number;
  maxTokens?: number;
  thinkingLevel?: 'MINIMAL' | 'LOW' | 'HIGH';
  responseMimeType?: 'text/plain' | 'application/json';
  responseSchema?: Record<string, any>;
  tools?: AiToolDeclaration[];
  tenantId: string;
  branchId?: string;
  userId: string;
  userRole?: string;
  sessionMemoryId?: string;
  bypassCache?: boolean;
  budgetCapUsd?: number;
}

export interface AiMessagePart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
  functionCall?: {
    name: string;
    args: Record<string, any>;
    id?: string;
  };
  functionResponse?: {
    name: string;
    response: Record<string, any>;
    id?: string;
  };
}

export interface AiChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  parts: AiMessagePart[];
  timestamp?: string;
}

export interface AiTokenUsage {
  promptTokens: number;
  completionTokens: number;
  reasoningTokens?: number;
  totalTokens: number;
  estimatedCostUsd: number;
  estimatedCostSar: number;
}

export interface AiResponseMetadata {
  modelId: string;
  provider: AiProviderId;
  latencyMs: number;
  ttftMs?: number;
  tokenUsage: AiTokenUsage;
  finishReason: 'STOP' | 'MAX_TOKENS' | 'TOOL_CALLS' | 'SAFETY' | 'ERROR';
  wasCached: boolean;
  fallbackTriggered: boolean;
  securityChecksPassed: boolean;
  piiMaskedCount: number;
  traceId: string;
}

export interface AiCompletionResponse {
  content: string;
  jsonPayload?: any;
  toolCalls?: {
    name: string;
    args: Record<string, any>;
    id: string;
  }[];
  metadata: AiResponseMetadata;
  citations?: RagCitation[];
}

// ==========================================
// 3. PROMPT MANAGEMENT TYPES
// ==========================================

export type PromptApprovalStatus = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';

export type PromptVariableType = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON' | 'ARRAY';

export interface PromptVariableSchema {
  name: string;
  type: PromptVariableType;
  required: boolean;
  defaultValue?: any;
  descriptionEn: string;
  descriptionAr: string;
}

export interface PromptVersion {
  version: string;
  templateContent: string;
  variables: PromptVariableSchema[];
  systemInstruction?: string;
  temperature?: number;
  status: PromptApprovalStatus;
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  changeLogEn: string;
  changeLogAr: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  slug: string;
  category: 'POS' | 'INVENTORY' | 'FINANCIAL' | 'HR' | 'ZATCA' | 'KITCHEN' | 'MARKETING';
  descriptionEn: string;
  descriptionAr: string;
  currentVersion: string;
  versions: PromptVersion[];
  tags: string[];
  tenantId?: string; // If null, global system prompt
}

// ==========================================
// 4. VECTOR DATABASE & RAG TYPES
// ==========================================

export type DistanceMetric = 'COSINE_SIMILARITY' | 'EUCLIDEAN_DISTANCE' | 'DOT_PRODUCT';

export type ChunkingStrategy = 'FIXED_SIZE_WITH_OVERLAP' | 'SEMANTIC_PARAGRAPH' | 'RECURSIVE_HEADING';

export interface VectorDocumentChunk {
  id: string;
  documentId: string;
  tenantId: string;
  chunkIndex: number;
  text: string;
  embedding: number[];
  tokenCount: number;
  metadata: {
    title: string;
    category: string;
    branchId?: string;
    sourceUri?: string;
    pageNumber?: number;
    sectionHeading?: string;
    sensitivityLevel: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
    tags: string[];
    createdAt: string;
  };
}

export interface RagIngestionDocument {
  id: string;
  tenantId: string;
  title: string;
  category: string;
  content: string;
  fileType: 'MARKDOWN' | 'PDF' | 'JSON' | 'CSV' | 'TXT';
  sensitivityLevel: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
  metadata: Record<string, any>;
  createdAt: string;
  chunkCount?: number;
}

export interface RagSearchResult {
  chunk: VectorDocumentChunk;
  similarityScore: number; // 0 to 1
  bm25Score?: number;
  combinedHybridScore: number;
}

export interface RagCitation {
  documentId: string;
  documentTitle: string;
  chunkId: string;
  snippet: string;
  score: number;
  pageNumber?: number;
  sectionHeading?: string;
}

// ==========================================
// 5. AI SECURITY & ZERO-TRUST SHIELD TYPES
// ==========================================

export interface SecurityScanResult {
  isSafe: boolean;
  blockedReasons: string[];
  injectionRiskScore: number; // 0 to 100
  jailbreakDetected: boolean;
  piiRedacted: {
    originalType: 'NATIONAL_ID' | 'PAN_CARD' | 'IBAN' | 'PHONE' | 'EMAIL' | 'CUSTOMER_NAME';
    maskedCount: number;
    sampleTokens: string[];
  }[];
  secretsDetected: {
    secretType: 'API_KEY' | 'BEARER_TOKEN' | 'PASSWORD' | 'PRIVATE_KEY';
    count: number;
  }[];
  cleanedPrompt: string;
  deidentificationMap: Record<string, string>; // Maps redacted placeholder back to original if permitted
}

export interface OutputGuardrailResult {
  isValid: boolean;
  hallucinationScore: number; // 0 to 100
  schemaCompliant: boolean;
  policyViolations: string[];
  sanitizedOutput: string;
}

// ==========================================
// 6. AI AUDIT & GOVERNANCE TYPES
// ==========================================

export interface AiAuditLogEntry {
  id: string;
  traceId: string;
  timestamp: string;
  tenantId: string;
  branchId?: string;
  userId: string;
  userRole: string;
  modelId: string;
  provider: AiProviderId;
  promptSnippet: string;
  responseSnippet: string;
  tokenUsage: AiTokenUsage;
  latencyMs: number;
  costUsd: number;
  costSar: number;
  securityResult: {
    passed: boolean;
    injectionScore: number;
    piiRedactedCount: number;
  };
  toolCallsMade: string[];
  sha256Hash: string; // Tamper-evident blockchain/Merkle chain hash
  previousHash: string;
}

// ==========================================
// 7. AI MEMORY FRAMEWORK TYPES
// ==========================================

export type MemoryScope = 'SESSION' | 'BRANCH' | 'CUSTOMER' | 'ENTERPRISE_LONG_TERM';

export interface AiMemoryItem {
  id: string;
  scope: MemoryScope;
  tenantId: string;
  scopeId: string; // e.g. sessionId, branchId, customerId
  key: string;
  value: string;
  embedding?: number[];
  importanceScore: number; // 1 to 10
  accessCount: number;
  lastAccessedAt: string;
  expiresAt?: string;
  createdAt: string;
}

// ==========================================
// 8. TOOL CALLING FRAMEWORK TYPES
// ==========================================

export interface AiToolParameter {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  enum?: string[];
  properties?: Record<string, AiToolParameter>;
  required?: boolean;
}

export interface AiToolDeclaration {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, AiToolParameter>;
    required: string[];
  };
  requiredPermission: string; // e.g. 'pos:orders:create', 'inventory:stock:adjust'
  isIdempotent: boolean;
  timeoutMs: number;
}

export interface AiToolExecutionResult {
  toolName: string;
  callId: string;
  status: 'SUCCESS' | 'PERMISSION_DENIED' | 'TIMEOUT' | 'ERROR';
  resultPayload: Record<string, any>;
  executionDurationMs: number;
  errorMessage?: string;
}

// ==========================================
// 9. AI OBSERVABILITY & METRICS TYPES
// ==========================================

export interface AiObservabilityMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  avgTokensPerSec: number;
  totalTokensConsumed: number;
  totalSpendUsd: number;
  totalSpendSar: number;
  avgHallucinationScore: number;
  providerBreakdown: Record<AiProviderId, { requests: number; spendUsd: number; errorRate: number }>;
  modelBreakdown: Record<string, { requests: number; spendUsd: number; avgLatencyMs: number }>;
}

// ==========================================
// 10. AI CONFIGURATION & SAFETY PROFILES
// ==========================================

export type SafetyProfileType = 'STRICT_REGULATORY' | 'BALANCED_OPERATIONS' | 'CREATIVE_MARKETING';

export interface AiRuntimeConfig {
  activeProfile: SafetyProfileType;
  defaultModelId: string;
  fallbackModelId: string;
  loadBalancingStrategy: LoadBalancingStrategy;
  maxMonthlySpendUsd: number;
  currentMonthlySpendUsd: number;
  rateLimitRequestsPerMin: number;
  enforceZeroTrustSecurity: boolean;
  enableHybridRagSearch: boolean;
  cacheTtlSeconds: number;
  circuitBreaker: CircuitBreakerConfig;
}
