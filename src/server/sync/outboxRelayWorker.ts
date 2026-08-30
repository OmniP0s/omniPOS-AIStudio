// Enterprise Transactional Outbox Background Relay Worker & Dispatcher
// Dispatches pending events with lease-based concurrency control (SKIP LOCKED),
// exponential backoff, dead-letter queueing, idempotent consumer protection, and zero-leakage observability.

import { TenantRepositoryFactory } from '../db/tenantRepository';
import { OutboxMessage } from '../../domain/contracts/outbox';
import { sanitizeSensitiveData } from '../db/postgresOutboxService';

export interface DispatchAuditRecord {
  correlationId: string;
  eventId: string;
  tenantId: string;
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  retryCount: number;
  status: 'PROCESSED' | 'FAILED' | 'DEAD_LETTER' | 'ALREADY_PROCESSED';
  durationMs: number;
  workerId: string;
  timestamp: string;
  errorMessage?: string;
}

export interface DispatchResult {
  tenantId: string;
  workerId: string;
  totalPolled: number;
  processed: number;
  failed: number;
  deadLettered: number;
  auditTrail: DispatchAuditRecord[];
  errors: Array<{ messageId: string; error: string }>;
}

export type EventHandler = (tenantId: string, event: OutboxMessage) => Promise<any>;

export class OutboxRelayWorker {
  private static isRunning = false;
  private static timer: NodeJS.Timeout | null = null;
  private static workerInstanceId = `relay-worker-${process.pid || 1}-${Math.random().toString(36).substring(2, 7)}`;
  private static customHandlers = new Map<string, EventHandler>();

  public static getWorkerId(): string {
    return this.workerInstanceId;
  }

  public static registerHandler(eventType: string, handler: EventHandler): void {
    this.customHandlers.set(eventType, handler);
  }

  public static clearHandlers(): void {
    this.customHandlers.clear();
  }

  /**
   * Dispatches pending outbox events for a given tenant with lease acquisition,
   * consumer idempotency check, exponential backoff, and structured audit logs.
   */
  public static async dispatchTenantEvents(
    tenantId: string,
    batchSize: number = 25,
    leaseDurationSeconds: number = 60,
    workerId: string = this.workerInstanceId
  ): Promise<DispatchResult> {
    const outboxService = TenantRepositoryFactory.getOutboxService();
    const consumerIdempotency = TenantRepositoryFactory.getConsumerIdempotencyService();

    // Acquire lease using atomic SKIP LOCKED if supported, else getPendingBatch
    let pendingEvents: OutboxMessage[] = [];
    if ('acquireLeaseBatch' in outboxService && typeof (outboxService as any).acquireLeaseBatch === 'function') {
      pendingEvents = await (outboxService as any).acquireLeaseBatch(
        tenantId,
        workerId,
        batchSize,
        leaseDurationSeconds
      );
    } else {
      pendingEvents = await outboxService.getPendingBatch(tenantId, batchSize);
    }

    const result: DispatchResult = {
      tenantId,
      workerId,
      totalPolled: pendingEvents.length,
      processed: 0,
      failed: 0,
      deadLettered: 0,
      auditTrail: [],
      errors: [],
    };

    if (pendingEvents.length === 0) {
      return result;
    }

    for (const event of pendingEvents) {
      const startTime = Date.now();
      const correlationId = event.correlationId || `corr-${event.id}`;
      const currentRetry = Number(event.retryCount || 0);
      const maxRetries = Number(event.maxRetries || 5);

      try {
        // Downstream consumer idempotency enforcement
        const consumerId = `consumer-${event.aggregateType.toLowerCase()}-relay`;
        const idempotentExecution = await consumerIdempotency.executeIdempotent(
          tenantId,
          consumerId,
          event.id,
          async () => {
            await this.handleEvent(tenantId, event);
          },
          event.idempotencyKey
        );

        // Acknowledge outbox entry
        await outboxService.acknowledge(tenantId, event.id, event.idempotencyKey);
        result.processed++;

        const auditRecord: DispatchAuditRecord = {
          correlationId,
          eventId: event.id,
          tenantId,
          eventType: event.eventType,
          aggregateType: event.aggregateType,
          aggregateId: event.aggregateId,
          retryCount: currentRetry,
          status: idempotentExecution.alreadyProcessed ? 'ALREADY_PROCESSED' : 'PROCESSED',
          durationMs: Date.now() - startTime,
          workerId,
          timestamp: new Date().toISOString(),
        };
        result.auditTrail.push(auditRecord);
      } catch (err: any) {
        const rawErrorMsg = err?.message || 'Unknown handler error';
        const sanitizedError = sanitizeSensitiveData(rawErrorMsg);
        const durationMs = Date.now() - startTime;
        const willDeadLetter = currentRetry + 1 >= maxRetries;

        result.failed++;
        if (willDeadLetter) {
          result.deadLettered++;
        }
        result.errors.push({ messageId: event.id, error: sanitizedError });

        if ('markFailed' in outboxService && typeof (outboxService as any).markFailed === 'function') {
          await (outboxService as any).markFailed(tenantId, event.id, sanitizedError, maxRetries);
        }

        const auditRecord: DispatchAuditRecord = {
          correlationId,
          eventId: event.id,
          tenantId,
          eventType: event.eventType,
          aggregateType: event.aggregateType,
          aggregateId: event.aggregateId,
          retryCount: currentRetry + 1,
          status: willDeadLetter ? 'DEAD_LETTER' : 'FAILED',
          durationMs,
          workerId,
          timestamp: new Date().toISOString(),
          errorMessage: sanitizedError,
        };
        result.auditTrail.push(auditRecord);
      }
    }

    return result;
  }

  /**
   * Internal event handler routing with custom listener overrides
   */
  private static async handleEvent(tenantId: string, event: OutboxMessage): Promise<void> {
    if (this.customHandlers.has(event.eventType)) {
      const customHandler = this.customHandlers.get(event.eventType)!;
      await customHandler(tenantId, event);
      return;
    }

    switch (event.eventType) {
      case 'ORDER_CREATED':
      case 'ORDER_COMPLETED':
      case 'ORDER_PAID':
      case 'SHIFT_CLOSED':
      case 'INVENTORY_ADJUSTED':
      default:
        // Default business handler logic
        break;
    }
  }

  /**
   * Starts periodic polling for background relay across tenants
   */
  public static startPolling(intervalMs: number = 5000, tenantIds: string[] = ['tenant-sa-001']): void {
    if (this.isRunning) return;
    this.isRunning = true;

    this.timer = setInterval(async () => {
      for (const tenantId of tenantIds) {
        try {
          await this.dispatchTenantEvents(tenantId);
        } catch (err: any) {
          console.warn(`[Outbox Relay Poller Error] Tenant ${tenantId}:`, sanitizeSensitiveData(err.message));
        }
      }
    }, intervalMs);
  }

  /**
   * Stops background polling cleanly
   */
  public static stopPolling(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
  }
}
