import React, { useState } from 'react';
import { globalSaaSBilling } from '../../domain/saas/saasBillingEngine';
import { TenantBillingPlan } from '../../types';
import {
  CreditCard,
  Crown,
  CheckCircle2,
  Zap,
  HardDrive,
  FileCheck2,
  Building,
  Monitor,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';

interface SaaSBillingViewProps {
  isArabic: boolean;
}

export const SaaSBillingView: React.FC<SaaSBillingViewProps> = ({ isArabic }) => {
  const [billing, setBilling] = useState<TenantBillingPlan>(() => globalSaaSBilling.getBillingPlan());

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-400" />
            <h1 className="text-lg font-black tracking-tight text-white">
              {isArabic ? 'إدارة اشتراكات المنصة السحابية والفوترة (SaaS Billing)' : 'SaaS Multi-Tenant Billing & Metering'}
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
              Automated Mada & Stripe
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {isArabic
              ? 'متابعة استهلاك الفواتير الضريبية، الفروع، نقاط البيع المرخصة، ومحفظة الدفع الآلي'
              : 'Resource consumption metering, ZATCA tax invoice quotas, terminal licensing, and billing history'}
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Active Plan Overview Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-amber-400" />
              <h2 className="text-xl font-black text-white">{billing.planTier} TIER PLAN</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                {isArabic ? 'نشط ومفعّل' : 'Active Subscription'}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {isArabic
                ? 'خطة الشركات المتطورة تشمل فروع غير محدودة، فوترة زاتكا المرحلة الثانية، ودعم فني على مدار الساعة SLA 99.99%'
                : 'Includes full multi-region high availability, ZATCA Phase 2 compliance engine, and 24/7 dedicated enterprise SLA.'}
            </p>
            <p className="text-xs text-slate-400">
              {isArabic ? 'تاريخ التجديد القادم:' : 'Next Renewal Date:'} <strong className="text-white">{billing.nextRenewalDate}</strong> • {billing.paymentMethodMasked}
            </p>
          </div>

          <div className="text-right rtl:text-left bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400">{isArabic ? 'المبلغ المستحق للدورة الحالية' : 'Current Billing Due'}</span>
            <p className="text-2xl font-black text-white font-mono mt-1">
              {billing.currentInvoiceDueSar.toLocaleString()} <span className="text-xs text-indigo-400">SAR / Month</span>
            </p>
          </div>
        </div>

        {/* Usage Metering Bars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <FileCheck2 className="w-4 h-4 text-indigo-400" />
                <span>{isArabic ? 'فواتير ZATCA الشهرية' : 'ZATCA Monthly Quota'}</span>
              </div>
              <span className="font-mono text-xs text-slate-400">
                {billing.zatcaInvoicesUsedThisMonth.toLocaleString()} / {billing.zatcaInvoicesMonthlyLimit.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="bg-indigo-500 h-full rounded-full"
                style={{ width: `${(billing.zatcaInvoicesUsedThisMonth / billing.zatcaInvoicesMonthlyLimit) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400">{isArabic ? '25% تم استهلاكها' : '25% consumed this cycle'}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Monitor className="w-4 h-4 text-emerald-400" />
                <span>{isArabic ? 'أجهزة نقاط البيع النشطة' : 'Licensed POS Terminals'}</span>
              </div>
              <span className="font-mono text-xs text-slate-400">{billing.activeTerminalsCount} Terminals</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '60%' }} />
            </div>
            <p className="text-[11px] text-slate-400">{billing.activeTerminalsCount * billing.terminalPriceSar} SAR / month</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <HardDrive className="w-4 h-4 text-amber-400" />
                <span>{isArabic ? 'مساحة تخزين المستندات' : 'Cloud Storage'}</span>
              </div>
              <span className="font-mono text-xs text-slate-400">
                {(billing.storageMbUsed / 1024).toFixed(1)} GB / {(billing.storageMbLimit / 1024).toFixed(1)} GB
              </span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="bg-amber-500 h-full rounded-full"
                style={{ width: `${(billing.storageMbUsed / billing.storageMbLimit) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400">{isArabic ? '14% مستخدمة' : '14% used'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
