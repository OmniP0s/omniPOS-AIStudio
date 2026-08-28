import React, { useState, useEffect } from 'react';
import {
  Users,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  Zap,
  Activity,
  Receipt,
  QrCode,
  ShieldCheck,
  Send,
  CreditCard,
  Lock,
} from 'lucide-react';
import { SyntheticWorker } from '../../domain/quality/types';
import {
  INITIAL_SYNTHETIC_WORKERS,
  SYNTHETIC_STEPS,
} from '../../domain/quality/syntheticTransactionEngine';

interface Props {
  isArabic: boolean;
}

export const SyntheticTransactionsView: React.FC<Props> = ({ isArabic }) => {
  const [workers, setWorkers] = useState<SyntheticWorker[]>(INITIAL_SYNTHETIC_WORKERS);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(INITIAL_SYNTHETIC_WORKERS[0].id);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setWorkers(prev =>
        prev.map(worker => {
          const stepSequence: SyntheticWorker['currentStep'][] = [
            'LOGIN',
            'OPEN_SHIFT',
            'CREATE_ORDER',
            'SEND_KITCHEN',
            'PAY_MADA',
            'PRINT_RECEIPT',
            'ZATCA_INVOICE',
            'CLOSE_SHIFT',
          ];

          const currentIndex = stepSequence.indexOf(worker.currentStep);
          const nextIndex = (currentIndex + 1) % stepSequence.length;
          const nextStep = stepSequence[nextIndex];
          const lat = Math.floor(Math.random() * 40) + 12;

          const newLog = {
            timestamp: new Date().toLocaleTimeString(),
            step: nextStep,
            latencyMs: lat,
            success: true,
            details: `Simulated worker ${worker.name} executed step ${nextStep} flawlessly.`,
          };

          return {
            ...worker,
            currentStep: nextStep,
            completedCycles: nextIndex === 0 ? worker.completedCycles + 1 : worker.completedCycles,
            lastCycleLatencyMs: lat,
            logs: [newLog, ...worker.logs.slice(0, 15)],
          };
        })
      );

      setActiveStepIndex(prev => (prev + 1) % SYNTHETIC_STEPS.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [isRunning]);

  const selectedWorker = workers.find(w => w.id === selectedWorkerId) || workers[0];
  const totalCompletedCycles = workers.reduce((acc, w) => acc + w.completedCycles, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-mono font-bold">
                24/7 Autonomous Synthetic Traffic
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                SLA 99.98%
              </span>
            </div>
            <h2 className="text-xl font-black text-white mt-1">
              {isArabic
                ? 'المستخدمون الافتراضيون للعمليات المتواصلة (24/7 Synthetic Workers)'
                : 'Autonomous 24/7 Synthetic User Transaction Engine'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isArabic
                ? 'محاكاة كاملة لدورة حياة المطعم المستمرة: تسجيل الدخول > فتح الوردية > إنشاء الطلب > إرسال للمطبخ > الدفع عبر مدى > طباعة الإيصال > فاتورة زاتكا > إغلاق الوردية'
                : 'End-to-end continuous business lifecycle simulation: Login -> Open Shift -> Create Order -> Send Kitchen -> Pay -> Print Receipt -> ZATCA Invoice -> Close Shift.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isRunning
                ? isArabic
                  ? 'إيقاف المحاكاة مؤقتاً'
                  : 'Pause Synthetic Traffic'
                : isArabic
                ? 'استئناف المحاكاة الحية'
                : 'Resume Live Synthetic Bots'}
            </button>
          </div>
        </div>

        {/* Global Synthetic Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 block">
              {isArabic ? 'الروبوتات الافتراضية النشطة' : 'Active Virtual Workers'}
            </span>
            <div className="text-2xl font-black text-white font-mono mt-1">{workers.length} Bots</div>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
              <Users className="w-3 h-3" /> Multi-Branch Emulation
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 block">
              {isArabic ? 'الدورات المكتملة الإجمالية' : 'Total Completed Cycles'}
            </span>
            <div className="text-2xl font-black text-indigo-400 font-mono mt-1">
              {totalCompletedCycles.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5">Zero Lost Invoices</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 block">
              {isArabic ? 'متوسط زمن الدورة الكاملة' : 'Avg Lifecycle Duration'}
            </span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">13.5s</div>
            <span className="text-[10px] text-emerald-400 mt-0.5">Under 15s Target SLA</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 block">
              {isArabic ? 'مطابقة الامتثال والموثوقية' : 'SLA Pass Rate'}
            </span>
            <div className="text-2xl font-black text-emerald-500 font-mono mt-1">99.98%</div>
            <span className="text-[10px] text-emerald-400 mt-0.5">Continuous ZATCA P2 Pass</span>
          </div>
        </div>
      </div>

      {/* 8-Step Lifecycle Progression Flow */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" />
          {isArabic ? 'المسار الإجرائي الحي لدورة المعاملات (8-Step Full Lifecycle)' : '8-Step End-to-End Synthetic Transaction Lifecycle'}
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {SYNTHETIC_STEPS.map((step, idx) => {
            const isStepActive = selectedWorker.currentStep === step.step;
            return (
              <div
                key={step.step}
                className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                  isStepActive
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-indigo-400">Step {idx + 1}</span>
                    {isStepActive && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
                  </div>
                  <div className="text-xs font-bold mt-1 text-white leading-tight">
                    {isArabic ? step.nameAr : step.nameEn}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] flex items-center justify-between">
                  <span className="text-slate-500">SLA</span>
                  <span className="font-mono text-emerald-400 font-bold">&lt;{step.targetLatencyMs}ms</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Virtual Workers Selection & Detailed Bot Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Workers List */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            {isArabic ? 'المستخدمون الافتراضيون النشطون' : 'Active Virtual Cashiers'}
          </h3>

          <div className="space-y-2">
            {workers.map(worker => {
              const isSelected = worker.id === selectedWorkerId;
              return (
                <button
                  key={worker.id}
                  onClick={() => setSelectedWorkerId(worker.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-mono">{worker.id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {worker.status}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white">{worker.name}</div>
                  <div className="text-xs text-slate-400">{worker.branchName} • {worker.terminalId}</div>

                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/80 mt-1 font-mono">
                    <span className="text-indigo-400">Step: {worker.currentStep}</span>
                    <span className="text-emerald-400">{worker.completedCycles} cycles</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Bot Live Telemetry & Real-Time Audit Trace */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                {selectedWorker.name}
              </h3>
              <p className="text-xs text-slate-400">
                {selectedWorker.branchName} | Terminal: {selectedWorker.terminalId} | SLA: {selectedWorker.slaPassRate}%
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-slate-950 font-mono text-xs text-emerald-400 font-bold border border-slate-800">
              Latency: {selectedWorker.lastCycleLatencyMs} ms
            </span>
          </div>

          {/* Live Step Logs Waterfall */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              {isArabic ? 'سجل العمليات اللحظية للشفرة التشفيرية والتزامن' : 'Live Transaction Trace & Cryptographic Waterfall'}
            </span>

            <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
              {selectedWorker.logs.map((log, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800/80 flex items-center justify-between text-xs hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-500 text-[11px]">{log.timestamp}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300">
                      {log.step}
                    </span>
                    <span className="text-slate-300 font-medium">{log.details}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 font-mono">
                    <span className="text-emerald-400 font-bold">{log.latencyMs} ms</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
