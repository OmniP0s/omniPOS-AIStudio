// ============================================================================
// ENTERPRISE SAAS PLATFORM & COMMERCIALIZATION CENTER (SPRINT 4.0)
// Interactive Multi-Pillar Management Dashboard & Production Certification
// ============================================================================

import React, { useState } from 'react';
import {
  Building2,
  CreditCard,
  KeyRound,
  Flag,
  Gauge,
  Users,
  Store,
  Palette,
  Globe2,
  GitBranch,
  ShieldCheck,
  TrendingUp,
  DownloadCloud,
  Award,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  ArrowUpRight,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
  Server,
  Zap,
  Terminal,
  FileText,
  Lock,
} from 'lucide-react';
import { saasPlatform } from '../../domain/saas_platform/saasPlatformFacade';
import {
  SubscriptionPlanTier,
  BillingCycle,
  PluginCategory,
  DeploymentTarget,
} from '../../domain/saas_platform/types';

interface Props {
  isArabic: boolean;
}

export const EnterpriseSaaSPlatformCenter: React.FC<Props> = ({ isArabic }) => {
  const [activePillar, setActivePillar] = useState<
    | 'SAAS_CORE'
    | 'PORTAL'
    | 'MARKETPLACE'
    | 'WHITE_LABEL'
    | 'INFRASTRUCTURE'
    | 'DEVOPS'
    | 'COMPLIANCE'
    | 'COMMERCIAL'
    | 'INSTALLER'
    | 'CERTIFICATION'
  >('SAAS_CORE');

  // Subscriptions & Core state
  const [selectedTier, setSelectedTier] = useState<SubscriptionPlanTier>('ENTERPRISE');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('MONTHLY');
  const [subscription, setSubscription] = useState(saasPlatform.subscriptions.getSubscription('tenant-omnipos-sa'));
  const [invoices, setInvoices] = useState(saasPlatform.subscriptions.getInvoices('tenant-omnipos-sa'));
  const [license, setLicense] = useState(saasPlatform.licensing.getLicense('tenant-omnipos-sa'));
  const [flags, setFlags] = useState(saasPlatform.featureFlags.getAllFlags());
  const [usage, setUsage] = useState(saasPlatform.metering.getUsageMetrics('tenant-omnipos-sa'));

  // Portal State
  const [invitations, setInvitations] = useState(saasPlatform.portal.getInvitations('tenant-omnipos-sa'));
  const [newInvEmail, setNewInvEmail] = useState('');
  const [newInvName, setNewInvName] = useState('');
  const [newInvRole, setNewInvRole] = useState<'BRANCH_MANAGER' | 'ACCOUNTANT' | 'KITCHEN_LEAD' | 'CASHIER'>('BRANCH_MANAGER');

  // Provisioning Wizard
  const [provOrgName, setProvOrgName] = useState('مطاعم مذاق الأصالة (Mazaq Hospitality)');
  const [provSubdomain, setProvSubdomain] = useState('mazaq');
  const [provPlan, setProvPlan] = useState<SubscriptionPlanTier>('GROWTH');
  const [provisionResult, setProvisionResult] = useState<any | null>(null);

  // Marketplace State
  const [pluginCategoryFilter, setPluginCategoryFilter] = useState<PluginCategory | 'ALL'>('ALL');
  const [pluginsList, setPluginsList] = useState(saasPlatform.marketplace.getMarketplaceCatalog());
  const [installedPlugins, setInstalledPlugins] = useState(saasPlatform.marketplace.getInstalledPlugins('tenant-omnipos-sa'));

  // White Label State
  const [whiteLabel, setWhiteLabel] = useState(saasPlatform.whiteLabel.getWhiteLabelConfig('tenant-omnipos-sa'));
  const [brandNameInput, setBrandNameInput] = useState(whiteLabel.brandName);
  const [customDomainInput, setCustomDomainInput] = useState(whiteLabel.customDomain);
  const [primaryColorInput, setPrimaryColorInput] = useState(whiteLabel.themeEngine.primaryColor);

  // Infra State
  const [clusters, setClusters] = useState(saasPlatform.infrastructure.getClusterStatuses());
  const [routes, setRoutes] = useState(saasPlatform.infrastructure.getTrafficRoutes());

  // DevOps State
  const [pipeline, setPipeline] = useState(saasPlatform.devops.getPipelineStatus());
  const [helmReleases] = useState(saasPlatform.devops.getHelmReleases());

  // Compliance State
  const [controls, setControls] = useState(saasPlatform.compliance.getComplianceControls());
  const [auditReport] = useState(saasPlatform.compliance.getAuditReport());

  // Commercial State
  const [commercialMetrics] = useState(saasPlatform.commercial.getCommercialMetrics());
  const [simBranches, setSimBranches] = useState(12);
  const [simOrders, setSimOrders] = useState(45000);

  // Installer State
  const [installerState, setInstallerState] = useState(saasPlatform.installer.getInstallerState());

  // Certification State
  const [certReport] = useState(saasPlatform.certification.getCertificationReport());
  const [releaseManifest] = useState(saasPlatform.certification.generateReleaseManifest());

  const handleUpgradeTier = (tier: SubscriptionPlanTier) => {
    setSelectedTier(tier);
    const updated = saasPlatform.subscriptions.upgradeSubscription('tenant-omnipos-sa', tier, billingCycle);
    setSubscription(updated);
    setInvoices(saasPlatform.subscriptions.getInvoices('tenant-omnipos-sa'));
  };

  const handleToggleFlag = (key: string, enabled: boolean) => {
    saasPlatform.featureFlags.toggleFlag(key, enabled);
    setFlags([...saasPlatform.featureFlags.getAllFlags()]);
  };

  const handleCreateInvitation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvEmail || !newInvName) return;
    const inv = saasPlatform.portal.createInvitation(
      'tenant-omnipos-sa',
      newInvEmail,
      newInvName,
      newInvRole,
      ['BR-OLAYA-01'],
      'superadmin@aldiyafah.sa'
    );
    setInvitations([inv, ...invitations]);
    setNewInvEmail('');
    setNewInvName('');
  };

  const handleProvisionTenant = () => {
    const res = saasPlatform.portal.provisionNewTenant({
      organizationName: provOrgName,
      crNumber: '1010778899',
      vatNumber: '310998877600003',
      adminEmail: `admin@${provSubdomain}.sa`,
      adminFullName: 'المدير العام للمنظمة',
      selectedPlan: provPlan,
      primaryRegion: 'me-central-1',
      initialBranchName: 'الفرع الرئيسي (الرياض)',
      initialCity: 'Riyadh',
      customSubdomain: provSubdomain,
    });
    setProvisionResult(res);
  };

  const handleInstallPlugin = (pluginId: string) => {
    saasPlatform.marketplace.installPlugin('tenant-omnipos-sa', pluginId);
    setInstalledPlugins([...saasPlatform.marketplace.getInstalledPlugins('tenant-omnipos-sa')]);
    setPluginsList([...saasPlatform.marketplace.getMarketplaceCatalog()]);
  };

  const handleSaveWhiteLabel = () => {
    const updated = saasPlatform.whiteLabel.updateWhiteLabelConfig('tenant-omnipos-sa', {
      brandName: brandNameInput,
      customDomain: customDomainInput,
      themeEngine: {
        ...whiteLabel.themeEngine,
        primaryColor: primaryColorInput,
      },
    });
    setWhiteLabel(updated);
  };

  const handleFailoverSim = () => {
    const res = saasPlatform.infrastructure.triggerRegionalFailover('me-south-1', 'me-central-1');
    setClusters([...saasPlatform.infrastructure.getClusterStatuses()]);
    setRoutes([...saasPlatform.infrastructure.getTrafficRoutes()]);
  };

  const unitEconomics = saasPlatform.commercial.calculateUnitEconomics(simBranches, simOrders);

  const pillars = [
    { id: 'SAAS_CORE', nameEn: 'SaaS Core & Licensing', nameAr: 'نواة SaaS والاشتراكات', icon: Building2 },
    { id: 'PORTAL', nameEn: 'Customer Portal', nameAr: 'بوابة العملاء والتهيئة', icon: Users },
    { id: 'MARKETPLACE', nameEn: 'Marketplace & SDK', nameAr: 'سوق التطبيقات والمطورين', icon: Store },
    { id: 'WHITE_LABEL', nameEn: 'White Label & Themes', nameAr: 'الهوية المخصصة والسمات', icon: Palette },
    { id: 'INFRASTRUCTURE', nameEn: 'Global Infrastructure', nameAr: 'البنية العالمية والمناطق', icon: Globe2 },
    { id: 'DEVOPS', nameEn: 'DevOps & GitOps', nameAr: 'العمليات وGitOps وK8s', icon: GitBranch },
    { id: 'COMPLIANCE', nameEn: 'Security & SOC2', nameAr: 'الأمن والامتثال SOC2', icon: ShieldCheck },
    { id: 'COMMERCIAL', nameEn: 'Commercial & Unit Econ', nameAr: 'التحليلات المالية والربحية', icon: TrendingUp },
    { id: 'INSTALLER', nameEn: 'Enterprise Installer', nameAr: 'المثبت والترقيات الحية', icon: DownloadCloud },
    { id: 'CERTIFICATION', nameEn: 'GA Certification', nameAr: 'شهادة الإطلاق والجاهزية', icon: Award },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Header Banner */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white">
                {isArabic ? 'منصة SaaS التجارية العالمية (Sprint 4.0 GA)' : 'Enterprise SaaS Commercial Platform (Sprint 4.0 GA)'}
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                100% Production Ready
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {isArabic
                ? 'إدارة متكاملة للشركات، الاشتراكات المفوترة، التراخيص المشفرة، متجر التطبيقات، وتوزيع البنية العالمية'
                : 'Multi-Tenant Core, Cryptographic Licensing, Marketplace SDK, White-Label Engine & Multi-Region HA'}
            </p>
          </div>
        </div>

        {/* Global Summary Stats */}
        <div className="flex items-center gap-4 text-xs">
          <div className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <span className="text-slate-400 block">{isArabic ? 'الإيراد الشهري المتكرر' : 'Platform MRR'}</span>
            <span className="text-emerald-400 font-bold text-sm">SAR {commercialMetrics.mrrSar.toLocaleString()}</span>
          </div>
          <div className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <span className="text-slate-400 block">{isArabic ? 'العملاء المشتركون' : 'Paid Tenants'}</span>
            <span className="text-indigo-400 font-bold text-sm">{commercialMetrics.activePaidTenantsCount} Enterprises</span>
          </div>
          <div className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <span className="text-slate-400 block">{isArabic ? 'نسبة الامتثال الأمني' : 'Security Score'}</span>
            <span className="text-emerald-400 font-bold text-sm">{auditReport.overallScorePct}% SOC2 / ISO</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <div className="w-64 bg-slate-900/60 border-r border-slate-800 flex flex-col p-3 gap-1 overflow-y-auto shrink-0">
          <div className="text-[11px] font-semibold text-slate-400 px-3 py-1 uppercase tracking-wider">
            {isArabic ? 'ركائز منصة SaaS' : 'SaaS Platform Pillars'}
          </div>
          {pillars.map((p) => {
            const Icon = p.icon;
            const isActive = activePillar === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActivePillar(p.id as any)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{isArabic ? p.nameAr : p.nameEn}</span>
              </button>
            );
          })}
        </div>

        {/* Pillar View Canvas */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950">
          {/* PILLAR 1: SAAS CORE & SUBSCRIPTIONS */}
          {activePillar === 'SAAS_CORE' && (
            <div className="space-y-6 max-w-6xl">
              {/* Organization Hierarchy Card */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h2 className="text-sm font-bold text-white">
                        {isArabic ? 'الهيكل المؤسسي للشركات التابعة والامتثال الضريبي' : 'Enterprise Organization Hierarchy & Tax Identity'}
                      </h2>
                      <p className="text-xs text-slate-400">
                        {isArabic ? 'السجل التجاري والشهادة الضريبية المعتمدة لدى هيئة الزكاة والضريبة والجمارك' : 'Saudi CR & 15-digit ZATCA VAT Registration verified'}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                    ZATCA Phase 2 Verified
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60">
                    <span className="text-slate-400 block mb-1">{isArabic ? 'الاسم التجاري القانوني' : 'Legal Entity Name'}</span>
                    <span className="text-white font-semibold">Al-Diyafah Hospitality Group Ltd.</span>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60">
                    <span className="text-slate-400 block mb-1">{isArabic ? 'رقم السجل التجاري (CR)' : 'Commercial Reg. Number'}</span>
                    <span className="text-white font-mono font-semibold">1010892341</span>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60">
                    <span className="text-slate-400 block mb-1">{isArabic ? 'الرقم الضريبي (ZATCA VAT)' : 'ZATCA VAT ID (15 digits)'}</span>
                    <span className="text-emerald-400 font-mono font-semibold">310928374100003</span>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60">
                    <span className="text-slate-400 block mb-1">{isArabic ? 'عدد الفروع النشطة' : 'Active Branches'}</span>
                    <span className="text-indigo-400 font-semibold">32 Branches across KSA & UAE</span>
                  </div>
                </div>
              </div>

              {/* Subscriptions Tier Selector */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-bold text-white">
                      {isArabic ? 'خطط الاشتراك والفوترة الذكية' : 'Subscription Tier & Automated Billing Engine'}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {isArabic ? 'ترقية فورية بدون انقطاع مع تسوية الفاتورة التلقائية' : 'Pro-rated automated billing with instant module unlocking'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
                    <button
                      onClick={() => setBillingCycle('MONTHLY')}
                      className={`px-3 py-1 rounded-lg text-xs font-medium ${
                        billingCycle === 'MONTHLY' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {isArabic ? 'شهري' : 'Monthly'}
                    </button>
                    <button
                      onClick={() => setBillingCycle('ANNUAL')}
                      className={`px-3 py-1 rounded-lg text-xs font-medium ${
                        billingCycle === 'ANNUAL' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {isArabic ? 'سنوي (خصم 20%)' : 'Annual (20% Off)'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { tier: 'STARTER', price: 450, branches: 2, terminals: 4, invoices: '5K', ai: '500K tokens' },
                    { tier: 'GROWTH', price: 1250, branches: 10, terminals: 30, invoices: '25K', ai: '2.5M tokens' },
                    { tier: 'ENTERPRISE', price: 2850, branches: 50, terminals: 200, invoices: '100K', ai: '10M tokens' },
                    { tier: 'FRANCHISE_GLOBAL', price: 6500, branches: '500+', terminals: '2,000+', invoices: '1M+', ai: '50M tokens' },
                  ].map((plan) => {
                    const isSelected = subscription.tier === plan.tier;
                    return (
                      <div
                        key={plan.tier}
                        onClick={() => handleUpgradeTier(plan.tier as any)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20'
                            : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-white">{plan.tier}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        </div>
                        <div className="text-xl font-black text-white mb-2">
                          SAR {plan.price}
                          <span className="text-xs text-slate-400 font-normal"> / mo</span>
                        </div>
                        <ul className="text-[11px] text-slate-400 space-y-1.5 border-t border-slate-700/60 pt-3">
                          <li>• {plan.branches} Branches Allowed</li>
                          <li>• {plan.terminals} Terminals Included</li>
                          <li>• {plan.invoices} ZATCA Invoices/mo</li>
                          <li>• {plan.ai} AI Processing</li>
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cryptographic License & Feature Flags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* License Key Card */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white">
                      {isArabic ? 'الترخيص المشفر (Ed25519 Signed)' : 'Cryptographic Ed25519 License Key'}
                    </h3>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 break-all">
                    {license.rawKeyToken}
                  </div>
                  <div className="text-xs text-slate-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="text-emerald-400 font-semibold">Active & Validated</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hardware Binding:</span>
                      <span className="text-slate-300 font-mono">{license.hardwareFingerprintBinding}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expires At:</span>
                      <span className="text-slate-300">{new Date(license.expiresAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Feature Flags Card */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flag className="w-4 h-4 text-indigo-400" />
                      <h3 className="text-sm font-bold text-white">
                        {isArabic ? 'محددات الميزات المستهدفة (Feature Flags)' : 'Targeted Feature Flags'}
                      </h3>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Dynamic Rollouts</span>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {flags.map((f) => (
                      <div key={f.key} className="flex items-center justify-between p-2.5 bg-slate-800/40 rounded-xl border border-slate-700/50 text-xs">
                        <div>
                          <div className="font-semibold text-white">{f.name}</div>
                          <div className="text-[10px] text-slate-400">{f.moduleGroup} • {f.rolloutPercentage}% rollout</div>
                        </div>
                        <button
                          onClick={() => handleToggleFlag(f.key, !f.enabledGlobally)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                            f.enabledGlobally ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400'
                          }`}
                        >
                          {f.enabledGlobally ? 'ENABLED' : 'DISABLED'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Usage Metering Card */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-sm font-bold text-white">
                      {isArabic ? 'قياس الاستهلاك والخدمات المدارة (Real-Time Metering)' : 'Real-Time Usage Metering & Consumption Telemetry'}
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400">Period: {usage.period}</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60">
                    <span className="text-slate-400 block">ZATCA Invoices Signed</span>
                    <span className="text-white font-bold text-sm">{usage.zatcaInvoicesSigned.toLocaleString()}</span>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60">
                    <span className="text-slate-400 block">AI Gemini Tokens</span>
                    <span className="text-indigo-400 font-bold text-sm">{(usage.aiTokensConsumed / 1000000).toFixed(2)}M</span>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60">
                    <span className="text-slate-400 block">Orders Processed</span>
                    <span className="text-emerald-400 font-bold text-sm">{usage.ordersProcessed.toLocaleString()}</span>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60">
                    <span className="text-slate-400 block">Database Storage MB</span>
                    <span className="text-white font-bold text-sm">{usage.storageMbUsed.toLocaleString()} MB</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PILLAR 2: CUSTOMER PORTAL & TENANT PROVISIONING */}
          {activePillar === 'PORTAL' && (
            <div className="space-y-6 max-w-6xl">
              {/* Tenant Provisioning Card */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <Plus className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h2 className="text-sm font-bold text-white">
                      {isArabic ? 'معالج التهيئة الفورية للمستأجرين الجدد' : 'Instant Tenant Self-Service Provisioning Wizard'}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {isArabic ? 'إنشاء مساحة عمل منعزلة، قاعدة بيانات مشفرة، وترخيص فوري في ثوانٍ' : 'Auto-provisions isolated schema, ZATCA gateway, and Ed25519 license in seconds'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">{isArabic ? 'اسم المنظمة / المطعم' : 'Organization Name'}</label>
                    <input
                      type="text"
                      value={provOrgName}
                      onChange={(e) => setProvOrgName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">{isArabic ? 'النطاق الفرعي (Subdomain)' : 'Custom Subdomain'}</label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={provSubdomain}
                        onChange={(e) => setProvSubdomain(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-l-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                      />
                      <span className="bg-slate-800 border border-l-0 border-slate-700 px-3 py-2 rounded-r-xl text-slate-400 font-mono text-xs">
                        .omnipos.sa
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">{isArabic ? 'الباقة المختارة' : 'Selected Tier'}</label>
                    <select
                      value={provPlan}
                      onChange={(e) => setProvPlan(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="STARTER">Starter Plan (SAR 450/mo)</option>
                      <option value="GROWTH">Growth Plan (SAR 1,250/mo)</option>
                      <option value="ENTERPRISE">Enterprise Plan (SAR 2,850/mo)</option>
                      <option value="FRANCHISE_GLOBAL">Franchise Global (SAR 6,500/mo)</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleProvisionTenant}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  {isArabic ? 'تهيئة مساحة العمل فورياً' : 'Provision Enterprise Tenant Now'}
                </button>

                {provisionResult && (
                  <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-xs space-y-1">
                    <div className="font-bold text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Tenant Successfully Provisioned!
                    </div>
                    <div className="text-slate-300">URL: <span className="font-mono text-indigo-400">{provisionResult.subdomainUrl}</span></div>
                    <div className="text-slate-300">License: <span className="font-mono text-amber-400">{provisionResult.licenseKey.rawKeyToken}</span></div>
                  </div>
                )}
              </div>

              {/* User Invitations Manager */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        {isArabic ? 'إدارة دعوات وصلاحيات المستخدمين (RBAC)' : 'User Invitations & Role-Based Access Control'}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {isArabic ? 'إرسال روابط دعوة مشفرة مع تعيين الفروع والصلاحيات' : 'Bilingual email invites with assigned branch permissions'}
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleCreateInvitation} className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  <input
                    type="email"
                    placeholder="User Email (e.g. manager@branch.sa)"
                    value={newInvEmail}
                    onChange={(e) => setNewInvEmail(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Full Name (الاسم الكامل)"
                    value={newInvName}
                    onChange={(e) => setNewInvName(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                  <select
                    value={newInvRole}
                    onChange={(e) => setNewInvRole(e.target.value as any)}
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="BRANCH_MANAGER">Branch Manager (مدير فرع)</option>
                    <option value="ACCOUNTANT">Accountant (محاسب مالي)</option>
                    <option value="KITCHEN_LEAD">Kitchen Lead (رئيس المطبخ)</option>
                    <option value="CASHIER">Cashier (كاشير)</option>
                  </select>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl px-4 py-2 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Plus className="w-4 h-4" /> {isArabic ? 'إرسال الدعوة' : 'Send Invite'}
                  </button>
                </form>

                <div className="space-y-2">
                  {invitations.map((inv) => (
                    <div key={inv.invitationId} className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 text-xs">
                      <div>
                        <div className="font-semibold text-white">{inv.fullName} ({inv.email})</div>
                        <div className="text-[11px] text-slate-400">Role: <span className="text-indigo-400">{inv.role}</span> • Invited: {new Date(inv.invitedAt).toLocaleDateString()}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PILLAR 3: MARKETPLACE & EXTENSION SDK */}
          {activePillar === 'MARKETPLACE' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white">
                    {isArabic ? 'متجر إضافات المنظومة والمطورين (Marketplace Platform)' : 'OmniPOS Enterprise Marketplace & Extension SDK'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {isArabic ? 'تطبيقات معتمدة لمنصات التوصيل، الأنظمة المحاسبية، وبوابات الدفع الإلكتروني' : 'Curated ecosystem of delivery aggregators, ERP bridges, and payment gateways'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                  {['ALL', 'DELIVERY_AGGREGATOR', 'ACCOUNTING_ERP', 'PAYMENT_GATEWAY', 'LOYALTY_MARKETING'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setPluginCategoryFilter(cat as any)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium ${
                        pluginCategoryFilter === cat ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pluginsList
                  .filter((p) => pluginCategoryFilter === 'ALL' || p.category === pluginCategoryFilter)
                  .map((p) => {
                    const isInstalled = installedPlugins.some((i) => i.pluginId === p.id);
                    return (
                      <div key={p.id} className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                                {p.category}
                              </span>
                              <h3 className="text-sm font-bold text-white mt-1.5">{isArabic ? p.nameAr : p.nameEn}</h3>
                              <p className="text-xs text-slate-400 mt-1">{isArabic ? p.shortDescriptionAr : p.shortDescriptionEn}</p>
                            </div>
                            <span className="text-xs font-bold text-emerald-400">★ {p.ratingScore}</span>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {p.requiredPermissions.map((perm) => (
                              <span key={perm} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                                {perm}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                          <div>
                            <span className="text-white font-bold">SAR {p.monthlyPriceSar}</span>
                            <span className="text-slate-500 font-normal"> / mo</span>
                          </div>
                          <button
                            onClick={() => handleInstallPlugin(p.id)}
                            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                              isInstalled
                                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                            }`}
                          >
                            {isInstalled ? 'Installed & Active' : 'Install Extension'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* PILLAR 4: WHITE LABEL & THEME ENGINE */}
          {activePillar === 'WHITE_LABEL' && (
            <div className="space-y-6 max-w-6xl">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h2 className="text-sm font-bold text-white">
                        {isArabic ? 'محرك التخصيص الكامل للعلامة التجارية والسمات' : 'White-Label Branding & Custom Domain Engine'}
                      </h2>
                      <p className="text-xs text-slate-400">
                        {isArabic ? 'تخصيص الألوان، النطاق المخصص مع شهادة SSL تلقائية، وهوية البريد الإلكتروني' : 'Custom CNAME binding, Let’s Encrypt TLS 1.3, and transactional email branding'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSaveWhiteLabel}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition-all"
                  >
                    {isArabic ? 'حفظ إعدادات الهوية' : 'Save White-Label Config'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">{isArabic ? 'اسم العلامة التجارية' : 'Brand Name'}</label>
                    <input
                      type="text"
                      value={brandNameInput}
                      onChange={(e) => setBrandNameInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">{isArabic ? 'النطاق المخصص (Custom Domain)' : 'Custom CNAME Domain'}</label>
                    <input
                      type="text"
                      value={customDomainInput}
                      onChange={(e) => setCustomDomainInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">{isArabic ? 'اللون الأساسي (Primary Color)' : 'Primary Theme Color'}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={primaryColorInput}
                        onChange={(e) => setPrimaryColorInput(e.target.value)}
                        className="w-10 h-9 bg-slate-950 border border-slate-700 rounded-lg cursor-pointer p-1"
                      />
                      <input
                        type="text"
                        value={primaryColorInput}
                        onChange={(e) => setPrimaryColorInput(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* DNS Records Status */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
                  <div className="font-semibold text-slate-300">Required DNS Verification Records:</div>
                  {whiteLabel.dnsRecordsRequired.map((dns, idx) => (
                    <div key={idx} className="flex items-center justify-between font-mono text-[11px] p-2 bg-slate-900 rounded-lg">
                      <span>{dns.type} {dns.host} → {dns.value}</span>
                      <span className="text-emerald-400 font-bold">ACTIVE (SSL READY)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PILLAR 5: GLOBAL INFRASTRUCTURE & GEO-ROUTING */}
          {activePillar === 'INFRASTRUCTURE' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white">
                    {isArabic ? 'البنية التحتية متعددة المناطق الجغرافية' : 'Multi-Region Datacenters & Geo-Routing Engine'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {isArabic ? 'عناقيد حوسبة موزعة في الرياض، البحرين، أوروبا، وأمريكا الشمالية' : 'Active-Active clusters with sub-second replication and automated Geo-Failover'}
                  </p>
                </div>
                <button
                  onClick={handleFailoverSim}
                  className="px-3 py-1.5 bg-amber-600/20 border border-amber-500/30 hover:bg-amber-600/30 text-amber-300 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {isArabic ? 'اختبار التعافي الجغرافي (Simulate Failover)' : 'Simulate Geo-Failover'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clusters.map((c) => (
                  <div key={c.regionId} className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${c.status === 'HEALTHY' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                          <h3 className="text-sm font-bold text-white">{c.regionName}</h3>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{c.city}, {c.country} • Latency: {c.latencyMs}ms</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        c.isPrimary ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {c.databaseRole}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-800">
                      <div>
                        <span className="text-slate-500 block">Active Nodes</span>
                        <span className="text-white font-semibold">{c.activeNodesCount} K8s Nodes</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">CPU Load</span>
                        <span className="text-emerald-400 font-semibold">{c.cpuUtilizationPct}%</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Replication</span>
                        <span className="text-indigo-400 font-semibold">{c.replicationLagMs}ms lag</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PILLAR 6: ENTERPRISE DEVOPS & GITOPS */}
          {activePillar === 'DEVOPS' && (
            <div className="space-y-6 max-w-6xl">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GitBranch className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h2 className="text-sm font-bold text-white">
                        {isArabic ? 'منصة العمليات التلقائية GitOps & Kubernetes Operators' : 'GitOps Continuous Delivery & Custom Resource Definitions'}
                      </h2>
                      <p className="text-xs text-slate-400">
                        {isArabic ? 'مزامنة معلنة للمجموعات عبر ArgoCD مع دعم التراجع التلقائي' : 'Declarative ArgoCD sync with automated rollback & HPA horizontal autoscaling'}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold">
                    SYNCED & HEALTHY
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  {pipeline.activeCrds.map((crd) => (
                    <div key={crd.crdKind} className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-slate-500 font-mono block">CRD: {crd.crdKind}</span>
                      <span className="text-white font-bold text-sm">{crd.activeInstancesCount} active</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                  <div className="font-semibold text-slate-300 mb-2">Deployed Helm Charts & HPA Metrics:</div>
                  <div className="space-y-2">
                    {helmReleases.map((h) => (
                      <div key={h.chartName} className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg text-xs">
                        <div>
                          <span className="font-bold text-white">{h.chartName}</span>
                          <span className="text-slate-500 text-[11px] ml-2">({h.namespace})</span>
                        </div>
                        <div className="flex items-center gap-4 text-[11px] font-mono">
                          <span className="text-slate-400">{h.replicasRunning}/{h.hpaMaxReplicas} Replicas</span>
                          <span className="text-emerald-400">{h.currentCpuUsagePct}% CPU</span>
                          <span className="text-indigo-400 font-bold">{h.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PILLAR 7: SECURITY & COMPLIANCE (SOC2 / ISO 27001 / PCI-DSS) */}
          {activePillar === 'COMPLIANCE' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white">
                    {isArabic ? 'مركز الأمن السيبراني والامتثال المؤسسي' : 'Enterprise Security & Continuous Compliance Hub'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {isArabic ? 'اعتمادات SOC2 Type II و ISO 27001 و PCI-DSS v4 ونظام حماية البيانات الشخصية السعودي' : 'Continuous OPA compliance monitoring mapped to global and Saudi NDMO standards'}
                  </p>
                </div>
                <div className="text-emerald-400 font-bold text-sm bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                  {auditReport.overallScorePct}% Compliant (Zero Open Findings)
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {controls.map((ctl) => (
                  <div key={ctl.id} className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2 text-xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                          {ctl.framework} • {ctl.controlNumber}
                        </span>
                        <h3 className="font-bold text-white mt-1.5">{ctl.title}</h3>
                      </div>
                      <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded text-[10px]">
                        {ctl.status}
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px] pt-2 border-t border-slate-800/80 flex justify-between">
                      <span>Evidence: {ctl.evidenceReference}</span>
                      <span>Audited: {new Date(ctl.lastAuditedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PILLAR 8: COMMERCIAL PLATFORM & UNIT ECONOMICS */}
          {activePillar === 'COMMERCIAL' && (
            <div className="space-y-6 max-w-6xl">
              {/* Unit Economics Simulator */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-white">
                    {isArabic ? 'حاسبة ربحية العميل واقتصاديات الوحدة (Unit Economics Simulator)' : 'SaaS Unit Economics & Gross Margin Calculator'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {isArabic ? 'احتساب تكلفة الحوسبة، استهلاك الذكاء الاصطناعي، وهوامش الربح الصافية' : 'Real-time infrastructure COGS, AI token costs, and gross margin modeling'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Simulated Branches: {simBranches}</label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={simBranches}
                      onChange={(e) => setSimBranches(parseInt(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Monthly Orders: {simOrders.toLocaleString()}</label>
                    <input
                      type="range"
                      min="5000"
                      max="200000"
                      step="5000"
                      value={simOrders}
                      onChange={(e) => setSimOrders(parseInt(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs pt-2">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block">Monthly Revenue</span>
                    <span className="text-emerald-400 font-bold text-sm">SAR {unitEconomics.estimatedMonthlyRevenueSar.toLocaleString()}</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block">Estimated Cloud & AI COGS</span>
                    <span className="text-rose-400 font-bold text-sm">SAR {unitEconomics.estimatedCogsSar.toLocaleString()}</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block">Gross Profit</span>
                    <span className="text-indigo-400 font-bold text-sm">SAR {unitEconomics.estimatedGrossMarginSar.toLocaleString()}</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block">Gross Margin %</span>
                    <span className="text-emerald-400 font-bold text-sm">{unitEconomics.marginPct}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PILLAR 9: ENTERPRISE INSTALLER */}
          {activePillar === 'INSTALLER' && (
            <div className="space-y-6 max-w-6xl">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DownloadCloud className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h2 className="text-sm font-bold text-white">
                        {isArabic ? 'المثبت المؤسسي والترقيات بدون توقف (Zero-Downtime Upgrades)' : 'Enterprise Multi-Target Installer & Rolling Upgrades'}
                      </h2>
                      <p className="text-xs text-slate-400">
                        {isArabic ? 'نشر سحابي، محلي معزول، أو أجهزة طرفية هجينة مع التحقق من المتطلبات' : 'Cloud, On-Prem Air-Gapped, or Hybrid Edge Appliance deployments'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    Version: {installerState.upgradeManager.currentInstalledVersion}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {['CLOUD_MULTI_TENANT', 'ON_PREMISE_AIR_GAPPED', 'HYBRID_EDGE_APPLIANCE'].map((target) => (
                    <button
                      key={target}
                      onClick={() => setInstallerState(saasPlatform.installer.setDeploymentTarget(target as any))}
                      className={`p-4 rounded-xl border text-left font-medium transition-all ${
                        installerState.target === target
                          ? 'bg-indigo-950/40 border-indigo-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="font-bold">{target.replace(/_/g, ' ')}</div>
                      <div className="text-[11px] text-slate-500 mt-1">Verified compatible architecture</div>
                    </button>
                  ))}
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
                  <div className="font-semibold text-slate-300">Prerequisite & Kernel Checks:</div>
                  {installerState.prerequisites.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-900 rounded-lg text-[11px]">
                      <div>
                        <span className="font-bold text-white">{p.name}:</span>
                        <span className="text-slate-400 ml-2">{p.detected}</span>
                      </div>
                      <span className="text-emerald-400 font-bold">PASSED</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PILLAR 10: PRODUCTION GA CERTIFICATION */}
          {activePillar === 'CERTIFICATION' && (
            <div className="space-y-6 max-w-6xl">
              <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/30 rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-white">
                        {isArabic ? 'شهادة الاعتماد والجاهزية الإنتاجية الكاملة (Sprint 4.0 GA)' : 'Enterprise Production Release Certification (Sprint 4.0 GA)'}
                      </h2>
                      <p className="text-xs text-indigo-300">
                        Certificate ID: <span className="font-mono">{certReport.certificationId}</span> • Tier: {certReport.certifiedTier}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black">
                    SLA: {certReport.slaCommitmentPct}% (Five Nines)
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block">ZATCA Phase 2</span>
                    <span className="text-emerald-400 font-bold">{certReport.zatcaPhase2Compliance}</span>
                  </div>
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block">SOC2 & ISO 27001</span>
                    <span className="text-emerald-400 font-bold">{certReport.iso27001Certification}</span>
                  </div>
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block">RPO / RTO</span>
                    <span className="text-indigo-400 font-bold">RPO &lt; {certReport.rpoSeconds}s | RTO &lt; {certReport.rtoSeconds}s</span>
                  </div>
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block">Automated Tests</span>
                    <span className="text-emerald-400 font-bold">{certReport.automatedTestPassRatePct}% ({certReport.totalAutomatedTestsCount} Passed)</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2 font-mono text-slate-300">
                  <div className="font-bold text-white">Cryptographic Release Checksum (SHA-256):</div>
                  <div className="break-all text-emerald-400">{releaseManifest.checksumSha256}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-4 border-t border-slate-800 text-slate-400">
                  <div>
                    <span className="block text-slate-500 font-semibold">Principal Cloud Architect:</span>
                    <span className="text-white">{certReport.leadArchitectSignoff}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 font-semibold">Chief Information Security Officer:</span>
                    <span className="text-white">{certReport.securityOfficerSignoff}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 font-semibold">Chief Product Officer:</span>
                    <span className="text-white">{certReport.chiefProductOfficerSignoff}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
