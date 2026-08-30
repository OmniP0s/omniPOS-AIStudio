// Enterprise Automated Accounting Postings Engine
// Maps operational POS events, refunds, inventory movements, and cash drawer settlements
// into balanced, immutable, double-entry journal entries

import { Money } from '../financial/money';
import { DoubleEntryEngine } from './doubleEntryEngine';
import { JournalEntryModel, JournalLineModel } from './ledgerDomain';

export interface PosOrderPayment {
  method: 'CASH' | 'MADA' | 'VISA' | 'MASTERCARD' | 'APPLE_PAY' | 'WALLET' | 'GIFT_CARD' | 'AR_CORPORATE';
  amount: Money;
}

export interface PosOrderPostingRequest {
  tenantId: string;
  branchId: string;
  orderNumber: string;
  orderId: string;
  orderType: string;
  subtotal: Money; // Gross sales before discount
  discountAmount: Money;
  taxableAmount: Money; // Subtotal - discount
  vatAmount: Money; // 15% VAT
  totalAmount: Money; // TaxableAmount + vatAmount
  payments: PosOrderPayment[];
  foodRevenueShare?: Money;
  beverageRevenueShare?: Money;
  postedBy?: string;
}

export interface PosRefundPostingRequest {
  tenantId: string;
  branchId: string;
  originalOrderNumber: string;
  refundNumber: string;
  refundId: string;
  refundSubtotal: Money;
  refundVatAmount: Money;
  refundTotalAmount: Money;
  refundPaymentMethod: 'CASH' | 'MADA' | 'VISA' | 'WALLET';
  reason: string;
  postedBy?: string;
}

export interface InventoryCogsPostingRequest {
  tenantId: string;
  branchId: string;
  referenceDoc: string;
  cogsAmount: Money;
  category: 'MEAT_POULTRY' | 'PRODUCE_DAIRY' | 'BEVERAGES_COFFEE' | 'PACKAGING' | 'WASTE';
  memo: string;
  postedBy?: string;
}

export interface CashDrawerSettlementPostingRequest {
  tenantId: string;
  branchId: string;
  shiftId: string;
  cashierName: string;
  expectedCash: Money;
  actualCashCounted: Money;
  postedBy?: string;
}

export class AccountingPostingsService {
  constructor(private engine: DoubleEntryEngine) {}

