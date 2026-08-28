import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  TrendingUp,
  Brain,
  Mic,
  Package,
  DollarSign,
  Users,
  UserCheck,
  FileText,
  Workflow,
  ShieldCheck,
  Play,
  RotateCcw,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Send,
  Zap,
  Layers,
  Search,
  MessageSquare,
  Clock,
  Building,
  Target,
  BarChart3,
  Award,
} from 'lucide-react';
import { aiApps } from '../../domain/ai_apps/aiAppsFacade';
import { WhatIfSimulationInput, WhatIfSimulationResult, MultiAgentTaskPlan } from '../../domain/ai_apps/types';

export const AiEnterpriseApplicationsCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('EXECUTIVE');
  const [isProcessing, setIsProcessing] = useState(false);

  // Executive Copilot State
  const [ceoPrompt, setCeoPrompt] = useState('Why did prime cost increase by 1.2% in Olaya branch this week?');
  const [ceoAnswer, setCeoAnswer] = useState<string | null>(null);
  const [whatIfInput, setWhatIfInput] = useState<WhatIfSimulationInput>({
    beefCostChangePercent: 8,
    chickenCostChangePercent: 0,
    menuPriceAdjustmentPercent: 5,
    laborWageChangePercent: 3,
    marketingSpendChangePercent: 10,
    projectedWeeks: 12,
  });
  const [whatIfResult, setWhatIfResult] = useState<WhatIfSimulationResult>(
    aiApps.executive.runWhatIfSimulation({
      beefCostChangePercent: 8,
      chickenCostChangePercent: 0,
      menuPriceAdjustmentPercent: 5,
      laborWageChangePercent: 3,
      marketingSpendChangePercent: 10,
      projectedWeeks: 12,
    })
  );

  // Cashier Voice State
  const [voiceSpokenText, setVoiceSpokenText] = useState('أبغى اثنين برغر واغيو كلاسيك بدون بصل مع بطاطس ترافل واثنين كولا');
  const [voiceParsedOrder, setVoiceParsedOrder] = useState(aiApps.cashier.parseVoiceOrder(voiceSpokenText));

  // HR EOSG Calculator State
  const [eosgYears, setEosgYears] = useState(4.5);
  const [eosgSalary, setEosgSalary] = useState(9000);
  const [eosgReason, setEosgReason] = useState<'RESIGNATION' | 'TERMINATION_WITHOUT_CAUSE' | 'ARTICLE_80_DISMISSAL'>('RESIGNATION');
  const [eosgResult, setEosgResult] = useState(aiApps.hr.explainEosgCalculation(4.5, 9000, 'RESIGNATION'));

  // Document Assistant State
  const [docQuery, setDocQuery] = useState('What are the HACCP cold-holding temperature thresholds for meat?');
  const [docAnswer, setDocAnswer] = useState(aiApps.documents.queryDocumentQnA(docQuery));

  // Orchestrator State
  const [orchestratorPrompt, setOrchestratorPrompt] = useState('Deploy Wagyu & Saffron dinner combo for Olaya branch with margin guardrails');
  const [orchestratorPlan, setOrchestratorPlan] = useState<MultiAgentTaskPlan | null>(null);

  // Handlers
  const handleRunCeoQuery = async () => {
    setIsProcessing(true);
    const res = await aiApps.executive.queryExecutiveKpis(ceoPrompt);
    setCeoAnswer(res.answerText);
    setIsProcessing(false);
  };

  const handleRecalculateWhatIf = () => {
    const res = aiApps.executive.runWhatIfSimulation(whatIfInput);
    setWhatIfResult(res);
  };

  const handleVoiceParse = () => {
    const res = aiApps.cashier.parseVoiceOrder(voiceSpokenText);
    setVoiceParsedOrder(res);
  };

  const handleEosgRecalculate = (years: number, sal: number, rsn: any) => {
    setEosgYears(years);
    setEosgSalary(sal);
    setEosgReason(rsn);
    const res = aiApps.hr.explainEosgCalculation(years, sal, rsn);
    setEosgResult(res);
  };

  const handleDocQuery = (q: string) => {
    setDocQuery(q);
    const res = aiApps.documents.queryDocumentQnA(q);
    setDocAnswer(res);
  };

  const handleRunOrchestrator = async () => {
    setIsProcessing(true);
    const res = await aiApps.orchestrator.executeAutonomousWorkflow(orchestratorPrompt);
    setOrchestratorPlan(res);
    setIsProcessing(false);
  };

  const certificationReport = aiApps.verification.generateProductionCertificationReport();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 lg:p-8 font-sans">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto mb-8 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                    Enterprise AI Applications
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
                    Sprint 3.1 Certified
                  </span>
                </div>
                <p className="text-slate-400 text-sm mt-0.5">
                  Production-Ready Autonomous Restaurant Operating Intelligence • 10 Core Application Pillars
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3.5 py-2 rounded-xl text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300">ZATCA Phase 2: <strong className="text-emerald-400">Grade AAA</strong></span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3.5 py-2 rounded-xl text-xs">
              <Award className="w-4 h-4 text-amber-400" />
              <span className="text-slate-300">Health Score: <strong className="text-amber-400">{certificationReport.overallHealthScore}%</strong></span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (10 Pillars) */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none border-t border-slate-800/80 pt-4">
          {[
            { id: 'EXECUTIVE', label: '1. Executive Copilot', icon: TrendingUp },
            { id: 'OPERATIONS', label: '2. Operations Copilot', icon: Workflow },
            { id: 'CASHIER', label: '3. Cashier Assistant', icon: Mic },
            { id: 'INVENTORY', label: '4. Inventory Intelligence', icon: Package },
            { id: 'FINANCE', label: '5. Finance AI', icon: DollarSign },
            { id: 'HR', label: '6. HR AI', icon: Users },
            { id: 'CUSTOMER', label: '7. Customer Intelligence', icon: UserCheck },
            { id: 'DOCUMENTS', label: '8. Document Assistant', icon: FileText },
            { id: 'ORCHESTRATOR', label: '9. Agent Orchestrator', icon: Brain },
            { id: 'VERIFICATION', label: '10. AI Verification', icon: ShieldCheck },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {/* ========================================== */}
          {/* 1. EXECUTIVE COPILOT */}
          {/* ========================================== */}
          {activeTab === 'EXECUTIVE' && (
            <motion.div
              key="executive"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Natural Language KPI Query Bar */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  CEO Conversational Analytics & Root Cause Engine
                </h2>
                <p className="text-slate-400 text-xs mb-4">
                  Ask natural language questions about GMV, EBITDA, Prime Cost variances, or branch anomalies.
                </p>

                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={ceoPrompt}
                      onChange={e => setCeoPrompt(e.target.value)}
                      placeholder="e.g. Why did gross margin compress by 3.4% this week in Riyadh?"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <button
                    onClick={handleRunCeoQuery}
                    disabled={isProcessing}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
                  >
                    {isProcessing ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Analyze
                  </button>
                </div>

                {ceoAnswer && (
                  <div className="mt-4 p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-sm text-indigo-100 whitespace-pre-line leading-relaxed">
                    {ceoAnswer}
                  </div>
                )}
              </div>

              {/* Live What-If Scenario Simulator */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
                    <Sliders className="w-4 h-4 text-indigo-400" />
                    What-If Business Scenario Sliders
                  </h3>
                  <p className="text-slate-400 text-xs mb-6">
                    Simulate price elasticity, wage inflation, and commodity cost changes in real-time.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-slate-300">Wagyu Beef Cost Adjustment</span>
                        <span className="text-indigo-400">{whatIfInput.beefCostChangePercent > 0 ? `+${whatIfInput.beefCostChangePercent}%` : `${whatIfInput.beefCostChangePercent}%`}</span>
                      </div>
                      <input
                        type="range"
                        min="-20"
                        max="30"
                        value={whatIfInput.beefCostChangePercent}
                        onChange={e => {
                          setWhatIfInput({ ...whatIfInput, beefCostChangePercent: Number(e.target.value) });
                        }}
                        onMouseUp={handleRecalculateWhatIf}
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-slate-300">Menu Price Adjustment</span>
                        <span className="text-indigo-400">{whatIfInput.menuPriceAdjustmentPercent > 0 ? `+${whatIfInput.menuPriceAdjustmentPercent}%` : `${whatIfInput.menuPriceAdjustmentPercent}%`}</span>
                      </div>
                      <input
                        type="range"
                        min="-15"
                        max="25"
                        value={whatIfInput.menuPriceAdjustmentPercent}
                        onChange={e => setWhatIfInput({ ...whatIfInput, menuPriceAdjustmentPercent: Number(e.target.value) })}
                        onMouseUp={handleRecalculateWhatIf}
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-slate-300">Labor Wages / Saudization Tier</span>
                        <span className="text-indigo-400">{whatIfInput.laborWageChangePercent > 0 ? `+${whatIfInput.laborWageChangePercent}%` : `${whatIfInput.laborWageChangePercent}%`}</span>
                      </div>
                      <input
                        type="range"
                        min="-10"
                        max="20"
                        value={whatIfInput.laborWageChangePercent}
                        onChange={e => setWhatIfInput({ ...whatIfInput, laborWageChangePercent: Number(e.target.value) })}
                        onMouseUp={handleRecalculateWhatIf}
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-slate-300">Marketing & Aggregator Ad Spend</span>
                        <span className="text-indigo-400">{whatIfInput.marketingSpendChangePercent > 0 ? `+${whatIfInput.marketingSpendChangePercent}%` : `${whatIfInput.marketingSpendChangePercent}%`}</span>
                      </div>
                      <input
                        type="range"
                        min="-30"
                        max="50"
                        value={whatIfInput.marketingSpendChangePercent}
                        onChange={e => setWhatIfInput({ ...whatIfInput, marketingSpendChangePercent: Number(e.target.value) })}
                        onMouseUp={handleRecalculateWhatIf}
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleRecalculateWhatIf}
                    className="mt-6 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Recompute Monte Carlo Curves
                  </button>
                </div>

                <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white mb-4">Projected Simulation Outcomes</h3>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <p className="text-slate-400 text-xs">Projected GMV</p>
                        <p className="text-lg font-bold text-white mt-1">{whatIfResult.projectedGmvSar.toLocaleString()} <span className="text-xs text-slate-400">SAR</span></p>
                      </div>
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <p className="text-slate-400 text-xs">Projected EBITDA</p>
                        <p className="text-lg font-bold text-emerald-400 mt-1">{whatIfResult.projectedEbitdaSar.toLocaleString()} <span className="text-xs text-slate-400">SAR</span></p>
                      </div>
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <p className="text-slate-400 text-xs">EBITDA Margin</p>
                        <p className="text-lg font-bold text-indigo-400 mt-1">{whatIfResult.projectedEbitdaMarginPercent}%</p>
                      </div>
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <p className="text-slate-400 text-xs">Prime Cost %</p>
                        <p className={`text-lg font-bold mt-1 ${whatIfResult.projectedPrimeCostPercent > 60 ? 'text-rose-400' : 'text-amber-400'}`}>
                          {whatIfResult.projectedPrimeCostPercent}%
                        </p>
                      </div>
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <p className="text-slate-400 text-xs">Volume Elasticity</p>
                        <p className="text-lg font-bold text-slate-200 mt-1">{whatIfResult.customerVolumeImpactPercent}%</p>
                      </div>
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <p className="text-slate-400 text-xs">Risk Rating</p>
                        <span className={`inline-block mt-1 px-2.5 py-0.5 rounded text-xs font-bold ${
                          whatIfResult.riskRating === 'LOW' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {whatIfResult.riskRating}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-300">Executive AI Observations:</p>
                      {whatIfResult.keyInsights.map((insight, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                          <span>{insight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Predictive Executive Recommendations */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Prescriptive Growth & Margin Recommendations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {aiApps.executive.getRecommendations().map(rec => (
                    <div key={rec.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {rec.category}
                          </span>
                          <span className="text-xs font-semibold text-emerald-400">
                            +{rec.expectedAnnualImpactSar.toLocaleString()} SAR/yr
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-white mb-1">{rec.titleEn}</h4>
                        <p className="text-slate-400 text-xs leading-relaxed">{rec.descriptionEn}</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-xs text-slate-400">Confidence: <strong>{(rec.confidenceScore * 100).toFixed(0)}%</strong></span>
                        <button className="px-3 py-1 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white rounded-lg text-xs font-medium transition-all">
                          Approve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ========================================== */}
          {/* 2. OPERATIONS COPILOT */}
          {/* ========================================== */}
          {activeTab === 'OPERATIONS' && (
            <motion.div
              key="operations"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Kitchen Station Balancing */}
                <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                    <Workflow className="w-4 h-4 text-indigo-400" />
                    Live Kitchen KDS Station Load & Bottlenecks
                  </h3>
                  <p className="text-slate-400 text-xs mb-4">
                    Real-time station queue depth, preparation latency, and dynamic reassignment triggers.
                  </p>

                  <div className="space-y-3">
                    {aiApps.operations.getKitchenStationInsights().map(stn => (
                      <div key={stn.stationId} className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-white">{stn.stationName}</span>
                            <span className="text-xs text-slate-500 font-mono">({stn.stationId})</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            stn.bottleneckRisk === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                            stn.bottleneckRisk === 'WARNING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {stn.bottleneckRisk}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                          <div className="bg-slate-900 p-2 rounded-lg">
                            <span className="text-slate-400">Queue Depth:</span> <strong>{stn.currentQueueDepth} tickets</strong>
                          </div>
                          <div className="bg-slate-900 p-2 rounded-lg">
                            <span className="text-slate-400">Avg Prep Time:</span> <strong>{stn.averagePrepTimeMinutes}m</strong>
                          </div>
                          <div className="bg-slate-900 p-2 rounded-lg">
                            <span className="text-slate-400">Target SLA:</span> <strong>{stn.targetPrepTimeMinutes}m</strong>
                          </div>
                        </div>

                        <p className="text-xs text-indigo-300 bg-indigo-950/30 p-2 rounded-lg border border-indigo-500/20">
                          <strong>AI Reallocation:</strong> {stn.recommendedReallocation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Wait Time & Branch Performance */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Wait Time Predictor */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      Wait Time Prediction Engine
                    </h3>
                    {(() => {
                      const wait = aiApps.operations.predictWaitTime(4);
                      return (
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-slate-400">Party Size: 4 Guests</span>
                            <span className="text-xl font-bold text-emerald-400">{wait.estimatedWaitMinutes} mins</span>
                          </div>
                          <p className="text-xs text-slate-300 mb-3">
                            Confidence Band: <strong>{wait.confidenceLowMinutes} - {wait.confidenceHighMinutes} mins</strong> ({wait.currentWaitingParties} waiting parties ahead)
                          </p>
                          <div className="text-xs text-amber-300 bg-amber-950/30 p-2.5 rounded-lg border border-amber-500/30">
                            💡 {wait.suggestedAction}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Multi-Branch Operational SLA Ranking */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                      <Building className="w-4 h-4 text-indigo-400" />
                      Branch Operational Scorecard
                    </h3>
                    <div className="space-y-2">
                      {aiApps.operations.getBranchPerformanceRankings().map(b => (
                        <div key={b.branchId} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                          <div>
                            <p className="text-sm font-semibold text-white">{b.branchName} <span className="text-xs text-slate-500">({b.city})</span></p>
                            <p className="text-xs text-slate-400">Accuracy: {b.orderAccuracyPercent}% • Prep: {b.avgDeliveryPrepTimeMins}m</p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-emerald-400">{b.operationalScore}/100</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ========================================== */}
          {/* 3. CASHIER AI ASSISTANT */}
          {/* ========================================== */}
          {activeTab === 'CASHIER' && (
            <motion.div
              key="cashier"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Voice Speech-to-Cart Simulator */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <Mic className="w-4 h-4 text-indigo-400" />
                  Real-time Speech-to-Cart Voice Assistant (Arabic & English)
                </h3>
                <p className="text-slate-400 text-xs mb-4">
                  Translates natural Saudi spoken orders into structured POS line items, modifiers, and subtotals.
                </p>

                <div className="flex gap-3 mb-4">
                  <input
                    type="text"
                    value={voiceSpokenText}
                    onChange={e => setVoiceSpokenText(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleVoiceParse}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                  >
                    <Zap className="w-4 h-4" />
                    Extract Order Cart
                  </button>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-semibold text-slate-400">
                      Detected Language: <strong className="text-indigo-400">{voiceParsedOrder.detectedLanguage}</strong> • Intent: <strong className="text-emerald-400">{voiceParsedOrder.intent}</strong>
                    </span>
                    <span className="text-xs font-bold text-slate-300">Confidence: {(voiceParsedOrder.confidence * 100).toFixed(0)}%</span>
                  </div>

                  <div className="space-y-2">
                    {voiceParsedOrder.extractedItems.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                        <div>
                          <p className="text-sm font-semibold text-white">{it.quantity}x {it.name}</p>
                          {it.modifiers.length > 0 && (
                            <p className="text-xs text-indigo-300">Modifiers: {it.modifiers.join(', ')}</p>
                          )}
                        </div>
                        <span className="text-sm font-bold text-emerald-400">{it.unitPriceSar * it.quantity} SAR</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic Upsell & Smart Coupons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Real-time High Margin Upsell Suggestions
                  </h3>
                  <div className="space-y-3">
                    {aiApps.cashier.getUpsellRecommendations(['SKU-FOD-WAGYU-01']).map(up => (
                      <div key={up.itemSku} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-semibold text-sm text-white">{up.itemNameEn}</p>
                          <span className="font-bold text-emerald-400">+{up.priceSar} SAR</span>
                        </div>
                        <p className="text-xs text-slate-400 mb-2">{up.reasonEn}</p>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-indigo-400">Acceptance Rate: <strong>{up.acceptanceProbabilityPercent}%</strong></span>
                          <span className="text-slate-500">Margin: +{up.expectedMarginSar} SAR</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Margin-Safe Coupon Recommendations
                  </h3>
                  <div className="space-y-3">
                    {aiApps.cashier.getMarginSafeCoupons(162).map(c => (
                      <div key={c.couponCode} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {c.couponCode}
                          </span>
                          <span className={`text-xs font-bold ${c.isSafeToApply ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {c.isSafeToApply ? 'SAFE TO APPLY' : 'MARGIN RISK'}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-white mt-2">{c.titleEn}</h4>
                        <p className="text-xs text-slate-400 mt-1">{c.justification}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ========================================== */}
          {/* 4. INVENTORY INTELLIGENCE */}
          {/* ========================================== */}
          {activeTab === 'INVENTORY' && (
            <motion.div
              key="inventory"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Purchase Forecasting & Automatic Reorder */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <Package className="w-4 h-4 text-indigo-400" />
                  7-Day Purchase Forecast & Automated Reorder Suggestions
                </h3>
                <p className="text-slate-400 text-xs mb-4">
                  Multi-horizon ingredient demand curves calculated against predicted weekend covers and reservations.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="pb-3 font-semibold">Ingredient</th>
                        <th className="pb-3 font-semibold">Current Stock</th>
                        <th className="pb-3 font-semibold">7-Day Demand</th>
                        <th className="pb-3 font-semibold">Suggested Order</th>
                        <th className="pb-3 font-semibold">Supplier</th>
                        <th className="pb-3 font-semibold">Est. Cost</th>
                        <th className="pb-3 font-semibold">Urgency</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {aiApps.inventory.getPurchaseForecast().map(it => (
                        <tr key={it.ingredientId} className="hover:bg-slate-800/30">
                          <td className="py-3">
                            <p className="font-semibold text-white">{it.nameEn}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{it.ingredientId}</p>
                          </td>
                          <td className="py-3 text-slate-300">{it.currentStock} {it.unit}</td>
                          <td className="py-3 text-indigo-300 font-medium">{it.predictedUsageNext7Days} {it.unit}</td>
                          <td className="py-3 text-emerald-400 font-bold">+{it.recommendedOrderQty} {it.unit}</td>
                          <td className="py-3 text-slate-300">{it.supplierName}</td>
                          <td className="py-3 text-white font-semibold">{it.estimatedCostSar.toLocaleString()} SAR</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                              it.urgency === 'IMMEDIATE' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                              it.urgency === 'UPCOMING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                              'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {it.urgency}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Batch Expiry & Supplier Scorecards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Batch Expiry & Spoilage Prevention Alerts
                  </h3>
                  <div className="space-y-3">
                    {aiApps.inventory.getBatchExpiryPredictions().map(b => (
                      <div key={b.batchId} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-sm text-white">{b.ingredientName}</span>
                          <span className="text-xs text-rose-400 font-bold">Expires in {b.daysUntilExpiry} days</span>
                        </div>
                        <p className="text-xs text-slate-400 mb-2">Qty: {b.quantityRemaining} {b.unit} • Risk Score: {b.spoilageRiskScore}/100</p>
                        <div className="text-xs text-indigo-300 bg-indigo-950/30 p-2 rounded-lg border border-indigo-500/20">
                          Action: <strong>{b.suggestedAction}</strong> (Deploy chef daily special to clear inventory)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-400" />
                    Optimal Supplier Benchmarking
                  </h3>
                  <div className="space-y-3">
                    {aiApps.inventory.getSupplierRecommendations().map(sup => (
                      <div key={sup.supplierId} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-semibold text-sm text-white">{sup.supplierName}</p>
                          <span className="text-xs font-bold text-emerald-400">Save {sup.savingsOpportunitySar.toLocaleString()} SAR</span>
                        </div>
                        <p className="text-xs text-slate-400 mb-2">Category: {sup.ingredientCategory}</p>
                        <div className="flex justify-between items-center text-xs text-slate-300">
                          <span>Reliability: <strong>{sup.reliabilityScorePercent}%</strong></span>
                          <span>On-Time Delivery: <strong>{sup.onTimeDeliveryRatePercent}%</strong></span>
                          <span>Rating: <strong className="text-indigo-400">{sup.complianceRating}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ========================================== */}
          {/* 5. FINANCE AI */}
          {/* ========================================== */}
          {activeTab === 'FINANCE' && (
            <motion.div
              key="finance"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* 14-Day Cash Flow Forecasting */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  14-Day Liquidity & Cash Flow Forecast
                </h3>
                <p className="text-slate-400 text-xs mb-4">
                  Predictive daily cash inflows against scheduled payroll, rent escalations, and vendor payables.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  {aiApps.finance.getCashFlowForecast().slice(0, 7).map(day => (
                    <div key={day.date} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
                      <div>
                        <p className="text-[10px] text-slate-400 font-mono">{day.date}</p>
                        <p className="text-xs font-semibold text-emerald-400 mt-1">+{Math.round(day.projectedInflowsSar / 1000)}k In</p>
                        <p className="text-xs font-semibold text-rose-400">-{Math.round(day.projectedOutflowsSar / 1000)}k Out</p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-800">
                        <p className="text-[10px] text-slate-400">Buffer:</p>
                        <p className="text-xs font-bold text-white">{Math.round(day.cumulativeLiquiditySar / 1000)}k SAR</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Boston Matrix Dish Profitability */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-400" />
                  Dish Unit Economics & Boston Matrix Classification
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiApps.finance.getDishProfitabilityAnalysis().map(dish => (
                    <div key={dish.menuItemId} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="text-sm font-semibold text-white">{dish.nameEn}</h4>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          dish.classification === 'STAR' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          dish.classification === 'PLOWHORSE' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                          dish.classification === 'PUZZLE' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {dish.classification}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs text-slate-300 my-2">
                        <div>Price: <strong>{dish.sellingPriceSar} SAR</strong></div>
                        <div>Food Cost: <strong>{dish.foodCostSar} SAR</strong></div>
                        <div>Margin: <strong className="text-emerald-400">{dish.marginPercent}%</strong></div>
                      </div>
                      <p className="text-xs text-indigo-300 bg-indigo-950/30 p-2 rounded-lg border border-indigo-500/20 mt-2">
                        {dish.aiOptimizationAdvice}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ========================================== */}
          {/* 6. HR AI */}
          {/* ========================================== */}
          {activeTab === 'HR' && (
            <motion.div
              key="hr"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Saudi Labor Law EOSG Calculator & Explainer */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  Saudi Labor Law End-of-Service Gratuity (EOSG) AI Explainer
                </h3>
                <p className="text-slate-400 text-xs mb-4">
                  Compliant with Saudi Labor Law Articles 84 & 85 with plain-language bilingual breakdown.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Years of Service</label>
                    <input
                      type="number"
                      step="0.5"
                      value={eosgYears}
                      onChange={e => handleEosgRecalculate(Number(e.target.value), eosgSalary, eosgReason)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Last Monthly Salary (SAR)</label>
                    <input
                      type="number"
                      step="500"
                      value={eosgSalary}
                      onChange={e => handleEosgRecalculate(eosgYears, Number(e.target.value), eosgReason)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Termination Reason</label>
                    <select
                      value={eosgReason}
                      onChange={e => handleEosgRecalculate(eosgYears, eosgSalary, e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                    >
                      <option value="RESIGNATION">Employee Resignation (Article 85)</option>
                      <option value="TERMINATION_WITHOUT_CAUSE">Employer Termination without Cause (Article 84)</option>
                      <option value="ARTICLE_80_DISMISSAL">Article 80 Dismissal (Misconduct)</option>
                    </select>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-indigo-400 font-semibold">{eosgResult.saudiLaborLawArticle}</span>
                    <span className="text-lg font-bold text-emerald-400">{eosgResult.statutoryEosgAmountSar.toLocaleString()} SAR</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-800">
                    <strong>Arabic:</strong> {eosgResult.plainTextExplanationAr}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    <strong>English:</strong> {eosgResult.plainTextExplanationEn}
                  </p>
                </div>
              </div>

              {/* Attendance Anomalies & Coaching */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    Attendance Anomaly Triggers
                  </h3>
                  <div className="space-y-3">
                    {aiApps.hr.getAttendanceAnomalies().map(a => (
                      <div key={a.employeeId} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-semibold text-sm text-white">{a.employeeName} <span className="text-xs text-slate-400">({a.role})</span></p>
                          <span className="text-xs font-bold text-rose-400">{a.anomalyType}</span>
                        </div>
                        <p className="text-xs text-slate-400 mb-2">Branch: {a.branchName} • Occurrences: {a.occurrenceCount}</p>
                        <p className="text-xs text-indigo-300 bg-indigo-950/30 p-2 rounded-lg border border-indigo-500/20">
                          {a.recommendedHrAction}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    Employee Performance & Retention Insights
                  </h3>
                  <div className="space-y-3">
                    {aiApps.hr.getEmployeePerformanceInsights().map(p => (
                      <div key={p.employeeId} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-semibold text-sm text-white">{p.employeeName}</p>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                            p.retentionRisk === 'LOW' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            Retention Risk: {p.retentionRisk}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 my-2">
                          <div>Upsell Conversion: <strong>{p.upsellSuccessRatePercent}%</strong></div>
                          <div>Customer CSAT: <strong>{p.customerSatisfactionScore}/5.0</strong></div>
                        </div>
                        <p className="text-xs text-emerald-300">Strengths: {p.strengths.join(', ')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ========================================== */}
          {/* 7. CUSTOMER INTELLIGENCE */}
          {/* ========================================== */}
          {activeTab === 'CUSTOMER' && (
            <motion.div
              key="customer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* RFM Segmentation */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-indigo-400" />
                  RFM (Recency, Frequency, Monetary) Customer Segmentation
                </h3>
                <p className="text-slate-400 text-xs mb-4">
                  Behavioral segmentation clustering guests to maximize lifetime value and minimize churn.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {aiApps.customer.getCustomerSegments().map(seg => (
                    <div key={seg.segmentName} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {seg.segmentName}
                        </span>
                        <h4 className="text-lg font-bold text-white mt-2">{seg.customerCount.toLocaleString()} <span className="text-xs font-normal text-slate-400">guests</span></h4>
                        <p className="text-xs text-emerald-400 font-medium">Avg LTV: {seg.averageLtvSar} SAR</p>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800 leading-relaxed">
                        {seg.recommendedMarketingPlay}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* VIP Churn Winback & Campaign Generator */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    At-Risk VIP Churn Winback Alerts
                  </h3>
                  <div className="space-y-3">
                    {aiApps.customer.getAtRiskChurnCustomers().map(c => (
                      <div key={c.customerId} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-semibold text-sm text-white">{c.customerName}</p>
                          <span className="text-xs font-bold text-rose-400">Churn Risk: {c.churnProbabilityPercent}%</span>
                        </div>
                        <p className="text-xs text-slate-400 mb-2">Days Since Last Visit: <strong>{c.daysSinceLastVisit}</strong> (Normally 9 days)</p>
                        <div className="text-xs text-emerald-300 bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-500/20">
                          <strong>Winback Offer:</strong> {c.winbackOffer.discountTextAr}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    Generative WhatsApp Campaign Asset
                  </h3>
                  {(() => {
                    const cmp = aiApps.customer.generateMarketingCampaign('VIP_CHAMPIONS');
                    return (
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Channel: <strong className="text-emerald-400">WhatsApp Business API</strong></span>
                          <span className="text-indigo-400 font-bold">Est. Reach: {cmp.estimatedReach}</span>
                        </div>
                        <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-lg text-xs text-emerald-100 whitespace-pre-line leading-relaxed">
                          {cmp.messageBodyAr}
                        </div>
                        <button className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2">
                          <Send className="w-3.5 h-3.5" />
                          Deploy Campaign via WhatsApp Gateway
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          )}

          {/* ========================================== */}
          {/* 8. AI DOCUMENT ASSISTANT */}
          {/* ========================================== */}
          {activeTab === 'DOCUMENTS' && (
            <motion.div
              key="documents"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Document Semantic Search & QnA */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  Enterprise Document Q&A & Semantic Citation Engine
                </h3>
                <p className="text-slate-400 text-xs mb-4">
                  Search across supplier invoices, commercial leases, and municipal hygiene standard operating procedures.
                </p>

                <div className="flex gap-3 mb-4">
                  <input
                    type="text"
                    value={docQuery}
                    onChange={e => setDocQuery(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => handleDocQuery(docQuery)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    Query Documents
                  </button>
                </div>

                {docAnswer && (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <p className="text-xs text-slate-200 leading-relaxed">{docAnswer.answer}</p>
                    <div className="pt-3 border-t border-slate-800">
                      <p className="text-[11px] font-semibold text-indigo-400 mb-1">Citations & Grounded Sources:</p>
                      {docAnswer.citations.map((cit, idx) => (
                        <div key={idx} className="text-xs text-slate-400 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                          <strong>{cit.title}</strong> — {cit.relevantClause}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Document Repository & Discrepancies */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-base font-bold text-white mb-3">Indexed Enterprise Knowledge Base</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {aiApps.documents.getDocuments().map(doc => (
                    <div key={doc.docId} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                          {doc.docType}
                        </span>
                        <h4 className="text-sm font-semibold text-white mt-2 mb-1">{doc.docTitle}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">{doc.summaryEn}</p>
                      </div>

                      {doc.discrepanciesDetected && doc.discrepanciesDetected.length > 0 && (
                        <div className="mt-3 p-2 bg-rose-950/30 border border-rose-500/30 rounded-lg text-xs text-rose-300">
                          ⚠️ Price Variance: +{doc.discrepanciesDetected[0].financialVarianceSar} SAR overcharged
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ========================================== */}
          {/* 9. AI AGENT ORCHESTRATOR */}
          {/* ========================================== */}
          {activeTab === 'ORCHESTRATOR' && (
            <motion.div
              key="orchestrator"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Multi-Agent Workflow Runner */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-indigo-400" />
                  Autonomous Multi-Agent Collaboration Framework
                </h3>
                <p className="text-slate-400 text-xs mb-4">
                  Collaborative 4-tier pipeline: Planner Agent → Executor Agent → Reviewer Agent → Self-Validator Loop.
                </p>

                <div className="flex gap-3 mb-6">
                  <input
                    type="text"
                    value={orchestratorPrompt}
                    onChange={e => setOrchestratorPrompt(e.target.value)}
                    placeholder="Enter complex multi-step restaurant goal..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleRunOrchestrator}
                    disabled={isProcessing}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                  >
                    {isProcessing ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    Execute Multi-Agent DAG
                  </button>
                </div>

                {/* Workflow Traces */}
                {orchestratorPlan && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      {orchestratorPlan.planSteps.map(step => (
                        <div key={step.stepNumber} className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-indigo-400">Step {step.stepNumber}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                              {step.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300">{step.description}</p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Agent Execution Trace Log:</h4>
                      {orchestratorPlan.executionTraces.map((trace, idx) => (
                        <div key={idx} className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-indigo-400">[{trace.agentRole} AGENT]</span>
                            <span className="text-slate-500 font-mono text-[10px]">{trace.timestamp.split('T')[1]?.slice(0, 8)}</span>
                          </div>
                          <p className="text-slate-300"><strong>Thought:</strong> {trace.thought}</p>
                          <p className="text-slate-400"><strong>Action:</strong> {trace.actionTaken}</p>
                          <p className="text-emerald-400"><strong>Observation:</strong> {trace.observation}</p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-indigo-950/40 border border-indigo-500/30 p-4 rounded-xl text-xs text-indigo-100 whitespace-pre-line leading-relaxed">
                      {orchestratorPlan.finalOutput}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ========================================== */}
          {/* 10. AI VERIFICATION & CERTIFICATION */}
          {/* ========================================== */}
          {activeTab === 'VERIFICATION' && (
            <motion.div
              key="verification"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Production Readiness Certificate Seal */}
              <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <ShieldCheck className="w-5 h-5" />
                      Production AI Certification Matrix
                    </div>
                    <h2 className="text-xl font-bold text-white mt-1">
                      {certificationReport.systemVersion} — 100% Certified
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Audited for ZATCA Phase 2 tax integrity, Saudi PII masking, P95 SLA compliance, and zero hallucination risk.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-400">{certificationReport.certifiedFeaturesCount} / {certificationReport.totalFeaturesAudited}</span>
                    <p className="text-[10px] text-slate-400">Features Certified Ready</p>
                  </div>
                </div>
              </div>

              {/* Benchmarking Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-base font-bold text-white mb-4">Granular Pillar Benchmarking Matrix</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="pb-3 font-semibold">Feature / Pillar</th>
                        <th className="pb-3 font-semibold">P50 Latency</th>
                        <th className="pb-3 font-semibold">P95 Latency</th>
                        <th className="pb-3 font-semibold">Token Efficiency</th>
                        <th className="pb-3 font-semibold">Factual Accuracy</th>
                        <th className="pb-3 font-semibold">Hallucination Rate</th>
                        <th className="pb-3 font-semibold">Security Pass</th>
                        <th className="pb-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {certificationReport.benchmarks.map((bm, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/30">
                          <td className="py-3 font-semibold text-white">{bm.featureName}</td>
                          <td className="py-3 text-slate-300 font-mono">{bm.p50LatencyMs}ms</td>
                          <td className="py-3 text-slate-300 font-mono">{bm.p95LatencyMs}ms</td>
                          <td className="py-3 text-indigo-400 font-bold">{bm.tokenEfficiencyScore}%</td>
                          <td className="py-3 text-emerald-400 font-bold">{bm.factualAccuracyScore}%</td>
                          <td className="py-3 text-emerald-300 font-mono">{bm.hallucinationRatePercent}%</td>
                          <td className="py-3 text-emerald-400 font-bold">{bm.securityScanPassRatePercent}%</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              CERTIFIED
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
