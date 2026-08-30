// Enterprise PostgreSQL Transactional Outbox Service & Consumer Idempotency Manager
// Implements IOutboxService, IOutboxStore, and IConsumerIdempotencyService
// Features: Parameterized SQL, PostgreSQL Row-Level Security, Atomic Leases (SKIP LOCKED), Exponential Backoff, DLQ, and PII Sanitization.

import pg from 'pg';
import {
  IOutboxService,
  IOutboxStore,
  IConsumerIdempotencyService,
  ConsumerEventRecord,
  OutboxEntry,
  OutboxMessage,
  SyncBatchResult,
} from '../../domain/contracts/outbox';
import { db } from './connection';

/**
 * Sanitizes sensitive fields (tokens, passwords, card PANs) before logging or persisting errors.
 */
export function sanitizeSensitiveData(input: any): any {
  if (!input) return input;
  if (typeof input === 'string') {
    return input
      .replace(/(Bearer\s+)[A-Za-z0-9-_.]+/gi, '$1[REDACTED]')
      .replace(/(password|secret|apiKey|token)["']?\s*[:=]\s*["']?[^"',\s]+["']?/gi, '$1: "[REDACTED]"')
      .replace(/\b(?:\d[ -]*?){13,16}\b/g, '[CARD_REDACTED]');
  }
  if (typeof input === 'object') {
    if (Array.isArray(input)) {
      return input.map(sanitizeSensitiveData);
    }
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(input)) {
      const lower = key.toLowerCase();
      if (
        lower.includes('password') ||
        lower.includes('secret') ||
        lower.includes('token') ||
        lower.includes('apikey') ||
        lower.includes('pan') ||
        lower.includes('cvv') ||
        lower.includes('authorization')
      ) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeSensitiveData(value);
      }
    }
    return sanitized;
  }
  return input;
}

export class PostgresOutboxService implements IOutboxService {
  constructor(private client?: pg.PoolClient) {}

  private async executeQuery<T = any>(sql: string, params: any[], tenantId: string): Promise<pg.QueryResult<T>> {
    if (this.client) {
      return this.client.query<T>(sql, params);
    }
    return db.query<T>(sql, params, tenantId);
  }

