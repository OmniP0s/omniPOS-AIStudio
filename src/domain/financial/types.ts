export type JournalStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'POSTED' | 'REJECTED';
export type AssetDepreciationMethod = 'STRAIGHT_LINE' | 'DECLINING_BALANCE' | 'UNITS_OF_PRODUCTION';

export interface CostCenter {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  type: 'COST_CENTER' | 'PROFIT_CENTER';
  budgetAnnualSar: number;
  spentYtdSar: number;
  varianceSar: number;
  variancePercent: number;
  manager: string;
}

export interface FixedAsset {
  id: string;
  assetTag: string;
  nameEn: string;
  nameAr: string;
  category: 'KITCHEN_EQUIPMENT' | 'POS_HARDWARE' | 'VEHICLES' | 'LEASEHOLD_IMPROVEMENTS';
  purchaseDate: string;
  purchaseCostSar: number;
  salvageValueSar: number;
  usefulLifeMonths: number;
  depreciationMethod: AssetDepreciationMethod;
  accumulatedDepreciationSar: number;
  netBookValueSar: number;
  location: string;
}

export interface BankReconciliationItem {
  id: string;
  statementDate: string;
  bankAccount: string;
  glAccountCode: string;
  bankStatementBalanceSar: number;
  bookBalanceSar: number;
  unreconciledDifferenceSar: number;
  matchedTransactionsCount: number;
  unmatchedTransactionsCount: number;
  status: 'RECONCILED' | 'ATTENTION_REQUIRED';
}

export interface JournalEntry {
  id: string;
  journalNumber: string;
  postingDate: string;
  descriptionEn: string;
  descriptionAr: string;
  reference: string;
  totalDebitSar: number;
  totalCreditSar: number;
  status: JournalStatus;
  preparedBy: string;
  approvedBy?: string;
  lines: {
    accountCode: string;
    accountName: string;
    costCenterCode?: string;
    debitSar: number;
    creditSar: number;
    notes: string;
  }[];
}

export interface FinancialStatementItem {
  accountCode: string;
  accountNameEn: string;
  accountNameAr: string;
  currentPeriodSar: number;
  priorPeriodSar: number;
  varianceSar: number;
  variancePercent: number;
}
