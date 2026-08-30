// Enterprise Offline-First Outbox & Delta Sync Contracts

export interface OutboxEntry<TPayload = any> {
  id: string;
  tenantId: string;
  branchId: string;
  terminalId: string;
  entityType: 'ORDER' | 'PAYMENT' | 'SHIFT' | 'INVENTORY' | 'ZATCA_INVOICE' | 'TABLE_STATUS';
  entityId: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE' | 'DISPATCH' | 'STAMP';
  payload: TPayload;
  idempotencyKey: string;
  createdAt: string;
  status: 'PENDING' | 'IN_FLIGHT' | 'PROCESSED' | 'SYNCED' | 'FAILED' | 'CONFLICT' | 'DEAD_LETTER';
  retryCount: number;
  lastError?: string;
  vectorClock: Record<string, number>;
}

export interface OutboxMessage {
  id: string;
  idempotencyKey: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  payload: any;
  vectorClock: Record<string, number>;
  createdAt: string;
  correlationId?: string;
  status?: 'PENDING' | 'IN_FLIGHT' | 'PROCESSING' | 'PROCESSED' | 'FAILED' | 'DEAD_LETTER';
  retryCount?: number;
  maxRetries?: number;
  errorMessage?: string;
  lockedBy?: string;
  lockedAt?: string;
  leaseExpiresAt?: string;
  nextRetryAt?: string;
  processedAt?: string;
}

export interface ConsumerEventRecord {
  id: string;
  tenantId: string;
  consumerId: string;
  eventId: string;
  idempotencyKey?: string;
  processedAt: string;
  resultSummary?: any;
}

export interface IConsumerIdempotencyService {
  isEventProcessed(tenantId: string, consumerId: string, eventId: string): Promise<boolean>;
  recordProcessedEvent(record: ConsumerEventRecord): Promise<void>;
  executeIdempotent<T>(
    tenantId: string,
    consumerId: string,
    eventId: string,
    handler: () => Promise<T>,
    idempotencyKey?: string
  ): Promise<{ alreadyProcessed: boolean; result?: T }>;
}

export interface SyncBatchResult {
  success: boolean;
  processedCount: number;
  conflictedCount: number;
  failedCount: number;
  processedIds: string[];
  conflictedIds: string[];
  failedIds: string[];
}

export interface IOutboxService {
  enqueue(tenantId: string, message: Omit<OutboxMessage, 'status' | 'retryCount'>): Promise<OutboxMessage>;
  getPendingBatch(tenantId: string, batchSize?: number): Promise<OutboxMessage[]>;
  acknowledge(tenantId: string, messageId: string, idempotencyKey: string): Promise<void>;
  processSyncBatch(tenantId: string, batch: OutboxMessage[]): Promise<SyncBatchResult>;
}

export interface IOutboxStore {
  enqueue(entry: OutboxEntry): Promise<void>;
  peekPending(batchSize?: number): Promise<OutboxEntry[]>;
  markSynced(id: string): Promise<void>;
  markFailed(id: string, error: string): Promise<void>;
  getPendingCount(): Promise<number>;
  clearAll(): Promise<void>;
}

export interface ISyncReconciler {
  reconcileBatch(entries: OutboxEntry[]): Promise<{
    syncedIds: string[];
    conflicts: Array<{ id: string; resolution: string; reason: string }>;
  }>;
}
