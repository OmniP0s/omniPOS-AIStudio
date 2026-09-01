// Enterprise Double-Entry Accounting Core Engine
// Enforces mathematical balance invariants (Debits == Credits), immutability,
// idempotent posting, and strict multi-tenant isolation

import { Money } from '../financial/money';
import { ChartOfAccountModel, JournalEntryModel, JournalLineModel, NormalBalance } from './ledgerDomain';

export class UnbalancedJournalEntryError extends Error {
  constructor(entryNumber: string, debitTotal: string, creditTotal: string) {
    super(`Unbalanced journal entry ${entryNumber}: Total debits (${debitTotal}) must equal total credits (${creditTotal})`);
    this.name = 'UnbalancedJournalEntryError';
  }
}

export class ImmutableJournalEntryError extends Error {
  constructor(entryNumber: string) {
    super(`Cannot modify or delete posted journal entry ${entryNumber}. A reversing entry must be created instead.`);
    this.name = 'ImmutableJournalEntryError';
  }
}

export class DuplicateJournalEntryError extends Error {
  constructor(idempotencyKey: string) {
    super(`Journal entry with idempotency key ${idempotencyKey} already exists and is posted.`);
    this.name = 'DuplicateJournalEntryError';
  }
}

export class NegativeAmountError extends Error {
  constructor(entryNumber: string, lineId: string) {
    super(`Journal entry ${entryNumber} contains a negative debit or credit on line ${lineId}.`);
    this.name = 'NegativeAmountError';
  }
}

export class MixedCurrencyError extends Error {
  constructor(entryNumber: string) {
    super(`Journal entry ${entryNumber} must use exactly one currency across all debit and credit amounts.`);
    this.name = 'MixedCurrencyError';
  }
}

