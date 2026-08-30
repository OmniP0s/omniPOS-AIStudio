// Enterprise IndexedDB Client Terminal Storage Engine (v2)
// Provides backwards-compatible bridge and wraps the typed EdgeDatabase & EdgeRepositories.

import { Order, Shift, InventoryItem } from '../../types';
import { globalEdgeDatabase, EdgeDatabase } from './edgeDatabase';
import {
  EdgeOrderRepository,
  EdgeShiftRepository,
  EdgeInventoryRepository,
  EdgeOutboxStore,
} from './edgeRepositories';

export interface IIndexedDbConfig {
  dbName: string;
  version: number;
}

export class IndexedDbStorage {
  private edgeDb: EdgeDatabase;
  private orderRepo: EdgeOrderRepository;
  private shiftRepo: EdgeShiftRepository;
  private inventoryRepo: EdgeInventoryRepository;
  private outboxStore: EdgeOutboxStore;

  constructor(config: IIndexedDbConfig = { dbName: 'omni_pos_edge_db', version: 2 }) {
    this.edgeDb = new EdgeDatabase(config.dbName, config.version);
    this.orderRepo = new EdgeOrderRepository(this.edgeDb);
    this.shiftRepo = new EdgeShiftRepository(this.edgeDb);
    this.inventoryRepo = new EdgeInventoryRepository(this.edgeDb);
    this.outboxStore = new EdgeOutboxStore(this.edgeDb);
  }

  public async init(): Promise<boolean> {
    try {
      await this.edgeDb.open();
      return true;
    } catch (err) {
      console.warn('[IndexedDbStorage] Initialization error:', err);
      return false;
    }
  }

  public async storeOrder(order: Order): Promise<void> {
    const tenantId = order.tenantId || 'tenant-sa-001';
    await this.orderRepo.save(tenantId, order);
  }

  public async getOrder(id: string, tenantId: string = 'tenant-sa-001'): Promise<Order | null> {
    return this.orderRepo.findById(tenantId, id);
  }

  public async getAllOrders(tenantId: string = 'tenant-sa-001'): Promise<Order[]> {
    return this.orderRepo.findMany(tenantId);
  }

  public async storeShift(shift: Shift): Promise<void> {
    const tenantId = shift.tenantId || 'tenant-sa-001';
    await this.shiftRepo.save(tenantId, shift);
  }

  public async getShift(id: string, tenantId: string = 'tenant-sa-001'): Promise<Shift | null> {
    return this.shiftRepo.findById(tenantId, id);
  }

  public async getAllShifts(tenantId: string = 'tenant-sa-001'): Promise<Shift[]> {
    return this.shiftRepo.findMany(tenantId);
  }

  public async storeInventory(item: InventoryItem, tenantId: string = 'tenant-sa-001'): Promise<void> {
    await this.inventoryRepo.save(tenantId, item);
  }

  public async getInventory(id: string, tenantId: string = 'tenant-sa-001'): Promise<InventoryItem | null> {
    return this.inventoryRepo.findById(tenantId, id);
  }

  public async getAllInventory(tenantId: string = 'tenant-sa-001'): Promise<InventoryItem[]> {
    return this.inventoryRepo.findMany(tenantId);
  }

  public async queueOutboxMessage(msg: {
    id: string;
    eventType: string;
    payload: any;
    status: 'PENDING' | 'SYNCED' | 'FAILED';
    timestamp: number;
    vectorClock?: Record<string, number>;
    tenantId?: string;
    branchId?: string;
    terminalId?: string;
    idempotencyKey?: string;
  }): Promise<void> {
    await this.outboxStore.enqueue({
      id: msg.id,
      tenantId: msg.tenantId || 'tenant-sa-001',
      branchId: msg.branchId || 'branch-01',
      terminalId: msg.terminalId || 'POS-TERMINAL-01',
      entityType: 'ORDER',
      entityId: msg.id,
      operation: 'CREATE',
      payload: msg.payload,
      idempotencyKey: msg.idempotencyKey || `idem-${msg.id}`,
      createdAt: new Date(msg.timestamp || Date.now()).toISOString(),
      status: msg.status === 'SYNCED' ? 'SYNCED' : msg.status === 'FAILED' ? 'FAILED' : 'PENDING',
      retryCount: 0,
      vectorClock: msg.vectorClock || {},
    });
  }

  public async getPendingOutbox(): Promise<any[]> {
    return this.outboxStore.peekPending();
  }

  public async clearSyncedOutbox(id: string): Promise<void> {
    await this.outboxStore.markSynced(id);
  }
}

export const globalIndexedDb = new IndexedDbStorage();