  /**
   * 1. Posts Double-Entry Journal for Completed POS Sale
   * Dr. Cash / Card / Wallet / AR (Tenders)
   * Dr. Sales Discounts & Promotional Allowances (if any)
   * Cr. Food & Beverage Sales Revenue
   * Cr. Output VAT Payable (15% ZATCA)
   */
  public postOrderSale(req: PosOrderPostingRequest): JournalEntryModel {
    const lines: JournalLineModel[] = [];
    const postedBy = req.postedBy || 'OmniPOS Auto-Accounting Engine';
    const currency = req.totalAmount.currency;

    // --- DEBITS (Tenders & Discounts) ---
    for (let i = 0; i < req.payments.length; i++) {
      const p = req.payments[i];
      if (p.amount.isPositive()) {
        let accountCode = '1010';
        let accountName = 'Cash on Hand (Drawers)';

        if (p.method === 'MADA' || p.method === 'VISA' || p.method === 'MASTERCARD' || p.method === 'APPLE_PAY') {
          accountCode = '1030';
          accountName = 'mada POS Card Clearing';
        } else if (p.method === 'WALLET' || p.method === 'GIFT_CARD') {
          accountCode = '2040';
          accountName = 'Customer Digital Wallet Deposits';
        } else if (p.method === 'AR_CORPORATE') {
          accountCode = '1040';
          accountName = 'Accounts Receivable (Corporate B2B)';
        }

        lines.push({
          id: `line-tender-${i + 1}`,
          accountId: `coa-${accountCode}-${req.tenantId}`,
          accountCode,
          accountName,
          debit: p.amount,
          credit: Money.zero(currency),
          memo: `${p.method} collection for Order ${req.orderNumber}`,
          branchId: req.branchId,
        });
      }
    }

    // Debit Discount Expense/Contra-Revenue if discount exists
    if (req.discountAmount.isPositive()) {
      lines.push({
        id: `line-disc-${Date.now()}`,
        accountId: `coa-4090-${req.tenantId}`,
        accountCode: '4090',
        accountName: 'Sales Discounts & Promotional Allowances',
        debit: req.discountAmount,
        credit: Money.zero(currency),
        memo: `Promotional discount for Order ${req.orderNumber}`,
        branchId: req.branchId,
      });
    }

    // --- CREDITS (Revenue & Output VAT) ---
    // Gross Revenue breakdown
    const foodRevenue = req.foodRevenueShare || (req.beverageRevenueShare ? req.subtotal.subtract(req.beverageRevenueShare) : req.subtotal);
    if (foodRevenue.isPositive()) {
      lines.push({
        id: `line-rev-food`,
        accountId: `coa-4010-${req.tenantId}`,
        accountCode: '4010',
        accountName: 'Food Sales (Dine-In & Takeaway)',
        debit: Money.zero(currency),
        credit: foodRevenue,
        memo: `Food sales revenue for Order ${req.orderNumber}`,
        branchId: req.branchId,
      });
    }

    if (req.beverageRevenueShare && req.beverageRevenueShare.isPositive()) {
      lines.push({
        id: `line-rev-bev`,
        accountId: `coa-4020-${req.tenantId}`,
        accountCode: '4020',
        accountName: 'Beverage & Specialty Coffee Sales',
        debit: Money.zero(currency),
        credit: req.beverageRevenueShare,
        memo: `Beverage sales revenue for Order ${req.orderNumber}`,
        branchId: req.branchId,
      });
    }

    // Output VAT Payable (15% ZATCA)
    if (req.vatAmount.isPositive()) {
      lines.push({
        id: `line-tax-vat`,
        accountId: `coa-2020-${req.tenantId}`,
        accountCode: '2020',
        accountName: 'Output VAT Payable (15% ZATCA)',
        debit: Money.zero(currency),
        credit: req.vatAmount,
        memo: `ZATCA 15% VAT on Order ${req.orderNumber}`,
        branchId: req.branchId,
      });
    }

    return this.engine.postJournalEntry({
      tenantId: req.tenantId,
      branchId: req.branchId,
      entryNumber: `JE-SALE-${req.orderNumber}`,
      date: new Date().toISOString().split('T')[0],
      reference: req.orderNumber,
      sourceType: 'POS_SALE',
      sourceId: req.orderId,
      idempotencyKey: `idemp-sale-${req.orderId}`,
      memo: `Auto Sales & VAT Journal for Order ${req.orderNumber} (${req.orderType})`,
      postedBy,
      postedAt: new Date().toISOString(),
      lines,
    });
  }