export const DEFAULT_CHART_OF_ACCOUNTS: Omit<ChartOfAccountModel, 'tenantId'>[] = [
  // 1000 - ASSETS (Normal Balance: DEBIT)
  { id: 'coa-1010', code: '1010', nameEn: 'Cash on Hand (Drawers)', nameAr: 'النقدية في الصناديق', category: 'ASSET', subCategory: 'Current Assets', normalBalance: 'DEBIT', balance: Money.fromMajor(15000, 'SAR'), currency: 'SAR', isActive: true, isReconciled: true },
  { id: 'coa-1020', code: '1020', nameEn: 'Bank Account (Main Operating)', nameAr: 'الحساب البنكي الرئيسي', category: 'ASSET', subCategory: 'Current Assets', normalBalance: 'DEBIT', balance: Money.fromMajor(320000, 'SAR'), currency: 'SAR', isActive: true, isReconciled: true },
  { id: 'coa-1030', code: '1030', nameEn: 'mada POS Card Clearing', nameAr: 'حساب وسيط تسوية بطاقات مدى', category: 'ASSET', subCategory: 'Current Assets', normalBalance: 'DEBIT', balance: Money.fromMajor(42000, 'SAR'), currency: 'SAR', isActive: true, isReconciled: true },
  { id: 'coa-1040', code: '1040', nameEn: 'Accounts Receivable (Corporate B2B)', nameAr: 'العملاء والمدينون التجاريون', category: 'ASSET', subCategory: 'Current Assets', normalBalance: 'DEBIT', balance: Money.fromMajor(24000, 'SAR'), currency: 'SAR', isActive: true, isReconciled: true },
  { id: 'coa-1050', code: '1050', nameEn: 'Food & Beverage Raw Inventory', nameAr: 'مخزون المواد الغذائية والمشروبات', category: 'ASSET', subCategory: 'Inventory Assets', normalBalance: 'DEBIT', balance: Money.fromMajor(95000, 'SAR'), currency: 'SAR', isActive: true, isReconciled: true },
  { id: 'coa-1060', code: '1060', nameEn: 'Packaging & Consumables Stock', nameAr: 'مخزون مواد التغليف والاستهلاك', category: 'ASSET', subCategory: 'Inventory Assets', normalBalance: 'DEBIT', balance: Money.fromMajor(18000, 'SAR'), currency: 'SAR', isActive: true, isReconciled: true },
  { id: 'coa-1510', code: '1510', nameEn: 'Kitchen Equipment & Grills', nameAr: 'معدات المطبخ والأفران', category: 'ASSET', subCategory: 'Fixed Assets', normalBalance: 'DEBIT', balance: Money.fromMajor(380000, 'SAR'), currency: 'SAR', isActive: true, isReconciled: true },
  
  // 2000 - LIABILITIES (Normal Balance: CREDIT)
  { id: 'coa-2010', code: '2010', nameEn: 'Accounts Payable (Trade Vendors)', nameAr: 'الموردون والدائنون التجاريون', category: 'LIABILITY', subCategory: 'Current Liabilities', normalBalance: 'CREDIT', balance: Money.fromMajor(48000, 'SAR'), currency: 'SAR', isActive: true, isReconciled: true },
  { id: 'coa-2020', code: '2020', nameEn: 'Output VAT Payable (15% ZATCA)', nameAr: 'ضريبة القيمة المضافة المستحقة (15%)', category: 'LIABILITY', subCategory: 'Tax Liabilities', normalBalance: 'CREDIT', balance: Money.fromMajor(35000, 'SAR'), currency: 'SAR', isActive: true, isReconciled: true },
  { id: 'coa-2030', code: '2030', nameEn: 'Accrued Staff Salaries & GOSI', nameAr: 'رواتب الموظفين المستحقة والتأمينات', category: 'LIABILITY', subCategory: 'Payroll Liabilities', normalBalance: 'CREDIT', balance: Money.fromMajor(68000, 'SAR'), currency: 'SAR', isActive: true, isReconciled: true },
  { id: 'coa-2040', code: '2040', nameEn: 'Customer Digital Wallet Deposits', nameAr: 'أمانات محافظ العملاء وبطاقات الهدايا', category: 'LIABILITY', subCategory: 'Current Liabilities', normalBalance: 'CREDIT', balance: Money.fromMajor(12000, 'SAR'), currency: 'SAR', isActive: true, isReconciled: true },
  { id: 'coa-2050', code: '2050', nameEn: 'Tips Payable to Service Staff', nameAr: 'إكراميات طاقم الخدمة المستحقة', category: 'LIABILITY', subCategory: 'Current Liabilities', normalBalance: 'CREDIT', balance: Money.fromMajor(5500, 'SAR'), currency: 'SAR', isActive: true, isReconciled: true },

  // 3000 - EQUITY (Normal Balance: CREDIT)
  { id: 'coa-3010', code: '3010', nameEn: 'Paid-in Capital', nameAr: 'رأس المال المدفوع', category: 'EQUITY', subCategory: 'Equity', normalBalance: 'CREDIT', balance: Money.fromMajor(500000, 'SAR'), currency: 'SAR', isActive: true, isReconciled: true },
  { id: 'coa-3020', code: '3020', nameEn: 'Retained Earnings', nameAr: 'الأرباح المبقاة', category: 'EQUITY', subCategory: 'Equity', normalBalance: 'CREDIT', balance: Money.fromMajor(225500, 'SAR'), currency: 'SAR', isActive: true, isReconciled: true },

  // 4000 - REVENUE (Normal Balance: CREDIT)
  { id: 'coa-4010', code: '4010', nameEn: 'Food Sales (Dine-In & Takeaway)', nameAr: 'مبيعات الأطعمة (محلي وسفري)', category: 'REVENUE', subCategory: 'Operating Revenue', normalBalance: 'CREDIT', balance: Money.fromMajor(450000, 'SAR'), currency: 'SAR', isActive: true, isReconciled: true },
  { id: 'coa-4020', code: '4020', nameEn: 'Beverage & Specialty Coffee Sales', nameAr: 'مبيعات المشروبات والقهوة', category: 'REVENUE', subCategory: 'Operating Revenue', normalBalance: 'CREDIT', balance: Money.fromMajor(115000, 'SAR'), currency: 'SAR', isActive: true, isReconciled: true },
  { id: 'coa-4030', code: '4030', nameEn: 'Delivery Aggregator Sales (Jahez/Hungerstation)', nameAr: 'مبيعات تطبيقات التوصيل', category: 'REVENUE', subCategory: 'Operating Revenue', normalBalance: 'CREDIT', balance: Money.fromMajor(135000, 'SAR'), currency: 'SAR', isActive: true, isReconciled: true },
  { id: 'coa-4090', code: '4090', nameEn: 'Sales Discounts & Promotional Allowances', nameAr: 'الخصومات والمسموحات التسويقية', category: 'REVENUE', subCategory: 'Contra Revenue', normalBalance: 'DEBIT', balance: Money.fromMajor(18500, 'SAR'), currency: 'SAR', isActive: true, isReconciled: true },

  // 5000 - COST OF GOODS SOLD (COGS) (Normal Balance: DEBIT)
  { id: 'coa-5010', code: '5010', nameEn: 'Cost of Meat & Poultry', nameAr: 'تكلفة اللحوم والدواجن', category: 'COGS', subCategory: 'Direct Food Costs', normalBalance: 'DEBIT', balance: Money.fromMajor(138000, 'SAR'), currency: 'SAR', isActive: true, isReconciled: true },
  { id: 'coa-5020', code: '5020', nameEn: 'Cost of Produce & Dairy', nameAr: 'تكلفة الخضار والألبان', category: 'COGS', subCategory: 'Direct Food Costs', normalBalance: 'DEBIT', balance: Money.fromMajor(56000, 'SAR'), currency: 'SAR', isActive: true, isReconciled: true },
  { id: 'coa-5030', code: '5030', nameEn: 'Cost of Coffee & Beverages', nameAr: 'تكلفة القهوة والمشروبات', category: 'COGS', subCategory: 'Direct Beverage Costs', normalBalance: 'DEBIT', balance: Money.fromMajor(28000, 'SAR'), currency: 'SAR', isActive: true, isReconciled: true },
  { id: 'coa-5040', code: '5040', nameEn: 'Packaging & Disposables Expense', nameAr: 'تكلفة علب التعبئة والتغليف', category: 'COGS', subCategory: 'Direct Packaging Costs', normalBalance: 'DEBIT', balance: Money.fromMajor(16500, 'SAR'), currency: 'SAR', isActive: true, isReconciled: true },
  { id: 'coa-5090', code: '5090', nameEn: 'Kitchen Spoilage & Waste', nameAr: 'خسائر وتالف المطبخ والهدر', category: 'COGS', subCategory: 'Waste', normalBalance: 'DEBIT', balance: Money.fromMajor(5200, 'SAR'), currency: 'SAR', isActive: true, isReconciled: true },

  // 6000 - EXPENSES (Normal Balance: DEBIT)
  { id: 'coa-6010', code: '6010', nameEn: 'Kitchen & Staff Salaries', nameAr: 'رواتب وأجور طاقم التشغيل', category: 'EXPENSE', subCategory: 'Payroll Expenses', normalBalance: 'DEBIT', balance: Money.fromMajor(110000, 'SAR'), currency: 'SAR', isActive: true, isReconciled: true },
  { id: 'coa-6020', code: '6020', nameEn: 'Branch Commercial Rent', nameAr: 'إيجار فروع المطعم', category: 'EXPENSE', subCategory: 'Occupancy Expenses', normalBalance: 'DEBIT', balance: Money.fromMajor(50000, 'SAR'), currency: 'SAR', isActive: true, isReconciled: true },
  { id: 'coa-6030', code: '6030', nameEn: 'Utilities (Electricity/Water/Gas)', nameAr: 'المرافق (كهرباء/مياه/غاز)', category: 'EXPENSE', subCategory: 'Occupancy Expenses', normalBalance: 'DEBIT', balance: Money.fromMajor(16000, 'SAR'), currency: 'SAR', isActive: true, isReconciled: true },
  { id: 'coa-6050', code: '6050', nameEn: 'Card Processing & Interchange Fees', nameAr: 'عمولات وعمليات أجهزة الدفع ومدى', category: 'EXPENSE', subCategory: 'Bank Charges', normalBalance: 'DEBIT', balance: Money.fromMajor(6800, 'SAR'), currency: 'SAR', isActive: true, isReconciled: true },
  { id: 'coa-6070', code: '6070', nameEn: 'Cash Over / Short Discrepancy', nameAr: 'فروقات وعجز/فائض النقدية في الصناديق', category: 'EXPENSE', subCategory: 'Operational Discrepancy', normalBalance: 'DEBIT', balance: Money.fromMajor(320, 'SAR'), currency: 'SAR', isActive: true, isReconciled: true },
];

