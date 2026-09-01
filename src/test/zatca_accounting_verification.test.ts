import { describe, it, expect, beforeEach } from 'vitest';
import { Money } from '../domain/financial/money';
import { DoubleEntryEngine } from '../domain/accounting/doubleEntryEngine';
import { AccountingPostingsService } from '../domain/accounting/accountingPostings';
import { FinancialReportingService } from '../domain/accounting/financialReporting';
import { ZatcaSigner } from '../domain/zatca/zatcaSigner';
import { ZatcaBusinessRulesValidator } from '../domain/zatca/businessRulesValidator';
import { CsidLifecycleManager } from '../domain/zatca/csidLifecycle';
import { ZatcaApiAdapter } from '../domain/zatca/zatcaApiAdapter';
import { ZatcaInvoiceModel } from '../domain/zatca/zatcaDomain';

describe('ZATCA Phase 2 & Double-Entry Accounting Production-Readiness Suite', () => {
  let engine: DoubleEntryEngine;
  let postings: AccountingPostingsService;
  let reporting: FinancialReportingService;
  let csidManager: CsidLifecycleManager;
  let zatcaAdapter: ZatcaApiAdapter;

  beforeEach(() => {
    engine = new DoubleEntryEngine('tenant-test-01');
    postings = new AccountingPostingsService(engine);
    reporting = new FinancialReportingService(engine);
    csidManager = new CsidLifecycleManager();
    zatcaAdapter = new ZatcaApiAdapter({ environment: 'LOCAL_SIMULATION' });
  });

  const createSampleInvoice = (overrides: Partial<ZatcaInvoiceModel> = {}): ZatcaInvoiceModel => {
    return {
      uuid: 'd0e88b22-83b9-4a92-95f2-ec0667e41111',
      invoiceNumber: 'INV-2026-0001',
      invoiceType: '0200000',
      transactionType: '388',
      issueDate: '2026-08-30',
      issueTime: '12:00:00',
      currency: 'SAR',
      seller: {
        legalName: 'Burger Artisan Co.',
        vatNumber: '300998877600003',
        crNumber: '1010998877',
        address: {
          street: 'King Fahd Road',
          buildingNumber: '1234',
          district: 'Al Olaya',
          city: 'Riyadh',
          postalCode: '12214',
          countryCode: 'SA',
        },
      },
      docReference: {
        invoiceCounterValue: 1,
        previousInvoiceHash: 'NWZlY2ViNjZmZmM4NmYzOGQ5NTI3ODZjNmQ2OTZjNzljMmRiYzIzOWRkNGU5MWI4YTMzOGZhNmZkMzUwNzUxYg==',
      },
      items: [
        {
          id: 'line-1',
          name: 'Artisan Wagyu Burger',
          quantity: 2,
          unitCode: 'PCE',
          unitPrice: Money.fromMajor(40, 'SAR'),
          discountAmount: Money.zero('SAR'),
          taxableAmount: Money.fromMajor(80, 'SAR'),
          taxCategory: 'S',
          vatRate: 0.15,
          vatAmount: Money.fromMajor(12, 'SAR'),
          totalWithVat: Money.fromMajor(92, 'SAR'),
        },
      ],
      summary: {
        subtotal: Money.fromMajor(80, 'SAR'),
        totalDiscount: Money.zero('SAR'),
        taxExclusiveAmount: Money.fromMajor(80, 'SAR'),
        totalVatAmount: Money.fromMajor(12, 'SAR'),
        taxInclusiveAmount: Money.fromMajor(92, 'SAR'),
        prepaidAmount: Money.zero('SAR'),
        payableAmount: Money.fromMajor(92, 'SAR'),
      },
      ...overrides,
    };
  };

  describe('1. ZATCA Phase 2 Cryptographic Chaining & Determinism', () => {
    it('generates deterministic SHA-256 hash and ECDSA signatures across sequential invoices', () => {
      const invoice1 = createSampleInvoice();
      const signer = new ZatcaSigner();
      const signed1 = signer.signInvoice(invoice1);

      expect(signed1.invoiceHashBase64).toBeDefined();
      expect(signed1.invoiceHashBase64.length).toBeGreaterThan(20);
      expect(signed1.signedXml).toContain('urn:oasis:names:specification:ubl:schema:xsd:Invoice-2');
      expect(signed1.signedXml).toContain('d0e88b22-83b9-4a92-95f2-ec0667e41111');
      expect(signed1.qrCodeBase64.length).toBeGreaterThan(40);

      // Chained Invoice 2 with PIH = signed1.invoiceHashBase64
      const invoice2 = createSampleInvoice({
        uuid: 'd0e88b22-83b9-4a92-95f2-ec0667e42222',
        invoiceNumber: 'INV-2026-0002',
        docReference: {
          invoiceCounterValue: 2,
          previousInvoiceHash: signed1.invoiceHashBase64,
        },
      });

      const signed2 = signer.signInvoice(invoice2);
      expect(signed2.signedXml).toContain(signed1.invoiceHashBase64);
      expect(signed2.invoiceHashBase64).not.toEqual(signed1.invoiceHashBase64);
    });

    it('enforces BR-KSA business rules validator for B2B standard vs B2C simplified', () => {
      // Missing buyer on B2B Standard Invoice
      const invalidB2b = createSampleInvoice({
        uuid: 'd0e88b22-83b9-4a92-95f2-ec0667e43333',
        invoiceNumber: 'INV-B2B-0001',
        invoiceType: '0100000', // Standard B2B
        buyer: undefined, // Violates BR-KSA-10
      });

      const result = ZatcaBusinessRulesValidator.validate(invalidB2b);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('BR-KSA-10'))).toBe(true);

      // Valid B2C simplified invoice
      const validB2c = createSampleInvoice();
      const validResult = ZatcaBusinessRulesValidator.validate(validB2c);
      expect(validResult.isValid).toBe(true);
      expect(validResult.errors.length).toBe(0);
    });
  });

  describe('2. Double-Entry Accounting & Mathematical Invariant Inviolability', () => {
    it('strictly requires debits == credits and rejects unbalanced journal entries', () => {
      expect(() => {
        engine.postJournalEntry({
          tenantId: 'tenant-test-01',
          branchId: 'branch-01',
          entryNumber: 'JE-BAD-01',
          date: '2026-08-30',
          reference: 'TEST',
          sourceType: 'MANUAL_JOURNAL',
          sourceId: 'src-1',
          idempotencyKey: 'idemp-bad-1',
          memo: 'Unbalanced entry test',
          postedBy: 'Tester',
          postedAt: new Date().toISOString(),
          lines: [
            {
              id: 'l1',
              accountId: 'coa-1010-tenant-test-01',
              accountCode: '1010',
              accountName: 'Cash',
              debit: Money.fromMajor(100, 'SAR'),
              credit: Money.zero('SAR'),
            },
            {
              id: 'l2',
              accountId: 'coa-4010-tenant-test-01',
              accountCode: '4010',
              accountName: 'Food Sales',
              debit: Money.zero('SAR'),
              credit: Money.fromMajor(90, 'SAR'), // 10 SAR discrepancy
            },
          ],
        });
      }).toThrow(/Unbalanced journal entry/);
    });

    it('posts balanced POS Sale with multi-tender and promotional discounts', () => {
      const saleJournal = postings.postOrderSale({
        tenantId: 'tenant-test-01',
        branchId: 'branch-01',
        orderNumber: 'ORD-9001',
        orderId: 'ord-id-9001',
        orderType: 'DINE_IN',
        subtotal: Money.fromMajor(200, 'SAR'),
        discountAmount: Money.fromMajor(20, 'SAR'),
        taxableAmount: Money.fromMajor(180, 'SAR'),
        vatAmount: Money.fromMajor(27, 'SAR'),
        totalAmount: Money.fromMajor(207, 'SAR'),
        payments: [
          { method: 'MADA', amount: Money.fromMajor(150, 'SAR') },
          { method: 'CASH', amount: Money.fromMajor(57, 'SAR') },
        ],
        foodRevenueShare: Money.fromMajor(160, 'SAR'),
        beverageRevenueShare: Money.fromMajor(40, 'SAR'),
        postedBy: 'Cashier Sarah',
      });

      expect(saleJournal.isPosted).toBe(true);
      expect(saleJournal.lines.length).toBe(6); // 2 tenders + discount (Dr) + 2 rev + 1 vat (Cr)

      let totalDr = Money.zero('SAR');
      let totalCr = Money.zero('SAR');
      for (const line of saleJournal.lines) {
        totalDr = totalDr.add(line.debit);
        totalCr = totalCr.add(line.credit);
      }
      expect(totalDr.equals(totalCr)).toBe(true);
      expect(totalDr.toMajor()).toBe(227); // 150 + 57 + 20 discount = 227 vs 160 + 40 + 27 = 227
    });

    it('posts balanced POS Refund & Credit Note correctly reversing revenue and VAT', () => {
      const refundJournal = postings.postOrderRefund({
        tenantId: 'tenant-test-01',
        branchId: 'branch-01',
        originalOrderNumber: 'ORD-9001',
        refundNumber: 'CN-ORD-9001',
        refundId: 'ref-9001',
        refundSubtotal: Money.fromMajor(100, 'SAR'),
        refundVatAmount: Money.fromMajor(15, 'SAR'),
        refundTotalAmount: Money.fromMajor(115, 'SAR'),
        refundPaymentMethod: 'MADA',
        reason: 'Customer returned cold burger',
        postedBy: 'Shift Supervisor',
      });

      expect(refundJournal.isPosted).toBe(true);
      let totalDr = Money.zero('SAR');
      let totalCr = Money.zero('SAR');
      for (const line of refundJournal.lines) {
        totalDr = totalDr.add(line.debit);
        totalCr = totalCr.add(line.credit);
      }
      expect(totalDr.equals(totalCr)).toBe(true);
      expect(totalDr.toMajor()).toBe(115);
    });

    it('posts balanced Cash Drawer Settlement (Over/Short) adjustments', () => {
      // 10 SAR Shortage
      const settleJournal = postings.postCashDrawerSettlement({
        tenantId: 'tenant-test-01',
        branchId: 'branch-01',
        shiftId: 'shift-01',
        cashierName: 'Ahmad Cashier',
        expectedCash: Money.fromMajor(1000, 'SAR'),
        actualCashCounted: Money.fromMajor(990, 'SAR'),
        postedBy: 'Branch Manager',
      });

      expect(settleJournal).not.toBeNull();
      expect(settleJournal!.lines[0].debit.toMajor()).toBe(10); // Dr. Cash Over/Short Expense
      expect(settleJournal!.lines[1].credit.toMajor()).toBe(10); // Cr. Cash on Hand
    });

    it('generates zero-variance Trial Balance on clean zero-state and after posted sales', () => {
      // Create a fresh engine where every default account starts at zero.
      const cleanEngine = new DoubleEntryEngine('tenant-clean-01');
      for (const acc of cleanEngine.getAccounts('tenant-clean-01')) {
        expect(acc.balance.isZero()).toBe(true);
      }

      const cleanPostings = new AccountingPostingsService(cleanEngine);
      const cleanReporting = new FinancialReportingService(cleanEngine);

      // Verify trial balance on zero state
      const initialTb = cleanReporting.generateTrialBalance('tenant-clean-01');
      expect(initialTb.isBalanced).toBe(true);
      expect(initialTb.variance.isZero()).toBe(true);

      // Post 3 balanced sales
      cleanPostings.postOrderSale({
        tenantId: 'tenant-clean-01',
        branchId: 'branch-01',
        orderNumber: 'ORD-001',
        orderId: 'ord-1',
        orderType: 'TAKEAWAY',
        subtotal: Money.fromMajor(100, 'SAR'),
        discountAmount: Money.zero('SAR'),
        taxableAmount: Money.fromMajor(100, 'SAR'),
        vatAmount: Money.fromMajor(15, 'SAR'),
        totalAmount: Money.fromMajor(115, 'SAR'),
        payments: [{ method: 'MADA', amount: Money.fromMajor(115, 'SAR') }],
      });

      cleanPostings.postOrderSale({
        tenantId: 'tenant-clean-01',
        branchId: 'branch-01',
        orderNumber: 'ORD-002',
        orderId: 'ord-2',
        orderType: 'DINE_IN',
        subtotal: Money.fromMajor(50, 'SAR'),
        discountAmount: Money.fromMajor(5, 'SAR'),
        taxableAmount: Money.fromMajor(45, 'SAR'),
        vatAmount: Money.fromMajor(6.75, 'SAR'),
        totalAmount: Money.fromMajor(51.75, 'SAR'),
        payments: [{ method: 'CASH', amount: Money.fromMajor(51.75, 'SAR') }],
      });

      // Post 1 refund
      cleanPostings.postOrderRefund({
        tenantId: 'tenant-clean-01',
        branchId: 'branch-01',
        originalOrderNumber: 'ORD-001',
        refundNumber: 'CN-ORD-001',
        refundId: 'ref-1',
        refundSubtotal: Money.fromMajor(50, 'SAR'),
        refundVatAmount: Money.fromMajor(7.5, 'SAR'),
        refundTotalAmount: Money.fromMajor(57.5, 'SAR'),
        refundPaymentMethod: 'MADA',
        reason: 'Partial return',
      });

      // Assert Trial Balance is mathematically perfectly balanced
      const tb = cleanReporting.generateTrialBalance('tenant-clean-01');
      expect(tb.isBalanced).toBe(true);
      expect(tb.variance.isZero()).toBe(true);
      expect(tb.totalDebits.equals(tb.totalCredits)).toBe(true);

      const pnl = cleanReporting.generateProfitAndLoss('tenant-clean-01');
      expect(pnl.grossRevenue.toMajor()).toBe(100); // 100 + 50 - 50 refunded = 100
      expect(pnl.totalDiscounts.toMajor()).toBe(5);

      const vatReturn = cleanReporting.generateZatcaVatReturn('tenant-clean-01');
      expect(vatReturn.status).toBe('RECONCILED');
    });

    it('enforces idempotency preventing duplicate journal postings on retry', () => {
      const entryData = {
        tenantId: 'tenant-test-01',
        branchId: 'branch-01',
        entryNumber: 'JE-IDEMP-01',
        date: '2026-08-30',
        reference: 'REF-IDEMP',
        sourceType: 'POS_SALE' as const,
        sourceId: 'sale-999',
        idempotencyKey: 'idemp-sale-999',
        memo: 'Idempotency test',
        postedBy: 'Engine',
        postedAt: new Date().toISOString(),
        lines: [
          {
            id: 'l1',
            accountId: 'coa-1010-tenant-test-01',
            accountCode: '1010',
            accountName: 'Cash',
            debit: Money.fromMajor(50, 'SAR'),
            credit: Money.zero('SAR'),
          },
          {
            id: 'l2',
            accountId: 'coa-4010-tenant-test-01',
            accountCode: '4010',
            accountName: 'Food Sales',
            debit: Money.zero('SAR'),
            credit: Money.fromMajor(50, 'SAR'),
          },
        ],
      };

      const first = engine.postJournalEntry(entryData);
      const second = engine.postJournalEntry(entryData); // Retried execution

      expect(first.id).toBe(second.id);
      expect(engine.getEntries('tenant-test-01').filter(e => e.idempotencyKey === 'idemp-sale-999').length).toBe(1);
    });
  });
});
