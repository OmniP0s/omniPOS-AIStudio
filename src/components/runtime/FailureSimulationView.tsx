import React, { useState } from 'react';
import {
  AlertTriangle,
  Flame,
  CheckCircle2,
  Database,
  Layers,
  Zap,
  Globe2,
  Radio,
  RefreshCw,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { runtimeEngine } from '../../domain/runtime/runtimeEngine';

interface Props {
  isArabic: boolean;
}

export const FailureSimulationView: React.FC<Props> = ({ isArabic }) => {
  const [experiments, setExperiments] = useState([...runtimeEngine.chaosExperiments]);
  const [simulatingType, setSimulatingType] = useState<string | null>(null);

  const triggerSimulation = (type: string) => {
    setSimulatingType(type);
    runtimeEngine.triggerChaos(type);
    setExperiments([...runtimeEngine.chaosExperiments]);

    setTimeout(() => {
      setSimulatingType(null);
      setExperiments([...runtimeEngine.chaosExperiments]);
    }, 3500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight">
                  {isArabic ? 'محاكي الفشل وهندسة الفوضى المدمج (In-App Chaos Engineering)' : 'In-App Failure Simulation & Chaos Testing'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  CHAOS EXPERIMENTATION
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isArabic
                  ? 'محاكاة واقعية للأعطال من داخل النظام: سقوط قاعدة البيانات، انقطاع Redis، فقدان كافكا، تأخر مدى، تعطل الزكاة، وعزل المناطق'
                  : 'Inject live chaos: Database Crash, Redis Outage, Kafka Loss, Mada Timeout, ZATCA Delays, and Region Network Partitions.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chaos Experiments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {experiments.map((exp) => (
          <div
            key={exp.type}
            className={`bg-slate-900 border rounded-2xl p-5 shadow-lg space-y-4 transition-all ${
              simulatingType === exp.type ? 'border-amber-500 bg-amber-950/20 animate-pulse' : 'border-slate-800'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-white font-bold text-sm">{isArabic ? exp.nameAr : exp.nameEn}</h3>
                <span className="text-[11px] text-slate-400 font-mono">Intensity: {exp.intensity}</span>
              </div>
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-slate-950 text-slate-300 border border-slate-800 font-mono">
                {exp.type}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{exp.description}</p>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1.5 text-xs">
              <div className="text-slate-400 text-[11px] font-bold">Expected System Resilience:</div>
              <div className="text-slate-200">{exp.expectedBehavior}</div>
            </div>

            <div className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-500/30 space-y-1 text-xs">
              <div className="text-emerald-400 text-[11px] font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Observed Automated Recovery (SLA Met):</span>
              </div>
              <div className="text-emerald-200">{exp.actualObservedRecovery}</div>
              <div className="text-[10px] text-slate-400 font-mono mt-1">
                Recovery SLA: <strong className="text-emerald-400">{exp.recoveredInMs} ms</strong>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => triggerSimulation(exp.type)}
                disabled={simulatingType !== null}
                className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/30 flex items-center justify-center gap-2"
              >
                {simulatingType === exp.type ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{isArabic ? 'جاري حقن الفشل والتحقق من التعافي...' : 'Injecting Chaos & Testing Auto-Heal...'}</span>
                  </>
                ) : (
                  <>
                    <Flame className="w-4 h-4" />
                    <span>{isArabic ? 'بدء محاكاة العطل والتحقق' : 'Run Chaos Experiment'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
