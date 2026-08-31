import { afterEach, describe, expect, it, vi } from 'vitest';
import { db } from '../server/db/connection';
import { TenantRepositoryFactory } from '../server/db/tenantRepository';
import { PostgresUnitOfWork } from '../server/db/unitOfWork';
import { TenantContextHolder } from '../server/security/tenantContext';

function tenantContext() {
  return {
    tenantId: 'tenant-atomic',
    userId: 'test-user',
    roles: ['admin'],
    permissions: ['*'],
    correlationId: 'test-transaction-binding',
  };
}

function fakeDatabase() {
  const queries: string[] = [];
  const client = {
    query: vi.fn(async (sql: string) => {
      queries.push(sql);
      return { rows: [], rowCount: 0 };
    }),
    release: vi.fn(),
  };
  const pool = { connect: vi.fn(async () => client) };

  vi.spyOn(db, 'isConfigured').mockReturnValue(true);
  vi.spyOn(db, 'getPool').mockReturnValue(pool as any);
  return { client, queries };
}

describe('PostgreSQL transaction client binding', () => {
  afterEach(() => vi.restoreAllMocks());

  it('binds every factory repository to the PoolClient owning the transaction', async () => {
    const { client, queries } = fakeDatabase();
    const uow = new PostgresUnitOfWork('tenant-atomic');

    await TenantContextHolder.run(tenantContext(), () =>
      uow.executeInTransaction(async () => {
        expect((TenantRepositoryFactory.getOrderRepository() as any).client).toBe(client);
        expect((TenantRepositoryFactory.getInventoryRepository() as any).client).toBe(client);
        expect((TenantRepositoryFactory.getShiftRepository() as any).client).toBe(client);
        expect((TenantRepositoryFactory.getOutboxService() as any).client).toBe(client);
      })
    );

    expect(queries).toEqual([
      'BEGIN',
      'SET LOCAL app.current_tenant_id = $1',
      'COMMIT',
    ]);
    expect(client.release).toHaveBeenCalledOnce();
  });

  it('rolls back the same client and never commits when transactional work fails', async () => {
    const { client, queries } = fakeDatabase();
    const uow = new PostgresUnitOfWork('tenant-atomic');

    await expect(TenantContextHolder.run(tenantContext(), () =>
      uow.executeInTransaction(async () => {
        expect((TenantRepositoryFactory.getOrderRepository() as any).client).toBe(client);
        throw new Error('second write failed');
      })
    )).rejects.toThrow('second write failed');

    expect(queries).toEqual([
      'BEGIN',
      'SET LOCAL app.current_tenant_id = $1',
      'ROLLBACK',
    ]);
    expect(queries).not.toContain('COMMIT');
    expect(client.release).toHaveBeenCalledOnce();
  });
});
