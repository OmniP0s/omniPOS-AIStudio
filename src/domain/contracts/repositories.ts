// Enterprise Repository & UnitOfWork Port Contracts
// Pure Hexagonal boundaries decoupled from database implementations

import { DiningTable, Order, InventoryItem, Shift, Customer } from '../../types';

export interface IRepository<T, TID = string> {
  findById(tenantId: string, id: TID): Promise<T | null>;
  findMany(tenantId: string, query?: Record<string, any>): Promise<T[]>;
  save(tenantId: string, entity: T): Promise<T>;
  delete(tenantId: string, id: TID): Promise<boolean>;
}

export interface IOrderRepository extends IRepository<Order> {
  findByStatus(tenantId: string, branchId: string, status: Order['status']): Promise<Order[]>;
  findActiveByTable(tenantId: string, branchId: string, tableId: string): Promise<Order | null>;
}

export interface IInventoryRepository extends IRepository<InventoryItem> {
  adjustStock(tenantId: string, itemId: string, warehouseId: string, deltaQty: number, reason: string): Promise<InventoryItem>;
  getLowStockItems(tenantId: string, branchId: string): Promise<InventoryItem[]>;
}

export interface IShiftRepository extends IRepository<Shift> {
  findActiveShift(tenantId: string, branchId: string, terminalId: string, userId: string): Promise<Shift | null>;
}

export interface IUnitOfWork {
  executeInTransaction<T>(work: () => Promise<T>): Promise<T>;
}
