export type ErrorCategory =
  | 'VALIDATION'
  | 'DOMAIN'
  | 'SECURITY'
  | 'INFRASTRUCTURE'
  | 'INTEGRATION'
  | 'SYSTEM'
  | 'CONCURRENCY'
  | 'TRANSACTION';

export type ErrorSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'FATAL';

export interface LocalizedString {
  en: string;
  ar: string;
}

export interface EnterpriseErrorDefinition {
  errorCode: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  httpStatus: number;
  retryable: boolean;
  retryStrategy?: {
    maxRetries: number;
    backoffMs: number;
    exponential: boolean;
  };
  messageTemplate: LocalizedString;
  developerMessage: string;
  remediationAdviceEn?: string;
  remediationAdviceAr?: string;
}

export interface RFC7807ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  errorCode: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  retryable: boolean;
  timestamp: string;
  correlationId: string;
  traceId: string;
  spanId: string;
  invalidParams?: Array<{
    name: string;
    reason: string;
    value?: any;
  }>;
  extensions?: Record<string, any>;
}

export interface ValidationRuleResult {
  valid: boolean;
  field?: string;
  errorCode?: string;
  messageEn: string;
  messageAr: string;
  severity?: ErrorSeverity;
}

export interface ValidationContext {
  tenantId: string;
  branchId?: string;
  userId?: string;
  roles?: string[];
  locale?: 'en' | 'ar';
}

export type ValidationScope = 'DTO' | 'DOMAIN' | 'BUSINESS' | 'CROSS_ENTITY' | 'CROSS_SERVICE';

export interface HealthCheckNode {
  name: string;
  type: 'DATABASE' | 'CACHE' | 'MESSAGE_BROKER' | 'STORAGE' | 'EXTERNAL_API' | 'PAYMENT' | 'TAX_AUTHORITY';
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  latencyMs: number;
  critical: boolean;
  lastChecked: string;
  details: Record<string, any>;
}

export interface SystemHealthSummary {
  overallStatus: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  readiness: boolean;
  liveness: boolean;
  startup: boolean;
  timestamp: string;
  uptimeSeconds: number;
  nodes: HealthCheckNode[];
}

export interface SecretMetadata {
  id: string;
  name: string;
  type: 'JWT_KEY' | 'DB_CREDENTIALS' | 'ZATCA_CSID_PRIVATE_KEY' | 'PAYMENT_GATEWAY_SECRET' | 'TLS_CERTIFICATE' | 'KMS_MASTER_KEY';
  version: number;
  status: 'ACTIVE' | 'ROTATING' | 'REVOKED' | 'EXPIRED';
  vaultPath: string;
  createdAt: string;
  expiresAt: string;
  lastRotatedAt: string;
  rotationIntervalDays: number;
  autoRenew: boolean;
  fingerprintSha256: string;
}

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  createdAt: number;
  expiresAt: number;
  slidingTtlSeconds?: number;
  tags: string[];
  tenantId: string;
  version: number;
}

export interface DistributedLock {
  resource: string;
  token: string;
  fencingToken: number;
  acquiredAt: number;
  expiresAt: number;
  ttlMs: number;
  holderNodeId: string;
  purpose: 'SCHEDULED_JOB' | 'SAGA_STEP' | 'DUPLICATE_PREVENTION' | 'LEADER_ELECTION';
}

export interface StorageObjectMetadata {
  id: string;
  bucket: string;
  key: string;
  versionId: string;
  sizeBytes: number;
  contentType: string;
  checksumSha256: string;
  encryptionAlgorithm: 'AES_256_GCM_ENVELOPE' | 'KMS_MANAGED';
  virusScanStatus: 'PENDING' | 'CLEAN' | 'INFECTED';
  replicationStatus: 'REPLICATED_3_REGIONS' | 'SYNCING';
  lifecycleTier: 'HOT' | 'COOL_ARCHIVE' | 'ZATCA_COMPLIANT_VAULT_6YR';
  createdAt: string;
  isCurrentVersion: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: Record<string, any>;
  fields?: string[];
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total?: number;
    page?: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextCursor?: string;
    prevCursor?: string;
  };
}
