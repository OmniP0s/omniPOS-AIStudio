import { CircuitBreakerStatus, DeadLetterMessage } from '../../types/production';

export interface BulkheadPartition {
  id: string;
  name: string;
  maxConcurrentCalls: number;
  currentActiveCalls: number;
  queueCapacity: number;
  currentQueueLength: number;
  rejectedCallsToday: number;
  status: 'HEALTHY' | 'SATURATED';
}

export class EnterpriseReliabilityEngine {
  private circuitBreakers: CircuitBreakerStatus[] = [
    {
      name: 'ZATCA Fatoora Portal API',
      state: 'CLOSED',
      failureCount: 0,
      successCount: 28410,
      thresholdFailures: 5,
      timeoutMs: 3000,
      lastStateChange: new Date(Date.now() - 86400000).toISOString(),
      avgLatencyMs: 142,
      fallbackCalls: 0,
    },
    {
      name: 'Jahez Aggregator Webhook Receiver',
      state: 'CLOSED',
      failureCount: 0,
      successCount: 4210,
      thresholdFailures: 3,
      timeoutMs: 2000,
      lastStateChange: new Date(Date.now() - 43200000).toISOString(),
      avgLatencyMs: 48,
      fallbackCalls: 0,
    },
    {
      name: 'Mada Payment Host Terminal Protocol',
      state: 'CLOSED',
      failureCount: 0,
      successCount: 19820,
      thresholdFailures: 4,
      timeoutMs: 5000,
      lastStateChange: new Date(Date.now() - 120000000).toISOString(),
      avgLatencyMs: 82,
      fallbackCalls: 0,
    },
    {
      name: 'SAP S/4HANA Enterprise RFC',
      state: 'CLOSED',
      failureCount: 1,
      successCount: 1140,
      thresholdFailures: 5,
      timeoutMs: 8000,
      lastStateChange: new Date(Date.now() - 7200000).toISOString(),
      avgLatencyMs: 210,
      fallbackCalls: 2,
    }
  ];

  private bulkheads: BulkheadPartition[] = [
    {
      id: 'BLK-01',
      name: 'POS Main Checkout Core',
      maxConcurrentCalls: 1000,
      currentActiveCalls: 38,
      queueCapacity: 5000,
      currentQueueLength: 0,
      rejectedCallsToday: 0,
      status: 'HEALTHY',
    },
    {
      id: 'BLK-02',
      name: 'Kitchen KDS Real-Time Stream',
      maxConcurrentCalls: 500,
      currentActiveCalls: 14,
      queueCapacity: 2000,
      currentQueueLength: 0,
      rejectedCallsToday: 0,
      status: 'HEALTHY',
    },
    {
      id: 'BLK-03',
      name: 'External Aggregator Webhooks',
      maxConcurrentCalls: 200,
      currentActiveCalls: 8,
      queueCapacity: 1000,
      currentQueueLength: 0,
      rejectedCallsToday: 0,
      status: 'HEALTHY',
    },
    {
      id: 'BLK-04',
      name: 'Heavy BI / Financial Export Engine',
      maxConcurrentCalls: 50,
      currentActiveCalls: 2,
      queueCapacity: 100,
      currentQueueLength: 0,
      rejectedCallsToday: 0,
      status: 'HEALTHY',
    }
  ];

  private dlqMessages: DeadLetterMessage[] = [
    {
      id: 'DLQ-901',
      topic: 'zatca.invoice.clearance',
      originalPayload: JSON.stringify({ invoiceNumber: 'INV-2026-8910', vat: '300000000000003', amount: 450.00 }),
      errorReason: 'ZATCA upstream maintenance window (HTTP 503 Service Temporarily Unavailable)',
      failedAttempts: 3,
      firstFailedAt: new Date(Date.now() - 1800000).toISOString(),
      lastFailedAt: new Date(Date.now() - 600000).toISOString(),
      status: 'PENDING',
    },
    {
      id: 'DLQ-902',
      topic: 'erp.journal.posting',
      originalPayload: JSON.stringify({ journalId: 'JRN-4821', poRef: 'PO-8812', amount: 12500.00 }),
      errorReason: 'ERP Lock Conflict on Account 2100 (Accounts Payable)',
      failedAttempts: 4,
      firstFailedAt: new Date(Date.now() - 3600000).toISOString(),
      lastFailedAt: new Date(Date.now() - 1200000).toISOString(),
      status: 'PENDING',
    }
  ];

  public getCircuitBreakers(): CircuitBreakerStatus[] {
    return this.circuitBreakers;
  }

  public getBulkheads(): BulkheadPartition[] {
    return this.bulkheads;
  }

  public getDlqMessages(): DeadLetterMessage[] {
    return this.dlqMessages;
  }

  public replayDlqMessage(id: string): DeadLetterMessage {
    const msg = this.dlqMessages.find(m => m.id === id);
    if (!msg) throw new Error(`DLQ message ${id} not found`);
    msg.status = 'REPLAYED';
    return msg;
  }

  public purgeDlqMessage(id: string): DeadLetterMessage {
    const msg = this.dlqMessages.find(m => m.id === id);
    if (!msg) throw new Error(`DLQ message ${id} not found`);
    msg.status = 'PURGED';
    return msg;
  }

  public tripCircuitBreaker(name: string, state: 'OPEN' | 'HALF_OPEN' | 'CLOSED'): CircuitBreakerStatus {
    const cb = this.circuitBreakers.find(c => c.name === name);
    if (!cb) throw new Error(`Circuit breaker ${name} not found`);
    cb.state = state;
    cb.lastStateChange = new Date().toISOString();
    return cb;
  }
}

export const reliabilityEngine = new EnterpriseReliabilityEngine();
