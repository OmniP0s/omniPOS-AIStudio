import React, { useState } from 'react';
import {
  Activity,
  ShieldAlert,
  Flame,
  Sparkles,
  TrendingUp,
  Zap,
  Gauge,
  RotateCcw,
  AlertTriangle,
  Lock,
  Cpu,
  Layers,
} from 'lucide-react';
import { RuntimeTab } from '../../domain/runtime/types';
import { RuntimeDiagnosticsView } from './RuntimeDiagnosticsView';
import { IntelligentAutoHealingView } from './IntelligentAutoHealingView';
import { RuntimeProfilerView } from './RuntimeProfilerView';
import { RuntimeAnalyzerView } from './RuntimeAnalyzerView';
import { CapacityPlanningView } from './CapacityPlanningView';
import { PerformanceOptimizerView } from './PerformanceOptimizerView';
import { EnterpriseRuntimeDashboardView } from './EnterpriseRuntimeDashboardView';
import { RuntimeReplayView } from './RuntimeReplayView';
import { FailureSimulationView } from './FailureSimulationView';
import { RuntimeSecurityIntelligenceView } from './RuntimeSecurityIntelligenceView';

interface Props {
  isArabic: boolean;
}

export const RuntimeOpsCenter: React.FC<Props> = ({ isArabic }) => {
  const [activeTab, setActiveTab] = useState<RuntimeTab>('DIAGNOSTICS');

  const tabs: { id: RuntimeTab; labelEn: string; labelAr: string; icon: any; badge?: string }[] = [
    { id: 'DIAGNOSTICS', labelEn: '1. Diagnostics', labelAr: '1. التشخيص الحي', icon: Activity, badge: 'Live' },
    { id: 'AUTO_HEALING', labelEn: '2. Auto Healing', labelAr: '2. التعافي الذاتي', icon: ShieldAlert, badge: 'Auto' },
    { id: 'PROFILER', labelEn: '3. Profiler', labelAr: '3. البروفايلر', icon: Flame, badge: 'AST' },
    { id: 'ANALYZER', labelEn: '4. Analyzer', labelAr: '4. محلل الأداء', icon: Sparkles, badge: 'AI' },
    { id: 'CAPACITY_PLANNING', labelEn: '5. Capacity', labelAr: '5. تخطيط السعة', icon: TrendingUp, badge: '90d' },
    { id: 'PERFORMANCE_OPTIMIZER', labelEn: '6. Optimizer', labelAr: '6. التحسين الآلي', icon: Zap, badge: '1-Click' },
    { id: 'RUNTIME_DASHBOARD', labelEn: '7. Live Telemetry', labelAr: '7. لوحة القيادة', icon: Gauge, badge: 'TPS' },
    { id: 'RUNTIME_REPLAY', labelEn: '8. Flight Replay', labelAr: '8. إعادة التشغيل', icon: RotateCcw, badge: 'Saga' },
    { id: 'FAILURE_SIMULATION', labelEn: '9. Chaos Sim', labelAr: '9. محاكي الأعطال', icon: AlertTriangle, badge: 'Chaos' },
    { id: 'SECURITY_INTELLIGENCE', labelEn: '10. Security Intel', labelAr: '10. استخبارات الأمان', icon: Lock, badge: 'SOC' },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-6 space-y-6 select-none">
      {/* Top Header Module */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            <h1 className="text-2xl font-black text-white tracking-tight">
              {isArabic
                ? 'مركز ذكاء التشغيل والعمليات الذاتية (Enterprise Runtime Ops Center)'
                : 'Enterprise Runtime Intelligence & Autonomous Operations'}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isArabic
              ? 'التحكم الشامل بجميع ركائز التشغيل العشرة: التشخيص، التعافي الذاتي، البروفايلر، التنبؤ بالسعة، محاكي الأعطال، والأمان السيبراني'
              : 'Complete 10-Pillar Mission Control: Diagnostics, Auto-Healing, Profiler, Analyzer, Capacity Planning, Optimizer, Telemetry, Replay, Chaos & Security.'}
          </p>
        </div>
      </div>

      {/* 10-Tab Navigation Bar */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-thin scrollbar-thumb-slate-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800/80'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{isArabic ? tab.labelAr : tab.labelEn}</span>
              {tab.badge && (
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                    isActive ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Dynamic Tab Body */}
      <div>
        {activeTab === 'DIAGNOSTICS' && <RuntimeDiagnosticsView isArabic={isArabic} />}
        {activeTab === 'AUTO_HEALING' && <IntelligentAutoHealingView isArabic={isArabic} />}
        {activeTab === 'PROFILER' && <RuntimeProfilerView isArabic={isArabic} />}
        {activeTab === 'ANALYZER' && <RuntimeAnalyzerView isArabic={isArabic} />}
        {activeTab === 'CAPACITY_PLANNING' && <CapacityPlanningView isArabic={isArabic} />}
        {activeTab === 'PERFORMANCE_OPTIMIZER' && <PerformanceOptimizerView isArabic={isArabic} />}
        {activeTab === 'RUNTIME_DASHBOARD' && <EnterpriseRuntimeDashboardView isArabic={isArabic} />}
        {activeTab === 'RUNTIME_REPLAY' && <RuntimeReplayView isArabic={isArabic} />}
        {activeTab === 'FAILURE_SIMULATION' && <FailureSimulationView isArabic={isArabic} />}
        {activeTab === 'SECURITY_INTELLIGENCE' && <RuntimeSecurityIntelligenceView isArabic={isArabic} />}
      </div>
    </div>
  );
};
