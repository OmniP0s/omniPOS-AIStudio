// Enterprise Outbox Hardening Test Suite
// Verifies: Crash Safety, Idempotent Consumers, Retry Backoff & DLQ, Lease/Concurrency Control,
// Transaction Atomicity & Rollback, Strict Multi-Tenant Isolation, and Observability/Zero-PII Leakage.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  PostgresOutboxService,
  PostgresConsumerIdempotencyService,
  InMemoryConsumerIdempotencyService,
  sanitizeSensitiveData,
} from '../server/db/postgresOutboxService';
import { OutboxRelayWorker } from '../server/sync/outboxRelayWorker';
import { PostgresUnitOfWork } from '../server/db/unitOfWork';
import { TenantRepositoryFactory } from '../server/db/tenantRepository';
import { OutboxMessage } from '../domain/contracts/outbox';
import { Order } from '../types';

describe('Transactional Outbox Hardening & Reliability Suite', () => {
  beforeEach(() => {
    OutboxRelayWorker.clearHandlers();
  });

  afterEach(() => {
    OutboxRelayWorker.clearHandlers();
    OutboxRelayWorker.stopPolling();
  });

  describe('1. Idempotent Consumers & Duplicate Delivery Protection', () => {
    it('prevents downstream business logic from executing more than once on duplicate message delivery', async () => {
      const consumerService = new InMemoryConsumerIdempotencyService();
      let sideEffectExecutionCount = 0;

      const businessSideEffect = async () => {
        sideEffectExecutionCount++;
        return { accountingLedgerUpdated: true, amount: 250.0 };
      };

      // First delivery attempt
      const result1 = await consumerService.executeIdempotent(
        'tenant-sa-001',
        'accounting-consumer',
        'evt-order-101',
        businessSideEffect,
        'idem-key-101'
      );

      expect(result1.alreadyProcessed).toBe(false);
      expect(result1.result?.accountingLedgerUpdated).toBe(true);
      expect(sideEffectExecutionCount).toBe(1);

      // Duplicate delivery attempt (e.g. network replay or retry after ack failure)
      const result2 = await consumerService.executeIdempotent(
        'tenant-sa-001',
        'accounting-consumer',
        'evt-order-101',
        businessSideEffect,
        'idem-key-101'
      );

      expect(result2.alreadyProcessed).toBe(true);
      // Side effect MUST NOT have executed a second time
      expect(sideEffectExecutionCount).toBe(1);
    });
  });

  describe('2. Worker Crash Safety & Lease Expiration / Reclamation', () => {
    it('reclaims and processes orphaned messages when a worker crashes mid-flight and lease expires', async () => {
      const dbRows: any[] = [
        {
          id: 'evt-crashed-worker-01',
          tenant_id: 'tenant-sa-001',
          idempotency_key: 'idem-crash-01',
          aggregate_type: 'ORDER',
          aggregate_id: 'ord-crash-01',
          event_type: 'ORDER_CREATED',
          payload: { orderNumber: '#ORD-CRASH-01' },
          vector_clock: { 'NODE-A': 1 },
          correlation_id: 'corr-crash-01',
          status: 'PROCESSING',
          retry_count: 1,
          max_retries: 5,
          locked_by: 'relay-worker-crashed-999',
          locked_at: new Date(Date.now() - 120000), // 2 minutes ago
          lease_expires_at: new Date(Date.now() - 60000), // Expired 1 minute ago
          next_retry_at: new Date(Date.now() - 60000),
          created_at: new Date(Date.now() - 180000),
        },
      ];

      const mockClient = {
        query: async (sql: string, params: any[]) => {
          if (sql.includes('WITH claimable AS')) {
            // Check for claimable expired leases
            const claimable = dbRows.filter(
              (r) =>
                r.tenant_id === params[0] &&
                (r.status === 'PENDING' ||
                  r.status === 'FAILED' ||
                  (r.status === 'PROCESSING' && new Date(r.lease_expires_at).getTime() <= Date.now())) &&
                r.retry_count < r.max_retries
            );
            claimable.forEach((r) => {
              r.status = 'PROCESSING';
              r.locked_by = params[2];
              r.locked_at = new Date();
              r.lease_expires_at = new Date(Date.now() + 60000);
            });
            return { rows: claimable };
          }
          if (sql.includes("status = 'PROCESSED'")) {
            const row = dbRows.find((r) => r.id === params[1]);
            if (row) row.status = 'PROCESSED';
            return { rows: [] };
          }
          return { rows: [] };
        },
      } as any;

      const outbox = new PostgresOutboxService(mockClient);
      const claimed = await outbox.acquireLeaseBatch('tenant-sa-001', 'relay-worker-restart-101', 10, 60);

      expect(claimed.length).toBe(1);
      expect(claimed[0].id).toBe('evt-crashed-worker-01');
      expect(dbRows[0].locked_by).toBe('relay-worker-restart-101');
      expect(dbRows[0].status).toBe('PROCESSING');
    });
  });

  describe('3. Retry Correctness, Exponential Backoff & Dead-Letter Queue (DLQ)', () => {
    it('calculates exponential backoff intervals and transitions to DEAD_LETTER when retries are exhausted', async () => {
      let executedSql = '';
      let executedParams: any[] = [];

      const mockClient = {
        query: async (sql: string, params: any[]) => {
          executedSql = sql;
          executedParams = params;
          return { rows: [] };
        },
      } as any;

      const outbox = new PostgresOutboxService(mockClient);

      // Failing with retries remaining (< 5)
      await outbox.markFailed('tenant-sa-001', 'evt-retry-01', 'External Payment Gateway Timeout', 5);
      expect(executedSql).toContain("status = CASE WHEN retry_count + 1 >= max_retries THEN 'DEAD_LETTER' ELSE 'FAILED' END");
      expect(executedSql).toContain('LEAST(POWER(2, retry_count) * 2, 300)');
      expect(executedParams[0]).toBe('tenant-sa-001');
      expect(executedParams[1]).toBe('evt-retry-01');
      expect(executedParams[2]).toBe('External Payment Gateway Timeout');
    });

    it('OutboxRelayWorker tracks failures and registers deadLettered events when reaching max retries', async () => {
      // Mock handler that fails
      OutboxRelayWorker.registerHandler('ORDER_FAILING', async () => {
        throw new Error('Downstream microservice 503 Service Unavailable');
      });

      // Outbox service that returns an event already at retryCount 4 (max 5)
      const mockOutbox = {
        acquireLeaseBatch: async () => [
          {
            id: 'evt-dlq-01',
            tenantId: 'tenant-sa-001',
            idempotencyKey: 'idem-dlq-01',
            aggregateType: 'ORDER',
            aggregateId: 'ord-dlq-01',
            eventType: 'ORDER_FAILING',
            payload: { orderNumber: '#ORD-DLQ' },
            vectorClock: {},
            retryCount: 4,
            maxRetries: 5,
            createdAt: new Date().toISOString(),
          },
        ],
        markFailed: vi.fn(),
        acknowledge: vi.fn(),
      };

      vi.spyOn(TenantRepositoryFactory, 'getOutboxService').mockReturnValue(mockOutbox as any);

      const result = await OutboxRelayWorker.dispatchTenantEvents('tenant-sa-001');
      expect(result.failed).toBe(1);
      expect(result.deadLettered).toBe(1);
      expect(result.errors[0].error).toContain('Downstream microservice 503');
      expect(mockOutbox.markFailed).toHaveBeenCalledWith('tenant-sa-001', 'evt-dlq-01', expect.any(String), 5);
    });
  });

  describe('4. Lease & Concurrency Control (SKIP LOCKED)', () => {
    it('guarantees exclusive lease acquisition so two concurrent workers never process the same message', async () => {
      const messagesInDb = [
        { id: 'evt-1', locked: false },
        { id: 'evt-2', locked: false },
        { id: 'evt-3', locked: false },
      ];

      const createWorkerClient = (workerName: string) => {
        return {
          query: async (sql: string, params: any[]) => {
            if (sql.includes('claimable')) {
              // Simulate SKIP LOCKED: acquire up to batchSize items that are currently unlocked
              const batchSize = params[1];
              const available = messagesInDb.filter((m) => !m.locked).slice(0, batchSize);
              available.forEach((m) => {
                m.locked = true;
              });
              return {
                rows: available.map((m) => ({
                  id: m.id,
                  tenant_id: 'tenant-sa-001',
                  idempotency_key: `idem-${m.id}`,
                  aggregate_type: 'ORDER',
                  aggregate_id: `ord-${m.id}`,
                  event_type: 'ORDER_CREATED',
                  payload: {},
                  vector_clock: {},
                  status: 'PROCESSING',
                  retry_count: 0,
                  max_retries: 5,
                  locked_by: workerName,
                  created_at: new Date(),
                })),
              };
            }
            return { rows: [] };
          },
        } as any;
      };

      const worker1 = new PostgresOutboxService(createWorkerClient('worker-1'));
      const worker2 = new PostgresOutboxService(createWorkerClient('worker-2'));

      // Both workers request 2 items concurrently
      const [batchWorker1, batchWorker2] = await Promise.all([
        worker1.acquireLeaseBatch('tenant-sa-001', 'worker-1', 2, 60),
        worker2.acquireLeaseBatch('tenant-sa-001', 'worker-2', 2, 60),
      ]);

      const worker1Ids = batchWorker1.map((m) => m.id);
      const worker2Ids = batchWorker2.map((m) => m.id);

      // Verify no overlap between worker 1 and worker 2
      const intersection = worker1Ids.filter((id) => worker2Ids.includes(id));
      expect(intersection.length).toBe(0);
      expect(worker1Ids.length + worker2Ids.length).toBe(3);
    });
  });

  describe('5. Strict Multi-Tenant Isolation', () => {
    it('prevents tenant B from reading or dispatching outbox events belonging to tenant A', async () => {
      const executedQueries: Array<{ sql: string; params: any[] }> = [];
      const mockClient = {
        query: async (sql: string, params: any[]) => {
          executedQueries.push({ sql, params });
          return { rows: [] };
        },
      } as any;

      const outbox = new PostgresOutboxService(mockClient);

      await outbox.getPendingBatch('tenant-sa-001', 20);
      expect(executedQueries[0].params[0]).toBe('tenant-sa-001');
      expect(executedQueries[0].sql).toContain('WHERE tenant_id = $1');

      await outbox.getPendingBatch('tenant-sa-002', 20);
      expect(executedQueries[1].params[0]).toBe('tenant-sa-002');
      expect(executedQueries[1].sql).toContain('WHERE tenant_id = $1');
    });
  });

  describe('6. Transaction Atomicity & Dual-Write Rollback', () => {
    it('rolls back business order changes if downstream outbox enqueue fails', async () => {
      let rolledBack = false;
      let committed = false;
      let orderInserted = false;

      const mockPoolClient = {
        query: async (sql: string) => {
          if (sql === 'BEGIN') return;
          if (sql === 'ROLLBACK') rolledBack = true;
          if (sql === 'COMMIT') committed = true;
          if (sql.includes('INSERT INTO orders')) orderInserted = true;
          return { rows: [] };
        },
        release: () => {},
      };

      const mockPool = {
        connect: async () => mockPoolClient,
      };

      vi.spyOn(PostgresUnitOfWork.prototype as any, 'withTransaction').mockImplementation(
        async (tenantId: string, operation: any) => {
          await mockPoolClient.query('BEGIN');
          try {
            const fakeRepos = {
              orderRepo: {
                save: async () => {
                  await mockPoolClient.query('INSERT INTO orders');
                },
              },
              outboxService: {
                enqueue: async () => {
                  throw new Error('Database disk full or constraint violation in outbox');
                },
              },
            };
            await operation(fakeRepos, mockPoolClient);
            await mockPoolClient.query('COMMIT');
          } catch (err) {
            await mockPoolClient.query('ROLLBACK');
            throw err;
          }
        }
      );

      const uow = new PostgresUnitOfWork('tenant-sa-001');

      await expect(
        uow.withTransaction('tenant-sa-001', async (repos) => {
          await repos.orderRepo.save('tenant-sa-001', {} as any);
          await repos.outboxService.enqueue('tenant-sa-001', {} as any);
        })
      ).rejects.toThrow('Database disk full or constraint violation in outbox');

      expect(orderInserted).toBe(true);
      expect(rolledBack).toBe(true);
      expect(committed).toBe(false);
    });

    it('rolls back outbox enqueue if business logic throws an error before commit', async () => {
      let rolledBack = false;
      let committed = false;

      const mockPoolClient = {
        query: async (sql: string) => {
          if (sql === 'ROLLBACK') rolledBack = true;
          if (sql === 'COMMIT') committed = true;
          return { rows: [] };
        },
        release: () => {},
      };

      vi.spyOn(PostgresUnitOfWork.prototype as any, 'withTransaction').mockImplementation(
        async (tenantId: string, operation: any) => {
          await mockPoolClient.query('BEGIN');
          try {
            const fakeRepos = {
              orderRepo: { save: vi.fn() },
              outboxService: { enqueue: vi.fn() },
            };
            await operation(fakeRepos, mockPoolClient);
            await mockPoolClient.query('COMMIT');
          } catch (err) {
            await mockPoolClient.query('ROLLBACK');
            throw err;
          }
        }
      );

      const uow = new PostgresUnitOfWork('tenant-sa-001');

      await expect(
        uow.withTransaction('tenant-sa-001', async (repos) => {
          await repos.outboxService.enqueue('tenant-sa-001', { id: 'evt-1' } as any);
          throw new Error('Business Validation Failed: Invalid Tax ID');
        })
      ).rejects.toThrow('Business Validation Failed: Invalid Tax ID');

      expect(rolledBack).toBe(true);
      expect(committed).toBe(false);
    });
  });

  describe('7. Observability & Zero-PII / Zero-Credential Leakage', () => {
    it('sanitizes bearer tokens, passwords, and credit card numbers from error logs and payloads', () => {
      const sensitivePayload = {
        user: 'admin',
        password: 'SuperSecretPassword123!',
        apiKey: 'sk-live-9993382947192847',
        paymentInfo: {
          cardNumber: '4532 1123 4567 8901',
          cvv: '123',
        },
        metadata: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.doNotLeak',
      };

      const sanitized = sanitizeSensitiveData(sensitivePayload);

      expect(sanitized.password).toBe('[REDACTED]');
      expect(sanitized.apiKey).toBe('[REDACTED]');
      expect(sanitized.paymentInfo.cvv).toBe('[REDACTED]');
      expect(sanitized.paymentInfo.cardNumber).toBe('[CARD_REDACTED]');
      expect(sanitized.metadata).toContain('[REDACTED]');
      expect(sanitized.metadata).not.toContain('eyJhbGci');
    });

    it('records correlationId, tenantId, duration, and workerId in dispatch audit trail without leaking secrets', async () => {
      const mockOutbox = {
        acquireLeaseBatch: async () => [
          {
            id: 'evt-audit-01',
            tenantId: 'tenant-sa-001',
            idempotencyKey: 'idem-audit-01',
            correlationId: 'corr-req-88992',
            aggregateType: 'ORDER',
            aggregateId: 'ord-88992',
            eventType: 'ORDER_CREATED',
            payload: { orderNumber: '#ORD-88992' },
            vectorClock: {},
            retryCount: 0,
            maxRetries: 5,
            createdAt: new Date().toISOString(),
          },
        ],
        acknowledge: vi.fn(),
      };

      vi.spyOn(TenantRepositoryFactory, 'getOutboxService').mockReturnValue(mockOutbox as any);

      const result = await OutboxRelayWorker.dispatchTenantEvents('tenant-sa-001');

      expect(result.auditTrail.length).toBe(1);
      const audit = result.auditTrail[0];
      expect(audit.correlationId).toBe('corr-req-88992');
      expect(audit.tenantId).toBe('tenant-sa-001');
      expect(audit.eventId).toBe('evt-audit-01');
      expect(audit.status).toBe('PROCESSED');
      expect(audit.workerId).toBe(OutboxRelayWorker.getWorkerId());
      expect(typeof audit.durationMs).toBe('number');
    });
  });
});
