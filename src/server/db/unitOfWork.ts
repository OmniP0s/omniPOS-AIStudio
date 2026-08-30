// Enterprise PostgreSQL Unit of Work with Transaction Management & RLS Session Scoping
// Implements IUnitOfWork with atomic rollback and isolation.

import pg from 'pg';
import { IUnitOfWork, IOrderRepository, IInventoryRepository, IShiftRepository } from '../../domain/contracts/repositories';
import { IOutboxService } from '../../domain/contracts/outbox';
import { db } from './connection';
import { PostgresOrderRepository, PostgresInventoryRepository, PostgresShiftRepository } from './postgresRepositories';
import { PostgresOutboxService } from './postgresOutboxService';
import { MultiTenantOrderRepository, MultiTenantInventoryRepository, MultiTenantShiftRepository } from './tenantRepository';
import { OutboxSyncEngine } from '../sync/outboxEngine';

import { TenantContextHolder } from '../security/tenantContext';

export interface ITransactionalRepositories {
  orderRepo: IOrderRepository;
  inventoryRepo: IInventoryRepository;
  shiftRepo: IShiftRepository;
  outboxService: IOutboxService;
}

export class PostgresUnitOfWork implements IUnitOfWork {
  constructor(private tenantId?: string) {}

  /**
   * Standard IUnitOfWork interface implementation
   */
  public async executeInTransaction<T>(work: () => Promise<T>): Promise<T> {
    if (!db.isConfigured()) {
      if (this.tenantId) {
        TenantContextHolder.setTenantId(this.tenantId);
      }
      return work();
    }

    const pool = db.getPool();
    if (!pool) return work();

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      if (this.tenantId) {
        await client.query('SET LOCAL app.current_tenant_id = $1', [this.tenantId]);
      }
      const result = await work();
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Extended UnitOfWork delivering transaction-bound repositories
   */
  public async withTransaction<T>(
    tenantId: string,
    operation: (repos: ITransactionalRepositories, client: pg.PoolClient) => Promise<T>
  ): Promise<T> {
    if (!db.isConfigured()) {
      TenantContextHolder.setTenantId(tenantId);
      const repos: ITransactionalRepositories = {
        orderRepo: new MultiTenantOrderRepository(),
        inventoryRepo: new MultiTenantInventoryRepository(),
        shiftRepo: new MultiTenantShiftRepository(),
        outboxService: new OutboxSyncEngine(),
      };
      return operation(repos, null as any);
    }

    const pool = db.getPool();
    if (!pool) throw new Error('Database pool unavailable');

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('SET LOCAL app.current_tenant_id = $1', [tenantId]);

      const repos: ITransactionalRepositories = {
        orderRepo: new PostgresOrderRepository(client),
        inventoryRepo: new PostgresInventoryRepository(client),
        shiftRepo: new PostgresShiftRepository(client),
        outboxService: new PostgresOutboxService(client),
      };

      const result = await operation(repos, client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