export class DoubleEntryEngine {
  private accounts = new Map<string, ChartOfAccountModel>(); // key: `${tenantId}:${accountCode}`
  private entries = new Map<string, JournalEntryModel>(); // key: entryId
  private idempotencyIndex = new Map<string, string>(); // key: `${tenantId}:${idempotencyKey}` -> entryId

  constructor(tenantId: string = 'tenant-enterprise-01') {
    this.initializeTenantAccounts(tenantId);
  }

  public initializeTenantAccounts(tenantId: string): void {
    for (const item of DEFAULT_CHART_OF_ACCOUNTS) {
      const coa: ChartOfAccountModel = {
        ...item,
        tenantId,
        id: `${item.id}-${tenantId}`,
      };
      this.accounts.set(`${tenantId}:${item.code}`, coa);
    }
  }

  public getAccounts(tenantId: string): ChartOfAccountModel[] {
    const list: ChartOfAccountModel[] = [];
    for (const [key, acc] of this.accounts.entries()) {
      if (key.startsWith(`${tenantId}:`)) {
        list.push(acc);
      }
    }
    return list.sort((a, b) => a.code.localeCompare(b.code));
  }

  public getAccountByCode(tenantId: string, code: string): ChartOfAccountModel | undefined {
    return this.accounts.get(`${tenantId}:${code}`);
  }

