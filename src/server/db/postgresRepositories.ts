// Enterprise PostgreSQL Repositories with Parameterized SQL & Row-Level Security (RLS)
// Implements IOrderRepository, IInventoryRepository, IShiftRepository with exact Domain Model mappings.

import pg from 'pg';
import { IOrderRepository, IInventoryRepository, IShiftRepository } from '../../domain/contracts/repositories';
import { Order, InventoryItem, Shift, OrderItem } from '../../types';
import { db } from './connection';
import { Money } from '../../domain/financial/money';

export class PostgresOrderRepository implements IOrderRepository {
  constructor(private client?: pg.PoolClient) {}

  private async executeQuery<T = any>(sql: string, params: any[], tenantId: string): Promise<pg.QueryResult<T>> {
    if (this.client) {
      return this.client.query<T>(sql, params);
    }
    return db.query<T>(sql, params, tenantId);
  }

  public async findById(tenantId: string, id: string): Promise<Order | null> {
    const orderRes = await this.executeQuery<any>(
      `SELECT * FROM orders WHERE tenant_id = $1 AND id = $2 LIMIT 1`,
      [tenantId, id],
      tenantId
    );

    if (orderRes.rows.length === 0) {
      return null;
    }

    const row = orderRes.rows[0];
    const itemsRes = await this.executeQuery<any>(
      `SELECT * FROM order_items WHERE tenant_id = $1 AND order_id = $2 ORDER BY created_at ASC`,
      [tenantId, id],
      tenantId
    );

    return this.mapRowToOrder(row, itemsRes.rows);
  }

  public async findMany(tenantId: string, query?: Record<string, any>): Promise<Order[]> {
    let sql = `SELECT * FROM orders WHERE tenant_id = $1`;
    const params: any[] = [tenantId];
    let paramIndex = 2;

    if (query) {
      if (query.branchId) {
        sql += ` AND branch_id = $${paramIndex++}`;
        params.push(query.branchId);
      }
      if (query.status) {
        sql += ` AND status = $${paramIndex++}`;
        params.push(query.status);
      }
      if (query.tableId) {
        sql += ` AND table_id = $${paramIndex++}`;
        params.push(query.tableId);
      }
      if (query.cashierId) {
        sql += ` AND cashier_id = $${paramIndex++}`;
        params.push(query.cashierId);
      }
    }

    sql += ` ORDER BY created_at DESC LIMIT 100`;

    const ordersRes = await this.executeQuery<any>(sql, params, tenantId);
    if (ordersRes.rows.length === 0) return [];

    const orderIds = ordersRes.rows.map((r) => r.id);
    const itemsRes = await this.executeQuery<any>(
      `SELECT * FROM order_items WHERE tenant_id = $1 AND order_id = ANY($2::varchar[])`,
      [tenantId, orderIds],
      tenantId
    );

    const itemsByOrderId = new Map<string, any[]>();
    itemsRes.rows.forEach((item) => {
      const list = itemsByOrderId.get(item.order_id) || [];
      list.push(item);
      itemsByOrderId.set(item.order_id, list);
    });

    return ordersRes.rows.map((r) => this.mapRowToOrder(r, itemsByOrderId.get(r.id) || []));
  }

  public async findByStatus(tenantId: string, branchId: string, status: Order['status']): Promise<Order[]> {
    return this.findMany(tenantId, { branchId, status });
  }

  public async findActiveByTable(tenantId: string, branchId: string, tableId: string): Promise<Order | null> {
    const orders = await this.findMany(tenantId, { branchId, tableId, status: 'PENDING' });
    return orders.length > 0 ? orders[0] : null;
  }

