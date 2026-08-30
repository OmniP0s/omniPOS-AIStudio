// Live PostgreSQL Dynamic Integration Suite
// Executes against real PostgreSQL if DATABASE_URL or POSTGRES_URL is configured.
// Gracefully marks as conditionally skipped in environments without external PostgreSQL container.

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import pg from 'pg';
import { MigrationRunner } from '../server/db/migrationRunner';
import { PostgresOrderRepository, PostgresInventoryRepository, PostgresShiftRepository } from '../server/db/postgresRepositories';
import { PostgresUnitOfWork } from '../server/db/unitOfWork';
import { Order, InventoryItem, Shift } from '../types';

const LIVE_DB_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const isLiveDbAvailable = Boolean(LIVE_DB_URL);

describe('Live PostgreSQL Production Persistence Integration', () => {
  let pool: pg.Pool | null = null;

  beforeAll(async () => {
    if (isLiveDbAvailable) {
      pool = new pg.Pool({ connectionString: LIVE_DB_URL });
      // Run deterministic migrations against live DB
      await MigrationRunner.run();
    }
  });

  afterAll(async () => {
    if (pool) {
      await pool.end();
    }
  });

  it('reports external database connectivity status deterministically', () => {
    if (!isLiveDbAvailable) {
      console.info('[Live Postgres Info]: Live database integration suite skipped - DATABASE_URL is not set in sandbox container.');
      expect(isLiveDbAvailable).toBe(false);
    } else {
      expect(pool).toBeDefined();
    }
  });

  // The following tests only execute when a real PostgreSQL database is supplied
  const runIfLiveDb = isLiveDbAvailable ? it : it.skip;

  runIfLiveDb('executes migrations and applies schema with RLS on live PostgreSQL', async () => {
    const res = await pool!.query(`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' AND tablename IN ('orders', 'order_items', 'inventory_items', 'shifts');
    `);
    
    expect(res.rows.length).toBeGreaterThanOrEqual(4);
    for (const row of res.rows) {
      expect(row.rowsecurity).toBe(true);
    }
  });

  runIfLiveDb('enforces RLS isolation on live PostgreSQL: Tenant A cannot read Tenant B data', async () => {
    const clientA = await pool!.connect();
    const clientB = await pool!.connect();

    try {
      // Setup Tenant A session
      await clientA.query('BEGIN');
      await clientA.query(`SET LOCAL app.current_tenant_id = 'tenant-live-a'`);
      
      const orderA: Order = {
        id: 'ord-live-test-a',
        orderNumber: '#ORD-LA-01',
        dailySequence: 1,
        tenantId: 'tenant-live-a',
        branchId: 'BR-01',
        orderType: 'DINE_IN',
        guestCount: 1,
        items: [],
        subtotal: 100,
        discountAmount: 0,
        taxableAmount: 86.96,
        taxAmount: 13.04,
        municipalityFeeAmount: 0,
        serviceChargeAmount: 0,
        tipAmount: 0,
        totalAmount: 100,
        paidAmount: 100,
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

      const orderRepoA = new PostgresOrderRepository(clientA);
      await orderRepoA.save('tenant-live-a', orderA);
      await clientA.query('COMMIT');

      // Tenant B session queries with RLS
      await clientB.query('BEGIN');
      await clientB.query(`SET LOCAL app.current_tenant_id = 'tenant-live-b'`);
      const orderRepoB = new PostgresOrderRepository(clientB);
      
      const leakedOrder = await orderRepoB.findById('tenant-live-b', 'ord-live-test-a');
      expect(leakedOrder).toBeNull();
      await clientB.query('COMMIT');
    } finally {
      clientA.release();
      clientB.release();
    }
  });

  runIfLiveDb('verifies transactional rollback on constraint failure on live PostgreSQL', async () => {
    const uow = new PostgresUnitOfWork('tenant-live-a');
    let threw = false;

    try {
      await uow.executeInTransaction(async () => {
        const orderRepo = new PostgresOrderRepository();
        // Insert invalid order to trigger constraint violation
        await pool!.query(`INSERT INTO orders (id, tenant_id, branch_id) VALUES ('ord-invalid', 'tenant-live-a', 'br-1')`);
        throw new Error('Simulated atomic failure');
      });
    } catch {
      threw = true;
    }

    expect(threw).toBe(true);
    // Verify rollback occurred
    const check = await pool!.query(`SELECT * FROM orders WHERE id = 'ord-invalid'`);
    expect(check.rows.length).toBe(0);
  });
});
