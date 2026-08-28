import React, { useState } from 'react';
import { Order, PaymentMethod, Customer } from '../../types';
import { X, CreditCard, Banknote, Smartphone, Wallet, Gift, Users, Split, CheckCircle2, ArrowRight } from 'lucide-react';

interface SplitPaymentModalProps {
  order: Order;
  currency: string;
  isArabic: boolean;
  customers: Customer[];
  onClose: () => void;
  onProcessPayment: (
    orderId: string,
    method: PaymentMethod,
    tenderedAmount: number,
    tipAmount: number,
    cardLast4?: string,
    isB2B?: boolean,
    buyerDetails?: { name: string; vat: string }
  ) => Promise<void>;
}

export const SplitPaymentModal: React.FC<SplitPaymentModalProps> = ({
  order,
  currency,
  isArabic,
  customers,
  onClose,
  onProcessPayment,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('MADA');
  const [splitMode, setSplitMode] = useState<'FULL' | 'EQUAL_SPLIT' | 'CUSTOM_AMOUNT'>('FULL');
  const [equalParts, setEqualParts] = useState(2);
  const [tenderAmount, setTenderAmount] = useState<number>(order.balanceAmount);
  const [cashTendered, setCashTendered] = useState<number>(order.balanceAmount);
  const [selectedTipPercent, setSelectedTipPercent] = useState<number>(0);
  const [isB2BInvoice, setIsB2BInvoice] = useState<boolean>(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerVat, setBuyerVat] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Attached customer if any
  const attachedCustomer = customers.find(c => c.id === order.customerId);

  // Calculate tip
  const tipAmount = selectedTipPercent > 0 ? (tenderAmount * selectedTipPercent) / 100 : 0;
  const grandPayable = tenderAmount + tipAmount;
  const cashChange = selectedMethod === 'CASH' ? Math.max(0, cashTendered - grandPayable) : 0;

  // Handle Split mode adjustments
  const handleSplitModeChange = (mode: 'FULL' | 'EQUAL_SPLIT' | 'CUSTOM_AMOUNT') => {
    setSplitMode(mode);
    if (mode === 'FULL') {
      setTenderAmount(order.balanceAmount);
      setCashTendered(order.balanceAmount);
    } else if (mode === 'EQUAL_SPLIT') {
      const part = Number((order.balanceAmount / equalParts).toFixed(2));
      setTenderAmount(part);
      setCashTendered(part);
    } else if (mode === 'CUSTOM_AMOUNT') {
      setTenderAmount(Math.round(order.balanceAmount / 2));
      setCashTendered(Math.round(order.balanceAmount / 2));
    }
  };

  const handleEqualPartsChange = (parts: number) => {
    setEqualParts(parts);
    const part = Number((order.balanceAmount / parts).toFixed(2));
    setTenderAmount(part);
    setCashTendered(part);
  };

  const handlePay = async () => {
    setIsProcessing(true);
    try {
      await onProcessPayment(
        order.id,
        selectedMethod,
        selectedMethod === 'CASH' ? cashTendered : tenderAmount,
        tipAmount,
        selectedMethod === 'CASH' ? undefined : '9182',
        isB2BInvoice,
        isB2BInvoice ? { name: buyerName, vat: buyerVat } : undefined
      );
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {order.orderNumber}
              </span>
              <span className="text-xs text-slate-500">
                {isArabic ? order.tableName || 'طلب مباشر' : order.tableName || 'Direct Order'}
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {isArabic ? 'إتمام الدفع وتقسيم الفاتورة' : 'Tender Payment & Split Bill'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Amount Balance Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-xs text-slate-500">{isArabic ? 'إجمالي الطلب' : 'Total Order'}</span>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {order.totalAmount.toFixed(2)} {currency}
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-500">{isArabic ? 'المدفوع سابقاً' : 'Paid So Far'}</span>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {order.paidAmount.toFixed(2)} {currency}
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-500">{isArabic ? 'المتبقي للدفع' : 'Remaining Balance'}</span>
              <p className="text-xl font-black text-rose-600 dark:text-rose-400">
                {order.balanceAmount.toFixed(2)} {currency}
              </p>
            </div>
          </div>

          {/* Split Mode Selector */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
              {isArabic ? 'طريقة تقسيم الفاتورة' : 'Split Bill Method'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSplitModeChange('FULL')}
                className={`p-3 rounded-xl border text-center font-medium text-sm transition-all ${
                  splitMode === 'FULL'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Banknote className="w-5 h-5 mx-auto mb-1 opacity-80" />
                {isArabic ? 'سداد كامل المبلغ' : 'Pay Full Balance'}
              </button>

              <button
                type="button"
                onClick={() => handleSplitModeChange('EQUAL_SPLIT')}
                className={`p-3 rounded-xl border text-center font-medium text-sm transition-all ${
                  splitMode === 'EQUAL_SPLIT'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Users className="w-5 h-5 mx-auto mb-1 opacity-80" />
                {isArabic ? 'تقسيم متساوي' : 'Equal Split'}
              </button>

              <button
                type="button"
                onClick={() => handleSplitModeChange('CUSTOM_AMOUNT')}
                className={`p-3 rounded-xl border text-center font-medium text-sm transition-all ${
                  splitMode === 'CUSTOM_AMOUNT'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Split className="w-5 h-5 mx-auto mb-1 opacity-80" />
                {isArabic ? 'مبلغ مخصص' : 'Custom Amount'}
              </button>
            </div>

            {splitMode === 'EQUAL_SPLIT' && (
              <div className="mt-3 p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
                <span className="text-sm text-indigo-950 dark:text-indigo-200 font-medium">
                  {isArabic ? 'عدد الأشخاص المقسم بينهم:' : 'Split between number of guests:'}
                </span>
                <div className="flex items-center gap-1.5">
                  {[2, 3, 4, 5, 6].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleEqualPartsChange(num)}
                      className={`w-9 h-9 rounded-lg font-bold text-sm ${
                        equalParts === num
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tender Methods */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
              {isArabic ? 'وسيلة الدفع' : 'Payment Tender Method'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'MADA', labelEn: 'mada (مدى)', labelAr: 'مدى (mada)', icon: CreditCard, color: 'emerald' },
                { id: 'APPLE_PAY', labelEn: 'Apple Pay', labelAr: 'آبل باي (Apple Pay)', icon: Smartphone, color: 'slate' },
                { id: 'VISA', labelEn: 'Visa / Mastercard', labelAr: 'فيزا / ماستركارد', icon: CreditCard, color: 'blue' },
                { id: 'CASH', labelEn: 'Cash (نقدي)', labelAr: 'نقدي (Cash)', icon: Banknote, color: 'amber' },
                { id: 'WALLET', labelEn: `Wallet (${attachedCustomer?.walletBalance || 0} SAR)`, labelAr: `محفظة العميل (${attachedCustomer?.walletBalance || 0} ر.س)`, icon: Wallet, color: 'purple' },
                { id: 'GIFT_CARD', labelEn: 'Gift Card', labelAr: 'بطاقة إهداء', icon: Gift, color: 'rose' },
              ].map(method => {
                const Icon = method.icon;
                const isSelected = selectedMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedMethod(method.id as PaymentMethod)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-md'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                    <span className="text-xs sm:text-sm font-bold truncate">
                      {isArabic ? method.labelAr : method.labelEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cash Bills Fast Buttons */}
          {selectedMethod === 'CASH' && (
            <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-amber-950 dark:text-amber-200">
                  {isArabic ? 'المبلغ النقدي المستلم:' : 'Cash Tendered from Customer:'}
                </span>
                <input
                  type="number"
                  value={cashTendered}
                  onChange={e => setCashTendered(Number(e.target.value))}
                  className="w-32 text-right font-bold text-lg p-2 rounded-lg border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {[50, 100, 200, 500].map(bill => (
                  <button
                    key={bill}
                    type="button"
                    onClick={() => setCashTendered(bill)}
                    className="flex-1 py-2 px-3 rounded-lg font-bold text-xs bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                  >
                    {bill} {currency}
                  </button>
                ))}
              </div>

              {cashChange > 0 && (
                <div className="pt-2 border-t border-amber-200 dark:border-amber-800/60 flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-bold">
                  <span>{isArabic ? 'المبلغ المتبقي للعميل (الصرف):' : 'Change Due to Customer:'}</span>
                  <span className="text-lg">
                    {cashChange.toFixed(2)} {currency}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Optional Tip Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {isArabic ? 'إكرامية الموظفين (Tips)' : 'Staff Tip (Optional)'}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[0, 5, 10, 15].map(pct => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setSelectedTipPercent(pct)}
                  className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                    selectedTipPercent === pct
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {pct === 0 ? (isArabic ? 'بدون' : 'None') : `${pct}%`}
                </button>
              ))}
            </div>
          </div>

          {/* ZATCA B2B / Corporate Invoice Toggle */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isArabic ? 'إصدار فاتورة ضريبية قياسية للشركات (B2B)' : 'Issue B2B Standard Tax Invoice (ZATCA Clearance)'}
                </h4>
                <p className="text-xs text-slate-500">
                  {isArabic ? 'تتطلب تسجيل اسم المنشأة والرقم الضريبي 15 رقم للفسح الفوري' : 'Requires Buyer Legal Name & 15-digit VAT for real-time clearance'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={isB2BInvoice}
                onChange={e => setIsB2BInvoice(e.target.checked)}
                className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
            </div>

            {isB2BInvoice && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {isArabic ? 'اسم الشركة / المنشأة المشتري' : 'Buyer Legal Entity Name'}
                  </label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={e => setBuyerName(e.target.value)}
                    placeholder="شركة الأفق للتجارة..."
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {isArabic ? 'الرقم الضريبي للمشتري (15 رقم)' : 'Buyer 15-Digit VAT Number'}
                  </label>
                  <input
                    type="text"
                    value={buyerVat}
                    onChange={e => setBuyerVat(e.target.value)}
                    placeholder="300123456700003"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-500">{isArabic ? 'المبلغ الإجمالي للدفع' : 'Total Tender'}:</span>
            <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">
              {grandPayable.toFixed(2)} {currency}
            </p>
          </div>

          <button
            type="button"
            disabled={isProcessing || grandPayable <= 0}
            onClick={handlePay}
            className="flex-1 py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {isArabic ? 'جاري التحقق والربط بهيئة الزكاة...' : 'Processing & Signing with ZATCA...'}
              </span>
            ) : isSuccess ? (
              <span className="flex items-center gap-2 text-emerald-200">
                <CheckCircle2 className="w-5 h-5" />
                {isArabic ? 'تم الدفع واعتماد الفاتورة بنجاح!' : 'Payment Approved & Signed!'}
              </span>
            ) : (
              <>
                <span>{isArabic ? `تأكيد دفع ${grandPayable.toFixed(2)} ${currency}` : `Confirm Pay ${grandPayable.toFixed(2)} ${currency}`}</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
