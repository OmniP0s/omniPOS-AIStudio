import { describe, it, expect } from 'vitest';
import { TenantContextHolder, ITenantContext } from '../server/security/tenantContext';
import { SecurityPipeline } from '../server/security/authPipeline';
import { MultiTenantOrderRepository, MultiTenantInventoryRepository } from '../server/db/tenantRepository';
import { VectorClockEngine, OutboxSyncEngine } from '../server/sync/outboxEngine';
import { Order, InventoryItem } from '../types';

describe('Zero-Trust Multi-Tenant Security & Context Pipeline', () => {
  it('isolates tenant context cleanly across asynchronous boundaries', async () => {
    const ctx1: ITenantContext = {
      tenantId: 'TENANT-001',
      userId: 'usr-1',
      roles: ['cashier'],
      permissions: ['pos:order:create'],
      correlationId: 'corr-1',
    };

    const ctx2: ITenantContext = {
      tenantId: 'TENANT-002',
      userId: 'usr-2',
      roles: ['admin'],
      permissions: ['*'],
      correlationId: 'corr-2',
    };

    await Promise.all([
      TenantContextHolder.run(ctx1, async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        expect(TenantContextHolder.getTenantId()).toBe('TENANT-001');
        expect(TenantContextHolder.getUserId()).toBe('usr-1');
      }),
      TenantContextHolder.run(ctx2, async () => {
        await new Promise((resolve) => setTimeout(resolve, 5));
        expect(TenantContextHolder.getTenantId()).toBe('TENANT-002');
        expect(TenantContextHolder.getUserId()).toBe('usr-2');
      }),
    ]);
  });

  it('generates and verifies cryptographic HMAC security tokens', () => {
    const token = SecurityPipeline.generateToken({
      sub: 'usr-manager-1',
      tenantId: 'TENANT-SA-01',
      roles: ['manager'],
    });

    expect(token).toBeDefined();
    const verified = SecurityPipeline.verifyToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.sub).toBe('usr-manager-1');
    expect(verified?.tenantId).toBe('TENANT-SA-01');
    expect(verified?.roles).toContain('manager');
  });

  it('rejects tampered or forged tokens', () => {
    const validToken = SecurityPipeline.generateToken({
      sub: 'usr-cashier-1',
      tenantId: 'TENANT-SA-01',
      roles: ['cashier'],
    });

    const [payload, sig] = validToken.split('.');
    const tamperedPayload = Buffer.from(
      JSON.stringify({
        sub: 'usr-cashier-1',
        tenantId: 'TENANT-SA-01',
        roles: ['admin'], // Privilege escalation attempt
        exp: Math.floor(Date.now() / 1000) + 3600,
      }),
      'utf8'
    ).toString('base64url');

    const forgedToken = `${tamperedPayload}.${sig}`;
    const result = SecurityPipeline.verifyToken(forgedToken);
    expect(result).toBeNull();
  });
});

describe('Multi-Tenant Row-Level Security Repository Isolation', () => {
  const orderRepo = new MultiTenantOrderRepository();

  it('strictly blocks cross-tenant order access', async () => {
    const tenantACtx: ITenantContext = {
      tenantId: 'TENANT-A',
      userId: 'usr-a',
      roles: ['admin'],
      permissions: ['*'],
      correlationId: 'corr-a',
    };

    const dummyOrder: Order = {
      id: 'ord-1001',
      orderNumber: '#ORD-1001',
      dailySequence: 1,
      tenantId: 'TENANT-A',
      branchId: 'BR-01',
      orderType: 'DINE_IN',
      guestCount: 2,
      items: [],
      subtotal: 100,
      discountAmount: 0,
      taxableAmount: 100,
      taxAmount: 15,
      municipalityFeeAmount: 0,
      serviceChargeAmount: 0,
      tipAmount: 0,
      totalAmount: 115,
      paidAmount: 115,
      balanceAmount: 0,
      status: 'COMPLETED',
      paymentStatus: 'PAID',
      payments: [],
      openedAt: new Date().toISOString(),
      cashierId: 'usr-a',
      cashierName: 'Alice',
      shiftId: 'shift-1',
      zatcaStatus: 'CLEARED',
      zatcaInvoiceType: 'SIMPLIFIED',
      vectorClock: { node1: 1 },
      version: 1,
    };

    // Save under Tenant A
    await TenantContextHolder.run(tenantACtx, async () => {
      await orderRepo.save('TENANT-A', dummyOrder);
      const found = await orderRepo.findById('TENANT-A', 'ord-1001');
      expect(found).not.toBeNull();
      expect(found?.id).toBe('ord-1001');
    });

    // Attempt to access from Tenant B context
    const tenantBCtx: ITenantContext = {
      tenantId: 'TENANT-B',
      userId: 'usr-b',
      roles: ['admin'],
      permissions: ['*'],
      correlationId: 'corr-b',
    };

    await TenantContextHolder.run(tenantBCtx, async () => {
      await expect(orderRepo.findById('TENANT-A', 'ord-1001')).rejects.toThrow('Security Violation');
    });
  });
});

describe('Vector Clocks & Offline Outbox Sync Engine', () => {
  it('correctly compares causal vector clocks', () => {
    const clock1 = { terminalA: 2, terminalB: 1 };
    const clock2 = { terminalA: 2, terminalB: 2 };
    const clock3 = { terminalA: 3, terminalB: 1 };

    expect(VectorClockEngine.compare(clock1, clock2)).toBe('BEFORE');
    expect(VectorClockEngine.compare(clock2, clock1)).toBe('AFTER');
    expect(VectorClockEngine.compare(clock2, clock3)).toBe('CONCURRENT'); // Conflict!
    expect(VectorClockEngine.compare(clock1, clock1)).toBe('IDENTICAL');
  });

  it('merges vector clocks seamlessly', () => {
    const clockA = { node1: 5, node2: 2 };
    const clockB = { node1: 3, node2: 4, node3: 1 };

    const merged = VectorClockEngine.merge(clockA, clockB);
    expect(merged).toEqual({
      node1: 5,
      node2: 4,
      node3: 1,
    });
  });

  it('enforces idempotency and deduplication in the Outbox Sync Engine', async () => {
    const engine = new OutboxSyncEngine();

    const event1 = await engine.enqueue('TENANT-01', {
      id: 'evt-1',
      idempotencyKey: 'idem-key-unique-001',
      aggregateId: 'ord-99',
      aggregateType: 'ORDER',
      eventType: 'ORDER_CREATED',
      payload: { amount: 100 },
      vectorClock: { term1: 1 },
      createdAt: new Date().toISOString(),
    });

    const eventDuplicate = await engine.enqueue('TENANT-01', {
      id: 'evt-duplicate',
      idempotencyKey: 'idem-key-unique-001', // Same idempotency key
      aggregateId: 'ord-99',
      aggregateType: 'ORDER',
      eventType: 'ORDER_CREATED',
      payload: { amount: 100 },
      vectorClock: { term1: 1 },
      createdAt: new Date().toISOString(),
    });

    // Should return original message without creating duplicate
    expect(eventDuplicate.id).toBe('evt-1');

    const result = await engine.processSyncBatch('TENANT-01', [event1]);
    expect(result.success).toBe(true);
    expect(result.processedCount).toBe(1);
  });
});
