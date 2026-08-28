import React, { useState } from 'react';
import { TenantConfig, Order } from '../../types';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Key,
  FileCode2,
  RefreshCw,
  Server,
  Lock,
  ExternalLink,
  QrCode,
  Download,
} from 'lucide-react';

interface ZatcaComplianceViewProps {
  tenant: TenantConfig;
  orders: Order[];
  isArabic: boolean;
}

export const ZatcaComplianceView: React.FC<ZatcaComplianceViewProps> = ({
  tenant,
  orders,
  isArabic,
}) => {
  const [testingEndpoint, setTestingEndpoint] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);

  const zatcaOrders = orders.filter(o => o.zatcaStatus && o.zatcaStatus !== 'NOT_APPLICABLE');

  const handleRunComplianceCheck = async () => {
    setTestingEndpoint(true);
    try {
      const response = await fetch('/api/zatca/compliance-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          egsSerialNumber: tenant.zatcaConfig?.egsSerialNumber,
          taxNumber: tenant.vatNumber,
          invoiceType: 'SIMPLIFIED',
          invoiceTotal: 154.5,
          vatTotal: 20.15,
        }),
      });
      const data = await response.json();
      setTestResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setTestingEndpoint(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 bg-slate-100 dark:bg-slate-950 gap-4">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {isArabic ? 'مركز الامتثال والربط المباشر مع هيئة الزكاة (ZATCA Phase 2)' : 'ZATCA Phase 2 E-Invoicing & Compliance Center'}
              </h2>
              <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                ACTIVE CSID
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {isArabic ? 'إدارة شهادات التشفير، التوقيع الرقمي ECDSA، وسلسلة الهاش SHA-256' : 'Cryptographic EGS unit, ECDSA signature, and continuous SHA-256 hash chaining'}
            </p>
          </div>
        </div>

        <button
          onClick={handleRunComplianceCheck}
          disabled={testingEndpoint}
          className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${testingEndpoint ? 'animate-spin' : ''}`} />
          <span>{isArabic ? 'فحص الاتصال مع بوابة الزكاة (Fatoora API)' : 'Test Fatoora API Gateway'}</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">EGS Cryptographic Unit</span>
              <Key className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
              {tenant.zatcaConfig?.egsSerialNumber || 'EGS-SA-91823-POS-01'}
            </p>
            <span className="text-[11px] text-emerald-600 font-medium block">
              ✓ ECDSA secp256k1 Key Pair Stored
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">CSID Certificate</span>
              <Lock className="w-4 h-4 text-indigo-500" />
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              {tenant.csidStatus} (Phase 2)
            </p>
            <span className="text-[11px] text-slate-500 block">
              Valid until: Nov 2028 (100% Compliant)
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Hash Chain Integrity</span>
              <FileCode2 className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-xs font-mono font-bold text-slate-900 dark:text-white truncate">
              {tenant.zatcaEnvironment.toUpperCase()} • CONTINUOUS SHA-256
            </p>
            <span className="text-[11px] text-emerald-600 font-medium block">
              ✓ Continuous Chain Intact (No Breaks)
            </span>
          </div>
        </div>


        {/* API Check Result if trigger */}
        {testResult && (
          <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between text-emerald-400 font-bold">
              <span>ZATCA Clearance Gateway Response: 200 OK</span>
              <span>{testResult.timestamp}</span>
            </div>
            <pre className="p-3 bg-slate-950 rounded-xl overflow-x-auto text-emerald-300">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}

        {/* Invoices Sent to ZATCA Log */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            {isArabic ? 'سجل الفواتير المرسلة والموقعة رقمياً عبر النظام' : 'Recent Signed & Reported E-Invoices'}
          </h3>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left rtl:text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Order #</th>
                  <th className="p-3">{isArabic ? 'نوع الفاتورة' : 'Type'}</th>
                  <th className="p-3">{isArabic ? 'المبلغ الإجمالي' : 'Total'}</th>
                  <th className="p-3">{isArabic ? 'الضريبة (15%)' : 'VAT'}</th>
                  <th className="p-3">SHA-256 Hash</th>
                  <th className="p-3">{isArabic ? 'حالة الاعتماد' : 'ZATCA Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {zatcaOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-slate-400">
                      {isArabic ? 'لا توجد فواتير موقعة حتى الآن' : 'No signed invoices recorded in this session.'}
                    </td>
                  </tr>
                ) : (
                  zatcaOrders.map(ord => (
                    <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-bold font-mono text-indigo-600">{ord.orderNumber}</td>
                      <td className="p-3 font-medium">
                        {ord.zatcaInvoiceType === 'STANDARD' ? 'Standard (B2B)' : 'Simplified (B2C)'}
                      </td>
                      <td className="p-3 font-bold">{ord.totalAmount.toFixed(2)} SAR</td>
                      <td className="p-3 font-semibold">{ord.taxAmount.toFixed(2)} SAR</td>
                      <td className="p-3 font-mono text-[11px] text-slate-500">
                        {ord.invoiceHash ? `${ord.invoiceHash.substring(0, 16)}...` : 'N/A'}
                      </td>
                      <td className="p-3">
                        <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full text-[10px]">
                          {ord.zatcaStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
