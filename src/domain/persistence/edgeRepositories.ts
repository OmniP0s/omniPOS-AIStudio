// Enterprise Typed IndexedDB Edge Repositories
// Provides clean, isolated, typed repositories for Orders, Shifts, Inventory, and Outbox.
// Adheres strictly to IOrderRepository, IInventoryRepository, IShiftRepository, and IOutboxStore contracts.

import { Order, Shift, InventoryItem } from '../../types';
import { IOrderRepository, IInventoryRepository, IShiftRepository } from '../contracts/repositories';
import { OutboxEntry, IOutboxStore } from '../contracts/outbox';
import { EdgeDatabase, globalEdgeDatabase } from './edgeDatabase';

export class EdgeOrderRepository implements IOrderRepository {
  private edgeDb: EdgeDatabase;

  constructor(edgeDb: EdgeDatabase = globalEdgeDatabase) {
    this.edgeDb = edgeDb;
  }

  public async findById(tenantId: string, id: string): Promise<Order | null> {
    const db = await this.edgeDb.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('orders', 'readonly');
      const store = tx.objectStore('orders');
      const req = store.get(id);

      req.onsuccess = () => {
        const order: Order | undefined = req.result;
        if (!order || (order.tenantId && order.tenantId !== tenantId)) {
          resolve(null);
        } else {
          resolve(order);
        }
      };
      req.onerror = () => reject(req.error);
    });
  }

  public async findMany(tenantId: string, query?: Record<string, any>): Promise<Order[]> {
    const db = await this.edgeDb.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('orders', 'readonly');
      const store = tx.objectStore('orders');
      const index = store.index('by_tenant');
      const req = index.getAll(tenantId);

      req.onsuccess = () => {
        let results: Order[] = req.result || [];
        if (query) {
          if (query.branchId) {
            results = results.filter((o) => o.branchId === query.branchId);
          }
          if (query.status) {
            results = results.filter((o) => o.status === query.status);
          }
        }
        resolve(results);
      };
      req.onerror = () => reject(req.error);
    });
  }

  public async save(tenantId: string, entity: Order): Promise<Order> {
    const orderWithTenant: Order = {
      ...entity,
      tenantId: entity.tenantId || tenantId,
    };

    const db = await this.edgeDb.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('orders', 'readwrite');
      const store = tx.objectStore('orders');
      store.put(orderWithTenant);

      tx.oncomplete = () => resolve(orderWithTenant);
      tx.onerror = () => reject(tx.error);
    });
  }

  public async delete(tenantId: string, id: string): Promise<boolean> {
    const existing = await this.findById(tenantId, id);
    if (!existing) return false;

    const db = await this.edgeDb.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('orders', 'readwrite');
      const store = tx.objectStore('orders');
      store.delete(id);

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  public async findByStatus(tenantId: string, branchId: string, status: Order['status']): Promise<Order[]> {
    const all = await this.findMany(tenantId, { branchId, status });
    return all;
  }

  public async findActiveByTable(tenantId: string, branchId: string, tableId: string): Promise<Order | null> {
    const all = await this.findMany(tenantId, { branchId });
    const found = all.find(
      (o) => o.tableId === tableId && o.status !== 'COMPLETED' && o.status !== 'CANCELLED'
    );
    return found || null;
  }
}

export class EdgeShiftRepository implements IShiftRepository {
  private edgeDb: EdgeDatabase;

  constructor(edgeDb: EdgeDatabase = globalEdgeDatabase) {
    this.edgeDb = edgeDb;
  }

  public async findById(tenantId: string, id: string): Promise<Shift | null> {
    const db = await this.edgeDb.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('shifts', 'readonly');
      const store = tx.objectStore('shifts');
      const req = store.get(id);

      req.onsuccess = () => {
        const shift: Shift | undefined = req.result;
        if (!shift || (shift.tenantId && shift.tenantId !== tenantId)) {
          resolve(null);
        } else {
          resolve(shift);
        }
      };
      req.onerror = () => reject(req.error);
    });
  }

  public async findMany(tenantId: string, query?: Record<string, any>): Promise<Shift[]> {
    const db = await this.edgeDb.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('shifts', 'readonly');
      const store = tx.objectStore('shifts');
      const index = store.index('by_tenant');
      const req = index.getAll(tenantId);

      req.onsuccess = () => {
        let results: Shift[] = req.result || [];
        if (query) {
          if (query.terminalId) {
            results = results.filter((s) => s.terminalId === query.terminalId);
          }
          if (query.status) {
            results = results.filter((s) => s.status === query.status);
          }
        }
        resolve(results);
      };
      req.onerror = () => reject(req.error);
    });
  }

  public async save(tenantId: string, entity: Shift): Promise<Shift> {
    const shiftWithTenant: Shift = {
      ...entity,
      tenantId: entity.tenantId || tenantId,
    };

    const db = await this.edgeDb.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('shifts', 'readwrite');
      const store = tx.objectStore('shifts');
      store.put(shiftWithTenant);

      tx.oncomplete = () => resolve(shiftWithTenant);
      tx.onerror = () => reject(tx.error);
    });
  }

  public async delete(tenantId: string, id: string): Promise<boolean> {
    const existing = await this.findById(tenantId, id);
    if (!existing) return false;

    const db = await this.edgeDb.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('shifts', 'readwrite');
      const store = tx.objectStore('shifts');
      store.delete(id);

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  public async findActiveShift(tenantId: string, branchId: string, terminalId: string, userId: string): Promise<Shift | null> {
    const shifts = await this.findMany(tenantId, { terminalId, status: 'OPEN' });
    const match = shifts.find((s) => s.cashierId === userId || !userId);
    return match || null;
  }
}

