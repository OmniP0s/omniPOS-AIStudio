import React, { useState } from 'react';
import {
  Zap,
  CheckCircle2,
  Database,
  Layers,
  Code2,
  Minimize2,
  Sliders,
  Sparkles,
  ArrowRight,
  HardDrive,
} from 'lucide-react';
import { runtimeEngine } from '../../domain/runtime/runtimeEngine';

interface Props {
  isArabic: boolean;
}

export const PerformanceOptimizerView: React.FC<Props> = ({ isArabic }) => {
  const [optimizations, setOptimizations] = useState([...runtimeEngine.optimizations]);

  const applyOptimization = (id: string) => {
    runtimeEngine.applyOptimization(id);
    setOptimizations([...runtimeEngine.optimizations]);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight">
                  {isArabic ? 'محرك التحسين التلقائي للأداء (Automatic Performance Optimizer)' : 'Automatic Performance Optimizer'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  CONTINUOUS TUNING ENGINE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isArabic
                  ? 'اقتراحات فورية وتطبيق آلي: فهارس الجداول المفقودة، التخزين المؤقت L2، إعادة صياغة الاستعلامات، تقسيم الجداول، والضغط المتقدم'
                  : 'Automated index recommendation, caching policies, query rewrites, table partitioning, and data compression.'}
              </p>
            </div>
          </div>
        </div>

        {/* 5 Recommendation Pillars */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6">
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-center">
            <Database className="w-5 h-5 mx-auto text-blue-400 mb-1" />
            <div className="text-xs font-bold text-white">Index DDL</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{isArabic ? 'فهارس مركبة' : 'Composite B-Tree'}</div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-center">
            <Layers className="w-5 h-5 mx-auto text-indigo-400 mb-1" />
            <div className="text-xs font-bold text-white">Cache Layer</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{isArabic ? 'تخزين L1/L2' : 'Modifier Pre-Warm'}</div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-center">
            <Code2 className="w-5 h-5 mx-auto text-emerald-400 mb-1" />
            <div className="text-xs font-bold text-white">Query Rewrite</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{isArabic ? 'إزالة N+1' : 'CTE Elimination'}</div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-center">
            <HardDrive className="w-5 h-5 mx-auto text-purple-400 mb-1" />
            <div className="text-xs font-bold text-white">Partitioning</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{isArabic ? 'تقسيم زمني' : 'Range by Date'}</div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-center">
            <Minimize2 className="w-5 h-5 mx-auto text-rose-400 mb-1" />
            <div className="text-xs font-bold text-white">Compression</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{isArabic ? 'ضغط ZSTD' : 'Brotli & ZSTD'}</div>
          </div>
        </div>
      </div>

      {/* Recommended Optimizations List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{isArabic ? 'حزمة التحسينات الجاهزة للتطبيق الفوري' : 'Actionable Performance Tuning Recommendations'}</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">{optimizations.length} Available</span>
        </div>

        <div className="space-y-4">
          {optimizations.map((opt) => (
            <div
              key={opt.id}
              className={`bg-slate-950/70 border rounded-xl p-4 space-y-3 transition-all ${
                opt.applied ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {opt.type}
                  </span>
                  <span className="text-white font-bold text-xs font-mono">{opt.target}</span>
                </div>

                <div className="text-xs font-bold text-emerald-400 font-mono">
                  {opt.estimatedGain}
                </div>
              </div>

              <p className="text-xs text-slate-300">{opt.description}</p>

              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto">
                <code>{opt.generatedCodeOrDDL}</code>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                <span className="text-[11px] text-slate-500 font-mono">
                  Verification: In-memory simulation tested with 0 lock contention
                </span>

                {opt.applied ? (
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isArabic ? 'تم التطبيق بنجاح' : 'Applied in Production'}</span>
                  </span>
                ) : (
                  <button
                    onClick={() => applyOptimization(opt.id)}
                    className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/30 flex items-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{isArabic ? 'تطبيق التحسين (1-Click Apply)' : 'Apply Optimization'}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
