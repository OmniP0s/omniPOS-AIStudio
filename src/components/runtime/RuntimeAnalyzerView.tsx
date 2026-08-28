import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  Database,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  FileCode,
  Network,
  PackageCheck,
  AlertTriangle,
} from 'lucide-react';
import { runtimeEngine } from '../../domain/runtime/runtimeEngine';

interface Props {
  isArabic: boolean;
}

export const RuntimeAnalyzerView: React.FC<Props> = ({ isArabic }) => {
  const [bottlenecks, setBottlenecks] = useState([...runtimeEngine.bottlenecks]);
  const [fixedItem, setFixedItem] = useState<string | null>(null);

  const applyRemediation = (component: string) => {
    setFixedItem(component);
    setTimeout(() => {
      setBottlenecks((prev) => prev.filter((b) => b.component !== component));
      setFixedItem(null);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight">
                  {isArabic ? 'محلل الأداء اللحظي الذكي (Runtime Analyzer)' : 'Autonomous Runtime Analyzer'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  AI-ASSISTED ROOT CAUSE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isArabic
                  ? 'تحليل شامل لعوامل التأخير: اختناق الـ APIs، بطء قواعد البيانات، إخفاقات الـ Cache، تأخير الطوابير، وتكلفة التسلسل (Serialization Cost)'
                  : 'Holistic bottleneck analysis across APIs, Database, Cache misses, Queue delays, Network latency, and Serialization overhead.'}
              </p>
            </div>
          </div>
        </div>

        {/* 6 Dimension Radar Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
            <div className="text-[10px] text-slate-400 font-bold uppercase">API Latency</div>
            <div className="text-lg font-black text-indigo-400 font-mono mt-1">1.4ms</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Optimal</div>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
            <div className="text-[10px] text-slate-400 font-bold uppercase">DB Wait Time</div>
            <div className="text-lg font-black text-amber-400 font-mono mt-1">1.2ms</div>
            <div className="text-[10px] text-amber-300 mt-0.5">Index Tuning Needed</div>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Cache Miss Rate</div>
            <div className="text-lg font-black text-purple-400 font-mono mt-1">3.2%</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">High Hit 96.8%</div>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Queue Delay</div>
            <div className="text-lg font-black text-blue-400 font-mono mt-1">0.4ms</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Realtime Flow</div>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Serialization</div>
            <div className="text-lg font-black text-rose-400 font-mono mt-1">0.8ms</div>
            <div className="text-[10px] text-slate-400 mt-0.5">JSON &amp; Proto</div>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Payload Size Avg</div>
            <div className="text-lg font-black text-cyan-400 font-mono mt-1">4.2 KB</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Brotli Enabled</div>
          </div>
        </div>
      </div>

      {/* Actionable Bottleneck Remediation Recommendations */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>{isArabic ? 'الاختناقات المرصودة ومقترحات التحسين الذاتية' : 'Detected Bottlenecks & Autonomous Recommendations'}</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">{bottlenecks.length} Items Identified</span>
        </div>

        {bottlenecks.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/50 rounded-xl border border-slate-800">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <div className="text-white font-bold text-sm">{isArabic ? 'النظام يعمل بأقصى كفاءة' : 'System Operating at Peak Efficiency'}</div>
            <p className="text-xs text-slate-400 mt-1">{isArabic ? 'تم تطبيق جميع التحسينات وتأكيد اختفاء عنق الزجاجة.' : 'All bottlenecks resolved.'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bottlenecks.map((item) => (
              <div key={item.component} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      {item.category}
                    </span>
                    <span className="text-white font-bold text-xs font-mono">{item.component}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Impact Score:</span>
                    <span className="text-xs font-bold text-rose-400 font-mono">{item.impactScore}/100</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-1 text-xs">
                  <div className="text-slate-400 text-[11px]">Observed Telemetry Metric:</div>
                  <div className="text-slate-200 font-mono text-[11px]">{item.metricObserved}</div>
                </div>

                <div className="p-3 bg-emerald-950/20 rounded-lg border border-emerald-500/30 space-y-1 text-xs">
                  <div className="text-emerald-400 font-bold text-[11px] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Autonomous AI Recommendation:</span>
                  </div>
                  <div className="text-emerald-200">{item.recommendedFix}</div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                  <div className="text-xs text-emerald-400 font-bold font-mono">
                    Estimated Gain: +{item.estimatedImprovementPct}% Throughput
                  </div>

                  {item.autoFixAvailable && (
                    <button
                      onClick={() => applyRemediation(item.component)}
                      disabled={fixedItem === item.component}
                      className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/30 flex items-center gap-1.5"
                    >
                      {fixedItem === item.component ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Applying...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5" />
                          <span>{isArabic ? 'تطبيق الإصلاح بضغطة زر' : 'Apply 1-Click Fix'}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
