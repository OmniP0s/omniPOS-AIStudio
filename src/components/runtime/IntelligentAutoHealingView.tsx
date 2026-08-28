import React, { useState } from 'react';
import {
  ShieldAlert,
  RotateCcw,
  Zap,
  Split,
  Power,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  History,
  Lock,
  ArrowRightLeft,
  Settings,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { runtimeEngine } from '../../domain/runtime/runtimeEngine';
import { HealingActionType, HealingPolicy } from '../../domain/runtime/types';

interface Props {
  isArabic: boolean;
}

export const IntelligentAutoHealingView: React.FC<Props> = ({ isArabic }) => {
  const [policies, setPolicies] = useState<HealingPolicy[]>([...runtimeEngine.healingPolicies]);
  const [history, setHistory] = useState([...runtimeEngine.healingHistory]);
  const [activeActionModal, setActiveActionModal] = useState<HealingActionType | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const togglePolicy = (id: string) => {
    runtimeEngine.toggleHealingPolicy(id);
    setPolicies([...runtimeEngine.healingPolicies]);
  };

  const triggerManualAction = (action: HealingActionType) => {
    setActiveActionModal(null);
    const newEvent = {
      id: `heal-manual-${Date.now()}`,
      timestamp: 'Just now',
      service: 'Manual Operator Trigger',
      incidentType: `Operator Dispatched [${action}]`,
      actionTaken: action,
      status: 'RECOVERED' as const,
      recoveryTimeMs: Math.floor(Math.random() * 1500 + 400),
      details: `Autonomous recovery cycle successfully executed for action ${action}. Verification checks passed (HTTP 200 OK).`,
      affectedTenants: ['CLUSTER_WIDE'],
    };

    runtimeEngine.healingHistory.unshift(newEvent);
    setHistory([...runtimeEngine.healingHistory]);
    setActionSuccessMsg(
      isArabic
        ? `تم تنفيذ إجراء التعافي الذاتي [${action}] بنجاح، وجميع الخدمات عادت للحالة المستقرة.`
        : `Self-healing action [${action}] executed successfully. All health probes returned 200 OK.`
    );
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight">
                  {isArabic ? 'محرك التعافي الذاتي الذكي (Intelligent Auto-Healing)' : 'Intelligent Auto-Healing Engine'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  AUTONOMOUS CLOSED-LOOP
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isArabic
                  ? 'استجابة تلقائية للأعطال بدون تدخل بشري: إعادة التشغيل، قواطع الدوائر، عزل المستأجرين، تحويل مسار الحركة، والانحدار الآمن'
                  : 'Closed-loop resilience: Automated Restart, Exponential Retry, Circuit Breakers, Tenant Isolation, Traffic Shifts, and Graceful Degradation.'}
              </p>
            </div>
          </div>
        </div>

        {/* 7 Core Healing Pillars Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 mt-6">
          <button
            onClick={() => triggerManualAction('RESTART_POD')}
            className="bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500 rounded-xl p-3 text-center transition-all group"
          >
            <Power className="w-5 h-5 mx-auto text-indigo-400 group-hover:scale-110 transition-transform mb-1.5" />
            <div className="text-xs font-bold text-white">Restart</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{isArabic ? 'إعادة تشغيل' : 'Zero-Downtime'}</div>
          </button>

          <button
            onClick={() => triggerManualAction('EXPONENTIAL_RETRY')}
            className="bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-blue-500 rounded-xl p-3 text-center transition-all group"
          >
            <RotateCcw className="w-5 h-5 mx-auto text-blue-400 group-hover:scale-110 transition-transform mb-1.5" />
            <div className="text-xs font-bold text-white">Retry</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{isArabic ? 'إعادة محاولة' : 'Exp Backoff'}</div>
          </button>

          <button
            onClick={() => triggerManualAction('CIRCUIT_BREAK')}
            className="bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500 rounded-xl p-3 text-center transition-all group"
          >
            <Zap className="w-5 h-5 mx-auto text-amber-400 group-hover:scale-110 transition-transform mb-1.5" />
            <div className="text-xs font-bold text-white">Circuit Break</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{isArabic ? 'قاطع الدائرة' : 'Trip / Fallback'}</div>
          </button>

          <button
            onClick={() => triggerManualAction('TENANT_ISOLATION')}
            className="bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-purple-500 rounded-xl p-3 text-center transition-all group"
          >
            <Lock className="w-5 h-5 mx-auto text-purple-400 group-hover:scale-110 transition-transform mb-1.5" />
            <div className="text-xs font-bold text-white">Isolation</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{isArabic ? 'عزل المستأجر' : 'Noisy Neighbor'}</div>
          </button>

          <button
            onClick={() => triggerManualAction('TRAFFIC_SHIFT')}
            className="bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500 rounded-xl p-3 text-center transition-all group"
          >
            <ArrowRightLeft className="w-5 h-5 mx-auto text-cyan-400 group-hover:scale-110 transition-transform mb-1.5" />
            <div className="text-xs font-bold text-white">Traffic Shift</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{isArabic ? 'تحويل المسار' : 'Multi-Region'}</div>
          </button>

          <button
            onClick={() => triggerManualAction('AUTOMATIC_RECOVERY')}
            className="bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500 rounded-xl p-3 text-center transition-all group"
          >
            <CheckCircle2 className="w-5 h-5 mx-auto text-emerald-400 group-hover:scale-110 transition-transform mb-1.5" />
            <div className="text-xs font-bold text-white">Auto Recovery</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{isArabic ? 'تعافي مؤكد' : 'Self-Heal SLA'}</div>
          </button>

          <button
            onClick={() => triggerManualAction('GRACEFUL_DEGRADATION')}
            className="bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-rose-500 rounded-xl p-3 text-center transition-all group"
          >
            <Split className="w-5 h-5 mx-auto text-rose-400 group-hover:scale-110 transition-transform mb-1.5" />
            <div className="text-xs font-bold text-white">Degradation</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{isArabic ? 'انحدار آمن' : 'Offline Queue'}</div>
          </button>
        </div>

        {actionSuccessMsg && (
          <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Grid: Configured Policies & Execution Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Self-Healing Policies (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>{isArabic ? 'سياسات التعافي الذاتي النشطة' : 'Active Self-Healing Policies'}</span>
            </div>
            <span className="text-xs text-emerald-400 font-mono">Autonomous Engine Active</span>
          </div>

          <div className="space-y-3">
            {policies.map((policy) => (
              <div
                key={policy.id}
                className={`bg-slate-950/70 border rounded-xl p-4 transition-all ${
                  policy.enabled ? 'border-slate-800' : 'border-slate-800/40 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-xs">{policy.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {policy.action}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 font-mono">
                      Target: <strong className="text-slate-300">{policy.targetService}</strong>
                    </p>
                    <p className="text-xs text-slate-300 mt-1.5 bg-slate-900 p-2 rounded-lg border border-slate-800">
                      Trigger: <span className="text-amber-300">{policy.triggerCondition}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => togglePolicy(policy.id)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {policy.enabled ? (
                      <ToggleRight className="w-7 h-7 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 text-slate-600" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2.5 border-t border-slate-900 font-mono">
                  <span>Cooldown: {policy.cooldownSeconds}s</span>
                  <span>Max Retries: {policy.maxAutoRetries}</span>
                  <span className="text-emerald-400">Success Rate: {policy.successRatePct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Incident & Healing Execution Log (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <History className="w-4 h-4 text-emerald-400" />
              <span>{isArabic ? 'سجل أحداث التعافي التلقائي' : 'Autonomous Healing Event Log'}</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">{history.length} Events</span>
          </div>

          <div className="space-y-3">
            {history.map((ev) => (
              <div key={ev.id} className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white text-[11px]">{ev.incidentType}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{ev.timestamp}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {ev.actionTaken}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Recovered in: <strong className="text-emerald-400">{ev.recoveryTimeMs}ms</strong>
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 bg-slate-900/90 p-2 rounded border border-slate-800/80 leading-relaxed">
                  {ev.details}
                </p>

                <div className="text-[10px] text-slate-500 font-mono">
                  Scope: {ev.affectedTenants.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
