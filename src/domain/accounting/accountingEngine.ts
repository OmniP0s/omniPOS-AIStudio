// Enterprise Accounting, General Ledger & Saudi VAT Engine
import { ChartOfAccount, JournalEntry, JournalLine, Order, PurchaseOrder, VatReturnSummary, CurrencyCode } from '../../types';

export const initialChartOfAccounts: ChartOfAccount[] = [
  // 1000 - ASSETS
  { id: 'coa-1010', code: '1010', nameEn: 'Cash on Hand (Drawers)', nameAr: 'النقدية في الصناديق', category: 'ASSET', subCategory: 'Current Assets', balance: 14500.00, currency: 'SAR', isReconciled: true },
  { id: 'coa-1020', code: '1020', nameEn: 'Bank Account (Al Rajhi Main)', nameAr: 'الحساب البنكي الرئيسي (الراجحي)', category: 'ASSET', subCategory: 'Current Assets', balance: 284500.00, currency: 'SAR', isReconciled: true },
  { id: 'coa-1030', code: '1030', nameEn: 'mada POS Card Clearing', nameAr: 'حساب وسيط تسوية بطاقات مدى', category: 'ASSET', subCategory: 'Current Assets', balance: 36200.00, currency: 'SAR', isReconciled: true },
  { id: 'coa-1040', code: '1040', nameEn: 'Accounts Receivable (B2B Corporate)', nameAr: 'العملاء والمدينون التجاريون', category: 'ASSET', subCategory: 'Current Assets', balance: 18400.00, currency: 'SAR', isReconciled: true },
  { id: 'coa-1050', code: '1050', nameEn: 'Food & Beverage Raw Inventory', nameAr: 'مخزون المواد الغذائية والمشروبات', category: 'ASSET', subCategory: 'Inventory Assets', balance: 84320.00, currency: 'SAR', isReconciled: true },
  { id: 'coa-1060', code: '1060', nameEn: 'Packaging & Consumables Stock', nameAr: 'مخزون مواد التغليف والاستهلاك', category: 'ASSET', subCategory: 'Inventory Assets', balance: 12500.00, currency: 'SAR', isReconciled: true },
  { id: 'coa-1510', code: '1510', nameEn: 'Kitchen Heavy Equipment & Grills', nameAr: 'المعدات الثقيلة وأفران المطبخ', category: 'ASSET', subCategory: 'Fixed Assets', balance: 350000.00, currency: 'SAR', isReconciled: true },
  { id: 'coa-1520', code: '1520', nameEn: 'Accumulated Depreciation - Equipment', nameAr: 'مجمع إهلاك المعدات والأجهزة', category: 'ASSET', subCategory: 'Fixed Assets', balance: -45000.00, currency: 'SAR', isReconciled: true },

  // 2000 - LIABILITIES
  { id: 'coa-2010', code: '2010', nameEn: 'Accounts Payable (Trade Vendors)', nameAr: 'الموردون والدائنون التجاريون', category: 'LIABILITY', subCategory: 'Current Liabilities', balance: 42100.00, currency: 'SAR', isReconciled: true },
  { id: 'coa-2020', code: '2020', nameEn: 'Output VAT Payable (15% ZATCA)', nameAr: 'ضريبة القيمة المضافة المستحقة (15%)', category: 'LIABILITY', subCategory: 'Tax Liabilities', balance: 31250.00, currency: 'SAR', isReconciled: true },
  { id: 'coa-2030', code: '2030', nameEn: 'Accrued Staff Salaries & GOSI', nameAr: 'رواتب الموظفين المستحقة والتأمينات', category: 'LIABILITY', subCategory: 'Payroll Liabilities', balance: 65000.00, currency: 'SAR', isReconciled: true },
  { id: 'coa-2040', code: '2040', nameEn: 'Customer Digital Wallet Deposits', nameAr: 'أمانات محافظ العملاء وبطاقات الهدايا', category: 'LIABILITY', subCategory: 'Current Liabilities', balance: 9400.00, currency: 'SAR', isReconciled: true },
  { id: 'coa-2050', code: '2050', nameEn: 'Tips Payable to Service Staff', nameAr: 'إكراميات طاقم الخدمة المستحقة', category: 'LIABILITY', subCategory: 'Current Liabilities', balance: 4800.00, currency: 'SAR', isReconciled: true },

  // 3000 - EQUITY
  { id: 'coa-3010', code: '3010', nameEn: 'Paid-in Capital', nameAr: 'رأس المال المدفوع', category: 'EQUITY', subCategory: 'Equity', balance: 500000.00, currency: 'SAR', isReconciled: true },
  { id: 'coa-3020', code: '3020', nameEn: 'Retained Earnings', nameAr: 'الأرباح المبقاة', category: 'EQUITY', subCategory: 'Equity', balance: 149370.00, currency: 'SAR', isReconciled: true },

  // 4000 - REVENUE
  { id: 'coa-4010', code: '4010', nameEn: 'Food Sales (Dine-In & Takeaway)', nameAr: 'مبيعات الأطعمة (محلي وسفري)', category: 'REVENUE', subCategory: 'Operating Revenue', balance: 382400.00, currency: 'SAR', isReconciled: true },
  { id: 'coa-4020', code: '4020', nameEn: 'Beverage & Specialty Coffee Sales', nameAr: 'مبيعات المشروبات والقهوة المختصة', category: 'REVENUE', subCategory: 'Operating Revenue', balance: 98600.00, currency: 'SAR', isReconciled: true },
  { id: 'coa-4030', code: '4030', nameEn: 'Delivery Platform Aggregator Sales', nameAr: 'مبيعات تطبيقات التوصيل (جاهز / هنقرستيشن)', category: 'REVENUE', subCategory: 'Operating Revenue', balance: 114500.00, currency: 'SAR', isReconciled: true },
  { id: 'coa-4090', code: '4090', nameEn: 'Sales Discounts & Promotional Allowances', nameAr: 'الخصومات والمسموحات التسويقية', category: 'REVENUE', subCategory: 'Operating Revenue', balance: -16800.00, currency: 'SAR', isReconciled: true },

  // 5000 - COST OF GOODS SOLD (COGS)
  { id: 'coa-5010', code: '5010', nameEn: 'Cost of Meat, Poultry & Seafood', nameAr: 'تكلفة اللحوم والدواجن والمأكولات البحرية', category: 'COGS', subCategory: 'Direct Food Costs', balance: 112400.00, currency: 'SAR', isReconciled: true },
  { id: 'coa-5020', code: '5020', nameEn: 'Cost of Produce, Dairy & Bakery', nameAr: 'تكلفة الخضار والألبان والمخبوزات', category: 'COGS', subCategory: 'Direct Food Costs', balance: 48900.00, currency: 'SAR', isReconciled: true },
  { id: 'coa-5030', code: '5030', nameEn: 'Cost of Beverages, Syrups & Coffee Beans', nameAr: 'تكلفة المشروبات وحبوب البن', category: 'COGS', subCategory: 'Direct Beverage Costs', balance: 24300.00, currency: 'SAR', isReconciled: true },
  { id: 'coa-5040', code: '5040', nameEn: 'Packaging & Delivery Disposables', nameAr: 'تكلفة علب التعبئة ومستلزمات التوصيل', category: 'COGS', subCategory: 'Direct Packaging Costs', balance: 14200.00, currency: 'SAR', isReconciled: true },
  { id: 'coa-5090', code: '5090', nameEn: 'Kitchen Spoilage & Waste Expense', nameAr: 'خسائر وتالف المطبخ والهدر', category: 'COGS', subCategory: 'Waste', balance: 4850.00, currency: 'SAR', isReconciled: true },

  // 6000 - OPERATING EXPENSES
  { id: 'coa-6010', code: '6010', nameEn: 'Kitchen & Service Staff Salaries', nameAr: 'رواتب وأجور طاقم التشغيل والخدمة', category: 'EXPENSE', subCategory: 'Payroll Expenses', balance: 94000.00, currency: 'SAR', isReconciled: true },
  { id: 'coa-6020', code: '6020', nameEn: 'Branch Commercial Rent', nameAr: 'إيجار فروع المطعم', category: 'EXPENSE', subCategory: 'Occupancy Expenses', balance: 45000.00, currency: 'SAR', isReconciled: true },
  { id: 'coa-6030', code: '6030', nameEn: 'Electricity, Gas & Water Utilities', nameAr: 'الكهرباء والغاز والمياه', category: 'EXPENSE', subCategory: 'Occupancy Expenses', balance: 14200.00, currency: 'SAR', isReconciled: true },
  { id: 'coa-6040', code: '6040', nameEn: 'POS & Cloud SaaS Subscriptions', nameAr: 'اشتراكات الأنظمة السحابية ونقاط البيع', category: 'EXPENSE', subCategory: 'Technology Expenses', balance: 3500.00, currency: 'SAR', isReconciled: true },
  { id: 'coa-6050', code: '6050', nameEn: 'Card Processing & mada Interchange Fees', nameAr: 'عمولات وعمليات أجهزة الدفع ومدى', category: 'EXPENSE', subCategory: 'Bank Charges', balance: 5600.00, currency: 'SAR', isReconciled: true },
  { id: 'coa-6060', code: '6060', nameEn: 'Social Media & Performance Marketing', nameAr: 'التسويق والحملات الإعلانية', category: 'EXPENSE', subCategory: 'Marketing Expenses', balance: 12000.00, currency: 'SAR', isReconciled: true },
];

