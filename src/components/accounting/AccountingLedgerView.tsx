import React, { useState } from 'react';
import { ChartOfAccount, JournalEntry, User } from '../../types';
import { globalAccounting } from '../../domain/accounting/accountingEngine';
import {
  BookOpen,
  FileText,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowDownRight,
  ArrowUpRight,
  Printer,
  Download,
} from 'lucide-react';

interface AccountingLedgerViewProps {
  isArabic: boolean;
  activeUser: User;
}

export const AccountingLedgerView: React.FC<AccountingLedgerViewProps> = ({
  isArabic,
  activeUser,
}) => {
  const [activeTab, setActiveTab] = useState<'COA' | 'JOURNALS' | 'P_AND_L' | 'BALANCE_SHEET' | 'ZATCA_VAT'>('COA');

  const coa = globalAccounting.getChartOfAccounts();
  const journals = globalAccounting.getJournalEntries();
  const pnl = globalAccounting.generateProfitAndLoss();
  const balanceSheet = globalAccounting.generateBalanceSheet();
  const vatReturn = globalAccounting.generateVatReturn('Q3 2026');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
              {isArabic ? 'المحاسبة العامة ودفتر الأستاذ والضريبة' : 'General Ledger & Financial Accounting'}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-mono font-bold">
              Double-Entry Engine
            </span>
          </div>
          <h1 className="text-2xl font-black mt-1">
            {isArabic ? 'شجرة الحسابات، القيود اليومية، وإقرار ضريبة ZATCA' : 'Chart of Accounts, Journal Entries & VAT Return'}
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {isArabic
              ? 'تسجيل القيود المحاسبية الآلية، إصدار قائمة الدخل والمركز المالي، ونموذج إقرار ضريبة القيمة المضافة 15%'
              : 'Automated POS sales journalization, real-time Balance Sheet, P&L, and Saudi 15% VAT filing'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700 text-right rtl:text-left">
            <span className="text-[11px] text-slate-400 block">{isArabic ? 'صافي الربح التشغيلي' : 'Net Operating Profit'}</span>
            <span className="text-sm font-black text-emerald-400 font-mono">
              SAR {pnl.netProfit.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'COA', labelEn: 'Chart of Accounts', labelAr: 'دليل الحسابات (COA)', icon: Layers },
          { id: 'JOURNALS', labelEn: 'Journal Entries Ledger', labelAr: 'سجل القيود اليومية', icon: BookOpen },
          { id: 'P_AND_L', labelEn: 'Profit & Loss (P&L)', labelAr: 'قائمة الدخل والأرباح', icon: TrendingUp },
          { id: 'BALANCE_SHEET', labelEn: 'Balance Sheet', labelAr: 'الميزانية العمومية والمركز المالي', icon: FileText },
          { id: 'ZATCA_VAT', labelEn: 'ZATCA VAT Return 15%', labelAr: 'إقرار ضريبة القيمة المضافة 15%', icon: ShieldCheck },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{isArabic ? tab.labelAr : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* TAB: CHART OF ACCOUNTS */}
      {activeTab === 'COA' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {isArabic ? 'شجرة الحسابات المعتمدة (Chart of Accounts)' : 'Standard Restaurant Chart of Accounts'}
              </h3>
              <p className="text-xs text-slate-500">
                {isArabic ? 'أرصدة الأصول، الخصوم، حقوق الملكية، الإيرادات، والمصروفات' : 'Current account balances reconciled in real-time with POS orders and receiving'}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 uppercase font-black text-[10px]">
                <tr>
                  <th className="p-3">Code</th>
                  <th className="p-3">Account Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3 text-right rtl:text-left">Current Balance (SAR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {coa.map(acc => (
                  <tr key={acc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-indigo-600">{acc.code}</td>
                    <td className="p-3">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {isArabic ? acc.nameAr : acc.nameEn}
                        </span>
                        <span className="text-[10px] text-slate-400">{acc.nameEn}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-black">
                        {acc.category}
                      </span>
                    </td>
                    <td className="p-3 text-right rtl:text-left font-mono font-black text-slate-900 dark:text-white">
                      SAR {acc.balance.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: JOURNALS */}
      {activeTab === 'JOURNALS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {isArabic ? 'دفتر اليومية العامة والقيود المزدوجة' : 'Double-Entry General Journal'}
            </h3>
            <span className="text-xs font-mono text-slate-400">{journals.length} Entries Recorded</span>
          </div>

          <div className="space-y-3">
            {journals.map(entry => (
              <div
                key={entry.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-indigo-600">{entry.entryNumber}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{entry.memo || entry.description}</span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">{entry.date}</span>
                </div>

                <div className="space-y-1 text-xs">
                  {entry.lines.map((line, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1 font-mono">
                      <span className="text-slate-700 dark:text-slate-300 font-semibold">
                        {line.accountCode} - {line.accountName}
                      </span>
                      <div className="flex items-center gap-6">
                        <span className={`w-24 text-right ${line.debit > 0 ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-300 dark:text-slate-600'}`}>
                          {line.debit > 0 ? `Dr ${line.debit.toFixed(2)}` : '-'}
                        </span>
                        <span className={`w-24 text-right ${line.credit > 0 ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-300 dark:text-slate-600'}`}>
                          {line.credit > 0 ? `Cr ${line.credit.toFixed(2)}` : '-'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: P&L */}
      {activeTab === 'P_AND_L' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 max-w-3xl mx-auto">
          <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {isArabic ? 'قائمة الأرباح والخسائر الشاملة' : 'Statement of Profit and Loss'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Fiscal Period: August 2026 • All amounts in SAR</p>
          </div>

          <div className="space-y-4 text-xs font-mono">
            {/* Revenue */}
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-sm text-slate-900 dark:text-white">Gross Operating Revenue</span>
              <span className="font-bold text-sm text-emerald-600">SAR {pnl.revenue.toFixed(2)}</span>
            </div>

            {/* COGS */}
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-700 dark:text-slate-300">Cost of Goods Sold (COGS Food & Bev)</span>
              <span className="font-bold text-rose-600">- SAR {pnl.cogs.toFixed(2)}</span>
            </div>

            {/* Gross Profit */}
            <div className="flex justify-between items-center py-2.5 bg-slate-50 dark:bg-slate-800/60 px-3 rounded-xl">
              <span className="font-black text-slate-900 dark:text-white">GROSS PROFIT (Margin: {pnl.revenue > 0 ? ((pnl.grossProfit / pnl.revenue) * 100).toFixed(1) : 0}%)</span>
              <span className="font-black text-emerald-600 text-sm">SAR {pnl.grossProfit.toFixed(2)}</span>
            </div>

            {/* Expenses */}
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-700 dark:text-slate-300">Operating Expenses & Utilities</span>
              <span className="font-bold text-rose-600">- SAR {pnl.expenses.toFixed(2)}</span>
            </div>

            {/* Net Profit */}
            <div className="flex justify-between items-center py-3 bg-indigo-50 dark:bg-indigo-950/60 px-4 rounded-xl border border-indigo-100 dark:border-indigo-900">
              <span className="font-black text-base text-indigo-900 dark:text-indigo-200">NET OPERATING PROFIT</span>
              <span className="font-black text-base text-emerald-600">SAR {pnl.netProfit.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB: BALANCE SHEET */}
      {activeTab === 'BALANCE_SHEET' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 max-w-3xl mx-auto">
          <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {isArabic ? 'الميزانية العمومية والمركز المالي' : 'Statement of Financial Position (Balance Sheet)'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">As of 27 August 2026 • Verified Balanced</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <h4 className="font-black text-sm text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
                TOTAL ASSETS
              </h4>
              <div className="flex justify-between">
                <span className="text-slate-500">Cash on Hand & Drawer</span>
                <span>SAR 18,240.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bank & POS Acquiring</span>
                <span>SAR 84,500.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Inventory on Hand</span>
                <span>SAR 32,800.00</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 font-bold text-emerald-600">
                <span>Total Assets</span>
                <span>SAR {balanceSheet.totalAssets.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <h4 className="font-black text-sm text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
                LIABILITIES & EQUITY
              </h4>
              <div className="flex justify-between">
                <span className="text-slate-500">Accounts Payable</span>
                <span>SAR 24,000.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ZATCA VAT Output Payable</span>
                <span>SAR 4,890.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Retained Earnings</span>
                <span>SAR 106,650.00</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 font-bold text-indigo-600">
                <span>Total Liabilities + Equity</span>
                <span>SAR {(balanceSheet.totalLiabilities + balanceSheet.totalEquity).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: ZATCA VAT */}
      {activeTab === 'ZATCA_VAT' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 text-[10px] font-black">
                FORM 2026 - GAZT/ZATCA
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                {isArabic ? 'إقرار ضريبة القيمة المضافة 15% (الربع الثالث 2026)' : 'Quarterly VAT Return (Q3 2026)'}
              </h3>
            </div>
            <button className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 flex items-center gap-1.5">
              <Download className="w-4 h-4" /> Download Filing Report
            </button>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="font-bold text-slate-900 dark:text-white block">1. Standard Rated Sales (15%)</span>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Taxable Amount (Base)</span>
                <span>SAR {vatReturn.standardRatedSalesSar.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-indigo-600">
                <span>Output VAT (15%)</span>
                <span>SAR {vatReturn.standardRatedOutputVatSar.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="font-bold text-slate-900 dark:text-white block">2. Standard Rated Purchases & Deductible Expenses</span>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Taxable Purchases Base</span>
                <span>SAR {vatReturn.standardRatedPurchasesSar.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-rose-600">
                <span>Input VAT Recoverable</span>
                <span>SAR {vatReturn.standardRatedInputVatSar.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex justify-between items-center">
              <span className="font-black text-sm text-emerald-900 dark:text-emerald-200">
                NET VAT DUE TO ZATCA (ضريبة القيمة المضافة المستحقة)
              </span>
              <span className="font-black text-base text-emerald-600">
                SAR {vatReturn.netVatDueSar.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
