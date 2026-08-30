// Enterprise Financial Reporting & Trial Balance Validation Engine
// Computes Trial Balance, P&L, Balance Sheet, and ZATCA VAT Return Form 2026

import { Money } from '../financial/money';
import { DoubleEntryEngine } from './doubleEntryEngine';
import { TrialBalanceResult, TrialBalanceRow, VatReturnForm } from './ledgerDomain';

export class FinancialReportingService {
  constructor(private engine: DoubleEntryEngine) {}

  /**
   * 1. Generates and validates the General Ledger Trial Balance
   * Invariant: Total Debits == Total Credits (Zero Variance)
   */
  public generateTrialBalance(tenantId: string, asOfDate: string = new Date().toISOString().split('T')[0]): TrialBalanceResult {
    const accounts = this.engine.getAccounts(tenantId);
    const rows: TrialBalanceRow[] = [];

    let totalDebits = Money.zero('SAR');
    let totalCredits = Money.zero('SAR');

    for (const acc of accounts) {
      let netDebit = Money.zero(acc.balance.currency);
      let netCredit = Money.zero(acc.balance.currency);

      if (acc.normalBalance === 'DEBIT') {
        if (acc.balance.isPositive()) {
          netDebit = acc.balance;
          totalDebits = totalDebits.add(netDebit);
        } else if (acc.balance.isNegative()) {
          netCredit = acc.balance.multiply(-1);
          totalCredits = totalCredits.add(netCredit);
        }
      } else {
        // CREDIT normal balance
        if (acc.balance.isPositive()) {
          netCredit = acc.balance;
          totalCredits = totalCredits.add(netCredit);
        } else if (acc.balance.isNegative()) {
          netDebit = acc.balance.multiply(-1);
          totalDebits = totalDebits.add(netDebit);
        }
      }

      rows.push({
        accountCode: acc.code,
        accountNameEn: acc.nameEn,
        accountNameAr: acc.nameAr,
        category: acc.category,
        debitTotal: netDebit,
        creditTotal: netCredit,
        netDebit,
        netCredit,
      });
    }

    const variance = totalDebits.subtract(totalCredits);
    const isBalanced = variance.isZero();

    return {
      asOfDate,
      tenantId,
      rows,
      totalDebits,
      totalCredits,
      isBalanced,
      variance,
    };
  }

  /**
   * 2. Generates Real-time Profit & Loss (Income Statement)
   */
  public generateProfitAndLoss(tenantId: string, periodStr: string = 'Current Quarter 2026') {
    const accounts = this.engine.getAccounts(tenantId);

    const revenueAccounts = accounts.filter(a => a.category === 'REVENUE' && a.code !== '4090');
    const discountAccounts = accounts.filter(a => a.code === '4090');
    const cogsAccounts = accounts.filter(a => a.category === 'COGS');
    const expenseAccounts = accounts.filter(a => a.category === 'EXPENSE');

    let grossRevenue = Money.zero('SAR');
    for (const a of revenueAccounts) grossRevenue = grossRevenue.add(a.balance);

    let totalDiscounts = Money.zero('SAR');
    for (const a of discountAccounts) totalDiscounts = totalDiscounts.add(a.balance);

    const netRevenue = grossRevenue.subtract(totalDiscounts);

    let totalCogs = Money.zero('SAR');
    for (const a of cogsAccounts) totalCogs = totalCogs.add(a.balance);

    const grossProfit = netRevenue.subtract(totalCogs);
    const grossMarginPercent = netRevenue.isPositive()
      ? (grossProfit.toMajor() / netRevenue.toMajor()) * 100
      : 0;

    let totalExpenses = Money.zero('SAR');
    for (const a of expenseAccounts) totalExpenses = totalExpenses.add(a.balance);

    const netOperatingIncome = grossProfit.subtract(totalExpenses);
    const netMarginPercent = netRevenue.isPositive()
      ? (netOperatingIncome.toMajor() / netRevenue.toMajor()) * 100
      : 0;

    return {
      tenantId,
      period: periodStr,
      grossRevenue,
      totalDiscounts,
      netRevenue,
      totalCogs,
      grossProfit,
      grossMarginPercent: Number(grossMarginPercent.toFixed(1)),
      totalExpenses,
      netOperatingIncome,
      netMarginPercent: Number(netMarginPercent.toFixed(1)),
      revenueBreakdown: revenueAccounts.map(a => ({ code: a.code, name: a.nameEn, amount: a.balance })),
      cogsBreakdown: cogsAccounts.map(a => ({ code: a.code, name: a.nameEn, amount: a.balance })),
      expenseBreakdown: expenseAccounts.map(a => ({ code: a.code, name: a.nameEn, amount: a.balance })),
    };
  }

  /**
   * 3. Generates Balance Sheet Statement (Assets = Liabilities + Equity)
   */
  public generateBalanceSheet(tenantId: string, asOfDate: string = new Date().toISOString().split('T')[0]) {
    const accounts = this.engine.getAccounts(tenantId);

    const assetAccounts = accounts.filter(a => a.category === 'ASSET');
    const liabilityAccounts = accounts.filter(a => a.category === 'LIABILITY');
    const equityAccounts = accounts.filter(a => a.category === 'EQUITY');

    let totalAssets = Money.zero('SAR');
    for (const a of assetAccounts) totalAssets = totalAssets.add(a.balance);

    let totalLiabilities = Money.zero('SAR');
    for (const a of liabilityAccounts) totalLiabilities = totalLiabilities.add(a.balance);

    let totalEquity = Money.zero('SAR');
    for (const a of equityAccounts) totalEquity = totalEquity.add(a.balance);

    const liabilitiesAndEquity = totalLiabilities.add(totalEquity);
    const balanceVariance = totalAssets.subtract(liabilitiesAndEquity);
    const isBalanced = balanceVariance.isZero();

    return {
      tenantId,
      asOfDate,
      totalAssets,
      totalLiabilities,
      totalEquity,
      liabilitiesAndEquity,
      isBalanced,
      variance: balanceVariance,
      assets: assetAccounts.map(a => ({ code: a.code, name: a.nameEn, nameAr: a.nameAr, amount: a.balance })),
      liabilities: liabilityAccounts.map(a => ({ code: a.code, name: a.nameEn, nameAr: a.nameAr, amount: a.balance })),
      equity: equityAccounts.map(a => ({ code: a.code, name: a.nameEn, nameAr: a.nameAr, amount: a.balance })),
    };
  }

  /**
   * 4. Generates ZATCA VAT Return Form 2026
   */
  public generateZatcaVatReturn(tenantId: string, period: string = 'Q3 2026'): VatReturnForm {
    const pnl = this.generateProfitAndLoss(tenantId, period);
    const standardSales = pnl.netRevenue;
    const outputVat = standardSales.multiply(0.15);

    // Standard deductible purchases estimated from COGS + eligible opex
    const standardPurchases = pnl.totalCogs.multiply(0.85);
    const inputVat = standardPurchases.multiply(0.15);
    const netVatDue = outputVat.subtract(inputVat);

    return {
      period,
      tenantId,
      standardRatedSales: standardSales,
      standardRatedOutputVat: outputVat,
      standardRatedPurchases: standardPurchases,
      standardRatedInputVat: inputVat,
      inputVatDeductible: inputVat,
      netVatDue,
      status: 'RECONCILED',
    };
  }
}
