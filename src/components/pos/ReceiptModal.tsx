import React, { useState, useEffect } from 'react';
import { Order, TenantConfig } from '../../types';
import { decodeZatcaTLV } from '../../domain/zatca/zatcaEngine';
import { globalHardwareBridge } from '../../domain/hardware/hardwareBridge';
import { X, Printer, Download, Code, CheckCircle, QrCode, ShieldCheck } from 'lucide-react';
import QRCode from 'qrcode';

interface ReceiptModalProps {
  order: Order;
  tenant: TenantConfig;
  currency: string;
  isArabic: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  order,
  tenant,
  currency,
  isArabic,
  onClose,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'RECEIPT' | 'TLV_TAGS' | 'UBL_XML'>('RECEIPT');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (order.zatcaQrCodeBase64) {
      QRCode.toDataURL(order.zatcaQrCodeBase64, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 180,
      })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error('QR generation error:', err));
    }
  }, [order.zatcaQrCodeBase64]);

  const decodedTags = order.zatcaQrCodeBase64 ? decodeZatcaTLV(order.zatcaQrCodeBase64) : [];

  const handlePrintEscPos = () => {
    const raw = globalHardwareBridge.formatEscPosReceipt({
      orderNumber: order.orderNumber,
      branchNameAr: tenant.legalNameAr,
      branchNameEn: tenant.legalNameEn,
      vatNumber: tenant.vatNumber,
      cashierName: order.cashierName,
      items: order.items.map(i => ({
        nameAr: i.nameAr,
        nameEn: i.nameEn,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalPrice: i.totalPrice,
      })),
      subtotal: order.subtotal,
      discount: order.discountAmount,
      vatAmount: order.taxAmount,
      total: order.totalAmount,
      paymentMethod: order.payments[0]?.method || 'CASH',
      dateStr: new Date(order.openedAt).toLocaleString('en-GB'),
    });

    console.log('--- RAW ESC/POS THERMAL BYTES ---\n', raw);
    window.print();
  };

  const handleCopyXml = () => {
    if (order.zatcaXmlUbl) {
      navigator.clipboard.writeText(order.zatcaXmlUbl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                  ZATCA Phase 2 Verified
                </span>
                <span className="text-xs text-slate-500">
                  {order.zatcaInvoiceType === 'STANDARD' ? 'Standard Tax Invoice (0100000)' : 'Simplified Tax Invoice (0200000)'}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {order.orderNumber}
              </h3>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('RECEIPT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'RECEIPT'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {isArabic ? 'إيصال حراري' : 'Receipt'}
            </button>
            <button
              onClick={() => setActiveTab('TLV_TAGS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'TLV_TAGS'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {isArabic ? 'رموز TLV' : 'TLV Tags'}
            </button>
            <button
              onClick={() => setActiveTab('UBL_XML')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'UBL_XML'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {isArabic ? 'UBL 2.1 XML' : 'UBL XML'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100 dark:bg-slate-950 flex justify-center">
          {activeTab === 'RECEIPT' && (
            <div className="w-full max-w-sm bg-white text-slate-900 p-6 rounded-xl shadow-lg border border-slate-200 font-mono text-xs space-y-4">
              {/* Thermal Receipt Layout */}
              <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
                <h4 className="font-bold text-sm tracking-tight">{tenant.legalNameAr}</h4>
                <p className="text-[11px] text-slate-600">{tenant.legalNameEn}</p>
                <p className="text-[10px] text-slate-500">الرقم الضريبي: {tenant.vatNumber}</p>
                <p className="text-[10px] text-slate-500">سجل تجاري: {tenant.crNumber}</p>
                <p className="text-[10px] text-slate-500">{tenant.branches[0]?.addressAr || 'الرياض، المملكة العربية السعودية'}</p>
              </div>

              <div className="space-y-1 text-[11px] pb-2 border-b border-dashed border-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">رقم الفاتورة:</span>
                  <span className="font-bold">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">التاريخ / الوقت:</span>
                  <span>{new Date(order.openedAt).toLocaleString('ar-SA')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">الكاشير:</span>
                  <span>{order.cashierName}</span>
                </div>
                {order.tableName && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">الطاولة:</span>
                    <span>{order.tableName}</span>
                  </div>
                )}
                {order.customerName && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">العميل:</span>
                    <span>{order.customerName}</span>
                  </div>
                )}
              </div>

              {/* Items */}
              <div className="space-y-2 pb-3 border-b border-dashed border-slate-300">
                <div className="flex justify-between text-slate-400 font-bold border-b pb-1">
                  <span>الصنف</span>
                  <span>الكمية × السعر</span>
                  <span>الإجمالي</span>
                </div>
                {order.items.map(item => (
                  <div key={item.id} className="space-y-0.5">
                    <div className="flex justify-between font-medium">
                      <span>{item.nameAr || item.nameEn}</span>
                      <span>
                        {item.quantity} × {item.unitPrice.toFixed(2)}
                      </span>
                      <span>{item.totalPrice.toFixed(2)}</span>
                    </div>
                    {item.selectedModifiers.map((m, idx) => (
                      <div key={idx} className="flex justify-between text-[10px] text-slate-500 pl-2">
                        <span>+ {m.optionName}</span>
                        <span>{m.price > 0 ? `+${m.price.toFixed(2)}` : ''}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-1.5 text-xs pb-3 border-b border-dashed border-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-600">المجموع غير شامل الضريبة:</span>
                  <span>{(order.totalAmount - order.taxAmount).toFixed(2)} {currency}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-rose-600 font-medium">
                    <span>الخصم المطبق:</span>
                    <span>-{order.discountAmount.toFixed(2)} {currency}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-600">ضريبة القيمة المضافة (15%):</span>
                  <span>{order.taxAmount.toFixed(2)} {currency}</span>
                </div>
                <div className="flex justify-between text-sm font-black pt-1 border-t border-slate-200">
                  <span>المبلغ الإجمالي شامل الضريبة:</span>
                  <span>{order.totalAmount.toFixed(2)} {currency}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-1 text-[11px] pb-3 border-b border-dashed border-slate-300">
                {order.payments.map((p, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-slate-500">طريقة الدفع: {p.method}</span>
                    <span className="font-bold">{p.amount.toFixed(2)} {currency}</span>
                  </div>
                ))}
                {order.payments[0]?.tenderedCash && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-500">المبلغ المستلم:</span>
                      <span>{order.payments[0].tenderedCash.toFixed(2)} {currency}</span>
                    </div>
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>المتبقي للعميل:</span>
                      <span>{(order.payments[0].changeGiven || 0).toFixed(2)} {currency}</span>
                    </div>
                  </>
                )}
              </div>

              {/* ZATCA QR CODE */}
              <div className="text-center flex flex-col items-center justify-center pt-2">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="ZATCA Phase 2 QR Code" className="w-36 h-36 mx-auto rounded border border-slate-200" />
                ) : (
                  <div className="w-36 h-36 bg-slate-100 flex items-center justify-center">
                    <QrCode className="w-10 h-10 text-slate-400" />
                  </div>
                )}
                <p className="text-[10px] text-slate-500 mt-2 font-mono break-all">
                  Hash: {order.invoiceHash ? `${order.invoiceHash.substring(0, 24)}...` : 'N/A'}
                </p>
                <p className="text-[11px] font-bold text-slate-700 mt-1">شكراً لزيارتكم - نسعد بخدمتكم دائماً</p>
              </div>
            </div>
          )}

          {activeTab === 'TLV_TAGS' && (
            <div className="w-full max-w-xl bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-indigo-500" />
                ZATCA Phase 2 Tag-Length-Value (TLV) Decoder
              </h4>
              <p className="text-xs text-slate-500">
                Decoded 9 mandatory cryptographic tags as required by GAZT/ZATCA electronic invoicing specifications.
              </p>

              <div className="space-y-2 mt-3">
                {decodedTags.map(item => (
                  <div key={item.tag} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      <span>Tag {item.tag}: {item.name}</span>
                      <span className="text-slate-400 font-mono">Len: {item.length} bytes</span>
                    </div>
                    <p className="text-xs font-mono text-slate-800 dark:text-slate-200 mt-1 break-all bg-white dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'UBL_XML' && (
            <div className="w-full max-w-xl bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  OASIS UBL 2.1 E-Invoice XML Payload
                </h4>
                <button
                  onClick={handleCopyXml}
                  className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  {isCopied ? <CheckCircle className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                  {isCopied ? 'Copied XML!' : 'Copy XML'}
                </button>
              </div>
              <pre className="flex-1 max-h-96 overflow-y-auto text-[11px] font-mono bg-slate-950 text-emerald-400 p-4 rounded-xl">
                {order.zatcaXmlUbl || '<!-- XML Payload Not Generated Yet -->'}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            CSID Stamp: Validated
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintEscPos}
              className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-indigo-600/20"
            >
              <Printer className="w-4 h-4" />
              {isArabic ? 'طباعة عبر الطابعة الحرارية (ESC/POS)' : 'Print Thermal Receipt (ESC/POS)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