  /**
   * 2. Posts Double-Entry Journal for POS Refund / Credit Note
   * Dr. Food Sales (Revenue reduction)
   * Dr. Output VAT Payable (VAT liability reduction)
   * Cr. Cash / Card / Wallet (Refund paid to customer)
   */
  public postOrderRefund(req: PosRefundPostingRequest): JournalEntryModel {
    const currency = req.refundTotalAmount.currency;
    const lines: JournalLineModel[] = [];
    const postedBy = req.postedBy || 'OmniPOS Auto-Accounting Engine';

    // Dr. Revenue (reversal)
    lines.push({
      id: `line-ref-rev`,
      accountId: `coa-4010-${req.tenantId}`,
      accountCode: '4010',
      accountName: 'Food Sales (Dine-In & Takeaway)',
      debit: req.refundSubtotal,
      credit: Money.zero(currency),
      memo: `Revenue reversal for Refund ${req.refundNumber} on Order ${req.originalOrderNumber}`,
      branchId: req.branchId,
    });

    // Dr. Output VAT (tax liability reduction)
    if (req.refundVatAmount.isPositive()) {
      lines.push({
        id: `line-ref-vat`,
        accountId: `coa-2020-${req.tenantId}`,
        accountCode: '2020',
        accountName: 'Output VAT Payable (15% ZATCA)',
        debit: req.refundVatAmount,
        credit: Money.zero(currency),
        memo: `VAT liability reduction for Refund ${req.refundNumber}`,
        branchId: req.branchId,
      });
    }

    // Cr. Cash or Card Clearing or Wallet (refund payout)
    let refundAccCode = '1010';
    let refundAccName = 'Cash on Hand (Drawers)';
    if (req.refundPaymentMethod === 'MADA' || req.refundPaymentMethod === 'VISA') {
      refundAccCode = '1030';
      refundAccName = 'mada POS Card Clearing';
    } else if (req.refundPaymentMethod === 'WALLET') {
      refundAccCode = '2040';
      refundAccName = 'Customer Digital Wallet Deposits';
    }

    lines.push({
      id: `line-ref-tender`,
      accountId: `coa-${refundAccCode}-${req.tenantId}`,
      accountCode: refundAccCode,
      accountName: refundAccName,
      debit: Money.zero(currency),
      credit: req.refundTotalAmount,
      memo: `${req.refundPaymentMethod} refund payout to customer (${req.reason})`,
      branchId: req.branchId,
    });

    return this.engine.postJournalEntry({
      tenantId: req.tenantId,
      branchId: req.branchId,
      entryNumber: `JE-REF-${req.refundNumber}`,
      date: new Date().toISOString().split('T')[0],
      reference: req.refundNumber,
      sourceType: 'POS_REFUND',
      sourceId: req.refundId,
      idempotencyKey: `idemp-refund-${req.refundId}`,
      memo: `Refund & Credit Note Journal for ${req.refundNumber} (${req.reason})`,
      postedBy,
      postedAt: new Date().toISOString(),
      lines,
    });
  }

