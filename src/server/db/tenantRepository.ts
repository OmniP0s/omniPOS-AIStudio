// Enterprise Multi-Tenant Repository Implementation with Strict RLS Isolation

import { IOrderRepository, IInventoryRepository, IShiftRepository, IRepository } from '../../domain/contracts/repositories';
import { Order, InventoryItem, Shift } from '../../types';
import { TenantContextHolder } from '../security/tenantContext';

export class MultiTenantOrderRepository implements IOrderRepository {
  private static orders = new Map<string, Order>(); // key: `${tenantId}:${orderId}`

  private getKey(tenantId: string, orderId: string): string {
    return `${tenantId}:${orderId}`;
  }

  public async findById(tenantId: string, id: string): Promise<Order | null> {
    const activeTenant = TenantContextHolder.getTenantId();
    if (activeTenant !== tenantId) {
      throw new Error(`Security Violation: Cross-tenant access attempted (active: ${activeTenant}, target: ${tenantId})`);
    }
    const order = MultiTenantOrderRepository.orders.get(this.getKey(tenantId, id));
    return order ? JSON.parse(JSON.stringify(order)) : null;
  }

  public async findMany(tenantId: string, query?: Record<string, any>): Promise<Order[]> {
    const activeTenant = TenantContextHolder.getTenantId();
    if (activeTenant !== tenantId) {
      throw new Error(`Security Violation: Cross-tenant access attempted`);
    }

    const results: Order[] = [];
    for (const [key, order] of MultiTenantOrderRepository.orders.entries()) {
      if (key.startsWith(`${tenantId}:`)) {
        if (query) {
          let match = true;
          for (const [prop, val] of Object.entries(query)) {
            if ((order as any)[prop] !== val) {
              match = false;
              break;
            }
          }
          if (match) results.push(JSON.parse(JSON.stringify(order)));
        } else {
          results.push(JSON.parse(JSON.stringify(order)));
        }
      }
    }
    return results;
  }

  public async findByStatus(tenantId: string, branchId: string, status: Order['status']): Promise<Order[]> {
    return this.findMany(tenantId, { branchId, status });
  }

  public async findActiveByTable(tenantId: string, branchId: string, tableId: string): Promise<Order | null> {
    const orders = await this.findMany(tenantId, { branchId, tableId, status: 'OPEN' });
    return orders.length > 0 ? orders[0] : null;
  }

  public async save(tenantId: string, entity: Order): Promise<Order> {
    const activeTenant = TenantContextHolder.getTenantId();
    if (activeTenant !== tenantId || entity.tenantId !== tenantId) {
      throw new Error(`Security Violation: Attempted to save order across tenant boundaries`);
    }

    const key = this.getKey(tenantId, entity.id);
    MultiTenantOrderRepository.orders.set(key, JSON.parse(JSON.stringify(entity)));
    return entity;
  }

  public async delete(tenantId: string, id: string): Promise<boolean> {
    const activeTenant = TenantContextHolder.getTenantId();
    if (activeTenant !== tenantId) {
      throw new Error(`Security Violation: Cross-tenant delete rejected`);
    }
    return MultiTenantOrderRepository.orders.delete(this.getKey(tenantId, id));
  }
}

export class MultiTenantInventoryRepository implements IInventoryRepository {
  private static items = new Map<string, InventoryItem>(); // key: `${tenantId}:${itemId}`

  private getKey(tenantId: string, itemId: string): string {
    return `${tenantId}:${itemId}`;
  }

  public async findById(tenantId: string, id: string): Promise<InventoryItem | null> {
    const item = MultiTenantInventoryRepository.items.get(this.getKey(tenantId, id));
    return item ? JSON.parse(JSON.stringify(item)) : null;
  }

  public async findMany(tenantId: string, query?: Record<string, any>): Promise<InventoryItem[]> {
    const results: InventoryItem[] = [];
    for (const [key, item] of MultiTenantInventoryRepository.items.entries()) {
      if (key.startsWith(`${tenantId}:`)) {
        results.push(JSON.parse(JSON.stringify(item)));
      }
    }
    return results;
  }

  public async save(tenantId: string, entity: InventoryItem): Promise<InventoryItem> {
    const key = this.getKey(tenantId, entity.id);
    MultiTenantInventoryRepository.items.set(key, JSON.parse(JSON.stringify(entity)));
    return entity;
  }

  public async delete(tenantId: string, id: string): Promise<boolean> {
    return MultiTenantInventoryRepository.items.delete(this.getKey(tenantId, id));
  }

  public async adjustStock(tenantId: string, itemId: string, warehouseId: string, deltaQty: number, _reason: string): Promise<InventoryItem> {
    const item = await this.findById(tenantId, itemId);
    if (!item) {
      throw new Error(`Inventory item ${itemId} not found in tenant ${tenantId}`);
    }
    if (!item.currentStock) {
      item.currentStock = {};
    }
    item.currentStock[warehouseId] = (item.currentStock[warehouseId] || 0) + deltaQty;
    await this.save(tenantId, item);
    return item;
  }