export const initialJournalEntries: JournalEntry[] = [
  {
    id: 'je-2026-001',
    entryNumber: 'JE-2026-0801',
    date: '2026-08-27',
    reference: 'POS-SETTLE-SH-102',
    branchId: 'branch-01',
    memo: 'Daily POS Sales Settlement & VAT Recognition for Riyadh Olaya Branch',
    postedBy: 'System Auto-Accounting',
    isPosted: true,
    lines: [
      { accountId: 'coa-1010', accountCode: '1010', accountName: 'Cash on Hand (Drawers)', debit: 4850.00, credit: 0, memo: 'Cash tender collected' },
      { accountId: 'coa-1030', accountCode: '1030', accountName: 'mada POS Card Clearing', debit: 12400.00, credit: 0, memo: 'mada/Visa payments' },
      { accountId: 'coa-4090', accountCode: '4090', accountName: 'Sales Discounts', debit: 350.00, credit: 0, memo: 'Promotional loyalty discounts' },
      { accountId: 'coa-4010', accountCode: '4010', accountName: 'Food Sales', debit: 0, credit: 12500.00, memo: 'Net food revenue' },
      { accountId: 'coa-4020', accountCode: '4020', accountName: 'Beverage Sales', debit: 0, credit: 2850.00, memo: 'Net beverage revenue' },
      { accountId: 'coa-2020', accountCode: '2020', accountName: 'Output VAT Payable (15%)', debit: 0, credit: 2250.00, memo: 'ZATCA Phase 2 15% VAT' },
    ],
  },
  {
    id: 'je-2026-002',
    entryNumber: 'JE-2026-0802',
    date: '2026-08-27',
    reference: 'PO-REC-2026-042',
    branchId: 'branch-01',
    memo: 'Goods Receiving (GRN) from Almarai Dairy & Food Supplies',
    postedBy: 'System Auto-Accounting',
    isPosted: true,
    lines: [
      { accountId: 'coa-1050', accountCode: '1050', accountName: 'Food & Beverage Raw Inventory', debit: 6200.00, credit: 0, memo: 'Inventory addition' },
      { accountId: 'coa-2010', accountCode: '2010', accountName: 'Accounts Payable', debit: 0, credit: 6200.00, memo: 'Trade payable to Almarai' },
    ],
  },
];