  /**
   * Enqueues an outbox message atomically into PostgreSQL outbox_events.
   * Enforces database-level idempotency via ON CONFLICT (tenant_id, idempotency_key) DO NOTHING.
   */
  public async enqueue(
    tenantId: string,
    message: Omit<OutboxMessage, 'status' | 'retryCount'>
  ): Promise<OutboxMessage> {
    const correlationId = message.correlationId || `corr-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const sanitizedPayload = sanitizeSensitiveData(message.payload);

    const sql = `
      INSERT INTO outbox_events (
        id, tenant_id, idempotency_key, aggregate_type, aggregate_id,
        event_type, payload, vector_clock, correlation_id, status, retry_count,
        max_retries, created_at, next_retry_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'PENDING', 0, $10, $11, CURRENT_TIMESTAMP)
      ON CONFLICT (tenant_id, idempotency_key) DO NOTHING
      RETURNING *;
    `;

    const res = await this.executeQuery<any>(
      sql,
      [
        message.id,
        tenantId,
        message.idempotencyKey,
        message.aggregateType,
        message.aggregateId,
        message.eventType,
        JSON.stringify(sanitizedPayload),
        JSON.stringify(message.vectorClock || {}),
        correlationId,
        message.maxRetries || 5,
        message.createdAt || new Date().toISOString(),
      ],
      tenantId
    );

    if (res.rows.length === 0) {
      // Event already existed due to idempotency constraint; retrieve existing
      const existing = await this.getByIdempotencyKey(tenantId, message.idempotencyKey);
      if (existing) return existing;
    }

    return {
      id: message.id,
      idempotencyKey: message.idempotencyKey,
      aggregateType: message.aggregateType,
      aggregateId: message.aggregateId,
      eventType: message.eventType,
      payload: sanitizedPayload,
      vectorClock: message.vectorClock || {},
      correlationId,
      status: 'PENDING',
      retryCount: 0,
      maxRetries: message.maxRetries || 5,
      createdAt: message.createdAt || new Date().toISOString(),
    };
  }

  public async getByIdempotencyKey(tenantId: string, idempotencyKey: string): Promise<OutboxMessage | null> {
    const res = await this.executeQuery<any>(
      `SELECT * FROM outbox_events WHERE tenant_id = $1 AND idempotency_key = $2 LIMIT 1`,
      [tenantId, idempotencyKey],
      tenantId
    );
    if (res.rows.length === 0) return null;
    return this.mapRowToMessage(res.rows[0]);
  }

  /**
   * Acquires a lease on a batch of pending/failed/expired outbox events atomically using FOR UPDATE SKIP LOCKED.
   * Prevents multiple concurrent relay workers from processing the same event.
   */
  public async acquireLeaseBatch(
    tenantId: string,
    workerId: string,
    batchSize: number = 25,
    leaseDurationSeconds: number = 60
  ): Promise<OutboxMessage[]> {
    const sql = `
      WITH claimable AS (
        SELECT id FROM outbox_events
        WHERE tenant_id = $1
          AND (
            status IN ('PENDING', 'FAILED')
            OR (status = 'PROCESSING' AND lease_expires_at <= CURRENT_TIMESTAMP)
          )
          AND retry_count < max_retries
          AND (next_retry_at IS NULL OR next_retry_at <= CURRENT_TIMESTAMP)
        ORDER BY created_at ASC
        LIMIT $2
        FOR UPDATE SKIP LOCKED
      )
      UPDATE outbox_events
      SET status = 'PROCESSING',
          locked_by = $3,
          locked_at = CURRENT_TIMESTAMP,
          lease_expires_at = CURRENT_TIMESTAMP + ($4 || ' seconds')::interval
      WHERE id IN (SELECT id FROM claimable)
      RETURNING *;
    `;

    const res = await this.executeQuery<any>(
      sql,
      [tenantId, batchSize, workerId, leaseDurationSeconds],
      tenantId
    );

    return res.rows.map((r) => this.mapRowToMessage(r));
  }

  public async getPendingBatch(tenantId: string, batchSize: number = 50): Promise<OutboxMessage[]> {
    const sql = `
      SELECT * FROM outbox_events
      WHERE tenant_id = $1
        AND (
          status IN ('PENDING', 'FAILED')
          OR (status = 'PROCESSING' AND lease_expires_at <= CURRENT_TIMESTAMP)
        )
        AND retry_count < max_retries
        AND (next_retry_at IS NULL OR next_retry_at <= CURRENT_TIMESTAMP)
      ORDER BY created_at ASC
      LIMIT $2;
    `;
    const res = await this.executeQuery<any>(sql, [tenantId, batchSize], tenantId);
    return res.rows.map((r) => this.mapRowToMessage(r));
  }

  public async acknowledge(tenantId: string, messageId: string, idempotencyKey: string): Promise<void> {
    const sql = `
      UPDATE outbox_events
      SET status = 'PROCESSED',
          processed_at = CURRENT_TIMESTAMP,
          error_message = NULL,
          locked_by = NULL,
          lease_expires_at = NULL
      WHERE tenant_id = $1 AND (id = $2 OR idempotency_key = $3);
    `;
    await this.executeQuery(sql, [tenantId, messageId, idempotencyKey], tenantId);
  }

  /**
   * Marks message as failed with exponential backoff and transitions to DEAD_LETTER when retries are exhausted.
   */
  public async markFailed(tenantId: string, messageId: string, error: string, maxRetries: number = 5): Promise<void> {
    const sanitizedError = sanitizeSensitiveData(error);
    const sql = `
      UPDATE outbox_events
      SET retry_count = retry_count + 1,
          status = CASE WHEN retry_count + 1 >= max_retries THEN 'DEAD_LETTER' ELSE 'FAILED' END,
          error_message = $3,
          locked_by = NULL,
          lease_expires_at = NULL,
          next_retry_at = CURRENT_TIMESTAMP + (LEAST(POWER(2, retry_count) * 2, 300) * INTERVAL '1 second')
      WHERE tenant_id = $1 AND id = $2;
    `;
    await this.executeQuery(sql, [tenantId, messageId, sanitizedError], tenantId);
  }

  public async processSyncBatch(tenantId: string, batch: OutboxMessage[]): Promise<SyncBatchResult> {
    const processedIds: string[] = [];
    const conflictedIds: string[] = [];
    const failedIds: string[] = [];

    // Sort deterministically by causal timestamps
    const sorted = [...batch].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    for (const msg of sorted) {
      try {
        await this.enqueue(tenantId, msg);
        await this.acknowledge(tenantId, msg.id, msg.idempotencyKey);
        processedIds.push(msg.id);
      } catch (err: any) {
        console.warn(`[Outbox Process Error] Message ${msg.id}:`, sanitizeSensitiveData(err.message));
        failedIds.push(msg.id);
      }
    }

    return {
      success: failedIds.length === 0,
      processedCount: processedIds.length,
      conflictedCount: conflictedIds.length,
      failedCount: failedIds.length,
      processedIds,
      conflictedIds,
      failedIds,
    };
  }

  private mapRowToMessage(row: any): OutboxMessage {
    return {
      id: row.id,
      idempotencyKey: row.idempotency_key,
      aggregateType: row.aggregate_type,
      aggregateId: row.aggregate_id,
      eventType: row.event_type,
      payload: typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload,
      vectorClock: typeof row.vector_clock === 'string' ? JSON.parse(row.vector_clock) : row.vector_clock || {},
      correlationId: row.correlation_id,
      status: row.status,
      retryCount: Number(row.retry_count || 0),
      maxRetries: Number(row.max_retries || 5),
      errorMessage: row.error_message,
      lockedBy: row.locked_by,
      lockedAt: row.locked_at ? new Date(row.locked_at).toISOString() : undefined,
      leaseExpiresAt: row.lease_expires_at ? new Date(row.lease_expires_at).toISOString() : undefined,
      nextRetryAt: row.next_retry_at ? new Date(row.next_retry_at).toISOString() : undefined,
      createdAt: new Date(row.created_at).toISOString(),
      processedAt: row.processed_at ? new Date(row.processed_at).toISOString() : undefined,
    };
  }
}

/**
 * PostgreSQL Implementation of Consumer Idempotency
 * Prevents downstream event handlers from processing duplicate deliveries.
 */
export class PostgresConsumerIdempotencyService implements IConsumerIdempotencyService {
  constructor(private client?: pg.PoolClient) {}

  private async executeQuery<T = any>(sql: string, params: any[], tenantId: string): Promise<pg.QueryResult<T>> {
    if (this.client) {
      return this.client.query<T>(sql, params);
    }
    return db.query<T>(sql, params, tenantId);
  }

  public async isEventProcessed(tenantId: string, consumerId: string, eventId: string): Promise<boolean> {
    const res = await this.executeQuery(
      `SELECT 1 FROM processed_consumer_events WHERE tenant_id = $1 AND consumer_id = $2 AND event_id = $3 LIMIT 1`,
      [tenantId, consumerId, eventId],
      tenantId
    );
    return res.rows.length > 0;
  }

  public async recordProcessedEvent(record: ConsumerEventRecord): Promise<void> {
    const sql = `
      INSERT INTO processed_consumer_events (
        id, tenant_id, consumer_id, event_id, idempotency_key, processed_at, result_summary
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (tenant_id, consumer_id, event_id) DO NOTHING;
    `;
    await this.executeQuery(
      sql,
      [
        record.id,
        record.tenantId,
        record.consumerId,
        record.eventId,
        record.idempotencyKey || null,
        record.processedAt || new Date().toISOString(),
        JSON.stringify(record.resultSummary || {}),
      ],
      record.tenantId
    );
  }

  public async executeIdempotent<T>(
    tenantId: string,
    consumerId: string,
    eventId: string,
    handler: () => Promise<T>,
    idempotencyKey?: string
  ): Promise<{ alreadyProcessed: boolean; result?: T }> {
    const already = await this.isEventProcessed(tenantId, consumerId, eventId);
    if (already) {
      return { alreadyProcessed: true };
    }

    const result = await handler();

    await this.recordProcessedEvent({
      id: `pce-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      tenantId,
      consumerId,
      eventId,
      idempotencyKey,
      processedAt: new Date().toISOString(),
      resultSummary: typeof result === 'object' ? sanitizeSensitiveData(result) : { success: true },
    });

