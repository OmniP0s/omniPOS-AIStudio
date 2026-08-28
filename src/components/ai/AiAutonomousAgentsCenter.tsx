/**
 * OmniPOS Enterprise AI Autonomous Agents Center
 * Sprint 3.2
 */

import React, { useState, useEffect } from 'react';
import {
  Bot,
  Cpu,
  Layers,
  Workflow,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  TrendingUp,
  Search,
  Check,
  X,
  FileText,
  DollarSign,
  Users,
  Building2,
  Package,
  ShoppingCart,
  Send,
  Activity,
  Award,
  Lock,
  Compass,
  BarChart3,
  Sliders,
  ChevronRight,
  RefreshCw,
  Eye,
  Key,
  Database,
  Share2
} from 'lucide-react';
import { aiAgents } from '../../domain/ai_agents/aiAgentsFacade';
import {
  AgentRole,
  AgentDefinition,
  AgentMessageEnvelope,
  DagWorkflowPlan,
  HumanApprovalGate,
  EnterpriseTool,
  KnowledgeGraphNode,
  AiEvaluationRunReport,
  GovernancePolicyRule,
  MerkleAuditBlock,
  TenantAiBudgetSummary,
  AgentFleetTelemetry,
  InventoryAutoOrderResult,
  ThreeWayMatchingResult,
  SmartStaffScheduleResult,
  MarketingCampaignAutomationResult,
  FinancialClosingResult
} from '../../domain/ai_agents/types';

interface Props {
  isArabic?: boolean;
}

type TabType =
  | 'FLEET_DAG'
  | 'WORKFLOWS'
  | 'APPROVAL_GATES'
  | 'TOOL_MARKETPLACE'
  | 'KNOWLEDGE_GRAPH'
  | 'GOVERNANCE'
  | 'EVALUATION';

