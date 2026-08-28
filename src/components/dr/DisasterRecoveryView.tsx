import React, { useState } from 'react';
import { globalDisasterRecovery } from '../../domain/dr/disasterRecoveryEngine';
import { ClusterRegionStatus } from '../../types';
import {
  ShieldAlert,
  Server,
  Activity,
  Zap,
  CheckCircle2,
  RefreshCw,
  Clock,
  Database,
  Globe2,
} from 'lucide-react';

interface DisasterRecoveryViewProps {
  isArabic: boolean;
}

export const DisasterRecoveryView: React.FC<DisasterRecoveryViewProps> = ({ isArabic }) => {
  const [regions, setRegions] = useState<ClusterRegionStatus[]>(() => globalDisasterRecovery.getRegions());
  const [drillResult, setDrillResult] = useState<{ success: boolean; failoverDurationSec: number; rpoAchievedSec: number } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulateFailover = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const res = globalDisasterRecovery.simulateFailoverDrill();
      setDrillResult(res);
      setRegions([...globalDisasterRecovery.getRegions()]);
      setIsSimulating(false);
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-400" />
            <h1 className="text-lg font-black tracking-tight text-white">
              {isArabic ? 'التعافي من الكوارث والجاهزية العالية متعددة المناطق (DR & HA)' : 'Disaster Recovery & Multi-Region Resilience'}
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
              Active-Active Hot Standby
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {isArabic
              ? 'مزامنة قواعد البيانات الحية عبر مناطق الرياض وجدة والبحرين، تحويل آلي لحركة المرور (Failover) في أقل من ثانيتين'
              : 'Sub-second RPO/RTO replication across KSA cloud regions, automated DNS health checks and zero data loss failover'}
          </p>
        </div>

        <button
          onClick={handleSimulateFailover}
          disabled={isSimulating}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-50"
        >
          <Zap className="w-4 h-4" />
          <span>{isSimulating ? (isArabic ? 'جاري محاكاة التحويل...' : 'Executing Drill...') : (isArabic ? 'إجراء مناورة تحويل الطوارئ' : 'Execute Failover Drill')}</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {drillResult && (
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/80 flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-white">
                  {isArabic ? 'نجاح مناورة التحويل السحابي الطارئ (Drill Passed):' : 'Automated Failover Drill Successfully Completed!'}
                </p>
                <p className="text-emerald-300 mt-0.5 font-mono">
                  Switchover Time (RTO): <strong>{drillResult.failoverDurationSec}s</strong> | Zero Data Loss (RPO): <strong>{drillResult.rpoAchievedSec}s</strong>
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
              PASSED 100%
            </span>
          </div>
        )}

        {/* Region Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {regions.map(r => (
            <div
              key={r.regionId}
              className={`p-4 rounded-xl border space-y-3 ${
                r.role === 'PRIMARY_ACTIVE'
                  ? 'bg-slate-900 border-indigo-500 shadow-xl shadow-indigo-500/10'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] text-indigo-400 font-bold">{r.regionId}</span>
                  <h3 className="font-bold text-white text-sm mt-0.5">{r.regionName}</h3>
                  <p className="text-xs text-slate-400">{r.location}</p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    r.role === 'PRIMARY_ACTIVE'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {r.role}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60 font-mono">
                <div>
                  <span className="text-slate-500 text-[10px]">Replication Lag</span>
                  <p className="font-bold text-emerald-400">{r.replicationLagMs} ms</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">Throughput (QPS)</span>
                  <p className="font-bold text-white">{r.qps} req/s</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">RPO Objective</span>
                  <p className="font-bold text-slate-200">{r.rpoSeconds}s</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">RTO Recovery</span>
                  <p className="font-bold text-slate-200">{r.rtoSeconds}s</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                <span>Snapshot Verified: <strong className="text-white">{r.lastSnapshotVerified}</strong></span>
                <span className="text-emerald-400 font-bold">Uptime {r.healthScorePercent}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