    return { alreadyProcessed: false, result };
  }
}

/**
 * In-Memory Fallback Consumer Idempotency Manager (Development/Test Only)
 */
export class InMemoryConsumerIdempotencyService implements IConsumerIdempotencyService {
  private processedMap = new Map<string, ConsumerEventRecord>();

  private getCompositeKey(tenantId: string, consumerId: string, eventId: string): string {
    return `${tenantId}::${consumerId}::${eventId}`;
  }

  public async isEventProcessed(tenantId: string, consumerId: string, eventId: string): Promise<boolean> {
    return this.processedMap.has(this.getCompositeKey(tenantId, consumerId, eventId));
  }

  public async recordProcessedEvent(record: ConsumerEventRecord): Promise<void> {
    const key = this.getCompositeKey(record.tenantId, record.consumerId, record.eventId);
    this.processedMap.set(key, record);
  }

  public async executeIdempotent<T>(
    tenantId: string,
    consumerId: string,
    eventId: string,
    handler: () => Promise<T>,
    idempotencyKey?: string
  ): Promise<{ alreadyProcessed: boolean; result?: T }> {
    if (await this.isEventProcessed(tenantId, consumerId, eventId)) {
      return { alreadyProcessed: true };
    }
    const result = await handler();
    await this.recordProcessedEvent({
      id: `mem-pce-${Date.now()}`,
      tenantId,
      consumerId,
      eventId,
      idempotencyKey,
      processedAt: new Date().toISOString(),
      resultSummary: typeof result === 'object' ? sanitizeSensitiveData(result) : { success: true },
    });
    return { alreadyProcessed: false, result };
  }
}