export const AiAutonomousAgentsCenter: React.FC<Props> = ({ isArabic = false }) => {
  const [activeTab, setActiveTab] = useState<TabType>('FLEET_DAG');
  const [telemetry, setTelemetry] = useState<AgentFleetTelemetry>(aiAgents.getFleetTelemetry());
  const [fleet, setFleet] = useState<AgentDefinition[]>(aiAgents.agents.getAgentFleet());
  const [messages, setMessages] = useState<AgentMessageEnvelope[]>(aiAgents.agents.getRecentMessages());
  const [approvalGates, setApprovalGates] = useState<HumanApprovalGate[]>(aiAgents.orchestrator.getApprovalGates());
  const [tools, setTools] = useState<EnterpriseTool[]>(aiAgents.marketplace.getAllTools());
  const [policies, setPolicies] = useState<GovernancePolicyRule[]>(aiAgents.governance.getPolicies());
  const [auditChain, setAuditChain] = useState<MerkleAuditBlock[]>(aiAgents.governance.getAuditChain());
  const [budget, setBudget] = useState<TenantAiBudgetSummary>(aiAgents.governance.getTenantBudget());
  const [evalReport, setEvalReport] = useState<AiEvaluationRunReport>(aiAgents.evaluation.getLatestReport());

  // Workflow states
  const [activeWfCategory, setActiveWfCategory] = useState<'INVENTORY' | 'MATCHING' | 'SCHEDULING' | 'MARKETING' | 'FINANCE'>('INVENTORY');
  const [wfLoading, setWfLoading] = useState(false);
  const [invResult, setInvResult] = useState<InventoryAutoOrderResult | null>(null);
  const [matchResult, setMatchResult] = useState<ThreeWayMatchingResult | null>(null);
  const [schedResult, setSchedResult] = useState<SmartStaffScheduleResult | null>(null);
  const [mktResult, setMktResult] = useState<MarketingCampaignAutomationResult | null>(null);
  const [finResult, setFinResult] = useState<FinancialClosingResult | null>(null);

  // Tool tester state
  const [selectedTool, setSelectedTool] = useState<EnterpriseTool | null>(null);
  const [toolParamsInput, setToolParamsInput] = useState<string>('{}');
  const [toolExecuting, setToolExecuting] = useState<boolean>(false);
  const [toolOutput, setToolOutput] = useState<any>(null);

  // Knowledge graph query state
  const [kgSearch, setKgSearch] = useState('Wagyu');
  const [kgResult, setKgResult] = useState(aiAgents.knowledge.queryGraph('Wagyu'));

  // Approval modal state
  const [selectedGate, setSelectedGate] = useState<HumanApprovalGate | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');

  // Auto refresh telemetry
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(aiAgents.getFleetTelemetry());
      setFleet(aiAgents.agents.getAgentFleet());
      setMessages(aiAgents.agents.getRecentMessages());
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleRunWorkflow = async (category: typeof activeWfCategory) => {
    setWfLoading(true);
    try {
      if (category === 'INVENTORY') {
        const res = await aiAgents.workflows.runInventoryAutoOrderWorkflow('BR-OLAYA-01');
        setInvResult(res);
      } else if (category === 'MATCHING') {
        const res = await aiAgents.workflows.runThreeWayMatchingWorkflow('INV-SUP-2026-881');
        setMatchResult(res);
      } else if (category === 'SCHEDULING') {
        const res = await aiAgents.workflows.runSmartStaffSchedulingWorkflow('BR-OLAYA-01');
        setSchedResult(res);
      } else if (category === 'MARKETING') {
        const res = await aiAgents.workflows.runMarketingCampaignWorkflow('AT_RISK_VIP');
        setMktResult(res);
      } else if (category === 'FINANCE') {
        const res = await aiAgents.workflows.runFinancialClosingWorkflow('BR-OLAYA-01');
        setFinResult(res);
      }
      setApprovalGates(aiAgents.orchestrator.getApprovalGates());
      setTelemetry(aiAgents.getFleetTelemetry());
    } finally {
      setWfLoading(false);
    }
  };

  const handleDecideGate = (gateId: string, decision: 'APPROVED' | 'REJECTED') => {
    aiAgents.orchestrator.decideApprovalGate(
      gateId,
      decision,
      'USR-MGR-001',
      'Tariq Al-Mansoor (Procurement Director)',
      approvalNotes || (decision === 'APPROVED' ? 'Approved for operational continuity' : 'Rejected due to budget variance')
    );
    setApprovalGates(aiAgents.orchestrator.getApprovalGates());
    setAuditChain(aiAgents.governance.getAuditChain());
    setTelemetry(aiAgents.getFleetTelemetry());
    setSelectedGate(null);
    setApprovalNotes('');
  };

  const handleExecuteTool = async () => {
    if (!selectedTool) return;
    setToolExecuting(true);
    try {
      let params = {};
      try {
        params = JSON.parse(toolParamsInput);
      } catch (e) {
        params = {};
      }
      const res = await aiAgents.marketplace.executeTool(selectedTool.toolId, params, 'EXECUTOR');
      setToolOutput(res);
      setTools(aiAgents.marketplace.getAllTools());
    } finally {
      setToolExecuting(false);
    }
  };

  const handleRunEvaluation = async () => {
    const rep = await aiAgents.evaluation.executeBenchmarkRun();
    setEvalReport(rep);
  };

  const handleTogglePolicy = (ruleId: string) => {
    aiAgents.governance.togglePolicy(ruleId);
    setPolicies(aiAgents.governance.getPolicies());
  };

  const handleKgQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kgSearch.trim()) return;
    setKgResult(aiAgents.knowledge.queryGraph(kgSearch));
  };

  const roleColors: Record<AgentRole, { bg: string; text: string; border: string }> = {
    PLANNER: { bg: 'bg-indigo-950/40', text: 'text-indigo-400', border: 'border-indigo-800/60' },
    EXECUTOR: { bg: 'bg-emerald-950/40', text: 'text-emerald-400', border: 'border-emerald-800/60' },
    REVIEWER: { bg: 'bg-amber-950/40', text: 'text-amber-400', border: 'border-amber-800/60' },
    VALIDATOR: { bg: 'bg-cyan-950/40', text: 'text-cyan-400', border: 'border-cyan-800/60' },
    CRITIC: { bg: 'bg-rose-950/40', text: 'text-rose-400', border: 'border-rose-800/60' },
    SUPERVISOR: { bg: 'bg-purple-950/40', text: 'text-purple-400', border: 'border-purple-800/60' },
  };

  return (
    <div className="flex flex-col flex-1 h-full bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Header Banner & Telemetry Bar */}
      <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white">
                {isArabic ? 'مركز الأتمتة والوكلاء الأذكياء المستقلين' : 'Enterprise Autonomous AI Agents & Automation'}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Sprint 3.2 GA
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Zero-Trust OPA
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {isArabic
                ? 'تنسيق أسطول الوكلاء، تدفقات الأعمال الذاتية، بوابات الموافقة البشرية، وسلسلة التدقيق المشفرة'
                : 'Multi-Agent DAG orchestration, autonomous business pipelines, HITL gates, and knowledge graph'}
            </p>
          </div>
        </div>

        {/* Global Live Telemetry */}
        <div className="flex items-center gap-4 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">Fleet Health:</span>
            <span className="font-semibold text-emerald-400">{telemetry.systemHealthScorePct}%</span>
          </div>
          <div className="h-4 w-px bg-slate-800" />
          <div>
            <span className="text-slate-400">Active Agents:</span>
            <span className="font-semibold text-indigo-400 ml-1.5">{telemetry.activeAgents} / 6</span>
          </div>
          <div className="h-4 w-px bg-slate-800" />
          <div>
            <span className="text-slate-400">Pending HITL Gates:</span>
            <span className={`font-semibold ml-1.5 ${telemetry.pendingApprovalsCount > 0 ? 'text-amber-400 animate-bounce' : 'text-slate-200'}`}>
              {telemetry.pendingApprovalsCount}
            </span>
          </div>
          <div className="h-4 w-px bg-slate-800" />
          <div>
            <span className="text-slate-400">MTD Spend:</span>
            <span className="font-semibold text-purple-400 ml-1.5">{budget.spentThisMonthSar} SAR</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 px-6 bg-slate-900 border-b border-slate-800 overflow-x-auto text-xs">
        {[
          { id: 'FLEET_DAG', labelEn: 'Agent Fleet & DAG', labelAr: 'الأسطول ومخطط DAG', icon: Bot },
          { id: 'WORKFLOWS', labelEn: 'Autonomous Workflows', labelAr: 'التدفقات الذاتية', icon: Workflow, badge: '5 Core' },
          { id: 'APPROVAL_GATES', labelEn: 'Human Approval Gates', labelAr: 'بوابات الموافقة البشرية', icon: CheckCircle2, count: telemetry.pendingApprovalsCount },
          { id: 'TOOL_MARKETPLACE', labelEn: 'Tool Marketplace', labelAr: 'سوق الأدوات والموصلات', icon: Layers, badge: `${tools.length} Tools` },
          { id: 'KNOWLEDGE_GRAPH', labelEn: 'Knowledge Graph', labelAr: 'الرسم البياني للمعرفة', icon: Share2 },
          { id: 'GOVERNANCE', labelEn: 'Governance & Merkle Audit', labelAr: 'الحوكمة وسلسلة التدقيق', icon: Lock },
          { id: 'EVALUATION', labelEn: 'AI Evaluation & Benchmarks', labelAr: 'التقييم ومؤشرات الأداء', icon: Award, badge: 'Grade AAA' },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{isArabic ? tab.labelAr : tab.labelEn}</span>
              {tab.badge && (
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                  {tab.badge}
                </span>
              )}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Tab Views */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* ========================================================================= */}
        {/* TAB 1: FLEET & DAG ORCHESTRATION                                         */}
        {/* ========================================================================= */}
        {activeTab === 'FLEET_DAG' && (
          <div className="space-y-6">
            {/* Fleet Cards */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-indigo-400" />
                  {isArabic ? 'أسطول الوكلاء المتخصصين الستة (The 6-Agent Fleet)' : 'The 6 Autonomous Specialized Agent Personas'}
                </h3>
                <span className="text-xs text-slate-500">Autonomous Concurrency Cap: 130 parallel tasks</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fleet.map(agent => {
                  const colors = roleColors[agent.role];
                  return (
                    <div
                      key={agent.id}
                      className={`p-4 rounded-xl border ${colors.border} ${colors.bg} backdrop-blur-sm relative overflow-hidden`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg bg-slate-900 border ${colors.border} flex items-center justify-center font-bold text-xs ${colors.text}`}>
                            {agent.role.slice(0, 3)}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-100">{agent.name}</h4>
                            <p className="text-[11px] text-slate-400">{agent.nameAr}</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 text-emerald-400 border border-slate-800 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {agent.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 mt-2.5 line-clamp-2 leading-relaxed">
                        {agent.description}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-1">
                        {agent.capabilities.map((c, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-900/60 text-slate-400 border border-slate-800">
                            {c}
                          </span>
                        ))}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-3 text-center text-xs">
                        <div>
                          <p className="text-[10px] text-slate-400">Completed</p>
                          <p className="font-semibold text-slate-200 mt-0.5">{agent.tasksCompleted}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400">Avg Latency</p>
                          <p className="font-semibold text-indigo-400 mt-0.5">{agent.avgLatencyMs}ms</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400">Accuracy</p>
                          <p className="font-semibold text-emerald-400 mt-0.5">{agent.accuracyScore}%</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Agent-to-Agent Communication Envelope Stream */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  {isArabic ? 'سجل بروتوكول التواصل الآني بين الوكلاء (Agent-to-Agent Protocol)' : 'Real-time Agent-to-Agent Message Envelope Stream'}
                </h3>
                <span className="text-xs text-slate-500 font-mono">Zero-Trust Encrypted Envelope v1.2</span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto font-mono text-xs">
                {messages.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">No recent messages recorded</p>
                ) : (
                  messages.map(msg => (
                    <div key={msg.messageId} className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-500">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${roleColors[msg.senderRole].bg} ${roleColors[msg.senderRole].text}`}>
                            {msg.senderRole}
                          </span>
                          <span className="text-slate-500">➔</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${roleColors[msg.recipientRole].bg} ${roleColors[msg.recipientRole].text}`}>
                            {msg.recipientRole}
                          </span>
                        </div>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-amber-300 border border-slate-700">
                          {msg.intent}
                        </span>
                        <span className="text-slate-300 truncate max-w-md">
                          {JSON.stringify(msg.payload)}
                        </span>
                      </div>
                      <span className="text-[10px] text-indigo-400/70">{msg.signature}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: AUTONOMOUS WORKFLOWS                                              */}
        {/* ========================================================================= */}
        {activeTab === 'WORKFLOWS' && (
          <div className="space-y-6">
            {/* Workflow Category Selector */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { id: 'INVENTORY', title: '1. Inventory Auto-Order', icon: Package, desc: 'Safety stock & POs' },
                { id: 'MATCHING', title: '2. 3-Way Matching', icon: ShoppingCart, desc: 'PO vs GRN vs Invoice' },
                { id: 'SCHEDULING', title: '3. Smart Staff Rosters', icon: Users, desc: 'Labor Law & Saudization' },
                { id: 'MARKETING', title: '4. Campaign Automation', icon: Send, desc: 'RFM & Margin-safe SMS' },
                { id: 'FINANCE', title: '5. Daily Financial Close', icon: DollarSign, desc: 'POS, ZATCA & Bank match' },
              ].map(w => {
                const Icon = w.icon;
                const isSelected = activeWfCategory === w.id;
                return (
                  <button
                    key={w.id}
                    onClick={() => setActiveWfCategory(w.id as any)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/40 ring-1 ring-indigo-500/50'
                        : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/40 text-slate-400'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <p className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>{w.title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{w.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* Workflow Runner & DAG Execution Visualization */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Workflow className="w-4 h-4 text-indigo-400" />
                    {activeWfCategory === 'INVENTORY' && 'Autonomous Multi-Branch Inventory Auto-Ordering Pipeline'}
                    {activeWfCategory === 'MATCHING' && 'Automatic Purchase Order 3-Way Reconciliation & Discrepancy Auditor'}
                    {activeWfCategory === 'SCHEDULING' && 'Predictive Footfall Staff Scheduling & Saudi Labor Law Articles 84/85'}
                    {activeWfCategory === 'MARKETING' && 'RFM Segment Campaign Automation & Margin-Safe Promo Dispatch'}
                    {activeWfCategory === 'FINANCE' && 'End-of-Day POS, ZATCA Phase 2 & SAMA Mada Automated Financial Closing'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Coordinated via Planner, Executor, Reviewer, Validator, Critic, and Supervisor DAG execution engine.
                  </p>
                </div>
                <button
                  onClick={() => handleRunWorkflow(activeWfCategory)}
                  disabled={wfLoading}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
                >
                  {wfLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  <span>{wfLoading ? 'Executing Multi-Agent DAG...' : 'Trigger Autonomous Execution'}</span>
                </button>
              </div>

              {/* Dynamic Results Display */}
              <div className="mt-5">
                {activeWfCategory === 'INVENTORY' && (
                  <div className="space-y-4">
                    {invResult ? (
                      <div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                            <p className="text-[10px] text-slate-400">SKUs Analyzed</p>
                            <p className="text-lg font-bold text-white mt-0.5">{invResult.itemsAnalyzedCount}</p>
                          </div>
                          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                            <p className="text-[10px] text-slate-400">POs Generated</p>
                            <p className="text-lg font-bold text-indigo-400 mt-0.5">{invResult.generatedPurchaseOrders.length}</p>
                          </div>
                          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                            <p className="text-[10px] text-slate-400">Total Value (SAR)</p>
                            <p className="text-lg font-bold text-purple-400 mt-0.5">{invResult.totalOrderValueSar.toFixed(2)} SAR</p>
                          </div>
                          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                            <p className="text-[10px] text-slate-400">Stockout Avoidance</p>
                            <p className="text-lg font-bold text-emerald-400 mt-0.5">+{invResult.projectedStockoutAvoidanceHours}h</p>
                          </div>
                        </div>

                        <div className="border border-slate-800 rounded-lg overflow-hidden text-xs">
                          <table className="w-full text-left">
                            <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase font-mono">
                              <tr>
                                <th className="p-2.5">SKU & Item Name</th>
                                <th className="p-2.5">Current Stock</th>
                                <th className="p-2.5">Reorder Qty</th>
                                <th className="p-2.5">Cost (SAR)</th>
                                <th className="p-2.5">Supplier</th>
                                <th className="p-2.5">Urgency</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 font-medium">
                              {invResult.itemsNeedingReorder.map(item => (
                                <tr key={item.itemId} className="hover:bg-slate-800/30">
                                  <td className="p-2.5 font-bold text-slate-200">{item.itemName}</td>
                                  <td className="p-2.5 text-rose-400 font-mono">{item.currentStock}</td>
                                  <td className="p-2.5 text-indigo-400 font-mono">+{item.recommendedOrderQty}</td>
                                  <td className="p-2.5 text-slate-300 font-mono">{item.totalCostSar.toFixed(2)} SAR</td>
                                  <td className="p-2.5 text-slate-400">{item.supplierName}</td>
                                  <td className="p-2.5">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.urgency === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'}`}>
                                      {item.urgency}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-slate-500 text-xs">
                        Click "Trigger Autonomous Execution" to run the Multi-Agent Inventory Auto-Ordering workflow.
                      </div>
                    )}
                  </div>
                )}

                {activeWfCategory === 'MATCHING' && (
                  <div className="space-y-4">
                    {matchResult ? (
                      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                          <span className="font-bold text-slate-200">Reconciliation Match Status:</span>
                          <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                            {matchResult.matchStatus}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <p className="text-[10px] text-slate-500">Purchase Order</p>
                            <p className="font-bold text-slate-200">{matchResult.poNumber}</p>
                            <p className="text-slate-400 font-mono">{matchResult.poAmountSar.toFixed(2)} SAR</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-500">Goods Received (GRN)</p>
                            <p className="font-bold text-slate-200">{matchResult.grnNumber}</p>
                            <p className="text-slate-400 font-mono">{matchResult.grnAmountSar.toFixed(2)} SAR</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-500">Supplier Invoice</p>
                            <p className="font-bold text-slate-200">{matchResult.invoiceId}</p>
                            <p className="text-slate-400 font-mono">{matchResult.invoiceAmountSar.toFixed(2)} SAR</p>
                          </div>
                        </div>
                        <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-800/40 text-emerald-300">
                          Zero discrepancy detected. Autonomous payment voucher dispatched to Accounts Payable.
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-slate-500 text-xs">
                        Click "Trigger Autonomous Execution" to run 3-Way Matching reconciliation.
                      </div>
                    )}
                  </div>
                )}

                {activeWfCategory === 'SCHEDULING' && (
                  <div className="space-y-4">
                    {schedResult ? (
                      <div>
                        <div className="grid grid-cols-3 gap-3 mb-4 text-xs">
                          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                            <p className="text-[10px] text-slate-400">Total Labor Hours</p>
                            <p className="text-lg font-bold text-white mt-0.5">{schedResult.totalLaborHours} hrs</p>
                          </div>
                          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                            <p className="text-[10px] text-slate-400">Labor Cost %</p>
                            <p className="text-lg font-bold text-emerald-400 mt-0.5">{schedResult.projectedLaborCostPercentage}% (Target: {schedResult.targetLaborCostPercentage}%)</p>
                          </div>
                          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                            <p className="text-[10px] text-slate-400">Nitaqat Saudization</p>
                            <p className="text-lg font-bold text-indigo-400 mt-0.5">{schedResult.complianceCheck.currentSaudizationPct}% (Target: {schedResult.complianceCheck.targetSaudizationPct}%)</p>
                          </div>
                        </div>

                        <div className="border border-slate-800 rounded-lg overflow-hidden text-xs">
                          <table className="w-full text-left">
                            <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase font-mono">
                              <tr>
                                <th className="p-2.5">Employee</th>
                                <th className="p-2.5">Designated Role</th>
                                <th className="p-2.5">Shift Window</th>
                                <th className="p-2.5">Daily Hours</th>
                                <th className="p-2.5">Labor Law Compliance</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 font-medium">
                              {schedResult.shiftsGenerated.map(shift => (
                                <tr key={shift.shiftId} className="hover:bg-slate-800/30">
                                  <td className="p-2.5 font-bold text-slate-200">{shift.employeeName}</td>
                                  <td className="p-2.5 text-slate-300">{shift.role}</td>
                                  <td className="p-2.5 text-indigo-400 font-mono">{shift.startTime} - {shift.endTime}</td>
                                  <td className="p-2.5 text-slate-300 font-mono">{shift.totalHours} hrs</td>
                                  <td className="p-2.5">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 flex items-center gap-1 w-fit">
                                      <Check className="w-3 h-3" /> Articles 84/85 PASS
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-slate-500 text-xs">
                        Click "Trigger Autonomous Execution" to run the Smart Staff Scheduling engine.
                      </div>
                    )}
                  </div>
                )}

                {activeWfCategory === 'MARKETING' && (
                  <div className="space-y-4">
                    {mktResult ? (
                      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                          <div>
                            <span className="font-bold text-slate-200">{mktResult.campaignName}</span>
                            <p className="text-[10px] text-slate-500">Target Segment: {mktResult.targetSegment} ({mktResult.targetAudienceCount} diners)</p>
                          </div>
                          <span className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                            {mktResult.channel}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[10px] text-slate-400">Offer Value</p>
                            <p className="font-semibold text-slate-200">{mktResult.offerValue}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400">Projected GMV Uplift</p>
                            <p className="font-semibold text-emerald-400 font-mono">+{mktResult.projectedUpliftGmvSar.toLocaleString()} SAR</p>
                          </div>
                        </div>
                        <div className="p-2.5 rounded bg-indigo-950/30 border border-indigo-800/40 text-indigo-300 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-indigo-400" /> Margin safety guardrail verified: Food cost remains under 28% with discount.
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-slate-500 text-xs">
                        Click "Trigger Autonomous Execution" to test the Marketing Campaign Automation pipeline.
                      </div>
                    )}
                  </div>
                )}

                {activeWfCategory === 'FINANCE' && (
                  <div className="space-y-4">
                    {finResult ? (
                      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                          <span className="font-bold text-slate-200">Reconciliation & E-Invoicing Result:</span>
                          <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> {finResult.reconciliationStatus}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <p className="text-[10px] text-slate-400">POS Gross Sales</p>
                            <p className="font-bold text-white font-mono">{finResult.totalPosGrossSalesSar.toFixed(2)} SAR</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400">ZATCA Reported</p>
                            <p className="font-bold text-indigo-400 font-mono">{finResult.zatcaReportedSalesSar.toFixed(2)} SAR</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400">VAT 15% Collected</p>
                            <p className="font-bold text-purple-400 font-mono">{finResult.vatCollectedSar.toFixed(2)} SAR</p>
                          </div>
                        </div>
                        <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Generated {finResult.glEntriesGeneratedCount} double-entry General Ledger journal vouchers with 100% SAMA Mada bank match.
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-slate-500 text-xs">
                        Click "Trigger Autonomous Execution" to run the Financial Closing Assistant.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: HUMAN APPROVAL GATES (HITL)                                       */}
        {/* ========================================================================= */}
        {activeTab === 'APPROVAL_GATES' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  {isArabic ? 'صندوق بوابات الموافقة البشرية (Human-in-the-Loop Gates)' : 'Human-in-the-Loop (HITL) Authorization Inbox'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  High-risk operations and financial mutations exceeding OPA policy thresholds require executive authorization.
                </p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                Total Gates: {approvalGates.length}
              </span>
            </div>

            <div className="space-y-3">
              {approvalGates.length === 0 ? (
                <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-500 text-xs">
                  No active or pending human approval gates at this time.
                </div>
              ) : (
                approvalGates.map(gate => {
                  const isPending = gate.status === 'PENDING';
                  return (
                    <div
                      key={gate.gateId}
                      className={`p-4 rounded-xl border transition-all ${
                        isPending
                          ? 'bg-slate-900/90 border-amber-500/40 shadow-lg shadow-amber-500/5'
                          : 'bg-slate-950 border-slate-800 opacity-80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              {gate.riskLevel} RISK
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                              {gate.policyTriggered}
                            </span>
                            <span className="text-xs font-bold text-white">{gate.actionTitle}</span>
                          </div>
                          <p className="text-xs text-slate-300">{gate.actionSummary}</p>
                          <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                            <span>Requested by: <strong className="text-indigo-400">{gate.requestedByAgent}</strong></span>
                            <span>Required Role: <strong className="text-slate-300">{gate.requiredRole}</strong></span>
                            {gate.financialImpactSar && (
                              <span>Financial Impact: <strong className="text-purple-400 font-mono">{gate.financialImpactSar.toLocaleString()} SAR</strong></span>
                            )}
                          </div>
                        </div>

                        {isPending ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedGate(gate);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                            >
                              <Check className="w-3.5 h-3.5" /> Authorize
                            </button>
                            <button
                              onClick={() => handleDecideGate(gate.gateId, 'REJECTED')}
                              className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1.5"
                            >
                              <X className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        ) : (
                          <div className="text-right">
                            <span className={`px-2.5 py-1 rounded text-xs font-bold ${gate.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                              {gate.status}
                            </span>
                            {gate.decidedByUserName && (
                              <p className="text-[10px] text-slate-500 mt-1">By {gate.decidedByUserName}</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Payload Snapshot Drawer */}
                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-mono">Payload: {JSON.stringify(gate.payloadSnapshot)}</span>
                        <span className="text-slate-500">{new Date(gate.requestedAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Authorize Modal */}
            {selectedGate && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      Authorize Human Approval Gate
                    </h3>
                    <button onClick={() => setSelectedGate(null)} className="text-slate-400 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <p className="font-bold text-slate-200">{selectedGate.actionTitle}</p>
                    <p className="text-slate-400">{selectedGate.actionSummary}</p>
                    <p className="text-purple-400 font-mono">Total Impact: {selectedGate.financialImpactSar?.toLocaleString()} SAR</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Audit Remarks & Authorizer Notes:
                    </label>
                    <textarea
                      value={approvalNotes}
                      onChange={e => setApprovalNotes(e.target.value)}
                      placeholder="e.g. Authorized for Olaya weekend rush stock readiness..."
                      className="w-full h-20 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => setSelectedGate(null)}
                      className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDecideGate(selectedGate.gateId, 'APPROVED')}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30"
                    >
                      <Check className="w-4 h-4" /> Confirm & Resume DAG
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: TOOL MARKETPLACE                                                  */}
        {/* ========================================================================= */}
        {activeTab === 'TOOL_MARKETPLACE' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  {isArabic ? 'سوق الأدوات والموصلات المؤسسية (Enterprise Tool Registry)' : 'Enterprise Tool Marketplace & Sandbox Runner'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sandboxed connectors for ZATCA Phase 2 XML, General Ledger ERP, Saudi Labor Law, and RFM Segmentation.
                </p>
              </div>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.map(tool => (
                <div
                  key={tool.toolId}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {tool.category}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">v{tool.version}</span>
                    </div>
                    <h4 className="text-xs font-bold text-white">{tool.name}</h4>
                    <p className="text-[11px] text-slate-400">{tool.nameAr}</p>
                    <p className="text-xs text-slate-300 leading-relaxed">{tool.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">Avg {tool.avgExecutionMs}ms • {tool.usageCount} runs</span>
                    <button
                      onClick={() => {
                        setSelectedTool(tool);
                        setToolParamsInput(JSON.stringify(tool.parameters.reduce((acc, p) => ({ ...acc, [p.name]: p.defaultValue || 'sample_value' }), {}), null, 2));
                        setToolOutput(null);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" /> Test Sandbox
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Tool Sandbox Runner Modal */}
            {selectedTool && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Play className="w-4 h-4 text-indigo-400" />
                        Execute Tool Sandbox: {selectedTool.name}
                      </h3>
                      <p className="text-[11px] text-slate-400">{selectedTool.category} • Required Permission: {selectedTool.requiredPermission}</p>
                    </div>
                    <button onClick={() => setSelectedTool(null)} className="text-slate-400 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Input JSON Parameters:
                    </label>
                    <textarea
                      value={toolParamsInput}
                      onChange={e => setToolParamsInput(e.target.value)}
                      rows={5}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono text-xs text-indigo-300 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={handleExecuteTool}
                      disabled={toolExecuting}
                      className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2"
                    >
                      {toolExecuting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                      <span>{toolExecuting ? 'Executing in Sandbox...' : 'Run Tool'}</span>
                    </button>
                    <button
                      onClick={() => setSelectedTool(null)}
                      className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                    >
                      Close
                    </button>
                  </div>

                  {toolOutput && (
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 font-mono text-xs">
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>Execution Time: {toolOutput.executionTimeMs}ms</span>
                        <span>Audit Hash: {toolOutput.auditHash}</span>
                      </div>
                      <pre className="text-emerald-400 max-h-40 overflow-y-auto whitespace-pre-wrap">
                        {JSON.stringify(toolOutput.output, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: KNOWLEDGE GRAPH                                                   */}
        {/* ========================================================================= */}
        {activeTab === 'KNOWLEDGE_GRAPH' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-purple-400" />
                  {isArabic ? 'مستكشف الرسم البياني للمعرفة المؤسسية (Enterprise Knowledge Graph)' : 'Enterprise Knowledge Graph & Semantic Ontology'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Semantic traversal across Branches, Recipes, Ingredients, Suppliers, Employees, and ZATCA Regulations.
                </p>
              </div>
            </div>

            {/* Search Input */}
            <form onSubmit={handleKgQuery} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={kgSearch}
                  onChange={e => setKgSearch(e.target.value)}
                  placeholder="Search Knowledge Graph (e.g. Wagyu, Olaya, Almarai, ZATCA, Saudi Labor Law)..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-purple-600/20"
              >
                <Search className="w-3.5 h-3.5" /> Semantic Traverse
              </button>
            </form>

            {/* Graph Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {kgResult.insights.map((insight, i) => (
                <div key={i} className="p-3 bg-purple-950/20 border border-purple-900/30 rounded-xl text-xs text-purple-300">
                  {insight}
                </div>
              ))}
            </div>

            {/* Matched Entities & Semantic Relationships */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nodes */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Entity Nodes Discovered ({kgResult.nodesFound.length})
                </h4>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {kgResult.nodesFound.map(node => (
                    <div key={node.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-purple-300">
                          {node.type}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500">{node.id}</span>
                      </div>
                      <p className="font-bold text-slate-100 mt-1">{node.label}</p>
                      <p className="text-[11px] text-slate-400">{node.labelAr}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-1">{JSON.stringify(node.properties)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Edges */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Semantic Edges & Traversal Paths ({kgResult.edgesFound.length})
                </h4>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {kgResult.edgesFound.map(edge => (
                    <div key={edge.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs flex items-center justify-between">
                      <div>
                        <span className="text-indigo-400 font-mono text-[11px]">{edge.sourceId}</span>
                        <span className="mx-2 px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-amber-300 font-bold">
                          --[{edge.type}]--&gt;
                        </span>
                        <span className="text-purple-400 font-mono text-[11px]">{edge.targetId}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Weight {edge.weight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: GOVERNANCE & MERKLE AUDIT                                         */}
        {/* ========================================================================= */}
        {activeTab === 'GOVERNANCE' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  {isArabic ? 'مركز حوكمة الذكاء الاصطناعي وسلسلة تدقيق ميركل المشفرة' : 'AI Governance Center & Merkle-Chained Audit Trail'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Zero-trust Open Policy Agent (OPA) guardrails, statutory compliance verification, and SHA-256 cryptographic audit chain.
                </p>
              </div>
            </div>

            {/* Active Policy Rules */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Autonomous Action Governance Guardrails
              </h4>
              <div className="space-y-2">
                {policies.map(policy => (
                  <div key={policy.ruleId} className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-indigo-300">
                          {policy.category}
                        </span>
                        <span className="font-bold text-white">{policy.ruleName}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{policy.ruleNameAr}</p>
                      <code className="text-[10px] text-emerald-400 font-mono">{policy.conditionStatement}</code>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${policy.severity === 'BLOCKING' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'}`}>
                        {policy.severity}
                      </span>
                      <button
                        onClick={() => handleTogglePolicy(policy.ruleId)}
                        className={`px-3 py-1 rounded text-xs font-bold transition-colors ${policy.isActive ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-500'}`}
                      >
                        {policy.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Merkle Cryptographic Audit Chain */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  SHA-256 Merkle-Linked Cryptographic Ledger (Zero-Tampering Guarantee)
                </h4>
                <span className="text-[10px] font-mono text-emerald-400">Chain Height: {auditChain.length} Blocks</span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto font-mono text-xs">
                {auditChain.map(block => (
                  <div key={block.blockIndex} className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-indigo-400 font-bold">Block #{block.blockIndex} • [{block.agentRole}]</span>
                      <span className="text-slate-500">{new Date(block.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-200 font-sans text-xs">{block.actionTaken}</p>
                    <div className="text-[10px] text-slate-500 truncate">
                      <span>Prev: {block.previousHash.slice(0, 24)}...</span> | <span className="text-purple-400">Hash: {block.blockHash.slice(0, 24)}...</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: AI EVALUATION & BENCHMARKS                                         */}
        {/* ========================================================================= */}
        {activeTab === 'EVALUATION' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  {isArabic ? 'إطار تقييم واختبار نماذج الذكاء الاصطناعي (AI Evaluation Suite)' : 'AI Evaluation Framework & Production Benchmark Suite'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Multi-dimensional benchmarking covering Accuracy, Hallucination Index, Safety, Cost, and Latency.
                </p>
              </div>
              <button
                onClick={handleRunEvaluation}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30"
              >
                <RefreshCw className="w-4 h-4" /> Run Live Benchmark Suite
              </button>
            </div>

            {/* Scorecard Hero */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/50 border border-indigo-900/40 grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
              <div>
                <p className="text-[10px] text-slate-400">Certification Grade</p>
                <p className="text-2xl font-black text-emerald-400 mt-1">Grade {evalReport.overallCertificationGrade}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Accuracy Rate</p>
                <p className="text-2xl font-black text-white mt-1">{evalReport.accuracyScorePct}%</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Hallucination Index</p>
                <p className="text-2xl font-black text-emerald-400 mt-1">{evalReport.hallucinationRatePct}%</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Safety & Defense</p>
                <p className="text-2xl font-black text-indigo-400 mt-1">{evalReport.safetyScorePct}%</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">P50 / P99 Latency</p>
                <p className="text-2xl font-black text-purple-400 mt-1">{evalReport.p50LatencyMs} / {evalReport.p99LatencyMs}ms</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Cost / 1k Tokens</p>
                <p className="text-2xl font-black text-slate-200 mt-1">{evalReport.costPer1kTokensSar} SAR</p>
              </div>
            </div>

            {/* Benchmark Metrics Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {evalReport.metrics.map((metric, i) => (
                <div key={i} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-indigo-300">
                      {metric.category}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {metric.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm">{metric.metricName}</h4>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-400">Target SLA: {metric.targetScore} {metric.unit}</span>
                    <span className="font-bold text-emerald-400 font-mono text-sm">Achieved: {metric.achievedScore} {metric.unit}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">{metric.benchmarkDetails}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
