import React, { useState } from 'react';
import { Shift, TenantConfig } from '../../types';
import { globalHardwareBridge } from '../../domain/hardware/hardwareBridge';
import {
  Banknote,
  DollarSign,
  PlusCircle,
  MinusCircle,
  FileText,
  Lock,
  Printer,
  AlertCircle,
  CheckCircle2,
  Clock,
  User,
  Calculator,
} from 'lucide-react';

interface ShiftDrawerManagementProps {
  shift: Shift;
  tenant: TenantConfig;
  currency: string;
  isArabic: boolean;
  onAddAdjustment: (type: 'PAY_IN' | 'PAY_OUT' | 'DROP', amount: number, reason: string) => void;
  onCloseShift: (actualCash: number) => void;
}

export const ShiftDrawerManagement: React.FC<ShiftDrawerManagementProps> = ({
  shift,
  tenant,
  currency,
  isArabic,
  onAddAdjustment,
  onCloseShift,
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ADJUSTMENT' | 'COUNT' | 'Z_REPORT'>('OVERVIEW');
  const [adjType, setAdjType] = useState<'PAY_IN' | 'PAY_OUT' | 'DROP'>('PAY_IN');
  const [adjAmount, setAdjAmount] = useState<number>(100);
  const [adjReason, setAdjReason] = useState<string>('');

  // Cash Denomination Count State (SAR bills)
  const [denominations, setDenominations] = useState<Record<number, number>>({
    500: 2,
    200: 1,
    100: 0,
    50: 0,
    20: 0,
    10: 4,
    5: 0,
    1: 0,
  });

  const totalCalculatedCash = Object.entries(denominations).reduce(
    (acc, [denom, count]) => acc + Number(denom) * count,
    0
  );

  const cashVariance = totalCalculatedCash - shift.expectedCash;

  const handleTriggerKick = () => {
    globalHardwareBridge.openCashDrawer('Manual Cash Drawer Open via Shift Manager');
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (adjAmount <= 0 || !adjReason) return;
    onAddAdjustment(adjType, adjAmount, adjReason);
    setAdjAmount(100);
    setAdjReason('');
    setActiveTab('OVERVIEW');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 bg-slate-100 dark:bg-slate-950 gap-4">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                {shift.shiftNumber}
              </span>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  shift.status === 'OPEN'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {shift.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isArabic ? `الكاشير: ${shift.cashierName}` : `Cashier: ${shift.cashierName}`} • Start: {new Date(shift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {/* Tab Controls & Hardware Drawer Kick */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleTriggerKick}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5 text-amber-500" />
            <span>{isArabic ? 'فتح درج النقد' : 'Kick Drawer'}</span>
          </button>

          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'OVERVIEW'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {isArabic ? 'ملخص الوردية' : 'Summary'}
            </button>
            <button
              onClick={() => setActiveTab('ADJUSTMENT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'ADJUSTMENT'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {isArabic ? 'إيداع / سحب' : 'Pay In/Out'}
            </button>
            <button
              onClick={() => setActiveTab('COUNT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'COUNT'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {isArabic ? 'جرد وإغلاق (Z-Report)' : 'Close Shift'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-4">
            {/* 4 Core Financial KPI Blocks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-xs text-slate-500 font-medium">
                  {isArabic ? 'إجمالي المبيعات' : 'Total Gross Sales'}
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {shift.totalSales.toFixed(2)} {currency}
                </h3>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  {shift.totalOrders} {isArabic ? 'طلب منفذ' : 'Orders Processed'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-xs text-slate-500 font-medium">
                  {isArabic ? 'النقد المتوقع بالدرج' : 'Expected Cash in Drawer'}
                </span>
                <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                  {shift.expectedCash.toFixed(2)} {currency}
                </h3>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  {isArabic ? `عهدة البداية: ${shift.startingCashFloat} ر.س` : `Float: ${shift.startingCashFloat} SAR`}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-xs text-slate-500 font-medium">
                  {isArabic ? 'مبيعات الشبكة والبطاقات' : 'Card & mada Payments'}
                </span>
                <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                  {shift.cardSales.toFixed(2)} {currency}
                </h3>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block font-semibold">
                  100% Settled Online
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-xs text-slate-500 font-medium">
                  {isArabic ? 'ضريبة القيمة المضافة المحصلة' : 'VAT (15%) Collected'}
                </span>
                <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {shift.totalVat.toFixed(2)} {currency}
                </h3>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  ZATCA Phase 2 Synced
                </span>
              </div>
            </div>

            {/* Adjustments & Pay-ins / Pay-outs History */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {isArabic ? 'سجل حركات النقدية والمصروفات خلال الوردية' : 'Petty Cash & Drawer Adjustments Log'}
              </h3>

              <div className="space-y-2">
                {[...shift.payIns, ...shift.payOuts, ...shift.drops].length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    {isArabic ? 'لا توجد حركات سحب أو إيداع نقدية حتى الآن' : 'No adjustments recorded in this shift.'}
                  </p>
                ) : (
                  [...shift.payIns, ...shift.payOuts, ...shift.drops].map(item => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        {item.type === 'PAY_IN' ? (
                          <PlusCircle className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <MinusCircle className="w-5 h-5 text-rose-500" />
                        )}
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {item.reason}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            {new Date(item.timestamp).toLocaleTimeString()} • {item.performedBy}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-sm font-black ${
                          item.type === 'PAY_IN' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {item.type === 'PAY_IN' ? '+' : '-'}
                        {item.amount.toFixed(2)} {currency}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ADJUSTMENT' && (
          <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {isArabic ? 'تسجيل حركة نقدية في الدرج (إيداع / سحب / إسقاط)' : 'Record Drawer Cash Adjustment'}
            </h3>

            <form onSubmit={handleSaveAdjustment} className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjType('PAY_IN')}
                  className={`p-3 rounded-xl border text-center font-bold text-xs ${
                    adjType === 'PAY_IN'
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600'
                  }`}
                >
                  {isArabic ? 'إيداع عهدة (Pay In)' : 'Pay In (+)'}
                </button>
                <button
                  type="button"
                  onClick={() => setAdjType('PAY_OUT')}
                  className={`p-3 rounded-xl border text-center font-bold text-xs ${
                    adjType === 'PAY_OUT'
                      ? 'border-rose-600 bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600'
                  }`}
                >
                  {isArabic ? 'سحب مصروفات (Pay Out)' : 'Pay Out (-)'}
                </button>
                <button
                  type="button"
                  onClick={() => setAdjType('DROP')}
                  className={`p-3 rounded-xl border text-center font-bold text-xs ${
                    adjType === 'DROP'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600'
                  }`}
                >
                  {isArabic ? 'إسقاط للخزينة (Drop)' : 'Safe Drop (-)'}
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isArabic ? 'المبلغ المطلوب' : 'Amount'} ({currency})
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={adjAmount}
                  onChange={e => setAdjAmount(Number(e.target.value))}
                  className="w-full text-lg font-black p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isArabic ? 'سبب الحركة / المبرر المالي' : 'Reason / Note'}
                </label>
                <textarea
                  rows={3}
                  required
                  value={adjReason}
                  onChange={e => setAdjReason(e.target.value)}
                  placeholder={isArabic ? 'مثال: شراء نعناع وخضروات طارئة، إيداع فكة إضافية...' : 'e.g. Emergency ice purchase, additional petty float...'}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md"
              >
                {isArabic ? 'حفظ وتسجيل الحركة' : 'Commit Cash Adjustment'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'COUNT' && (
          <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
            <div>
              <h3 className="font-black text-lg text-slate-900 dark:text-white">
                {isArabic ? 'حاسبة الجرد النقدي وإغلاق الوردية (Z-Report)' : 'Cash Drawer Denomination Count & Shift Close'}
              </h3>
              <p className="text-xs text-slate-500">
                {isArabic ? 'أدخل عدد الأوراق النقدية لكل فئة لمطابقة الرصيد الفعلي مع المتوقع' : 'Enter bill counts to reconcile physical cash against calculated expected balance.'}
              </p>
            </div>

            {/* Denomination Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[500, 200, 100, 50, 20, 10, 5, 1].map(denom => (
                <div
                  key={denom}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between"
                >
                  <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                    {denom} {currency}
                  </span>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[10px] text-slate-400">Qty:</span>
                    <input
                      type="number"
                      min={0}
                      value={denominations[denom] || 0}
                      onChange={e =>
                        setDenominations({ ...denominations, [denom]: Math.max(0, Number(e.target.value)) })
                      }
                      className="w-full text-right font-bold text-xs p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mt-1 text-right">
                    = {((denominations[denom] || 0) * denom).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Reconciliation Comparison Bar */}
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between text-xs">
                <span>{isArabic ? 'النقد الفعلي المحصي' : 'Actual Cash Counted'}:</span>
                <span className="font-bold text-base text-slate-900 dark:text-white">
                  {totalCalculatedCash.toFixed(2)} {currency}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span>{isArabic ? 'النقد المتوقع في النظام' : 'Expected System Cash'}:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {shift.expectedCash.toFixed(2)} {currency}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-sm">
                <span>{isArabic ? 'الفارق (عجز / زيادة)' : 'Variance (Over / Short)'}:</span>
                <span
                  className={
                    cashVariance === 0
                      ? 'text-emerald-600'
                      : cashVariance > 0
                      ? 'text-blue-600'
                      : 'text-rose-600'
                  }
                >
                  {cashVariance >= 0 ? `+${cashVariance.toFixed(2)}` : cashVariance.toFixed(2)} {currency}
                </span>
              </div>
            </div>

            <button
              onClick={() => onCloseShift(totalCalculatedCash)}
              className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>{isArabic ? 'تأكيد إغلاق الوردية وإصدار تقرير Z-Report' : 'Confirm Close Shift & Generate Z-Report'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