export class AccountingEngine {
  private coa: ChartOfAccount[] = [...initialChartOfAccounts];
  private entries: JournalEntry[] = [...initialJournalEntries];

  public getChartOfAccounts(): ChartOfAccount[] {
    return this.coa;
  }

  public getJournalEntries(): JournalEntry[] {
    return this.entries;
  }

  // Create Double-entry transaction for a completed order
  public recordOrderSale(order: Order, branchId: string, postedBy: string = 'System Auto-Accounting'): JournalEntry {
    const lines: JournalLine[] = [];

    // Tenders received (Debits to Cash / Bank / mada)
    const cashTotal = order.payments.filter(p => p.method === 'CASH').reduce((sum, p) => sum + p.amount, 0);
    const cardTotal = order.payments.filter(p => p.method === 'MADA' || p.method === 'VISA' || p.method === 'MASTERCARD' || p.method === 'APPLE_PAY').reduce((sum, p) => sum + p.amount, 0);
    const walletTotal = order.payments.filter(p => p.method === 'WALLET' || p.method === 'GIFT_CARD').reduce((sum, p) => sum + p.amount, 0);

    if (cashTotal > 0) {
      lines.push({ accountId: 'coa-1010', accountCode: '1010', accountName: 'Cash on Hand (Drawers)', debit: cashTotal, credit: 0, memo: `Cash from Order ${order.orderNumber}` });
    }
    if (cardTotal > 0) {
      lines.push({ accountId: 'coa-1030', accountCode: '1030', accountName: 'mada POS Card Clearing', debit: cardTotal, credit: 0, memo: `Card from Order ${order.orderNumber}` });
    }
    if (walletTotal > 0) {
      lines.push({ accountId: 'coa-2040', accountCode: '2040', accountName: 'Customer Digital Wallet Deposits', debit: walletTotal, credit: 0, memo: `Wallet redemption for Order ${order.orderNumber}` });
    }
    if (order.discountAmount > 0) {
      lines.push({ accountId: 'coa-4090', accountCode: '4090', accountName: 'Sales Discounts & Promotional Allowances', debit: order.discountAmount, credit: 0, memo: `Discount on ${order.orderNumber}` });
    }

    // Credits (Revenue & Taxes)
    const foodSales = Math.max(0, order.taxableAmount + order.discountAmount);
    lines.push({ accountId: 'coa-4010', accountCode: '4010', accountName: 'Food Sales (Dine-In & Takeaway)', debit: 0, credit: Number(foodSales.toFixed(2)), memo: `Gross food sales for ${order.orderNumber}` });

    if (order.taxAmount > 0) {
      lines.push({ accountId: 'coa-2020', accountCode: '2020', accountName: 'Output VAT Payable (15% ZATCA)', debit: 0, credit: Number(order.taxAmount.toFixed(2)), memo: `ZATCA 15% VAT on ${order.orderNumber}` });
    }

    const entry: JournalEntry = {
      id: `je-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      entryNumber: `JE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      reference: order.orderNumber,
      branchId,
      memo: `Auto Journal Entry: Order ${order.orderNumber} (${order.orderType})`,
      postedBy,
      isPosted: true,
      lines,
    };

    this.entries.unshift(entry);
    return entry;
  }

