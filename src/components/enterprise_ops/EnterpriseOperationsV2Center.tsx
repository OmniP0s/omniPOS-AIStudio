// ============================================================================
// ENTERPRISE OPERATIONS & VERSION 2.0 RELEASE CENTER
// Sprint 5.0 / Version 2.0 Enterprise Operations
// 10 Interactive Pillars Suite
// ============================================================================

import React, { useState, useEffect } from 'react';
import { enterpriseOps } from '../../domain/enterprise_ops/enterpriseOpsFacade';
import {
  Rocket,
  ArrowRightLeft,
  HeartHandshake,
  Headphones,
  Sliders,
  LineChart,
  Activity,
  ShieldAlert,
  CheckCircle2,
  FileCode2,
  Sparkles,
  Server,
  Database,
  Cpu,
  Layers,
  Award,
  Play,
  RotateCcw,
  Check,
  AlertTriangle,
  RefreshCw,
  Terminal,
  ShieldCheck,
  Zap,
  Clock,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Radio,
  FileCheck,
  Download,
  Key,
  Flame,
  Globe,
  Wifi,
  Bot,
  HelpCircle,
} from 'lucide-react';

interface EnterpriseOperationsV2CenterProps {
  isArabic: boolean;
}

export type OpsTab =
  | 'ONBOARDING'
  | 'MIGRATION'
  | 'CUSTOMER_SUCCESS'
  | 'SUPPORT_DIAGNOSTICS'
  | 'RELEASE_OPS'
  | 'OBSERVABILITY'
  | 'MONITORING_SLA'
  | 'BUSINESS_CONTINUITY'
  | 'PRODUCTION_VALIDATION'
  | 'V2_RELEASE_GA';

