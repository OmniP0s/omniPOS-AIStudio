import React, { useState } from 'react';
import { globalAiEngine } from '../../domain/ai/aiPredictiveEngine';
import { AiDemandForecast, AiFraudAnomaly } from '../../types';
import {
  BrainCircuit,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  Users,
  Boxes,
  Calendar,
  SunMedium,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';

interface AiPredictiveServicesViewProps {
  isArabic: boolean;
}

export const AiPredictiveServicesView: React.FC<AiPredictiveServicesViewProps> = ({ isArabic }) => {
  const [forecasts] = useState<AiDemandForecast[]>(() => globalAiEngine.getForecasts());
  const [fraudAlerts] = useState<AiFraudAnomaly[]>(() => globalAiEngine.getFraudAlerts());
  const [summary] = useState<string>(() => globalAiEngine.generateExecutiveSummary());

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
            <h1 className="text-lg font-black tracking-tight text-white">
              {isArabic ? 'خدمات الذكاء الاصطناعي والتنبؤ بالطلب والاحتيال' : 'Enterprise AI Predictive Services & ML Insights'}
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
              Neural Time-Series Model
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {isArabic
              ? 'التنبؤ بالمبيعات واحتياج المواد والعمالة، واكتشاف الأنماط المشبوهة في الخزينة وإلغاء الفواتير'
              : 'Sales & customer cover forecasting, automated reorder prediction, labor optimization, and real-time cash drawer fraud detection'}
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Executive AI Briefing */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-800/80 space-y-2">
          <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>{isArabic ? 'الملخص التنفيذي الذكي (AI Executive Briefing):' : 'AI Executive Briefing'}</span>
          </div>
          <div className="text-xs text-slate-200 leading-relaxed font-mono whitespace-pre-line">
            {summary}
          </div>
        </div>

        {/* 2-Column Grid: Forecasts vs Fraud Anomaly Detection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Demand Forecasting Card */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  {isArabic ? 'التنبؤ بالمبيعات والطلب' : 'Demand & Sales Forecasts'}
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">95% Confidence</span>
            </div>

            <div className="space-y-3">
              {forecasts.map((fc, idx) => (
                <div key={idx} className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{fc.date}</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px]">
                      {fc.weatherFactor}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-900">
                    <div>
                      <span className="text-slate-500 text-[10px]">{isArabic ? 'المبيعات المتوقعة' : 'Predicted GMV'}</span>
                      <p className="font-bold text-emerald-400 font-mono text-sm">{fc.predictedSalesSar.toLocaleString()} SAR</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px]">{isArabic ? 'الزبائن المتوقعين' : 'Est. Covers'}</span>
                      <p className="font-bold text-white font-mono text-sm">{fc.predictedCoversCount}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px]">{isArabic ? 'الكادر المقترح' : 'Staff Needed'}</span>
                      <p className="font-bold text-indigo-400 font-mono text-sm">{fc.recommendedStaffCount} staff</p>
                    </div>
                  </div>

                  {fc.reorderAlerts.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {isArabic ? 'تنبيهات نقص المخزون التنبؤي:' : 'Predictive Reorder Recommendations:'}
                      </span>
                      {fc.reorderAlerts.map((ra, rIdx) => (
                        <div key={rIdx} className="flex items-center justify-between bg-slate-900/90 p-2 rounded border border-slate-800 text-[11px]">
                          <span className="text-slate-300">{ra.itemName}</span>
                          <span className="font-mono text-amber-300 font-bold">
                            Stock: {ra.currentStock} ➔ Order: +{ra.recommendedOrderQty}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Fraud & Anomaly Card */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  {isArabic ? 'حارس الاحتيال والشبهات المالية' : 'Fraud & Cash Guard Anomalies'}
                </h3>
              </div>
              <span className="text-[10px] font-mono text-rose-400">Real-time Quarantine</span>
            </div>

            <div className="space-y-3">
              {fraudAlerts.map(fa => (
                <div key={fa.id} className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-rose-400">{fa.anomalyType}</span>
                      <span className="px-2 py-0.2 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                        {fa.severity}
                      </span>
                    </div>
                    <span className="text-slate-500 text-[10px] font-mono">{fa.detectionTimestamp}</span>
                  </div>

                  <p className="text-slate-300 text-xs leading-normal">{fa.description}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-[11px]">
                    <span className="text-slate-400">
                      {isArabic ? 'المشتبه:' : 'Actor:'} <strong className="text-white">{fa.cashierName}</strong> ({fa.branchName})
                    </span>
                    <span className="font-mono font-bold text-indigo-400">
                      Confidence: {fa.confidenceScorePercent}%
                    </span>
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