  // Generate Real-time P&L Statement
  public generateProfitAndLoss(periodStr: string = 'Current Quarter 2026') {
    const revenueAccounts = this.coa.filter(a => a.category === 'REVENUE');
    const cogsAccounts = this.coa.filter(a => a.category === 'COGS');
    const expenseAccounts = this.coa.filter(a => a.category === 'EXPENSE');

    const totalGrossRevenue = revenueAccounts.filter(a => a.balance > 0).reduce((sum, a) => sum + a.balance, 0);
    const totalDiscounts = Math.abs(revenueAccounts.filter(a => a.balance < 0).reduce((sum, a) => sum + a.balance, 0));
    const netRevenue = totalGrossRevenue - totalDiscounts;

    const totalCogs = cogsAccounts.reduce((sum, a) => sum + a.balance, 0);
    const grossProfit = netRevenue - totalCogs;
    const grossMarginPercent = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;

    const totalExpenses = expenseAccounts.reduce((sum, a) => sum + a.balance, 0);
    const netOperatingIncome = grossProfit - totalExpenses;
    const netMarginPercent = netRevenue > 0 ? (netOperatingIncome / netRevenue) * 100 : 0;

    return {
      period: periodStr,
      revenue: netRevenue,
      grossRevenue: totalGrossRevenue,
      discounts: totalDiscounts,
      cogs: totalCogs,
      grossProfit,
      grossMarginPercent,
      expenses: totalExpenses,
      netProfit: netOperatingIncome,
      netOperatingIncome,
      netMarginPercent,
      revenueItems: revenueAccounts,
      cogsItems: cogsAccounts,
      expenseItems: expenseAccounts,
    };
  }