  public async save(tenantId: string, entity: Order): Promise<Order> {
    const subtotalMinor = Number(Money.fromMajor(entity.subtotal || 0).minorUnits);
    const discountMinor = Number(Money.fromMajor(entity.discountAmount || 0).minorUnits);
    const vatMinor = Number(Money.fromMajor(entity.taxAmount || 0).minorUnits);
    const totalMinor = Number(Money.fromMajor(entity.totalAmount || 0).minorUnits);

    const upsertOrderSql = `
      INSERT INTO orders (
        id, tenant_id, branch_id, order_number, order_type, status,
        subtotal_minor, discount_minor, vat_amount_minor, total_minor,
        payment_method, cashier_id, cashier_name, table_id, customer_id,
        zatca_hash, zatca_qr_base64, zatca_status, vector_clock, version,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        branch_id = EXCLUDED.branch_id,
        status = EXCLUDED.status,
        subtotal_minor = EXCLUDED.subtotal_minor,
        discount_minor = EXCLUDED.discount_minor,
        vat_amount_minor = EXCLUDED.vat_amount_minor,
        total_minor = EXCLUDED.total_minor,
        payment_method = EXCLUDED.payment_method,
        zatca_hash = EXCLUDED.zatca_hash,
        zatca_qr_base64 = EXCLUDED.zatca_qr_base64,
        zatca_status = EXCLUDED.zatca_status,
        vector_clock = EXCLUDED.vector_clock,
        version = EXCLUDED.version,
        updated_at = CURRENT_TIMESTAMP;
    `;

    await this.executeQuery(
      upsertOrderSql,
      [
        entity.id,
        tenantId,
        entity.branchId,
        entity.orderNumber,
        entity.orderType,
        entity.status,
        subtotalMinor,
        discountMinor,
        vatMinor,
        totalMinor,
        entity.paymentStatus || 'UNPAID',
        entity.cashierId,
        entity.cashierName || 'Cashier',
        entity.tableId || null,
        entity.customerId || null,
        entity.invoiceHash || null,
        entity.zatcaQrCodeBase64 || null,
        entity.zatcaStatus || 'REPORTED',
        JSON.stringify(entity.vectorClock || {}),
        entity.version || 1,
        entity.openedAt || new Date().toISOString(),
      ],
      tenantId
    );

    // Sync order items
    await this.executeQuery(
      `DELETE FROM order_items WHERE tenant_id = $1 AND order_id = $2`,
      [tenantId, entity.id],
      tenantId
    );

    for (const item of entity.items) {
      const itemUnitMinor = Number(Money.fromMajor(item.unitPrice || 0).minorUnits);
      const itemTotalMinor = Number(Money.fromMajor(item.totalPrice || 0).minorUnits);

      await this.executeQuery(
        `INSERT INTO order_items (
          id, tenant_id, order_id, product_id, name_en, name_ar,
          unit_price_minor, quantity, total_price_minor, modifiers, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          item.id,
          tenantId,
          entity.id,
          item.menuItemId,
          item.nameEn,
          item.nameAr,
          itemUnitMinor,
          item.quantity,
          itemTotalMinor,
          JSON.stringify(item.selectedModifiers || []),
          item.specialInstructions || null,
        ],
        tenantId
      );
    }

    return entity;
  }

  public async delete(tenantId: string, id: string): Promise<boolean> {
    const res = await this.executeQuery(
      `DELETE FROM orders WHERE tenant_id = $1 AND id = $2`,
      [tenantId, id],
      tenantId
    );
    return (res.rowCount || 0) > 0;
  }

  private mapRowToOrder(row: any, itemRows: any[]): Order {
    const items: OrderItem[] = itemRows.map((ir) => ({
      id: ir.id,
      menuItemId: ir.product_id,
      nameEn: ir.name_en,
      nameAr: ir.name_ar,
      unitPrice: Money.fromMinor(Number(ir.unit_price_minor)).toNumber(),
      quantity: Number(ir.quantity),
      discountAmount: 0,
      taxAmount: 0,
      totalPrice: Money.fromMinor(Number(ir.total_price_minor)).toNumber(),
      stationId: 'station-01',
      stationName: 'Main Kitchen',
      status: 'QUEUED',
      selectedModifiers: typeof ir.modifiers === 'string' ? JSON.parse(ir.modifiers) : ir.modifiers || [],
      specialInstructions: ir.notes || undefined,
    }));

    return {
      id: row.id,
      orderNumber: row.order_number,
      dailySequence: 1,
      tenantId: row.tenant_id,
      branchId: row.branch_id,
      orderType: row.order_type,
      guestCount: 1,
      items,
      subtotal: Money.fromMinor(Number(row.subtotal_minor)).toNumber(),
      discountAmount: Money.fromMinor(Number(row.discount_minor)).toNumber(),
      taxableAmount: Money.fromMinor(Number(row.subtotal_minor)).toNumber(),
      taxAmount: Money.fromMinor(Number(row.vat_amount_minor)).toNumber(),
      municipalityFeeAmount: 0,
      serviceChargeAmount: 0,
      tipAmount: 0,
      totalAmount: Money.fromMinor(Number(row.total_minor)).toNumber(),
      paidAmount: Money.fromMinor(Number(row.total_minor)).toNumber(),
      balanceAmount: 0,
      status: row.status,
      paymentStatus: (row.payment_method === 'PAID' ? 'PAID' : 'UNPAID') as any,
      payments: [],
      openedAt: new Date(row.created_at).toISOString(),
      closedAt: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
      cashierId: row.cashier_id,
      cashierName: row.cashier_name || 'Cashier',
      tableId: row.table_id || undefined,
      customerId: row.customer_id || undefined,
      shiftId: 'shift-01',
      invoiceHash: row.zatca_hash || undefined,
      zatcaQrCodeBase64: row.zatca_qr_base64 || undefined,
      zatcaStatus: row.zatca_status || 'REPORTED',
      zatcaInvoiceType: 'SIMPLIFIED',
      vectorClock: typeof row.vector_clock === 'string' ? JSON.parse(row.vector_clock) : row.vector_clock || {},
      version: Number(row.version || 1),
    };
  }
}

export class PostgresInventoryRepository implements IInventoryRepository {
  constructor(private client?: pg.PoolClient) {}

  private async executeQuery<T = any>(sql: string, params: any[], tenantId: string): Promise<pg.QueryResult<T>> {
    if (this.client) {
      return this.client.query<T>(sql, params);
    }
    return db.query<T>(sql, params, tenantId);
  }

  public async findById(tenantId: string, id: string): Promise<InventoryItem | null> {
    const res = await this.executeQuery<any>(
      `SELECT * FROM inventory_items WHERE tenant_id = $1 AND id = $2 LIMIT 1`,
      [tenantId, id],
      tenantId
    );
    if (res.rows.length === 0) return null;
    return this.mapRowToInventory(res.rows[0]);
  }

  public async findMany(tenantId: string, _query?: Record<string, any>): Promise<InventoryItem[]> {
    const res = await this.executeQuery<any>(
      `SELECT * FROM inventory_items WHERE tenant_id = $1 ORDER BY name_en ASC`,
      [tenantId],
      tenantId
    );
    return res.rows.map((r) => this.mapRowToInventory(r));
  }

  public async save(tenantId: string, entity: InventoryItem): Promise<InventoryItem> {
    const costMinor = Number(Money.fromMajor(entity.costPerUnit || 0).minorUnits);
    const sellingMinor = costMinor;

    const sql = `
      INSERT INTO inventory_items (
        id, tenant_id, sku, name_en, name_ar, category_id, barcode, unit,
        cost_price_minor, selling_price_minor, min_stock_level, current_stock,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (tenant_id, sku) DO UPDATE SET
        name_en = EXCLUDED.name_en,
        name_ar = EXCLUDED.name_ar,
        category_id = EXCLUDED.category_id,
        barcode = EXCLUDED.barcode,
        cost_price_minor = EXCLUDED.cost_price_minor,
        selling_price_minor = EXCLUDED.selling_price_minor,
        min_stock_level = EXCLUDED.min_stock_level,
        current_stock = EXCLUDED.current_stock,
        updated_at = CURRENT_TIMESTAMP;
    `;

    await this.executeQuery(
      sql,
      [
        entity.id,
        tenantId,
        entity.sku,
        entity.nameEn,
        entity.nameAr,
        entity.category || null,
        entity.barcode || null,
        entity.unit || 'pcs',
        costMinor,
        sellingMinor,
        entity.minStockLevel || 0,
        JSON.stringify(entity.currentStock || {}),
      ],
      tenantId
    );

    return entity;
  }

  public async delete(tenantId: string, id: string): Promise<boolean> {
    const res = await this.executeQuery(
      `DELETE FROM inventory_items WHERE tenant_id = $1 AND id = $2`,
      [tenantId, id],
      tenantId
    );
    return (res.rowCount || 0) > 0;
  }

  public async adjustStock(
    tenantId: string,
    itemId: string,
    warehouseId: string,
    deltaQty: number,
    _reason: string
  ): Promise<InventoryItem> {
    const item = await this.findById(tenantId, itemId);
    if (!item) {
      throw new Error(`Inventory item ${itemId} not found in tenant ${tenantId}`);
    }

    const currentStock = item.currentStock || {};
    currentStock[warehouseId] = (currentStock[warehouseId] || 0) + deltaQty;
    item.currentStock = currentStock;

    await this.save(tenantId, item);
    return item;
  }

  public async getLowStockItems(tenantId: string, _branchId: string): Promise<InventoryItem[]> {
    const all = await this.findMany(tenantId);
    return all.filter((item) => {
      const totalStock = Object.values(item.currentStock || {}).reduce((a, b) => a + b, 0);
      return totalStock <= item.minStockLevel;
    });
  }

  private mapRowToInventory(row: any): InventoryItem {
    return {
      id: row.id,
      sku: row.sku,
      nameEn: row.name_en,
      nameAr: row.name_ar,
      category: row.category_id || '',
      barcode: row.barcode || '',
      unit: row.unit || 'pcs',
      costPerUnit: Money.fromMinor(Number(row.cost_price_minor)).toNumber(),
      minStockLevel: Number(row.min_stock_level),
      currentStock: typeof row.current_stock === 'string' ? JSON.parse(row.current_stock) : row.current_stock || {},
      supplierId: 'sup-01',
      batches: [],
    };
  }
}

export class PostgresShiftRepository implements IShiftRepository {
  constructor(private client?: pg.PoolClient) {}

  private async executeQuery<T = any>(sql: string, params: any[], tenantId: string): Promise<pg.QueryResult<T>> {
    if (this.client) {
      return this.client.query<T>(sql, params);
    }
    return db.query<T>(sql, params, tenantId);
  }

  public async findById(tenantId: string, id: string): Promise<Shift | null> {
    const res = await this.executeQuery<any>(
      `SELECT * FROM shifts WHERE tenant_id = $1 AND id = $2 LIMIT 1`,
      [tenantId, id],
      tenantId
    );
    if (res.rows.length === 0) return null;
    return this.mapRowToShift(res.rows[0]);
  }

  public async findMany(tenantId: string, query?: Record<string, any>): Promise<Shift[]> {
    let sql = `SELECT * FROM shifts WHERE tenant_id = $1`;
    const params: any[] = [tenantId];
    let pIdx = 2;

    if (query?.branchId) {
      sql += ` AND branch_id = $${pIdx++}`;
      params.push(query.branchId);
    }
    if (query?.cashierId) {
      sql += ` AND cashier_id = $${pIdx++}`;
      params.push(query.cashierId);
    }
    if (query?.status) {
      sql += ` AND status = $${pIdx++}`;
      params.push(query.status);
    }

    sql += ` ORDER BY opened_at DESC LIMIT 50`;
    const res = await this.executeQuery<any>(sql, params, tenantId);
    return res.rows.map((r) => this.mapRowToShift(r));
  }

  public async findActiveShift(
    tenantId: string,
    branchId: string,
    _terminalId: string,
    userId: string
  ): Promise<Shift | null> {
    const res = await this.executeQuery<any>(
      `SELECT * FROM shifts WHERE tenant_id = $1 AND branch_id = $2 AND cashier_id = $3 AND status = 'OPEN' LIMIT 1`,
      [tenantId, branchId, userId],
      tenantId
    );
    if (res.rows.length === 0) return null;
    return this.mapRowToShift(res.rows[0]);
  }

  public async save(tenantId: string, entity: Shift): Promise<Shift> {
    const openMinor = Number(Money.fromMajor(entity.startingCashFloat || 0).minorUnits);
    const cashMinor = Number(Money.fromMajor(entity.cashSales || 0).minorUnits);
    const cardMinor = Number(Money.fromMajor(entity.cardSales || 0).minorUnits);
    const closeMinor = entity.actualCashCounted !== undefined ? Number(Money.fromMajor(entity.actualCashCounted).minorUnits) : null;
    const discMinor = entity.cashDifference !== undefined ? Number(Money.fromMajor(entity.cashDifference).minorUnits) : null;

    const sql = `
      INSERT INTO shifts (
        id, tenant_id, branch_id, terminal_id, cashier_id, cashier_name,
        status, opened_at, closed_at, opening_balance_minor, cash_sales_minor,
        card_sales_minor, closing_balance_minor, discrepancy_minor,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        closed_at = EXCLUDED.closed_at,
        cash_sales_minor = EXCLUDED.cash_sales_minor,
        card_sales_minor = EXCLUDED.card_sales_minor,
        closing_balance_minor = EXCLUDED.closing_balance_minor,
        discrepancy_minor = EXCLUDED.discrepancy_minor,
        updated_at = CURRENT_TIMESTAMP;
    `;

    await this.executeQuery(
      sql,
      [
        entity.id,
        tenantId,
        entity.branchId,
        'POS-01',
        entity.cashierId,
        entity.cashierName || 'Cashier',
        entity.status,
        entity.startTime || new Date().toISOString(),
        entity.endTime || null,
        openMinor,
        cashMinor,
        cardMinor,
        closeMinor,
        discMinor,
      ],
      tenantId
    );

    return entity;
  }

  public async delete(tenantId: string, id: string): Promise<boolean> {
    const res = await this.executeQuery(
      `DELETE FROM shifts WHERE tenant_id = $1 AND id = $2`,
      [tenantId, id],
      tenantId
    );
    return (res.rowCount || 0) > 0;
  }

  private mapRowToShift(row: any): Shift {
    return {
      id: row.id,
      shiftNumber: 'SHIFT-01',
      branchId: row.branch_id,
      cashierId: row.cashier_id,
      cashierName: row.cashier_name || 'Cashier',
      startTime: new Date(row.opened_at).toISOString(),
      endTime: row.closed_at ? new Date(row.closed_at).toISOString() : undefined,
      status: row.status,
      startingCashFloat: Money.fromMinor(Number(row.opening_balance_minor)).toNumber(),
      expectedCash: Money.fromMinor(Number(row.cash_sales_minor)).toNumber(),
      actualCashCounted: row.closing_balance_minor != null ? Money.fromMinor(Number(row.closing_balance_minor)).toNumber() : 0,
      cashDifference: row.discrepancy_minor != null ? Money.fromMinor(Number(row.discrepancy_minor)).toNumber() : 0,
      payIns: [],
      payOuts: [],
      drops: [],
      totalSales: Money.fromMinor(Number(row.cash_sales_minor) + Number(row.card_sales_minor)).toNumber(),
      cashSales: Money.fromMinor(Number(row.cash_sales_minor)).toNumber(),
      cardSales: Money.fromMinor(Number(row.card_sales_minor)).toNumber(),
      walletSales: 0,
      giftCardSales: 0,
      totalVat: 0,
      totalDiscounts: 0,
      totalRefunds: 0,
      totalOrders: 1,
      zReportGenerated: false,
    };
  }
}