export class PostgresOutboxStoreAdapter implements IOutboxStore {
  constructor(
    private outboxService: PostgresOutboxService = new PostgresOutboxService(),
    private tenantId: string = 'tenant-sa-001'
  ) {}

  async enqueue(entry: OutboxEntry): Promise<void> {
    await this.outboxService.enqueue(entry.tenantId || this.tenantId, {
      id: entry.id,
      idempotencyKey: entry.idempotencyKey,
      aggregateType: entry.entityType,
      aggregateId: entry.entityId,
      eventType: `${entry.entityType}_${entry.operation}`,
      payload: entry.payload,
      vectorClock: entry.vectorClock,
      createdAt: entry.createdAt,
    });
  }

  async peekPending(batchSize: number = 50): Promise<OutboxEntry[]> {
    const messages = await this.outboxService.getPendingBatch(this.tenantId, batchSize);
    return messages.map((m) => ({
      id: m.id,
      tenantId: this.tenantId,
      branchId: 'branch-01',
      terminalId: 'POS-01',
      entityType: (m.aggregateType as any) || 'ORDER',
      entityId: m.aggregateId,
      operation: 'CREATE',
      payload: m.payload,
      idempotencyKey: m.idempotencyKey,
      createdAt: m.createdAt,
      status: m.status as any,
      retryCount: m.retryCount || 0,
      vectorClock: m.vectorClock,
    }));
  }

  async markSynced(id: string): Promise<void> {
    await this.outboxService.acknowledge(this.tenantId, id, id);
  }

  async markFailed(id: string, error: string): Promise<void> {
    await this.outboxService.markFailed(this.tenantId, id, error);
  }

  async getPendingCount(): Promise<number> {
    const pending = await this.outboxService.getPendingBatch(this.tenantId, 1000);
    return pending.length;
  }

  async clearAll(): Promise<void> {
    if (db.isConfigured()) {
      await db.query(`DELETE FROM outbox_events WHERE tenant_id = $1`, [this.tenantId], this.tenantId);
    }
  }
}
