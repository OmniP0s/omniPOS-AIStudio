import { describe, it, expect, beforeEach } from 'vitest';
import { posStore, calculateOrderTotals, globalOutboxEngine } from '../services/posStateService';
import { Money } from '../domain/financial/money';
import { VectorClockEngine } from '../server/sync/outboxEngine';
import { Order, OrderItem } from '../types';

describe('Phase 2 Integration: POS State Service, Money Arithmetic & Outbox Pipeline', () => {
  beforeEach(() => {
    // Reset or ensure baseline state
  });

  it('calculates order financial totals using arbitrary precision Money value objects', () => {
    const items: OrderItem[] = [
      {
        id: 'item-1',
        menuItemId: 'item-wagyu-burger',
        nameEn: 'Truffle Wagyu Burger',
        nameAr: 'برجر الواغيو بالكمأة الفاخرة',
        unitPrice: 68.0,
        quantity: 2,
        discountAmount: 0,
        taxAmount: 0,
        totalPrice: 0,
        stationId: 'st-grill',
        stationName: 'Grill Station',
        status: 'QUEUED',
        selectedModifiers: [
          { groupId: 'mod-addons', groupName: 'Add-ons', optionId: 'opt-bacon', optionName: 'Crispy Beef Bacon', price: 6.0 },
        ],
      },
      {
        id: 'item-2',
        menuItemId: 'item-truffle-fries',
        nameEn: 'Parmesan Truffle Fries',
        nameAr: 'بطاطس مقلية بالبارميزان',
        unitPrice: 28.0,
        quantity: 1,
        discountAmount: 0,
        taxAmount: 0,
        totalPrice: 0,
        stationId: 'st-fryer',
        stationName: 'Fryer Station',
        status: 'QUEUED',
        selectedModifiers: [],
      },
    ];

    // Item 1: (68 + 6) * 2 = 148.00 SAR
    // Item 2: 28.00 * 1 = 28.00 SAR
    // Subtotal: 176.00 SAR
    // Discount: 16.00 SAR -> Net: 160.00 SAR
    const result = calculateOrderTotals(items, 16.0, 0.15);

    expect(result.subtotal).toBe(176.0);
    expect(result.discountAmount).toBe(16.0);
    expect(result.totalAmount).toBe(160.0);

    // Verify ZATCA 15% inclusive VAT decomposition
    // Net: 160.00 SAR -> Tax Basis = 160 / 1.15 = 139.1304... -> 139.13 SAR
    // VAT = 160.00 - 139.13 = 20.87 SAR
    expect(result.taxableAmount).toBe(139.13);
    expect(result.taxAmount).toBe(20.87);

    // Sum check
    const sum = Money.fromMajor(result.taxableAmount, 'SAR').add(Money.fromMajor(result.taxAmount, 'SAR'));
    expect(sum.toNumber()).toBe(160.0);
  });

  it('increments Vector Clocks and enqueues idempotent events on saveOrder', async () => {
    const testOrder: Order = {
      id: 'ord-test-vector-101',
      orderNumber: '#ORD-TEST-101',
      dailySequence: 101,
      tenantId: 'tenant-sa-001',
      branchId: 'branch-01',
      orderType: 'TAKEAWAY',
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
      paidAmount: 0,
      balanceAmount: 100,
      status: 'PREPARING',
      paymentStatus: 'UNPAID',
      payments: [],
      openedAt: new Date().toISOString(),
      cashierId: 'usr-admin-01',
      cashierName: 'Admin',
      shiftId: 'shift-01',
      zatcaStatus: 'NOT_APPLICABLE',
      zatcaInvoiceType: 'SIMPLIFIED',
      vectorClock: { 'POS-01': 1 },
      version: 1,
    };

    const saved = posStore.saveOrder(testOrder);
    expect(saved.version).toBe(2);
    expect(saved.vectorClock?.['usr-admin-01']).toBe(1);

    // Save again to verify monotonic tick
    const updated = posStore.saveOrder(saved);
    expect(updated.version).toBe(3);
    expect(updated.vectorClock?.['usr-admin-01']).toBe(2);

    // Verify outbox has pending batch
    const batch = await globalOutboxEngine.getPendingBatch('tenant-sa-001', 10);
    expect(batch.length).toBeGreaterThan(0);
    const orderEvents = batch.filter(b => b.aggregateId === 'ord-test-vector-101');
    expect(orderEvents.length).toBeGreaterThan(0);
  });

  it('processes order payment with exact cash change, shift updates, and ZATCA invoice generation', async () => {
    const initialOrders = posStore.getOrders();
    const order = initialOrders.find(o => o.paymentStatus === 'UNPAID') || initialOrders[0];
    const initialShiftExpectedCash = posStore.getShift().expectedCash;

    const tenderedCash = order.balanceAmount + 50.0;
    const { order: completedOrder, zatcaResult } = await posStore.processOrderPayment(
      order.id,
      'CASH',
      tenderedCash,
      10.0 // 10 SAR tip
    );

    expect(completedOrder.paymentStatus).toBe('PAID');
    expect(completedOrder.status).toBe('COMPLETED');
    expect(completedOrder.balanceAmount).toBe(0);
    expect(completedOrder.paidAmount).toBeGreaterThan(0);
    expect(completedOrder.payments.length).toBeGreaterThan(0);

    const cashPayment = completedOrder.payments.find(p => p.method === 'CASH');
    expect(cashPayment).toBeDefined();
    expect(cashPayment?.changeGiven).toBe(50.0);
    expect(cashPayment?.tipAmount).toBe(10.0);

    // Verify shift cash incremented
    const currentShift = posStore.getShift();
    expect(currentShift.expectedCash).toBeGreaterThan(initialShiftExpectedCash);

    // Verify ZATCA integration
    expect(completedOrder.zatcaStatus).toBeDefined();
    expect(completedOrder.zatcaQrCodeBase64).toBeDefined();
  });
});