  public getEntries(tenantId: string): JournalEntryModel[] {
    const list: JournalEntryModel[] = [];
    for (const entry of this.entries.values()) {
      if (entry.tenantId === tenantId) {
        list.push(entry);
      }
    }
    return list.sort((a, b) => b.postedAt.localeCompare(a.postedAt));
  }

  /**
   * Posts an immutable, balanced journal entry into the General Ledger.
   * Enforces Debits == Credits and updates Chart of Accounts balances.
   */
  public postJournalEntry(entry: Omit<JournalEntryModel, 'id' | 'isPosted' | 'isReversed'>): JournalEntryModel {
    const { tenantId, idempotencyKey, entryNumber, lines } = entry;

    // 1. Idempotency Check
    const existingId = this.idempotencyIndex.get(`${tenantId}:${idempotencyKey}`);
    if (existingId && this.entries.has(existingId)) {
      return this.entries.get(existingId)!;
    }

    // 2. Validate Lines Exist
    if (!lines || lines.length < 2) {
      throw new Error(`Journal entry ${entryNumber} must contain at least two lines.`);
    }

    // 3. Validate signs and enforce one currency across every amount.
    const currencies = new Set(lines.flatMap(line => [line.debit.currency, line.credit.currency]));
    if (currencies.size !== 1) {
      throw new MixedCurrencyError(entryNumber);
    }

    for (const line of lines) {
      if (line.debit.isNegative() || line.credit.isNegative()) {
        throw new NegativeAmountError(entryNumber, line.id);
      }
    }

    // 4. Verify Mathematical Balance: Total Debits == Total Credits
    const entryCurrency = lines[0].debit.currency;
    let totalDebit = Money.zero(entryCurrency);
    let totalCredit = Money.zero(entryCurrency);

    for (const line of lines) {
      totalDebit = totalDebit.add(line.debit);
      totalCredit = totalCredit.add(line.credit);
    }

    if (!totalDebit.equals(totalCredit)) {
      throw new UnbalancedJournalEntryError(
        entryNumber,
        totalDebit.formatMajor(),
        totalCredit.formatMajor()
      );
    }

    // 5. Compute every resulting account state without mutating the ledger.
    const intendedAccounts = new Map<string, ChartOfAccountModel>();
    for (const line of lines) {
      const accKey = `${tenantId}:${line.accountCode}`;
      let account = intendedAccounts.get(accKey) ?? this.accounts.get(accKey);

      if (!account) {
        account = {
          id: `coa-${line.accountCode}-${tenantId}`,
          tenantId,
          code: line.accountCode,
          nameEn: line.accountName,
          nameAr: line.accountName,
          category: this.inferCategory(line.accountCode),
          subCategory: 'General',
          normalBalance: this.inferNormalBalance(line.accountCode),
          balance: Money.zero(line.debit.currency),
          currency: line.debit.currency,
          isActive: true,
          isReconciled: true,
        };
      }

      const balance = account.normalBalance === 'DEBIT'
        ? account.balance.add(line.debit).subtract(line.credit)
        : account.balance.add(line.credit).subtract(line.debit);
      intendedAccounts.set(accKey, { ...account, balance });
    }

    // 6. Prepare the posted record before committing any state changes.
    const journalEntryId = `je-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const postedEntry: JournalEntryModel = {
      ...entry,
      id: journalEntryId,
      isPosted: true,
      isReversed: false,
    };

    // 7. Commit the prevalidated account states and journal indexes together.
    for (const [accountKey, account] of intendedAccounts) {
      this.accounts.set(accountKey, account);
    }
    this.entries.set(journalEntryId, postedEntry);
    this.idempotencyIndex.set(`${tenantId}:${idempotencyKey}`, journalEntryId);

    return postedEntry;
  }

  /**
   * Reverses a posted journal entry immutably by posting a mirroring entry
   */
  public reverseJournalEntry(params: {
    tenantId: string;
    originalEntryId: string;
    reason: string;
    postedBy: string;
  }): JournalEntryModel {
    const { tenantId, originalEntryId, reason, postedBy } = params;
    const original = this.entries.get(originalEntryId);

    if (!original || original.tenantId !== tenantId) {
      throw new Error(`Original journal entry ${originalEntryId} not found for tenant ${tenantId}.`);
    }

    if (original.isReversed) {
      throw new Error(`Journal entry ${original.entryNumber} has already been reversed.`);
    }

    // Invert all lines: Debits become Credits, Credits become Debits
    const invertedLines: JournalLineModel[] = original.lines.map((line, idx) => ({
      id: `rev-line-${idx + 1}`,
      accountId: line.accountId,
      accountCode: line.accountCode,
      accountName: line.accountName,
      debit: line.credit, // Inverted
      credit: line.debit, // Inverted
      memo: `Reversal of [${line.accountCode}]: ${reason}`,
      costCenter: line.costCenter,
      branchId: line.branchId,
    }));

    const reversalEntry = this.postJournalEntry({
      tenantId,
      branchId: original.branchId,
      entryNumber: `REV-${original.entryNumber}`,
      date: new Date().toISOString().split('T')[0],
      reference: `REVERSAL:${original.reference}`,
      sourceType: original.sourceType,
      sourceId: original.sourceId,
      idempotencyKey: `idemp-rev-${original.id}`,
      memo: `Reversal entry for ${original.entryNumber}: ${reason}`,
      postedBy,
      postedAt: new Date().toISOString(),
      reversesEntryId: original.id,
      lines: invertedLines,
    });

    // Replace, rather than mutate, the original only after reversal posting succeeds.
    this.entries.set(originalEntryId, {
      ...original,
      isReversed: true,
      reversalEntryId: reversalEntry.id,
    });

    return reversalEntry;
  }

  private inferCategory(code: string) {
    if (code.startsWith('1')) return 'ASSET';
    if (code.startsWith('2')) return 'LIABILITY';
    if (code.startsWith('3')) return 'EQUITY';
    if (code.startsWith('4')) return 'REVENUE';
    if (code.startsWith('5')) return 'COGS';
    return 'EXPENSE';
  }

  private inferNormalBalance(code: string): NormalBalance {
    if (code.startsWith('1') || code.startsWith('5') || code.startsWith('6') || code === '4090') {
      return 'DEBIT';
    }
    return 'CREDIT';
  }
}
