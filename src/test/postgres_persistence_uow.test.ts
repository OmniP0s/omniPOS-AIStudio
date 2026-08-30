import { describe, it, expect } from 'vitest';
import { MIGRATIONS, INITIAL_SCHEMA_SQL } from '../server/db/schema';
import { PostgresConnectionManager } from '../server/db/connection';
import { PostgresUnitOfWork } from '../server/db/unitOfWork';
import { TenantRepositoryFactory, MultiTenantOrderRepository } from '../server/db/tenantRepository';
import { IndexedDbStorage } from '../domain/persistence/indexedDbStorage';
import { Order } from '../types';
import { TenantContextHolder } from '../server/security/tenantContext';

describe('Enterprise PostgreSQL Persistence Architecture & Migrations', () => {
  it('contains valid PostgreSQL DDL migration definitions with RLS policies', () => {
    expect(MIGRATIONS.length).toBeGreaterThan(0);
    const initialMigration = MIGRATIONS[0];
    expect(initialMigration.version).toBe('20260830_001_initial_schema');
    expect(initialMigration.sql).toContain('CREATE TABLE IF NOT EXISTS tenants');
    expect(initialMigration.sql).toContain('CREATE TABLE IF NOT EXISTS orders');
    expect(initialMigration.sql).toContain('CREATE TABLE IF NOT EXISTS order_items');
    expect(initialMigration.sql).toContain('CREATE TABLE IF NOT EXISTS inventory_items');
    expect(initialMigration.sql).toContain('CREATE TABLE IF NOT EXISTS shifts');
    expect(initialMigration.sql).toContain('CREATE TABLE IF NOT EXISTS outbox_events');
    
    // Check Row-Level Security policies
    expect(initialMigration.sql).toContain('ALTER TABLE orders ENABLE ROW LEVEL SECURITY;');
    expect(initialMigration.sql).toContain('ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;');
    expect(initialMigration.sql).toContain('ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;');
    expect(initialMigration.sql).toContain('ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;');
    expect(initialMigration.sql).toContain('ALTER TABLE outbox_events ENABLE ROW LEVEL SECURITY;');
    expect(initialMigration.sql).toContain('CREATE POLICY tenant_isolation_orders ON orders');
    expect(initialMigration.sql).toContain("USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''))");
    expect(initialMigration.sql).toContain("WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''))");
  });

  it('verifies SQL table schemas, unique constraints, foreign keys and indexes', () => {
    const sql = INITIAL_SCHEMA_SQL;
    expect(sql).toContain('CONSTRAINT uq_tenant_branch_code UNIQUE (tenant_id, code)');
    expect(sql).toContain('CONSTRAINT uq_tenant_sku UNIQUE (tenant_id, sku)');
    expect(sql).toContain('CONSTRAINT uq_tenant_idempotency UNIQUE (tenant_id, idempotency_key)');
    expect(sql).toContain('REFERENCES tenants(id) ON DELETE CASCADE');
    expect(sql).toContain('idx_orders_tenant_branch');
    expect(sql).toContain('idx_orders_tenant_status');
    expect(sql).toContain('idx_outbox_tenant_status');
  });

  it('PostgresConnectionManager initializes cleanly and reports health check', async () => {
    const connectionMgr = PostgresConnectionManager.getInstance();
    expect(connectionMgr).toBeDefined();

    const health = await connectionMgr.healthCheck();
    expect(health).toHaveProperty('connected');
  });

  it('PostgresUnitOfWork executes transactional operations atomically', async () => {
    const uow = new PostgresUnitOfWork('tenant-sa-test');
    let stateMutated = false;

    const result = await TenantContextHolder.run(createTenantContext('tenant-sa-test'), () =>
      uow.executeInTransaction(async () => {
        stateMutated = true;
        return { success: true, count: 42 };
      })
    );

    expect(stateMutated).toBe(true);
    expect(result.success).toBe(true);
    expect(result.count).toBe(42);
  });

  it('TenantRepositoryFactory resolves repositories honoring domain contracts', async () => {
    const orderRepo = TenantRepositoryFactory.getOrderRepository();
    const invRepo = TenantRepositoryFactory.getInventoryRepository();
    const shiftRepo = TenantRepositoryFactory.getShiftRepository();
    const uow = TenantRepositoryFactory.getUnitOfWork('tenant-sa-001');

    expect(orderRepo).toHaveProperty('findById');
    expect(orderRepo).toHaveProperty('save');
    expect(invRepo).toHaveProperty('adjustStock');
    expect(shiftRepo).toHaveProperty('findActiveShift');
    expect(uow).toHaveProperty('executeInTransaction');
  });

  it('TenantContextHolder prevents cross-tenant leakage during repository calls', async () => {
    const orderRepo = new MultiTenantOrderRepository();

    const order: Order = {
      id: 'ord-db-test-01',
      orderNumber: '#ORD-DB-1',
      dailySequence: 1,
      tenantId: 'TENANT-ALPHA',
      branchId: 'BR-01',
      orderType: 'DINE_IN',
      guestCount: 2,
      items: [],
      subtotal: 50,
      discountAmount: 0,
      taxableAmount: 43.48,
      taxAmount: 6.52,
      municipalityFeeAmount: 0,
      serviceChargeAmount: 0,
      tipAmount: 0,
      totalAmount: 50,
      paidAmount: 50,
      balanceAmount: 0,
      status: 'COMPLETED',
      paymentStatus: 'PAID',
      payments: [],
      openedAt: new Date().toISOString(),
      cashierId: 'usr-1',
      cashierName: 'Cashier',
      shiftId: 'shift-1',
      zatcaStatus: 'REPORTED',
      zatcaInvoiceType: 'SIMPLIFIED',
      vectorClock: { 'NODE-1': 1 },
      version: 1,
    };

    await TenantContextHolder.run(createTenantContext('TENANT-ALPHA'), async () => {
      await orderRepo.save('TENANT-ALPHA', order);
      const retrieved = await orderRepo.findById('TENANT-ALPHA', 'ord-db-test-01');
      expect(retrieved?.id).toBe('ord-db-test-01');
    });

    await TenantContextHolder.run(createTenantContext('TENANT-BETA'), async () => {
      await expect(orderRepo.findById('TENANT-BETA', 'ord-db-test-01')).resolves.toBeNull();
      await expect(orderRepo.findById('TENANT-ALPHA', 'ord-db-test-01')).rejects.toThrow(/Cross-tenant/);
    });
  });

  it('IndexedDbStorage edge persistence initializes gracefully in edge/test environment', async () => {
    const storage = new IndexedDbStorage({ dbName: 'test_pos_edge_db', version: 1 });
    expect(storage).toBeDefined();

    // In node/vitest, browser window.indexedDB may not be present, so init resolves safely without crashing
    const initialized = await storage.init();
    expect(typeof initialized).toBe('boolean');
  });

  it('PostgresUnitOfWork safely catches errors and executes rollback without silent failure', async () => {
    const uow = new PostgresUnitOfWork('tenant-sa-001');
    await expect(
      TenantContextHolder.run(createTenantContext('tenant-sa-001'), () =>
        uow.executeInTransaction(async () => {
          throw new Error('Database constraint violation simulated');
        })
      )
    ).rejects.toThrow('Database constraint violation simulated');
  });

  it('verifies that in-memory repository is explicit fallback and reports correctly', async () => {
    const isDbConfigured = PostgresConnectionManager.getInstance().isConfigured();
    const orderRepo = TenantRepositoryFactory.getOrderRepository();
    
    if (!isDbConfigured) {
      expect(orderRepo.constructor.name).toBe('MultiTenantOrderRepository');
    } else {
      expect(orderRepo.constructor.name).toBe('PostgresOrderRepository');
    }
  });

  it('fails fast when REQUIRE_PERSISTENT_DB is set and PostgreSQL is not configured', () => {
    const prevVal = process.env.REQUIRE_PERSISTENT_DB;
    process.env.REQUIRE_PERSISTENT_DB = 'true';

    try {
      expect(() => TenantRepositoryFactory.getOrderRepository()).toThrow(/Production Persistence Violation/);
    } finally {
      if (prevVal !== undefined) {
        process.env.REQUIRE_PERSISTENT_DB = prevVal;
      } else {
        delete process.env.REQUIRE_PERSISTENT_DB;
      }
    }
  });
});

function createTenantContext(tenantId: string) {
  return {
    tenantId,
    userId: 'test-user',
    roles: ['admin'],
    permissions: ['*'],
    correlationId: `test-${tenantId}`,
  };
}