  public generateProfitAndLossStatement(periodStr: string = 'Current Quarter 2026') {
    const pnl = this.generateProfitAndLoss(periodStr);
    return {
      period: periodStr,
      revenue: {
        items: pnl.revenueItems,
        grossRevenue: pnl.grossRevenue,
        discounts: pnl.discounts,
        netRevenue: pnl.revenue,
      },
      cogs: {
        items: pnl.cogsItems,
        totalCogs: pnl.cogs,
      },
      grossProfit: pnl.grossProfit,
      grossMarginPercent: pnl.grossMarginPercent,
      operatingExpenses: {
        items: pnl.expenseItems,
        totalExpenses: pnl.expenses,
      },
      netOperatingIncome: pnl.netOperatingIncome,
      netMarginPercent: pnl.netMarginPercent,
    };
  }

  // Generate Balance Sheet
  public generateBalanceSheet() {
    const assetAccounts = this.coa.filter(a => a.category === 'ASSET');
    const liabilityAccounts = this.coa.filter(a => a.category === 'LIABILITY');
    const equityAccounts = this.coa.filter(a => a.category === 'EQUITY');

    const totalAssets = assetAccounts.reduce((sum, a) => sum + a.balance, 0);
    const totalLiabilities = liabilityAccounts.reduce((sum, a) => sum + a.balance, 0);
    const totalEquity = equityAccounts.reduce((sum, a) => sum + a.balance, 0);

    return {
      asOfDate: new Date().toISOString().split('T')[0],
      totalAssets,
      totalLiabilities,
      totalEquity,
      assets: {
        currentAssets: assetAccounts.filter(a => a.subCategory === 'Current Assets'),
        inventoryAssets: assetAccounts.filter(a => a.subCategory === 'Inventory Assets'),
        fixedAssets: assetAccounts.filter(a => a.subCategory === 'Fixed Assets'),
        totalAssets,
      },
      liabilities: {
        currentLiabilities: liabilityAccounts.filter(a => a.subCategory === 'Current Liabilities'),
        taxLiabilities: liabilityAccounts.filter(a => a.subCategory === 'Tax Liabilities'),
        payrollLiabilities: liabilityAccounts.filter(a => a.subCategory === 'Payroll Liabilities'),
        totalLiabilities,
      },
      equity: {
        items: equityAccounts,
        totalEquity,
      },
      isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 1000,
    };
  }

  // Generate ZATCA VAT Return Form 2026
  public generateVatReturn(period: string = 'Q3 2026'): VatReturnSummary {
    const pnl = this.generateProfitAndLossStatement();
    const standardSales = pnl.revenue.netRevenue;
    const outputVat = standardSales * 0.15;
    const standardPurchases = pnl.cogs.totalCogs * 0.85; // Approx deductible taxable inputs
    const inputVat = standardPurchases * 0.15;
    const netVatPayable = outputVat - inputVat;

    return {
      period,
      standardRatedSalesSar: standardSales,
      standardRatedOutputVatSar: outputVat,
      standardRatedPurchasesSar: standardPurchases,
      standardRatedInputVatSar: inputVat,
      inputVatDeductibleSar: inputVat,
      netVatDueSar: netVatPayable,
      netVatPayableSar: netVatPayable,
      zatcaStatus: 'RECONCILED',
    };
  }
}

export const globalAccounting = new AccountingEngine();
