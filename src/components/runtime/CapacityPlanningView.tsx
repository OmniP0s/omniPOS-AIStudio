import React from 'react';
import {
  TrendingUp,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Database,
  Cpu,
  HardDrive,
  Radio,
  Layers,
  Network,
  Zap,
} from 'lucide-react';
import { runtimeEngine } from '../../domain/runtime/runtimeEngine';

interface Props {
  isArabic: boolean;
}

export const CapacityPlanningView: React.FC<Props> = ({ isArabic }) => {
  const { projections } = runtimeEngine;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight">
                  {isArabic ? 'التخطيط الاستباقي للسعة والموارد (Capacity Planning)' : 'Enterprise Capacity Planning & Forecasting'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  90-DAY PREDICTIVE MODEL
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isArabic
                  ? 'التنبؤ الذكي بتشبع الموارد قبل حدوث المشاكل: المعالجات، الذاكرة، التخزين، Kafka، Redis، وقواعد البيانات'
                  : 'Proactive saturation forecasting across CPU, Memory, Disk Storage, Kafka topics, Redis RAM, and PostgreSQL IOPS.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-800 px-3.5 py-2 rounded-xl text-xs text-slate-300 border border-slate-700">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span>Horizon: 30 to 90 Days Growth Model</span>
          </div>
        </div>

        {/* Global Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
            <div className="text-xs text-slate-400">Global Cluster Saturation Risk</div>
            <div className="text-xl font-black text-emerald-400 mt-1">LOW (Healthy)</div>
            <div className="text-[10px] text-slate-500 mt-0.5">All services within green margins for 90+ days</div>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
            <div className="text-xs text-slate-400">Average Resource Growth</div>
            <div className="text-xl font-black text-blue-400 mt-1 font-mono">+18.4% / mo</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Driven by 42 new franchise branches added</div>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
            <div className="text-xs text-slate-400">Nearest Saturation Horizon</div>
            <div className="text-xl font-black text-amber-400 mt-1 font-mono">3.8 Months</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Cluster CPU Cores peak capacity upgrade</div>
          </div>
        </div>
      </div>

      {/* Projections Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projections.map((proj) => (
          <div key={proj.resourceName} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-white font-bold text-sm">{proj.resourceName}</h3>
                <span className="text-[11px] text-slate-400 font-mono">Monthly Growth: +{proj.trendGrowthPct}%</span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                  proj.status === 'SUFFICIENT'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {proj.status}
              </span>
            </div>

            {/* Projection Comparison Cards */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">Current Usage</div>
                <div className="text-sm font-bold text-white font-mono mt-1">
                  {proj.currentUsage} {proj.unit}
                </div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">+30 Days Proj</div>
                <div className="text-sm font-bold text-blue-400 font-mono mt-1">
                  {proj.projected30Days} {proj.unit}
                </div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">+90 Days Proj</div>
                <div className="text-sm font-bold text-purple-400 font-mono mt-1">
                  {proj.projected90Days} {proj.unit}
                </div>
              </div>
            </div>

            {/* Progress Bar Towards Hard Limit */}
            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1 font-mono">
                <span>Utilization ({Math.round((proj.currentUsage / proj.hardLimit) * 100)}%)</span>
                <span>Hard Limit: {proj.hardLimit} {proj.unit}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    proj.currentUsage / proj.hardLimit > 0.75 ? 'bg-amber-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${(proj.currentUsage / proj.hardLimit) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
              <span>Saturation Horizon:</span>
              <strong className="text-white font-mono">{proj.saturationDate}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