  public async getLowStockItems(tenantId: string, _branchId: string): Promise<InventoryItem[]> {
    const all = await this.findMany(tenantId);
    return all.filter(item => {
      const totalStock = Object.values(item.currentStock || {}).reduce((a, b) => a + b, 0);
      return totalStock <= item.minStockLevel;
    });
  }
}

export class MultiTenantShiftRepository implements IShiftRepository {
  private static shifts = new Map<string, Shift>();

  public async findById(tenantId: string, id: string): Promise<Shift | null> {
    const shift = MultiTenantShiftRepository.shifts.get(`${tenantId}:${id}`);
    return shift ? JSON.parse(JSON.stringify(shift)) : null;
  }

  public async findMany(tenantId: string, query?: Record<string, any>): Promise<Shift[]> {
    const results: Shift[] = [];
    for (const [key, shift] of MultiTenantShiftRepository.shifts.entries()) {
      if (key.startsWith(`${tenantId}:`)) {
        results.push(JSON.parse(JSON.stringify(shift)));
      }
    }
    return results;
  }

  public async findActiveShift(tenantId: string, branchId: string, terminalId: string, userId: string): Promise<Shift | null> {
    const shifts = await this.findMany(tenantId);
    return shifts.find(s => s.branchId === branchId && s.cashierId === userId && s.status === 'OPEN') || null;
  }

  public async save(tenantId: string, entity: Shift): Promise<Shift> {
    MultiTenantShiftRepository.shifts.set(`${tenantId}:${entity.id}`, JSON.parse(JSON.stringify(entity)));
    return entity;
  }

  public async delete(tenantId: string, id: string): Promise<boolean> {
    return MultiTenantShiftRepository.shifts.delete(`${tenantId}:${id}`);
  }
}

import { db } from './connection';
import { PostgresOrderRepository, PostgresInventoryRepository, PostgresShiftRepository } from './postgresRepositories';
import { PostgresOutboxService } from './postgresOutboxService';
import { PostgresUnitOfWork } from './unitOfWork';
import { TransactionClientContext } from './transactionContext';
import { IOutboxService } from '../../domain/contracts/outbox';
import { OutboxSyncEngine } from '../sync/outboxEngine';
import { IConsumerIdempotencyService } from '../../domain/contracts/outbox';
import { PostgresConsumerIdempotencyService, InMemoryConsumerIdempotencyService } from './postgresOutboxService';

export class TenantRepositoryFactory {
  private static defaultOutboxService = new OutboxSyncEngine();
  private static defaultConsumerIdempotencyService = new InMemoryConsumerIdempotencyService();

  private static checkProductionGuard(): void {
    const isProd = process.env.NODE_ENV === 'production';
    const requireDb = process.env.REQUIRE_PERSISTENT_DB === 'true';
    const allowFallback = process.env.ALLOW_IN_MEMORY_FALLBACK === 'true';

    if ((requireDb || (isProd && !allowFallback)) && !db.isConfigured()) {
      throw new Error(
        'Production Persistence Violation: Live PostgreSQL database connection is required but DATABASE_URL is not configured. In-memory fallback is disabled.'
      );
    }
  }

  public static getOrderRepository(): IOrderRepository {
    this.checkProductionGuard();
    if (db.isConfigured()) {
      return new PostgresOrderRepository(TransactionClientContext.getClient());
    }
    return new MultiTenantOrderRepository();
  }

  public static getInventoryRepository(): IInventoryRepository {
    this.checkProductionGuard();
    if (db.isConfigured()) {
      return new PostgresInventoryRepository(TransactionClientContext.getClient());
    }
    return new MultiTenantInventoryRepository();
  }

  public static getShiftRepository(): IShiftRepository {
    this.checkProductionGuard();
    if (db.isConfigured()) {
      return new PostgresShiftRepository(TransactionClientContext.getClient());
    }
    return new MultiTenantShiftRepository();
  }

  public static getOutboxService(): IOutboxService {
    this.checkProductionGuard();
    if (db.isConfigured()) {
      return new PostgresOutboxService(TransactionClientContext.getClient());
    }
    return this.defaultOutboxService;
  }

  public static getConsumerIdempotencyService(): IConsumerIdempotencyService {
    this.checkProductionGuard();
    if (db.isConfigured()) {
      return new PostgresConsumerIdempotencyService(TransactionClientContext.getClient());
    }
    return this.defaultConsumerIdempotencyService;
  }

  public static getUnitOfWork(tenantId?: string): PostgresUnitOfWork {
    this.checkProductionGuard();
    return new PostgresUnitOfWork(tenantId);
  }
}
