import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Layers,
  ShieldCheck,
  Zap,
  TrendingUp,
  Cpu,
  Download,
  Printer,
  Sparkles,
} from 'lucide-react';
import { ProductionReadinessReport } from '../../domain/quality/types';
import { INITIAL_READINESS_REPORT } from '../../domain/quality/certificationEngines';

interface Props {
  isArabic: boolean;
}

export const ProductionReadinessScoreView: React.FC<Props> = ({ isArabic }) => {
  const [report] = useState<ProductionReadinessReport>(INITIAL_READINESS_REPORT);

  return (
    <div className="space-y-6">
      {/* Executive Hero Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                {isArabic ? 'التقييم المؤسسي النهائي للجاهزية' : 'Enterprise Production Readiness Scorecard'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-mono font-bold">
                10-Pillar Weighted Model
              </span>
            </div>
            <h1 className="text-2xl font-black text-white">
              {isArabic ? 'تقرير الجاهزية للإنتاج (Production Readiness Score: 99.4/100)' : 'Production Readiness Scorecard & Audit Report'}
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              {isArabic ? report.executiveSummaryAr : report.executiveSummaryEn}
            </p>
          </div>

          {/* Big Score Gauge Badge */}
          <div className="flex items-center gap-4 bg-slate-950/80 p-5 rounded-2xl border border-slate-800 shadow-2xl shrink-0">
            <div className="text-center">
              <span className="text-[10px] font-mono uppercase text-slate-500 block font-bold">Overall Score</span>
              <div className="text-5xl font-black text-emerald-400 font-mono tracking-tight">
                {report.overallScore}
                <span className="text-lg text-slate-500 font-normal">/100</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 inline-block mt-1">
                {report.verdict}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 10-Dimension Score Breakdown Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            {isArabic ? 'تفاصيل التقييم عبر الأبعاد العشرة' : '10-Pillar Evaluation Matrix & Breakdown'}
          </h3>
          <span className="text-xs text-slate-400 font-mono">10% Weight Per Pillar</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.categories.map(cat => (
            <div
              key={cat.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3 flex flex-col justify-between hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">
                    {isArabic ? cat.nameAr : cat.nameEn}
                  </h4>
                  <span className="text-sm font-black font-mono text-emerald-400">
                    {cat.score} <span className="text-xs text-slate-500">/ 100</span>
                  </span>
                </div>

                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800 mt-2">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${cat.score}%` }}
                  />
                </div>

                {/* Strengths */}
                <div className="mt-3 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    {isArabic ? 'نقاط القوة المحققة:' : 'Certified Strengths:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(isArabic ? cat.strengthsAr : cat.strengthsEn).map((str, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1 font-medium"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {str}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Deficiencies (if any) */}
                {(isArabic ? cat.deficienciesAr : cat.deficienciesEn).length > 0 && (
                  <div className="mt-2 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      {isArabic ? 'الملاحظات والتوصيات المستقبلية:' : 'Minor Observations / Future Roadmap:'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(isArabic ? cat.deficienciesAr : cat.deficienciesEn).map((def, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[11px] bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1 font-medium"
                        >
                          <AlertTriangle className="w-3 h-3 text-amber-400" /> {def}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>Weight: {cat.weight}%</span>
                <span className="font-mono text-emerald-400 font-bold">{cat.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
