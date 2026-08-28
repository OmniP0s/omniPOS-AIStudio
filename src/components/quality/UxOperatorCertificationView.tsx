import React, { useState } from 'react';
import {
  MousePointer,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  Flame,
  Award,
  Sparkles,
  TrendingUp,
  Activity,
  Smile,
} from 'lucide-react';
import { UxCertificationMetrics } from '../../domain/quality/types';
import { INITIAL_UX_METRICS } from '../../domain/quality/certificationEngines';

interface Props {
  isArabic: boolean;
}

export const UxOperatorCertificationView: React.FC<Props> = ({ isArabic }) => {
  const [metrics, setMetrics] = useState<UxCertificationMetrics>(INITIAL_UX_METRICS);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                {isArabic ? 'شهادة تجربة المستخدم وكفاءة المشغلين' : 'Ergonomic UX & Operator Efficiency Certification'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-mono font-bold">
                Operator Score: {metrics.operatorEfficiencyScore}/100
              </span>
            </div>
            <h2 className="text-xl font-black text-white mt-1">
              {isArabic
                ? 'قياس عدد النقرات، زمن إنهاء الطلب، سرعة الكاشير، وسرعة المطبخ'
                : 'Click-Stream Analytics, Workflow Time, Cashier Velocity & Kitchen Speed'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isArabic
                ? 'تحليل دقيق لكفاءة نقطة البيع: معدل النقرات لكل طلب، زمن إتمام المعاملة، نسبة خطأ المشغلين، ومعدل إجهاد العين والإرهاق الذهني'
                : 'Empirical measurement of cashier keystrokes, checkout completion velocity, KDS dish preparation speed, and error deflection.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-4 py-2 rounded-xl bg-slate-950 font-mono text-xs text-emerald-400 font-bold border border-slate-800 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-400" />
              {isArabic ? 'معتمد للمطاعم السريعة' : 'QSR & Fine-Dining Certified'}
            </span>
          </div>
        </div>

        {/* 6 Key UX Metric Pillars */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 block">
              {isArabic ? 'متوسط النقرات للطلب' : 'Clicks Per Order'}
            </span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
              {metrics.averageClicksPerOrder} <span className="text-xs text-slate-500 font-normal">clicks</span>
            </div>
            <span className="text-[10px] text-emerald-400 mt-0.5">Optimal (&lt; 4.0)</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 block">
              {isArabic ? 'زمن إتمام المعاملة' : 'Workflow Duration'}
            </span>
            <div className="text-2xl font-black text-indigo-400 font-mono mt-1">
              {metrics.orderWorkflowTimeSec}s
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5">From Item to Receipt</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 block">
              {isArabic ? 'سرعة الكاشير' : 'Cashier Velocity'}
            </span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
              {metrics.cashierSpeedOrdersPerMin} <span className="text-xs text-slate-500 font-normal">ord/min</span>
            </div>
            <span className="text-[10px] text-emerald-400 mt-0.5">Peak Rush Certified</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 block">
              {isArabic ? 'زمن تحضير المطبخ' : 'Kitchen Prep Time'}
            </span>
            <div className="text-2xl font-black text-amber-400 font-mono mt-1">
              {metrics.kitchenPrepAvgMinutes} <span className="text-xs text-slate-500 font-normal">min</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5">KDS Color Tagged</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 block">
              {isArabic ? 'نسبة خطأ المشغلين' : 'Operator Error Rate'}
            </span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
              {metrics.operatorErrorRatePercent}%
            </div>
            <span className="text-[10px] text-emerald-400 mt-0.5">Near-Zero Voids</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 block">
              {isArabic ? 'مؤشر الإجهاد الذهني' : 'Cognitive Load'}
            </span>
            <div className="text-2xl font-black text-emerald-500 font-mono mt-1">
              {metrics.cognitiveLoadIndex} / 100
            </div>
            <span className="text-[10px] text-emerald-400 mt-0.5">Minimal Strain</span>
          </div>
        </div>
      </div>

      {/* Ergonomic Optimization Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Smile className="w-5 h-5 text-emerald-400" />
            {isArabic ? 'تحسينات سرعة الكاشير ومعدل الاستجابة' : 'Cashier Velocity & Rapid Action Shortcuts'}
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                {isArabic
                  ? 'لوحة أرقام ذكية بنقرة واحدة لاختيار الفئات النقدية الأكثر شيوعاً (50، 100، 500 ريال).'
                  : '1-click smart denomination tender pills for instant exact-change calculation.'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                {isArabic
                  ? 'تفعيل تلقائي لقارئ الباركود ومحطة مدى الذكية دون الحاجة للتنقل بين التبويبات.'
                  : 'Seamless background Mada NFC auto-listen without manual payment modal navigation.'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                {isArabic
                  ? 'تأكيد الحذف والإلغاء مشروط بصلاحيات المدير لحماية الإيرادات ومنع الأخطاء غير المقصودة.'
                  : 'Two-touch void protection with supervisor authorization to eliminate cashier mistakes.'}
              </span>
            </li>
          </ul>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            {isArabic ? 'كفاءة شاشة المطبخ KDS ودقة الطهي' : 'Kitchen KDS Ergonomics & Rush-Hour Routing'}
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                {isArabic
                  ? 'ترميز بصري بالألوان للطلبات: أخضر (< 5 د)، أصفر (< 10 د)، وأحمر وامض (> 15 د).'
                  : 'Dynamic color aging: Green (< 5m), Amber (< 10m), and Flashing Red (> 15m).'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                {isArabic
                  ? 'توزيع ذكي للأصناف حسب المحطة (المشواة، المقلاة، المشروبات) لمنع الاختناقات.'
                  : 'Station split routing: grill, fryer, assembly, and beverage dispenses to dedicated screens.'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                {isArabic
                  ? 'أزرار لمس ضخمة (Bump Bar) لإنهاء الأصناف بلمسة واحدة حتى أثناء ارتداء قفازات الطهي.'
                  : 'High-contrast 64px touch bump targets for instant fulfillment even with prep gloves.'}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