  /**
   * 3. Posts Double-Entry Journal for Inventory Movement / COGS
   * Dr. Cost of Goods Sold (5010/5020/5030/5040/5090)
   * Cr. Raw Material Inventory Asset (1050/1060)
   */
  public postInventoryMovement(req: InventoryCogsPostingRequest): JournalEntryModel {
    const currency = req.cogsAmount.currency;
    let cogsAccCode = '5010';
    let cogsAccName = 'Cost of Meat & Poultry';
    let invAccCode = '1050';
    let invAccName = 'Food & Beverage Raw Inventory';

    if (req.category === 'PRODUCE_DAIRY') {
      cogsAccCode = '5020';
      cogsAccName = 'Cost of Produce & Dairy';
    } else if (req.category === 'BEVERAGES_COFFEE') {
      cogsAccCode = '5030';
      cogsAccName = 'Cost of Coffee & Beverages';
    } else if (req.category === 'PACKAGING') {
      cogsAccCode = '5040';
      cogsAccName = 'Packaging & Disposables Expense';
      invAccCode = '1060';
      invAccName = 'Packaging & Consumables Stock';
    } else if (req.category === 'WASTE') {
      cogsAccCode = '5090';
      cogsAccName = 'Kitchen Spoilage & Waste';
    }

    const lines: JournalLineModel[] = [
      {
        id: `line-cogs-${Date.now()}-1`,
        accountId: `coa-${cogsAccCode}-${req.tenantId}`,
        accountCode: cogsAccCode,
        accountName: cogsAccName,
        debit: req.cogsAmount,
        credit: Money.zero(currency),
        memo: `COGS recognition: ${req.memo}`,
        branchId: req.branchId,
      },
      {
        id: `line-cogs-${Date.now()}-2`,
        accountId: `coa-${invAccCode}-${req.tenantId}`,
        accountCode: invAccCode,
        accountName: invAccName,
        debit: Money.zero(currency),
        credit: req.cogsAmount,
        memo: `Inventory relief: ${req.memo}`,
        branchId: req.branchId,
      },
    ];

    return this.engine.postJournalEntry({
      tenantId: req.tenantId,
      branchId: req.branchId,
      entryNumber: `JE-COGS-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      reference: req.referenceDoc,
      sourceType: 'INVENTORY_COGS_CONSUMPTION',
      sourceId: req.referenceDoc,
      idempotencyKey: `idemp-cogs-${req.referenceDoc}`,
      memo: `Inventory COGS Consumption for ${req.referenceDoc}`,
      postedBy: req.postedBy || 'OmniPOS Inventory Sync',
      postedAt: new Date().toISOString(),
      lines,
    });
  }

  /**
   * 4. Posts Cash Drawer Settlement Discrepancy (Over / Short)
   * If Short: Dr. Cash Over/Short Expense (6070), Cr. Cash on Hand (1010)
   * If Over:  Dr. Cash on Hand (1010), Cr. Cash Over/Short (6070)
   */
  public postCashDrawerSettlement(req: CashDrawerSettlementPostingRequest): JournalEntryModel | null {
    const currency = req.expectedCash.currency;
    const diff = req.actualCashCounted.subtract(req.expectedCash);

    if (diff.isZero()) {
      return null; // Perfectly balanced drawer, no variance adjustment needed
    }

    const lines: JournalLineModel[] = [];
    const isShort = diff.isNegative();
    const absDiff = isShort ? diff.multiply(-1) : diff;

    if (isShort) {
      // Cash is short: recognize expense, reduce cash account
      lines.push({
        id: `line-short-exp`,
        accountId: `coa-6070-${req.tenantId}`,
        accountCode: '6070',
        accountName: 'Cash Over / Short Discrepancy',
        debit: absDiff,
        credit: Money.zero(currency),
        memo: `Cash drawer shortage for shift ${req.shiftId} (${req.cashierName})`,
        branchId: req.branchId,
      });
      lines.push({
        id: `line-short-cash`,
        accountId: `coa-1010-${req.tenantId}`,
        accountCode: '1010',
        accountName: 'Cash on Hand (Drawers)',
        debit: Money.zero(currency),
        credit: absDiff,
        memo: `Drawer adjustment for shortage in shift ${req.shiftId}`,
        branchId: req.branchId,
      });
    } else {
      // Cash is over: increase cash account, credit discrepancy
      lines.push({
        id: `line-over-cash`,
        accountId: `coa-1010-${req.tenantId}`,
        accountCode: '1010',
        accountName: 'Cash on Hand (Drawers)',
        debit: absDiff,
        credit: Money.zero(currency),
        memo: `Drawer adjustment for surplus in shift ${req.shiftId}`,
        branchId: req.branchId,
      });
      lines.push({
        id: `line-over-exp`,
        accountId: `coa-6070-${req.tenantId}`,
        accountCode: '6070',
        accountName: 'Cash Over / Short Discrepancy',
        debit: Money.zero(currency),
        credit: absDiff,
        memo: `Cash drawer surplus for shift ${req.shiftId} (${req.cashierName})`,
        branchId: req.branchId,
      });
    }

    return this.engine.postJournalEntry({
      tenantId: req.tenantId,
      branchId: req.branchId,
      entryNumber: `JE-SETTLE-${req.shiftId}`,
      date: new Date().toISOString().split('T')[0],
      reference: req.shiftId,
      sourceType: 'CASH_DRAWER_SETTLEMENT',
      sourceId: req.shiftId,
      idempotencyKey: `idemp-settle-${req.shiftId}`,
      memo: `Cash Drawer Shift Settlement Reconciliation (${req.cashierName})`,
      postedBy: req.postedBy || 'OmniPOS Shift Reconciliation',
      postedAt: new Date().toISOString(),
      lines,
    });
  }
}
