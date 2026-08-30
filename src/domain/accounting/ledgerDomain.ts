// Enterprise Double-Entry Accounting Domain Models & Types
// Strictly typed with Money value objects, debit/credit invariants, and tenant isolation

import { Money } from '../financial/money';

export type AccountCategory = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE' | 'COGS';
export type NormalBalance = 'DEBIT' | 'CREDIT';

export type JournalSourceType = 
  | 'POS_SALE'
  | 'POS_REFUND'
  | 'CREDIT_NOTE'
  | 'DEBIT_NOTE'
  | 'PURCHASE_RECEIPT'
  | 'INVENTORY_ADJUSTMENT'
  | 'INVENTORY_COGS_CONSUMPTION'
  | 'CASH_DRAWER_SETTLEMENT'
  | 'PAYROLL_ACCRUAL'
  | 'MANUAL_JOURNAL';

export interface ChartOfAccountModel {
  id: string;
  tenantId: string;
  code: string; // e.g. '1010', '2020', '4010'
  nameEn: string;
  nameAr: string;
  category: AccountCategory;
  subCategory: string; // e.g. 'Current Assets', 'Tax Liabilities'
  normalBalance: NormalBalance;
  balance: Money;
  currency: string;
  isActive: boolean;
  isReconciled: boolean;
}

export interface JournalLineModel {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: Money;
  credit: Money;
  memo?: string;
  costCenter?: string;
  branchId?: string;
}

export interface JournalEntryModel {
  id: string;
  tenantId: string;
  branchId: string;
  entryNumber: string; // e.g. 'JE-2026-0001'
  date: string; // YYYY-MM-DD
  reference: string; // e.g. Order # or Invoice #
  sourceType: JournalSourceType;
  sourceId: string;
  idempotencyKey: string;
  memo: string;
  postedBy: string;
  postedAt: string;
  isPosted: boolean;
  isReversed: boolean;
  reversalEntryId?: string;
  reversesEntryId?: string;
  lines: JournalLineModel[];
}

export interface TrialBalanceRow {
  accountCode: string;
  accountNameEn: string;
  accountNameAr: string;
  category: AccountCategory;
  debitTotal: Money;
  creditTotal: Money;
  netDebit: Money;
  netCredit: Money;
}

export interface TrialBalanceResult {
  asOfDate: string;
  tenantId: string;
  rows: TrialBalanceRow[];
  totalDebits: Money;
  totalCredits: Money;
  isBalanced: boolean;
  variance: Money;
}

export interface VatReturnForm {
  period: string; // e.g. 'Q3 2026'
  tenantId: string;
  standardRatedSales: Money;
  standardRatedOutputVat: Money;
  standardRatedPurchases: Money;
  standardRatedInputVat: Money;
  inputVatDeductible: Money;
  netVatDue: Money;
  status: 'RECONCILED' | 'PENDING';
}