export class EdgeInventoryRepository implements IInventoryRepository {
  private edgeDb: EdgeDatabase;

  constructor(edgeDb: EdgeDatabase = globalEdgeDatabase) {
    this.edgeDb = edgeDb;
  }

  public async findById(tenantId: string, id: string): Promise<InventoryItem | null> {
    const db = await this.edgeDb.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('inventory', 'readonly');
      const store = tx.objectStore('inventory');
      const req = store.get(id);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  public async findMany(tenantId: string, query?: Record<string, any>): Promise<InventoryItem[]> {
    const db = await this.edgeDb.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('inventory', 'readonly');
      const store = tx.objectStore('inventory');
      const req = store.getAll();

      req.onsuccess = () => {
        let results: InventoryItem[] = req.result || [];
        if (query?.sku) {
          results = results.filter((i) => i.sku === query.sku);
        }
        resolve(results);
      };
      req.onerror = () => reject(req.error);
    });
  }

  public async save(tenantId: string, entity: InventoryItem): Promise<InventoryItem> {
    const db = await this.edgeDb.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('inventory', 'readwrite');
      const store = tx.objectStore('inventory');
      store.put(entity);

      tx.oncomplete = () => resolve(entity);
      tx.onerror = () => reject(tx.error);
    });
  }

  public async delete(tenantId: string, id: string): Promise<boolean> {
    const db = await this.edgeDb.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('inventory', 'readwrite');
      const store = tx.objectStore('inventory');
      store.delete(id);

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  public async adjustStock(tenantId: string, itemId: string, warehouseId: string, deltaQty: number, reason: string): Promise<InventoryItem> {
    const item = await this.findById(tenantId, itemId);
    if (!item) {
      throw new Error(`Inventory item ${itemId} not found at edge.`);
    }

    const currentQty = item.currentStock[warehouseId] || 0;
    const newQty = Math.max(0, Number((currentQty + deltaQty).toFixed(3)));
    item.currentStock[warehouseId] = newQty;

    await this.save(tenantId, item);
    return item;
  }

  public async getLowStockItems(tenantId: string, branchId: string): Promise<InventoryItem[]> {
    const all = await this.findMany(tenantId);
    return all.filter((item) => {
      const totalStock = Object.values(item.currentStock).reduce((acc, q) => acc + q, 0);
      return totalStock <= (item.minStockLevel || 0);
    });
  }
}

export class EdgeOutboxStore implements IOutboxStore {
  private edgeDb: EdgeDatabase;

  constructor(edgeDb: EdgeDatabase = globalEdgeDatabase) {
    this.edgeDb = edgeDb;
  }

  /**
   * Enqueues an outbox entry with idempotent deduplication key protection.
   */
  public async enqueue(entry: OutboxEntry): Promise<void> {
    const db = await this.edgeDb.open();

    return new Promise((resolve, reject) => {
      const tx = db.transaction('outbox_events', 'readwrite');
      const store = tx.objectStore('outbox_events');
      const index = store.index('by_idempotency_key');

      const checkReq = index.get(entry.idempotencyKey);
      checkReq.onsuccess = () => {
        if (checkReq.result) {
          // Already enqueued with this idempotency key - preserve existing
          resolve();
          return;
        }

        const putReq = store.put(entry);
        putReq.onsuccess = () => resolve();
        putReq.onerror = () => reject(putReq.error);
      };

      checkReq.onerror = () => reject(checkReq.error);
      tx.onerror = () => reject(tx.error);
    });
  }

  public async peekPending(batchSize: number = 25): Promise<OutboxEntry[]> {
    const db = await this.edgeDb.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('outbox_events', 'readonly');
      const store = tx.objectStore('outbox_events');
      const index = store.index('by_status');
      const req = index.getAll('PENDING', batchSize);

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  public async markSynced(id: string): Promise<void> {
    const db = await this.edgeDb.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('outbox_events', 'readwrite');
      const store = tx.objectStore('outbox_events');
      const req = store.get(id);

      req.onsuccess = () => {
        const item = req.result;
        if (!item) {
          resolve();
          return;
        }
        item.status = 'SYNCED';
        store.put(item);
        tx.oncomplete = () => resolve();
      };
      req.onerror = () => reject(req.error);
    });
  }

  public async markFailed(id: string, error: string): Promise<void> {
    const db = await this.edgeDb.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('outbox_events', 'readwrite');
      const store = tx.objectStore('outbox_events');
      const req = store.get(id);

      req.onsuccess = () => {
        const item = req.result;
        if (!item) {
          resolve();
          return;
        }
        item.status = 'FAILED';
        item.retryCount = (item.retryCount || 0) + 1;
        item.lastError = error;
        store.put(item);
        tx.oncomplete = () => resolve();
      };
      req.onerror = () => reject(req.error);
    });
  }

  public async getPendingCount(): Promise<number> {
    const pending = await this.peekPending(1000);
    return pending.length;
  }

  public async clearAll(): Promise<void> {
    const db = await this.edgeDb.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('outbox_events', 'readwrite');
      const store = tx.objectStore('outbox_events');
      store.clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}