export const EnterpriseOperationsV2Center: React.FC<EnterpriseOperationsV2CenterProps> = ({ isArabic }) => {
  const [activeTab, setActiveTab] = useState<OpsTab>('ONBOARDING');
  const [systemSummary, setSystemSummary] = useState(() => enterpriseOps.getSystemSummary());
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Pillar 1: Onboarding State
  const [onboardingSteps, setOnboardingSteps] = useState(() => enterpriseOps.onboarding.getSteps());
  const [selectedPreset, setSelectedPreset] = useState<string>('preset-saudi-fine-dining');
  const [demoCompanies, setDemoCompanies] = useState(() => enterpriseOps.onboarding.getDemoCompanies());

  // Pillar 2: Migration State
  const [migrationJobs, setMigrationJobs] = useState(() => enterpriseOps.migration.getJobs());
  const [selectedSourcePlatform, setSelectedSourcePlatform] = useState<any>('FOODICS');
  const [isSimulatingMigration, setIsSimulatingMigration] = useState(false);

  // Pillar 3: Customer Success State
  const [healthReport, setHealthReport] = useState(() => enterpriseOps.customerSuccess.getHealthReport());
  const [tutorials, setTutorials] = useState(() => enterpriseOps.customerSuccess.getTutorials());
  const [adoptionStats] = useState(() => enterpriseOps.customerSuccess.getAdoptionAnalytics());
  const [recommendations] = useState(() => enterpriseOps.customerSuccess.getRecommendations());

  // Pillar 4: Support & Diagnostics State
  const [tickets, setTickets] = useState(() => enterpriseOps.support.getTickets());
  const [probes, setProbes] = useState(() => enterpriseOps.support.getDiagnosticProbes());
  const [logs] = useState(() => enterpriseOps.support.getLogs());
  const [aiSupportQuery, setAiSupportQuery] = useState('Kitchen printer spooler buffer timeout');
  const [aiSupportDiagnosis, setAiSupportDiagnosis] = useState<any>(null);

  // Pillar 5: Release Operations State
  const [canaries, setCanaries] = useState(() => enterpriseOps.releaseOps.getCanaries());
  const [featureToggles, setFeatureToggles] = useState(() => enterpriseOps.releaseOps.getFeatureToggles());
  const [rollbackSnapshots] = useState(() => enterpriseOps.releaseOps.getRollbackSnapshots());

  // Pillar 6: Observability State
  const [kpis, setKpis] = useState(() => enterpriseOps.observability.getTelemetry());
  const [funnelStages] = useState(() => enterpriseOps.observability.getFunnelStages());
  const [crashReports] = useState(() => enterpriseOps.observability.getCrashReports());
  const [sessionReplay] = useState(() => enterpriseOps.observability.getSessionReplay());
  const [currentReplayStep, setCurrentReplayStep] = useState(1);

  // Pillar 7: Monitoring State
  const [slaRecords] = useState(() => enterpriseOps.monitoring.getSlaRecords());
  const [tenantsOverview] = useState(() => enterpriseOps.monitoring.getTenantsOverview());
  const [multiRegionNodes] = useState(() => enterpriseOps.monitoring.getMultiRegionTelemetry());

  // Pillar 8: Continuity State
  const [backups] = useState(() => enterpriseOps.continuity.getBackups());
  const [drDrills, setDrDrills] = useState(() => enterpriseOps.continuity.getDrills());
  const [chaosReports] = useState(() => enterpriseOps.continuity.getChaosReports());
  const [isRunningDrill, setIsRunningDrill] = useState(false);

  // Pillar 9: Validation State
  const [e2eTests] = useState(() => enterpriseOps.validation.getE2EResults());
  const [penTests] = useState(() => enterpriseOps.validation.getPenTestFindings());
  const [loadBenchmark] = useState(() => enterpriseOps.validation.getLoadBenchmark());
  const [readinessChecklist] = useState(() => enterpriseOps.validation.getChecklist());

  // Pillar 10: V2 Release State
  const [docs] = useState(() => enterpriseOps.v2Release.getDocumentation());
  const [selectedDocId, setSelectedDocId] = useState('doc-arch-overview');
  const [changelog] = useState(() => enterpriseOps.v2Release.getChangelog());
  const [releaseManifest] = useState(() => enterpriseOps.v2Release.getSignedManifest());

  // Periodic telemetry refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setKpis(enterpriseOps.observability.getTelemetry());
      setSystemSummary(enterpriseOps.getSystemSummary());
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleSeedData = (presetId: string) => {
    const res = enterpriseOps.onboarding.seedSampleData(presetId);
    showFeedback(isArabic ? res.messageAr : res.messageEn);
  };

  const handleActivateDemo = (companyId: string) => {
    const comp = enterpriseOps.onboarding.activateDemoCompany(companyId);
    if (comp) {
      setDemoCompanies([...enterpriseOps.onboarding.getDemoCompanies()]);
      showFeedback(
        isArabic
          ? `تم تفعيل بيئة المحاكاة لـ ${comp.nameAr} بنجاح`
          : `Activated sandbox environment for ${comp.nameEn}`
      );
    }
  };

  const handleRunMigrationDryRun = () => {
    setIsSimulatingMigration(true);
    const newJob = enterpriseOps.migration.createMigrationJob(
      selectedSourcePlatform,
      'tenant-omnipos-sa',
      `${selectedSourcePlatform.toLowerCase()}_production_export.json`,
      12890400,
      2840
    );
    setTimeout(() => {
      const res = enterpriseOps.migration.runDryRunSimulation(newJob.jobId);
      setIsSimulatingMigration(false);
      setMigrationJobs([...enterpriseOps.migration.getJobs()]);
      showFeedback(
        isArabic
          ? `اكتمل الفحص التجريبي لـ ${res.job.totalRecords} سجل بدون أي أخطاء حرجة`
          : `Dry-run simulation completed for ${res.job.totalRecords} records with 0 fatal errors.`
      );
    }, 1200);
  };

  const handleExecuteImport = (jobId: string) => {
    const res = enterpriseOps.migration.executeImport(jobId);
    setMigrationJobs([...enterpriseOps.migration.getJobs()]);
    showFeedback(
      isArabic
        ? `تم استيراد ${res.successfulRecords} سجل بنجاح وإنشاء لقطة التراجع`
        : `Successfully imported ${res.successfulRecords} records and created rollback snapshot.`
    );
  };

  const handleRollbackMigration = (jobId: string) => {
    const res = enterpriseOps.migration.rollbackMigration(jobId);
    setMigrationJobs([...enterpriseOps.migration.getJobs()]);
    showFeedback(isArabic ? res.messageAr : res.messageEn);
  };

  const handleProbeDevice = (deviceId: string) => {
    const updated = enterpriseOps.support.runProbeHealthCheck(deviceId);
    setProbes([...enterpriseOps.support.getDiagnosticProbes()]);
    showFeedback(
      isArabic
        ? `تم فحص الجهاز بنجاح: زمن الاستجابة ${updated?.pingLatencyMs}ms`
        : `Device probe completed: ping latency ${updated?.pingLatencyMs}ms`
    );
  };

  const handleQueryAiSupport = () => {
    const res = enterpriseOps.support.queryAiAssistant(aiSupportQuery);
    setAiSupportDiagnosis(res);
  };

  const handleSetCanaryTraffic = (releaseId: string, weight: number) => {
    const updated = enterpriseOps.releaseOps.setCanaryTraffic(releaseId, weight);
    setCanaries([...enterpriseOps.releaseOps.getCanaries()]);
    showFeedback(
      isArabic
        ? `تم ضبط نسبة حركة المرور لـ Canary على ${weight}%`
        : `Adjusted Canary traffic weight to ${weight}%`
    );
  };

  const handleToggleFeature = (toggleId: string, current: boolean) => {
    enterpriseOps.releaseOps.toggleFeature(toggleId, !current);
    setFeatureToggles([...enterpriseOps.releaseOps.getFeatureToggles()]);
  };

  const handleKillSwitch = (toggleId: string) => {
    enterpriseOps.releaseOps.engageKillSwitch(toggleId);
    setFeatureToggles([...enterpriseOps.releaseOps.getFeatureToggles()]);
    showFeedback(
      isArabic
        ? 'تم تفعيل زر الإيقاف الطارئ (Kill Switch) بنجاح'
        : 'Emergency Kill-Switch engaged successfully.'
    );
  };

  const handleTriggerRollback = (snapshotId: string) => {
    const res = enterpriseOps.releaseOps.triggerInstantRollback(snapshotId);
    showFeedback(isArabic ? res.messageAr : res.messageEn);
  };

  const handleRunDrDrill = (scenario: any) => {
    setIsRunningDrill(true);
    setTimeout(() => {
      const drill = enterpriseOps.continuity.runLiveDisasterRecoveryDrill(scenario);
      setIsRunningDrill(false);
      setDrDrills([...enterpriseOps.continuity.getDrills()]);
      showFeedback(isArabic ? drill.findingsAr : drill.findingsEn);
    }, 1500);
  };

  const tabs: { id: OpsTab; labelEn: string; labelAr: string; icon: any; badge?: string }[] = [
    { id: 'ONBOARDING', labelEn: '1. Onboarding & Demo', labelAr: '1. التهيئة والمحاكاة', icon: Rocket, badge: 'Wizard' },
    { id: 'MIGRATION', labelEn: '2. Data Migration', labelAr: '2. ترحيل البيانات', icon: ArrowRightLeft, badge: 'Foodics/Oracle/SAP' },
    { id: 'CUSTOMER_SUCCESS', labelEn: '3. Customer Success', labelAr: '3. نجاح العملاء', icon: HeartHandshake, badge: 'Health 98' },
    { id: 'SUPPORT_DIAGNOSTICS', labelEn: '4. Support & Telemetry', labelAr: '4. الدعم والتشخيص', icon: Headphones, badge: 'AI Assistant' },
    { id: 'RELEASE_OPS', labelEn: '5. Release Ops & Rollouts', labelAr: '5. إدارة الإطلاقات', icon: Sliders, badge: 'Canary' },
    { id: 'OBSERVABILITY', labelEn: '6. Observability 2.0', labelAr: '6. المراقبة والتحليلات', icon: LineChart, badge: 'Funnels & Replay' },
    { id: 'MONITORING_SLA', labelEn: '7. Monitoring & 99.999% SLA', labelAr: '7. الأداء واتفاقية 99.999%', icon: Activity, badge: 'Five-Nines' },
    { id: 'BUSINESS_CONTINUITY', labelEn: '8. Continuity & DR', labelAr: '8. التعافي واستمرارية العمل', icon: ShieldAlert, badge: 'RTO < 2.5s' },
    { id: 'PRODUCTION_VALIDATION', labelEn: '9. Production Validation', labelAr: '9. الاعتماد الإنتاجي', icon: CheckCircle2, badge: '50K RPS' },
    { id: 'V2_RELEASE_GA', labelEn: '10. Version 2.0 GA Release', labelAr: '10. إطلاق الإصدار 2.0 GA', icon: Award, badge: 'Signed Gold' },
  ];

  const selectedDoc = docs.find((d) => d.id === selectedDocId) || docs[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Toast Feedback Notification */}
      {actionFeedback && (
        <div className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 z-50 bg-indigo-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-indigo-400 animate-in fade-in slide-in-from-bottom duration-200">
          <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          <span className="font-semibold text-sm">{actionFeedback}</span>
        </div>
      )}

      {/* Top Banner & Operational Command Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white tracking-tight">
                  {isArabic ? 'منصة العمليات والإطلاق المؤسسي 2.0' : 'Enterprise Operations & Version 2.0 Release Center'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  v2.0.0-GA
                </span>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  99.999% SLA
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isArabic
                  ? 'مركز القيادة المتكامل للتهيئة، ترحيل البيانات، الدعم الذكي، إدارة الإطلاقات، والمراقبة الحية'
                  : 'Mission-critical cockpit for onboarding, data migrations, AI support, release rollouts & Five-Nines monitoring'}
              </p>
            </div>
          </div>

          {/* Quick Real-Time Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:w-auto">
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-2 text-center">
              <div className="text-[10px] text-slate-400 font-medium">
                {isArabic ? 'حالة التوفر SLA' : 'Uptime SLA'}
              </div>
              <div className="text-sm font-black text-emerald-400 font-mono">99.9998%</div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-2 text-center">
              <div className="text-[10px] text-slate-400 font-medium">
                {isArabic ? 'مؤشر الصحة' : 'Health Score'}
              </div>
              <div className="text-sm font-black text-indigo-400 font-mono">98 / 100</div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-2 text-center">
              <div className="text-[10px] text-slate-400 font-medium">
                {isArabic ? 'Canary التوزيع' : 'Canary Weight'}
              </div>
              <div className="text-sm font-black text-amber-400 font-mono">{canaries[0]?.trafficWeightPct}%</div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-2 text-center">
              <div className="text-[10px] text-slate-400 font-medium">
                {isArabic ? 'الاعتماد الإنتاجي' : 'GA Signoffs'}
              </div>
              <div className="text-sm font-black text-emerald-400 font-mono">4 / 4 Certified</div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Pillar Tabs */}
      <nav className="bg-slate-900/60 border-b border-slate-800 px-4 overflow-x-auto scrollbar-thin">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{isArabic ? tab.labelAr : tab.labelEn}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Tab Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* =========================================================================
            TAB 1: ONBOARDING & GUIDED SETUP & DEMO COMPANY
           ========================================================================= */}
        {activeTab === 'ONBOARDING' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Guided Setup Progress Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-indigo-400" />
                    {isArabic ? 'معالج التهيئة السريعة والإعداد الموجه' : 'First-Run Guided Onboarding Wizard'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {isArabic
                      ? 'خطوات الإعداد المؤسسي لربط السجل التجاري، هيئة الزكاة، الأجهزة، وقوائم الطعام'
                      : 'Enterprise setup pipeline for commercial registration, ZATCA tax, hardware pairing & menus'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right rtl:text-left">
                    <div className="text-xs text-slate-400">{isArabic ? 'نسبة الإنجاز' : 'Completion'}</div>
                    <div className="text-base font-black text-indigo-400 font-mono">
                      {enterpriseOps.onboarding.getCompletionPercentage()}%
                    </div>
                  </div>
                  <div className="w-28 h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                      style={{ width: `${enterpriseOps.onboarding.getCompletionPercentage()}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Steps Timeline Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {onboardingSteps.map((step) => (
                  <div
                    key={step.id}
                    className={`border rounded-xl p-4 transition-all ${
                      step.status === 'COMPLETED'
                        ? 'bg-emerald-950/20 border-emerald-700/50 text-emerald-100'
                        : step.status === 'IN_PROGRESS'
                        ? 'bg-indigo-950/20 border-indigo-600/60 text-indigo-100'
                        : 'bg-slate-800/40 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 text-xs font-mono font-bold flex items-center justify-center">
                        {step.stepNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          step.status === 'COMPLETED'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : step.status === 'IN_PROGRESS'
                            ? 'bg-indigo-500/20 text-indigo-300'
                            : 'bg-slate-700/50 text-slate-400'
                        }`}
                      >
                        {step.status}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-white mb-1">
                      {isArabic ? step.titleAr : step.titleEn}
                    </h3>
                    <p className="text-[11px] opacity-80 line-clamp-2 mb-3">
                      {isArabic ? step.descriptionAr : step.descriptionEn}
                    </p>
                    {step.completionData && (
                      <div className="text-[10px] font-mono bg-slate-950/60 p-2 rounded-lg border border-slate-800 text-slate-300">
                        {Object.entries(step.completionData).map(([k, v]) => (
                          <div key={k} className="flex justify-between">
                            <span className="opacity-60">{k}:</span>
                            <span className="font-semibold text-indigo-300">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Sample Data Presets & Demo Companies */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sample Data Presets */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-black text-white flex items-center gap-2 mb-3">
                  <Database className="w-4 h-4 text-emerald-400" />
                  {isArabic ? 'قوالب بيانات المطاعم الجاهزة للتحميل الفوري' : 'Sample Restaurant Data Presets'}
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  {isArabic
                    ? 'تحميل قوائم كاملة، وصفات تكاليف، مسببات تحسس، وإعدادات ضريبة الزكاة بنقرة واحدة'
                    : '1-click seed realistic enterprise menus, recipe BOMs, allergens & ZATCA tax rules'}
                </p>
                <div className="space-y-3">
                  {enterpriseOps.onboarding.getSamplePresets().map((preset) => (
                    <div
                      key={preset.id}
                      className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white">
                            {isArabic ? preset.nameAr : preset.nameEn}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                            {preset.concept}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {isArabic ? preset.descriptionAr : preset.descriptionEn}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-indigo-300">
                          <span>{preset.itemCount} Items</span>
                          <span>•</span>
                          <span>{preset.categoryCount} Categories</span>
                          <span>•</span>
                          <span>{preset.recipeBomCount} BOM Recipes</span>
                          <span>•</span>
                          <span className="text-emerald-400">15% VAT Ready</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSeedData(preset.id)}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isArabic ? 'تحميل العينة' : 'Seed Preset'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Demo Companies Sandbox */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-black text-white flex items-center gap-2 mb-3">
                  <Flame className="w-4 h-4 text-amber-400" />
                  {isArabic ? 'شركات المحاكاة التجريبية (Demo Companies Sandbox)' : 'Pre-Configured Demo Companies'}
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  {isArabic
                    ? 'بيئات افتراضية متكاملة ببيانات طلبات حية وموظفين ومبيعات لاختبار النظام'
                    : 'Fully populated sandboxes with branches, historical sales, KDS screens & staff'}
                </p>
                <div className="space-y-3">
                  {demoCompanies.map((comp) => (
                    <div
                      key={comp.companyId}
                      className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white">
                            {isArabic ? comp.nameAr : comp.nameEn}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold">
                            {comp.brandType}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-2 text-[10px] font-mono text-slate-300">
                          <div>
                            <span className="text-slate-500">Branches:</span> {comp.branchCount}
                          </div>
                          <div>
                            <span className="text-slate-500">Terminals:</span> {comp.terminalCount}
                          </div>
                          <div>
                            <span className="text-slate-500">Orders:</span> {comp.sampleOrdersCount}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleActivateDemo(comp.companyId)}
                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>{isArabic ? 'تشغيل المحاكاة' : 'Launch Sandbox'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: DATA MIGRATION ENGINE
           ========================================================================= */}
        {activeTab === 'MIGRATION' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <ArrowRightLeft className="w-5 h-5 text-indigo-400" />
                    {isArabic ? 'محرك استيراد وترحيل البيانات المؤسسية' : 'Enterprise Data Migration & Transformation Pipeline'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {isArabic
                      ? 'استيراد آلي من فودكس (Foodics)، أوراكل (Oracle Micros)، ساب (SAP)، إكسيل وCSV مع الفحص التلقائي والتراجع'
                      : 'Automated ingestion from Foodics, Oracle Micros/Simphony, SAP, Excel XLSX & CSV with instant rollback'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedSourcePlatform}
                    onChange={(e) => setSelectedSourcePlatform(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2 font-bold focus:outline-none"
                  >
                    <option value="FOODICS">Foodics Cloud POS</option>
                    <option value="ORACLE_MICROS">Oracle Micros / Simphony</option>
                    <option value="SAP_POS">SAP Customer Checkout / S4HANA</option>
                    <option value="EXCEL_SHEETS">Excel Multi-Sheet (.xlsx)</option>
                    <option value="CSV_DELIMITED">Generic CSV Delimited</option>
                    <option value="LEGACY_SQL_DUMP">Legacy POS SQL Dump</option>
                  </select>
                  <button
                    onClick={handleRunMigrationDryRun}
                    disabled={isSimulatingMigration}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-md shadow-indigo-600/30"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingMigration ? 'animate-spin' : ''}`} />
                    <span>{isArabic ? 'تشغيل الفحص التجريبي الآلي' : 'Run Automated Dry-Run'}</span>
                  </button>
                </div>
              </div>

              {/* Supported Platforms Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-6">
                {enterpriseOps.migration.getPlatformTemplates().map((tpl) => (
                  <div
                    key={tpl.platform}
                    onClick={() => setSelectedSourcePlatform(tpl.platform)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedSourcePlatform === tpl.platform
                        ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                        : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-white">
                        {isArabic ? tpl.nameAr : tpl.nameEn}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300">
                        {tpl.typicalMigrationTimeMin}m avg
                      </span>
                    </div>
                    <p className="text-[11px] opacity-80 mb-3">
                      {isArabic ? tpl.descriptionAr : tpl.descriptionEn}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {tpl.supportedFormats.map((fmt) => (
                        <span key={fmt} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                          {fmt}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Migration Jobs Table & Rollback Manager */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                    {isArabic ? 'سجل مهام الاستيراد واللقطات المحفوظة' : 'Active Ingestion Jobs & Rollback Snapshots'}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">{migrationJobs.length} Jobs</span>
                </div>
                <div className="divide-y divide-slate-800/80">
                  {migrationJobs.map((job) => (
                    <div key={job.jobId} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-indigo-300">{job.jobId}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-slate-800 text-slate-300">
                            {job.sourcePlatform}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              job.status === 'COMPLETED'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : job.status === 'READY_FOR_IMPORT'
                                ? 'bg-indigo-500/20 text-indigo-300'
                                : job.status === 'ROLLED_BACK'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-slate-700 text-slate-300'
                            }`}
                          >
                            {job.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          File: <span className="font-mono text-slate-300">{job.fileName}</span> • Total Records:{' '}
                          <span className="font-mono text-slate-200">{job.totalRecords.toLocaleString()}</span>
                        </div>
                        {job.issues && job.issues.length > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            {job.issues.map((iss) => (
                              <span
                                key={iss.id}
                                className={`text-[10px] px-2 py-0.5 rounded flex items-center gap-1 ${
                                  iss.severity === 'WARNING'
                                    ? 'bg-amber-500/20 text-amber-300'
                                    : 'bg-blue-500/20 text-blue-300'
                                }`}
                              >
                                <Check className="w-3 h-3" />
                                {isArabic ? iss.messageAr : iss.messageEn}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {job.status === 'READY_FOR_IMPORT' && (
                          <button
                            onClick={() => handleExecuteImport(job.jobId)}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                          >
                            <Play className="w-3 h-3" />
                            <span>{isArabic ? 'تنفيذ الاستيراد' : 'Execute Import'}</span>
                          </button>
                        )}
                        {job.status === 'COMPLETED' && (
                          <button
                            onClick={() => handleRollbackMigration(job.jobId)}
                            className="px-3.5 py-1.5 bg-slate-800 hover:bg-amber-600 hover:text-white text-slate-300 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-700"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>{isArabic ? 'تراجع عن الاستيراد' : 'Rollback'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: CUSTOMER SUCCESS CENTER
           ========================================================================= */}
        {activeTab === 'CUSTOMER_SUCCESS' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Health Score Overview & Churn Risk */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
                  {isArabic ? 'مؤشر الصحة المؤسسية الشامل' : 'Overall Customer Health Score'}
                </div>
                <div className="w-28 h-28 rounded-full border-4 border-emerald-500/80 bg-emerald-950/30 flex flex-col items-center justify-center my-3 shadow-xl shadow-emerald-500/20">
                  <span className="text-3xl font-black text-emerald-400 font-mono">{healthReport.overallScore}</span>
                  <span className="text-[10px] text-emerald-300 font-bold">/ 100</span>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {healthReport.status}
                </span>
                <p className="text-[11px] text-slate-400 mt-2">
                  {isArabic ? 'مخاطر الإلغاء (Churn Risk): أقل من 2%' : 'Churn Risk Index: < 2%'}
                </p>
              </div>

              {/* Health Metrics Breakdown */}
              <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3.5">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  {isArabic ? 'تفصيل مؤشرات الصحة والامتثال التشغيلي' : 'Multi-Factor Health & Compliance Breakdown'}
                </h3>
                <div className="space-y-3">
                  {healthReport.metrics.map((m) => (
                    <div key={m.category} className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-bold text-white">{m.category}</span>
                        <span className="font-mono font-bold text-emerald-400">{m.score}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden mb-1.5">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400" style={{ width: `${m.score}%` }} />
                      </div>
                      <p className="text-[10px] text-slate-400">{isArabic ? m.metricDetailsAr : m.metricDetailsEn}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Interactive Staff Walkthroughs */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-black text-white flex items-center gap-2 mb-4">
                <Award className="w-4 h-4 text-amber-400" />
                {isArabic ? 'الدروس التفاعلية وتأهيل الموظفين' : 'Interactive Staff Onboarding & Role Certifications'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tutorials.map((tut) => (
                  <div key={tut.id} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold">
                          {tut.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{tut.estimatedMinutes} mins</span>
                      </div>
                      <h4 className="text-xs font-bold text-white mb-1.5">{isArabic ? tut.titleAr : tut.titleEn}</h4>
                      <p className="text-[11px] text-slate-400 mb-3">{isArabic ? tut.descriptionAr : tut.descriptionEn}</p>
                    </div>
                    <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        {tut.badgeAward}
                      </span>
                      <button
                        onClick={() => showFeedback(isArabic ? `تم بدء تدريب: ${tut.titleAr}` : `Started module: ${tut.titleEn}`)}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        {isArabic ? 'بدء التدريب' : 'Start'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart AI Recommendations */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-black text-white flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                {isArabic ? 'توصيات الذكاء الاصطناعي لرفع الكفاءة التشغيلية' : 'AI-Driven Operational Growth Recommendations'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            rec.priority === 'HIGH'
                              ? 'bg-rose-500/20 text-rose-300'
                              : rec.priority === 'MEDIUM'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-blue-500/20 text-blue-300'
                          }`}
                        >
                          {rec.priority} PRIORITY
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white mb-1">{isArabic ? rec.titleAr : rec.titleEn}</h4>
                      <p className="text-[11px] text-slate-400 mb-3">{isArabic ? rec.impactAr : rec.impactEn}</p>
                    </div>
                    <button
                      onClick={() => showFeedback(isArabic ? `تم تنفيذ الإجراء: ${rec.titleAr}` : `Triggered action: ${rec.titleEn}`)}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      {isArabic ? rec.actionButtonLabelAr : rec.actionButtonLabelEn}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: SUPPORT PLATFORM & REMOTE DIAGNOSTICS
           ========================================================================= */}
        {activeTab === 'SUPPORT_DIAGNOSTICS' && (
          <div className="space-y-6 animate-in fade-in">
            {/* AI Support Assistant & Triage */}
            <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/40 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    {isArabic ? 'مساعد الدعم الفني الذكي (AI Support Assistant)' : 'Autonomous AI Support & Troubleshooting Assistant'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isArabic ? 'تشخيص فوري للأعطال، تحليل سجلات الأخطاء، وتنفيذ المعالجة التلقائية' : 'Real-time root cause analysis & executable auto-remediation actions'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={aiSupportQuery}
                  onChange={(e) => setAiSupportQuery(e.target.value)}
                  placeholder={isArabic ? 'صف المشكلة الفنية أو رقم التذكرة...' : 'Describe POS / Hardware / ZATCA issue...'}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleQueryAiSupport}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-md shadow-indigo-600/30"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isArabic ? 'تحليل ذكي' : 'Diagnose'}</span>
                </button>
              </div>

              {aiSupportDiagnosis && (
                <div className="bg-slate-950/80 border border-indigo-500/30 rounded-xl p-4 space-y-3 animate-in fade-in">
                  <div>
                    <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                      {isArabic ? 'التشخيص والسبب الجذري' : 'Diagnosis & Root Cause'}
                    </div>
                    <div className="text-xs font-semibold text-slate-200 mt-0.5">
                      {isArabic ? aiSupportDiagnosis.diagnosisAr : aiSupportDiagnosis.diagnosisEn}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {isArabic ? aiSupportDiagnosis.rootCauseAr : aiSupportDiagnosis.rootCauseEn}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2">
                      {isArabic ? 'الإجراءات العلاجية الموصى بها بنقرة واحدة' : 'Executable Remediation Actions'}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {aiSupportDiagnosis.recommendedActions.map((act: any) => (
                        <button
                          key={act.actionId}
                          onClick={() => showFeedback(isArabic ? `تم تنفيذ: ${act.labelAr}` : `Executed: ${act.labelEn}`)}
                          className="px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/40 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                        >
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>{isArabic ? act.labelAr : act.labelEn}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Remote Hardware Probes & SLA Tickets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Remote Probes */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-black text-white flex items-center gap-2 mb-3">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  {isArabic ? 'فحص الأجهزة والعتاد عن بُعد' : 'Remote Hardware Diagnostic Probes'}
                </h3>
                <div className="space-y-3">
                  {probes.map((probe) => (
                    <div key={probe.deviceId} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white">{probe.deviceName}</span>
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                              probe.status === 'ONLINE_HEALTHY'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {probe.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] font-mono text-slate-400">
                          <span>IP: {probe.ipAddress}</span>
                          <span>Ping: {probe.pingLatencyMs}ms</span>
                          <span>RAM: {probe.memoryUsagePct}%</span>
                          {probe.thermalHeadTempCelsius && <span>Temp: {probe.thermalHeadTempCelsius}°C</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => handleProbeDevice(probe.deviceId)}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-indigo-600 text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>{isArabic ? 'فحص' : 'Probe'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* SLA Tickets */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-black text-white flex items-center gap-2 mb-3">
                  <Headphones className="w-4 h-4 text-indigo-400" />
                  {isArabic ? 'تذاكر الدعم ومستويات الخدمة (SLA)' : 'Enterprise Support Tickets & SLA Targets'}
                </h3>
                <div className="space-y-3">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-indigo-300">{ticket.ticketNumber}</span>
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                              ticket.priority === 'P1_CRITICAL_BLOCKER'
                                ? 'bg-rose-500/20 text-rose-300'
                                : ticket.priority === 'P2_MAJOR_SERVICE'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-blue-500/20 text-blue-300'
                            }`}
                          >
                            {ticket.priority}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-amber-400">
                          {ticket.slaRemainingMinutes}m SLA Left
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white mb-1">{isArabic ? ticket.titleAr : ticket.titleEn}</h4>
                      <p className="text-[11px] text-slate-400">{isArabic ? ticket.descriptionAr : ticket.descriptionEn}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 5: RELEASE OPERATIONS & ROLLOUT CENTER
           ========================================================================= */}
        {activeTab === 'RELEASE_OPS' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Canary Deployment Controls */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-indigo-400" />
                    {isArabic ? 'إدارة الإطلاقات التدريجية وتوزيع حركة المرور' : 'Progressive Canary Rollout & Traffic Director'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {isArabic
                      ? 'التحكم بنسبة توجيه الطلبات للنسخة الجديدة ومراقبة معدل الأخطاء وزمن الاستجابة'
                      : 'Granular traffic steering across rollout rings with continuous automated telemetry health gates'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">{isArabic ? 'حركة المرور لـ Canary:' : 'Canary Traffic:'}</span>
                  <span className="text-base font-black text-indigo-400 font-mono">{canaries[0]?.trafficWeightPct}%</span>
                </div>
              </div>

              {/* Canary Sliders & Telemetry */}
              {canaries.map((c) => (
                <div key={c.releaseId} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-white">{c.version}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                          {c.targetRing}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Deployed: {new Date(c.deployedAt).toLocaleTimeString()} • Status:{' '}
                        <span className="text-emerald-400 font-bold">{c.status}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {[5, 25, 50, 100].map((pct) => (
                        <button
                          key={pct}
                          onClick={() => handleSetCanaryTraffic(c.releaseId, pct)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-colors ${
                            c.trafficWeightPct === pct
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Range Slider */}
                  <div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={c.trafficWeightPct}
                      onChange={(e) => handleSetCanaryTraffic(c.releaseId, Number(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  {/* Telemetry Gate Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-400">P95 Latency</div>
                      <div className="text-xs font-mono font-bold text-emerald-400">{c.metrics.p95LatencyMs}ms</div>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-400">Error Rate</div>
                      <div className="text-xs font-mono font-bold text-emerald-400">{c.metrics.errorRatePct}%</div>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-400">ZATCA Clearance</div>
                      <div className="text-xs font-mono font-bold text-emerald-400">{c.metrics.zatcaSuccessRatePct}%</div>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-400">Active Instances</div>
                      <div className="text-xs font-mono font-bold text-indigo-400">
                        {c.metrics.activeCanaryInstances} / {c.metrics.activeBaselineInstances}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Feature Toggles & Rollback Snapshots */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Feature Toggles */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-black text-white flex items-center gap-2 mb-4">
                  <Key className="w-4 h-4 text-amber-400" />
                  {isArabic ? 'مفاتيح التحكم بالميزات وأزرار الإيقاف الطارئ' : 'Targeted Feature Toggles & Kill-Switches'}
                </h3>
                <div className="space-y-3">
                  {featureToggles.map((tog) => (
                    <div key={tog.id} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white">{isArabic ? tog.nameAr : tog.nameEn}</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">
                            {tog.canaryRolloutPct}% Rollout
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{isArabic ? tog.descriptionAr : tog.descriptionEn}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleFeature(tog.id, tog.enabled)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                            tog.enabled ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400'
                          }`}
                        >
                          {tog.enabled ? 'ON' : 'OFF'}
                        </button>
                        <button
                          onClick={() => handleKillSwitch(tog.id)}
                          className="px-2.5 py-1 bg-rose-900/60 hover:bg-rose-600 text-rose-200 hover:text-white rounded-lg text-xs font-bold transition-colors border border-rose-700"
                        >
                          Kill
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rollback Center */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-black text-white flex items-center gap-2 mb-4">
                  <RotateCcw className="w-4 h-4 text-rose-400" />
                  {isArabic ? 'مركز التراجع الفوري (Zero-Downtime Rollback)' : 'Instant Zero-Downtime Rollback Center'}
                </h3>
                <div className="space-y-3">
                  {rollbackSnapshots.map((snap) => (
                    <div key={snap.snapshotId} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-white">{snap.version}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                            DB Compatible
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 mt-1">
                          Git: {snap.gitCommitSha} • Rollback Time: ~{snap.rollbackTimeSeconds}s
                        </div>
                      </div>
                      <button
                        onClick={() => handleTriggerRollback(snap.snapshotId)}
                        className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-md shadow-rose-600/30"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>{isArabic ? 'تراجع فوري' : 'Rollback'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 6: OBSERVABILITY 2.0 & TELEMETRY
           ========================================================================= */}
        {activeTab === 'OBSERVABILITY' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Live Real-Time Business KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="text-xs text-slate-400 font-medium">{isArabic ? 'القيمة الإجمالية للعمليات/ثانية' : 'GTV / Second'}</div>
                <div className="text-2xl font-black text-white font-mono mt-1">{kpis.grossTransactionValuePerSecSar} SAR</div>
                <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +12.4% vs peak yesterday
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="text-xs text-slate-400 font-medium">{isArabic ? 'سرعة الطلبات (طلب/دقيقة)' : 'Order Velocity'}</div>
                <div className="text-2xl font-black text-indigo-400 font-mono mt-1">{kpis.orderVelocityPerMinute} / min</div>
                <div className="text-[10px] text-slate-400 mt-1">Across 8 Active POS nodes</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="text-xs text-slate-400 font-medium">{isArabic ? 'زمن توقيع الزكاة' : 'ZATCA Signing Latency'}</div>
                <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{kpis.zatcaSigningLatencyMs} ms</div>
                <div className="text-[10px] text-slate-400 mt-1">Local HSM ECDSA secp256k1</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="text-xs text-slate-400 font-medium">{isArabic ? 'متوسط سرعة إعداد المطبخ P95' : 'Kitchen P95 Prep Time'}</div>
                <div className="text-2xl font-black text-amber-400 font-mono mt-1">{kpis.kitchenPrepTimeP95Minutes} mins</div>
                <div className="text-[10px] text-slate-400 mt-1">Target &lt; 9.0 mins</div>
              </div>
            </div>

            {/* 5-Stage Ordering Funnel */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-black text-white flex items-center gap-2 mb-4">
                <Layers className="w-4 h-4 text-indigo-400" />
                {isArabic ? 'مسار رحلة المستخدم ومعدلات التحويل (User Journey Funnel)' : '5-Stage POS Ordering Funnel Conversion & Drop-off'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {funnelStages.map((stage) => (
                  <div key={stage.stageId} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 font-mono mb-1">Step {stage.stageId.split('-')[1]}</div>
                      <h4 className="text-xs font-bold text-white mb-2">{isArabic ? stage.nameAr : stage.nameEn}</h4>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono mb-1">
                        <span className="text-emerald-400 font-bold">{stage.conversionRatePct}%</span>
                        <span className="text-slate-400">{stage.averageDurationSec}s avg</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400" style={{ width: `${stage.conversionRatePct}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Session Replay Simulator */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Play className="w-4 h-4 text-emerald-400" />
                    {isArabic ? 'محاكي إعادة تشغيل الجلسات (Session Replay)' : 'Cashier Session Replay & Visual Audit'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Session ID: <span className="font-mono text-slate-300">{sessionReplay.sessionId}</span> • Cashier:{' '}
                    <span className="font-bold text-white">{sessionReplay.cashierName}</span> • Order:{' '}
                    <span className="font-mono text-indigo-300">{sessionReplay.orderId}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  {sessionReplay.events.map((ev) => (
                    <button
                      key={ev.step}
                      onClick={() => setCurrentReplayStep(ev.step)}
                      className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-colors ${
                        currentReplayStep === ev.step
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {ev.step}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step Display Box */}
              {sessionReplay.events[currentReplayStep - 1] && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-mono font-bold flex items-center justify-center text-xs">
                      #{sessionReplay.events[currentReplayStep - 1].step}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">
                        {isArabic
                          ? sessionReplay.events[currentReplayStep - 1].descriptionAr
                          : sessionReplay.events[currentReplayStep - 1].descriptionEn}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        Action: {sessionReplay.events[currentReplayStep - 1].actionType} • Offset: +
                        {sessionReplay.events[currentReplayStep - 1].timeOffsetMs}ms
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setCurrentReplayStep(
                        currentReplayStep < sessionReplay.events.length ? currentReplayStep + 1 : 1
                      )
                    }
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <span>{isArabic ? 'الخطوة التالية' : 'Next Step'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 7: ENTERPRISE MONITORING & FIVE-NINES SLA
           ========================================================================= */}
        {activeTab === 'MONITORING_SLA' && (
          <div className="space-y-6 animate-in fade-in">
            {/* 99.999% SLA Commitment Tracker */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-400" />
                    {isArabic ? 'مراقبة اتفاقية مستوى الخدمة 99.999% (Five-Nines SLA)' : '99.999% Five-Nines SLA & Error Budget Tracker'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {isArabic
                      ? 'مراقبة الالتزام التعاقدي السحابي، رصيد الخطأ المتبقي (25.9 ثانية)، وحساب غرامات التعويض'
                      : 'Contractual uptime enforcement with automated error budget calculation and penalty refund guarantees'}
                  </p>
                </div>
                <div className="bg-emerald-950/40 border border-emerald-500/50 px-4 py-2 rounded-xl text-center">
                  <div className="text-[10px] text-emerald-300 font-bold uppercase">{isArabic ? 'الالتزام الشهري' : 'August SLA'}</div>
                  <div className="text-lg font-black text-emerald-400 font-mono">99.9998% Uptime</div>
                </div>
              </div>

              {/* Monthly SLA Records */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {slaRecords.map((rec) => (
                  <div key={rec.month} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-white">{rec.month}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold font-mono">
                        {rec.status}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Target SLA:</span>
                        <span className="font-mono text-slate-200">{rec.targetSlaPct}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Actual Uptime:</span>
                        <span className="font-mono text-emerald-400 font-bold">{rec.actualUptimePct}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Error Budget Remaining:</span>
                        <span className="font-mono text-indigo-300">{rec.errorBudgetRemainingSeconds}s / {rec.errorBudgetMonthlyTotalSeconds}s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Penalty Owed:</span>
                        <span className="font-mono text-emerald-400 font-bold">{rec.penaltyRefundOwedSar} SAR</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Multi-Region Global Cluster Infrastructure */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-black text-white flex items-center gap-2 mb-4">
                <Globe className="w-4 h-4 text-indigo-400" />
                {isArabic ? 'العناقيد السحابية العالمية متعددة المناطق' : 'Global Multi-Region Cloud Cluster Infrastructure'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {multiRegionNodes.map((node) => (
                  <div key={node.regionId} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-bold text-xs text-white">{node.regionId}</span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                          node.isPrimaryMaster
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-indigo-500/20 text-indigo-300'
                        }`}
                      >
                        {node.status}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-200 mb-1">{isArabic ? node.regionNameAr : node.nameEn || node.regionNameEn}</div>
                    <div className="text-[10px] text-slate-400 mb-3">{node.datacenter}</div>
                    <div className="space-y-1 text-[10px] font-mono text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Latency:</span> {node.pingLatencyMs}ms
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">CPU Usage:</span> {node.cpuUsagePct}%
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Cache Hit:</span> {node.redisCacheHitRatioPct}%
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">DB IOPS:</span> {node.databaseIops.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 8: BUSINESS CONTINUITY & CHAOS RESILIENCE
           ========================================================================= */}
        {activeTab === 'BUSINESS_CONTINUITY' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Automated DR Drills Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-indigo-400" />
                    {isArabic ? 'محاكاة وتمارين التعافي من الكوارث (DR Drills)' : 'Automated Disaster Recovery Drills & Audits'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {isArabic
                      ? 'تمارين انقطاع مراكز البيانات، انقسام قواعد البيانات، والتحقق التلقائي من عدم فقدان أي بيانات'
                      : 'Automated simulated disaster drills with zero data loss verification & RTO < 2.5s'}
                  </p>
                </div>
                <button
                  onClick={() => handleRunDrDrill('PRIMARY_DC_BLACKOUT')}
                  disabled={isRunningDrill}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-md shadow-indigo-600/30"
                >
                  <Flame className={`w-3.5 h-3.5 ${isRunningDrill ? 'animate-bounce' : ''}`} />
                  <span>{isArabic ? 'تشغيل تمرين انقطاع مركز البيانات الحية' : 'Run Live DR Drill'}</span>
                </button>
              </div>

              {/* Drills List */}
              <div className="space-y-3">
                {drDrills.map((drill) => (
                  <div key={drill.drillId} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">{isArabic ? drill.nameAr : drill.nameEn}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                          {drill.status}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">
                        Duration: {drill.durationSeconds}s
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mb-2">{isArabic ? drill.findingsAr : drill.findingsEn}</p>
                    <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400">
                      <span>Lead: {drill.leadEngineer}</span>
                      <span>•</span>
                      <span>Auditor: {drill.auditorSignoff}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Backup Snapshot Integrity & Chaos Engineering Reports */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Backups */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-black text-white flex items-center gap-2 mb-4">
                  <Database className="w-4 h-4 text-emerald-400" />
                  {isArabic ? 'التحقق من سلامة النسخ الاحتياطية (SHA-256)' : 'Cryptographic Backup Validation (SHA-256)'}
                </h3>
                <div className="space-y-3">
                  {backups.map((b) => (
                    <div key={b.snapshotId} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono font-bold text-xs text-indigo-300">{b.snapshotId}</span>
                        <span className="text-[9px] px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-300">
                          {b.status}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 break-all mb-2">Hash: {b.sha256Checksum}</div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-300">
                        <span>RPO: {b.rpoActualSeconds}s</span>
                        <span>RTO: {b.rtoActualSeconds}s</span>
                        <span>Size: {(b.sizeBytes / 1024 / 1024).toFixed(1)} MB</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chaos Reports */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-black text-white flex items-center gap-2 mb-4">
                  <Zap className="w-4 h-4 text-amber-400" />
                  {isArabic ? 'تقارير هندسة الفوضى والمرونة (Chaos Engineering)' : 'Chaos Engineering Resilience Experiments'}
                </h3>
                <div className="space-y-3">
                  {chaosReports.map((c) => (
                    <div key={c.experimentId} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-white">{isArabic ? c.nameAr : c.nameEn}</span>
                        <span className="text-[9px] px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-300">
                          {c.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mb-2">{isArabic ? c.summaryAr : c.summaryEn}</p>
                      <div className="text-[10px] font-mono text-slate-400">
                        Blast Radius: {c.blastRadius} • Recovery: {c.recoveryLatencyMs}ms
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 9: FINAL PRODUCTION VALIDATION
           ========================================================================= */}
        {activeTab === 'PRODUCTION_VALIDATION' && (
          <div className="space-y-6 animate-in fade-in">
            {/* 50K RPS Load Benchmarks & OWASP Pen-Tests */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Load Benchmarks */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    {isArabic ? 'اختبارات الحمل القصوى (50,000 طلب/ثانية)' : '50,000 RPS Stress & Load Benchmarks'}
                  </h3>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {loadBenchmark.verdict}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center mb-4">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400">Peak RPS</div>
                    <div className="text-sm font-black text-emerald-400 font-mono">
                      {loadBenchmark.peakRequestsPerSec.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400">P99 Latency</div>
                    <div className="text-sm font-black text-emerald-400 font-mono">{loadBenchmark.p99LatencyMs}ms</div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400">Terminals</div>
                    <div className="text-sm font-black text-indigo-400 font-mono">
                      {loadBenchmark.targetConcurrentTerminals.toLocaleString()}
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  {isArabic
                    ? 'تمت محاكاة 10 آلاف نقطة بيع متزامنة مع 3.14 مليون عملية بدون أي أخطاء بنسبة خطأ 0.000%'
                    : 'Validated with 10,000 concurrent terminals processing 3.14M orders with 0.000% error rate.'}
                </p>
              </div>

              {/* Penetration Tests */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-black text-white flex items-center gap-2 mb-4">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  {isArabic ? 'نتائج الفحص الأمني المتقدم واختبارات الاختراق' : 'Penetration Testing & OWASP Top 10 Audit'}
                </h3>
                <div className="space-y-3">
                  {penTests.map((pen) => (
                    <div key={pen.testId} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-white">{isArabic ? pen.testNameAr : pen.testNameEn}</span>
                        <span className="text-[9px] px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-300">
                          {pen.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{isArabic ? pen.assessmentAr : pen.assessmentEn}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 25-Point Release Readiness Checklist */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-black text-white flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {isArabic ? 'قائمة الجاهزية والاعتماد للتشغيل الإنتاجي' : 'Production Release Readiness Checklist'}
              </h3>
              <div className="space-y-2.5">
                {readinessChecklist.map((item) => (
                  <div key={item.id} className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{isArabic ? item.titleAr : item.titleEn}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Evidence: {item.evidence}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-indigo-300">{item.verifier}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 10: VERSION 2.0 GA RELEASE CENTER
           ========================================================================= */}
        {activeTab === 'V2_RELEASE_GA' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Signed Release Manifest Card */}
            <div className="bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/40 rounded-2xl p-6 shadow-2xl">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-6 h-6 text-amber-400" />
                    <h2 className="text-xl font-black text-white">
                      {isArabic ? 'شهادة وبيان الإطلاق الرسمي المعتمد الإصدار 2.0 GA' : 'Official Version 2.0 Enterprise GA Signed Manifest'}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-300">
                    Codename: <span className="font-mono text-indigo-300 font-bold">{releaseManifest.releaseCodename}</span> • SHA-256:{' '}
                    <span className="font-mono text-slate-400">{releaseManifest.sha256BinaryChecksum.slice(0, 24)}...</span>
                  </p>
                </div>
                <span className="px-4 py-1.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10">
                  PRODUCTION CERTIFIED GOLD
                </span>
              </div>

              {/* C-Level Sign-Offs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
                {Object.entries(releaseManifest.signoffs).map(([roleKey, sign]) => (
                  <div key={roleKey} className="bg-slate-950/80 border border-indigo-500/30 rounded-xl p-4">
                    <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">{sign.title}</div>
                    <div className="text-xs font-black text-white mt-1">{sign.name}</div>
                    <div className="text-[10px] font-mono text-emerald-400 mt-2 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>{sign.signatureHash}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Digital Signature Footer */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <span>Ed25519 Signature: {releaseManifest.ed25519Signature}</span>
                <span className="text-emerald-400 font-bold">RPO &lt; 0.1s • RTO &lt; 2.5s • SLA 99.999%</span>
              </div>
            </div>

            {/* Documentation Runbooks & Changelog */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Documentation */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-black text-white flex items-center gap-2 mb-4">
                  <FileCode2 className="w-4 h-4 text-indigo-400" />
                  {isArabic ? 'أدلة المعمارية والتشغيل والربط' : 'Enterprise Documentation & Operational Runbooks'}
                </h3>
                <div className="flex gap-2 mb-4">
                  {docs.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        selectedDocId === doc.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {doc.category}
                    </button>
                  ))}
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-white">{isArabic ? selectedDoc.titleAr : selectedDoc.titleEn}</h4>
                  <p className="text-[11px] text-slate-400">{isArabic ? selectedDoc.summaryAr : selectedDoc.summaryEn}</p>
                  <div className="text-[10px] font-mono text-indigo-300 pt-2 border-t border-slate-800">
                    Read Time: {selectedDoc.readTimeMinutes} mins • Last Updated: {selectedDoc.lastUpdated}
                  </div>
                </div>
              </div>

              {/* Changelog */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-black text-white flex items-center gap-2 mb-4">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  {isArabic ? 'سجل التغييرات والإصدارات (Changelog)' : 'Comprehensive Changelog & Release Notes'}
                </h3>
                <div className="space-y-4">
                  {changelog.map((rel) => (
                    <div key={rel.version} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-bold text-xs text-white">{rel.version}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                          {rel.badge}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-indigo-300 mb-2">{isArabic ? rel.titleAr : rel.titleEn}</h4>
                      <ul className="space-y-1 text-[11px] text-slate-300 list-disc list-inside">
                        {(isArabic ? rel.highlightsAr : rel.highlightsEn).map((h, idx) => (
                          <li key={idx} className="line-clamp-2">
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
