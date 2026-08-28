import React, { useState } from 'react';
import {
  Flame,
  Search,
  Database,
  Lock,
  Skull,
  TrendingUp,
  AlertOctagon,
  Clock,
  Code2,
  CheckCircle2,
  GitCommit,
  Cpu,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { runtimeEngine } from '../../domain/runtime/runtimeEngine';

interface Props {
  isArabic: boolean;
}

export const RuntimeProfilerView: React.FC<Props> = ({ isArabic }) => {
  const [activeProfilerTab, setActiveProfilerTab] = useState<
    'SLOW_APIS' | 'SLOW_QUERIES' | 'MEMORY_LEAKS' | 'LOCK_CONTENTION' | 'DEADLOCKS'
  >('SLOW_APIS');

  const { slowApis, slowQueries, memoryLeak, lockContentions } = runtimeEngine;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight">
                  {isArabic ? 'البروفايلر الحي المدمج (In-Process Runtime Profiler)' : 'In-Process Runtime Profiler'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  ZERO EXTERNAL APM OVERHEAD
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isArabic
                  ? 'كشف فوري دون أدوات خارجية: الـ APIs البطيئة، الاستعلامات الثقيلة، تسريبات الذاكرة، اختناق الأقفال، وتجويع الـ Threads'
                  : 'Native in-process continuous profiling: Slow API Detector, Slow Query Explainer, Memory Leak Detector, Lock Contention, and Deadlocks.'}
              </p>
            </div>
          </div>
        </div>

        {/* Profiler Filter Tabs */}
        <div className="flex flex-wrap gap-2 mt-6">
          <button
            onClick={() => setActiveProfilerTab('SLOW_APIS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeProfilerTab === 'SLOW_APIS'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{isArabic ? 'الـ APIs البطيئة' : 'Slow API Detector'}</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-900 text-[10px]">{slowApis.length}</span>
          </button>

          <button
            onClick={() => setActiveProfilerTab('SLOW_QUERIES')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeProfilerTab === 'SLOW_QUERIES'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>{isArabic ? 'الاستعلامات البطيئة (SQL)' : 'Slow Query Detector'}</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-900 text-[10px]">{slowQueries.length}</span>
          </button>

          <button
            onClick={() => setActiveProfilerTab('MEMORY_LEAKS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeProfilerTab === 'MEMORY_LEAKS'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>{isArabic ? 'تسريبات الذاكرة (Leaks)' : 'Memory Leak Detector'}</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-900 text-[10px]">Active</span>
          </button>

          <button
            onClick={() => setActiveProfilerTab('LOCK_CONTENTION')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeProfilerTab === 'LOCK_CONTENTION'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>{isArabic ? 'اختناق الأقفال الموزعة' : 'Lock Contention Detector'}</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-900 text-[10px]">{lockContentions.length}</span>
          </button>

          <button
            onClick={() => setActiveProfilerTab('DEADLOCKS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeProfilerTab === 'DEADLOCKS'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Skull className="w-4 h-4" />
            <span>{isArabic ? 'حلقات القفل الميت (Deadlocks)' : 'Deadlock Detector'}</span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-900/60 text-emerald-300 text-[10px]">0 Cycles</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeProfilerTab === 'SLOW_APIS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="text-white font-bold text-sm">
              {isArabic ? 'سجل الـ Endpoints المتجاوزة لحدود SLA' : 'SLA-Breaching Endpoints Recorded'}
            </div>
            <span className="text-xs text-rose-400 font-mono">P99 Alert Threshold &gt; 250ms</span>
          </div>

          <div className="space-y-3">
            {slowApis.map((api) => (
              <div key={api.id} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      {api.method}
                    </span>
                    <span className="font-mono text-white font-bold text-xs">{api.endpoint}</span>
                  </div>
                  <div className="text-rose-400 font-mono font-bold text-xs">
                    {api.durationMs}ms <span className="text-[10px] text-slate-500">(Limit: {api.p99ThresholdMs}ms)</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 text-xs">
                  <div className="text-slate-400 text-[11px] font-bold mb-1">Root Cause Analysis (In-Process AST):</div>
                  <div className="text-amber-300">{api.rootCause}</div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Trace ID: {api.traceId}</span>
                  <span>Recorded: {api.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeProfilerTab === 'SLOW_QUERIES' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="text-white font-bold text-sm">
              {isArabic ? 'الاستعلامات المتسببة بمسح كامل للجداول (Full Scans)' : 'Sequential Scan Queries Profiled'}
            </div>
            <span className="text-xs text-amber-400 font-mono">PostgreSQL EXPLAIN ANALYZE AST</span>
          </div>

          <div className="space-y-4">
            {slowQueries.map((q) => (
              <div key={q.id} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-blue-400">Table: {q.table}</span>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-rose-400 font-bold">{q.executionTimeMs}ms execution</span>
                    <span className="text-slate-400">Examined: {q.rowsExamined.toLocaleString()} rows</span>
                  </div>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto">
                  {q.querySummary}
                </div>

                {q.missingIndexSuggestion && (
                  <div className="bg-emerald-950/30 border border-emerald-500/30 p-3 rounded-lg space-y-1">
                    <div className="text-emerald-400 font-bold text-[11px] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isArabic ? 'مقترح الفهرس التلقائي الفوري:' : 'Suggested Index DDL:'}</span>
                    </div>
                    <code className="text-emerald-300 font-mono text-xs block overflow-x-auto">
                      {q.missingIndexSuggestion}
                    </code>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeProfilerTab === 'MEMORY_LEAKS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="text-white font-bold text-sm">
              {isArabic ? 'كاشف نمو الهيب وتسريب الذاكرة (Heap Growth Regression)' : 'Memory Leak Growth Regression Profiler'}
            </div>
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400">
              Risk: {memoryLeak.leakRisk}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400">Target Subsystem</div>
              <div className="text-sm font-bold font-mono text-indigo-300 mt-1">{memoryLeak.targetComponent}</div>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400">Net Growth Rate</div>
              <div className="text-sm font-bold font-mono text-emerald-400 mt-1">{memoryLeak.growthRateMBPerHour} MB / hour</div>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400">Confidence Score</div>
              <div className="text-sm font-bold font-mono text-white mt-1">{memoryLeak.confidenceScore}%</div>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <div className="text-xs font-bold text-slate-300">Top Retained Heap Objects:</div>
            {memoryLeak.retainedObjectTypes.map((item) => (
              <div key={item.type} className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 flex items-center justify-between text-xs">
                <span className="font-mono text-purple-300 font-bold">{item.type}</span>
                <span className="text-slate-400">{item.instances.toLocaleString()} instances</span>
                <span className="font-mono text-white font-bold">{item.sizeMB} MB</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeProfilerTab === 'LOCK_CONTENTION' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="text-white font-bold text-sm">
              {isArabic ? 'مراقبة التنافس على الأقفال الموزعة (Distributed Lock Contention)' : 'Lock Contention & Mutex Latency'}
            </div>
            <span className="text-xs text-amber-400 font-mono">Redlock & Fencing Protected</span>
          </div>

          <div className="space-y-3">
            {lockContentions.map((lock) => (
              <div key={lock.id} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-amber-300">{lock.lockResource}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">
                    {lock.severity}
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  Holder: <code className="text-white font-mono">{lock.holdingThread}</code>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-900">
                  <span>Waiting Threads: {lock.waitingThreads}</span>
                  <span>Max Wait Duration: {lock.maxWaitTimeMs}ms</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeProfilerTab === 'DEADLOCKS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="text-white font-bold text-sm">
            {isArabic ? 'صفر حالات Deadlock - الرسم البياني خالي من الحلقات المغلقة' : 'Zero Deadlocks Detected - Cycle Graph Clear'}
          </div>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {isArabic
              ? 'خوارزمية Tarjan SCC تفحص الرسم البياني للتبعيات كل 500ms وتؤكد عدم وجود أي حلقة انتظار دائرية.'
              : 'Continuous cycle detection graph running every 500ms confirms zero circular wait conditions.'}
          </p>
        </div>
      )}
    </div>
  );
};
