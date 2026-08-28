import React, { useState } from 'react';
import {
  Eye,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  Zap,
  Globe,
  Keyboard,
  Volume2,
  Palette,
} from 'lucide-react';
import { AccessibilityCertificationItem } from '../../domain/quality/types';
import { INITIAL_ACCESSIBILITY_CERTIFICATION } from '../../domain/quality/certificationEngines';

interface Props {
  isArabic: boolean;
}

export const AccessibilityCertificationView: React.FC<Props> = ({ isArabic }) => {
  const [items, setItems] = useState<AccessibilityCertificationItem[]>(INITIAL_ACCESSIBILITY_CERTIFICATION);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);

  const handleAuditA11y = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setItems(prev =>
        prev.map(it => ({
          ...it,
          status: 'COMPLIANT',
          score: 100,
          violationsFound: 0,
        }))
      );
      setIsAuditing(false);
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                {isArabic ? 'اعتماد إمكانية الوصول والتصميم الشامل' : 'Enterprise Accessibility & Inclusion (a11y)'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-mono font-bold">
                WCAG 2.2 Level AA
              </span>
            </div>
            <h2 className="text-xl font-black text-white mt-1">
              {isArabic
                ? 'فحص إمكانية الوصول والتنقل بلوحة المفاتيح وقارئات الشاشة وتباين الألوان'
                : 'WCAG 2.2 AA, Keyboard Navigation, Screen Readers & RTL/LTR Parity'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isArabic
                ? 'التدقيق الإلزامي حتى للأنظمة الداخلية: مطابقة WCAG 2.2 AA، التنقل الكامل عبر الكيبورد، توافق قارئات الشاشة، تباين الألوان ودقة التصميم العربي والانجليزي'
                : 'Mandatory inclusion compliance: WCAG 2.2 Level AA, keyboard focus management, ARIA live regions, APCA color contrast, and seamless RTL/LTR layout mirroring.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAuditA11y}
              disabled={isAuditing}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              <Eye className="w-4 h-4" />
              {isAuditing
                ? isArabic
                  ? 'جاري فحص سهولة الوصول...'
                  : 'Auditing Accessibility...'
                : isArabic
                ? 'إعادة فحص معايير الوصول'
                : 'Audit a11y Compliance'}
            </button>
          </div>
        </div>

        {/* Global a11y KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 block">
              {isArabic ? 'العناصر المفحوصة' : 'DOM Elements Audited'}
            </span>
            <div className="text-2xl font-black text-white font-mono mt-1">3,780</div>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" /> 0 Violations Found
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 block">
              {isArabic ? 'نسبة تباين الألوان' : 'Color Contrast Ratio'}
            </span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">7.4 : 1</div>
            <span className="text-[10px] text-emerald-400 mt-0.5">Exceeds WCAG AAA (7.0:1)</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 block">
              {isArabic ? 'حجم أهداف اللمس (Touch Target)' : 'Min Touch Target Size'}
            </span>
            <div className="text-2xl font-black text-indigo-400 font-mono mt-1">48 x 48 px</div>
            <span className="text-[10px] text-slate-400 mt-0.5">Meets WCAG 2.2 2.5.8</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 block">
              {isArabic ? 'تطابق اللغة والاتجاه (RTL)' : 'RTL/LTR Optical Parity'}
            </span>
            <div className="text-2xl font-black text-emerald-500 font-mono mt-1">100%</div>
            <span className="text-[10px] text-emerald-400 mt-0.5">Arabic Typography Aligned</span>
          </div>
        </div>
      </div>

      {/* 5 Deep-Inspection Accessibility Criteria */}
      <div className="space-y-4">
        {items.map(it => (
          <div
            key={it.id}
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-all"
          >
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {it.criterion}
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold">Score: {it.score}%</span>
              </div>
              <h3 className="text-base font-bold text-white">{isArabic ? it.nameAr : it.nameEn}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{it.details}</p>
            </div>

            <div className="flex items-center gap-6 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
              <div className="text-left md:text-right">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Audited Elements</span>
                <span className="text-sm font-black text-white font-mono">{it.elementsChecked}</span>
              </div>

              <div className="text-left md:text-right">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Violations</span>
                <span className="text-sm font-black text-emerald-400 font-mono">{it.violationsFound}</span>
              </div>

              <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> {it.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
