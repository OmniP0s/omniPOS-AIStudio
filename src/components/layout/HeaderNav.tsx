import React, { useState, useEffect } from 'react';
import { TenantConfig, Branch, User } from '../../types';
import { canAccessNav } from '../../config/permissions';
import { outboxManager } from '../../domain/crdt/outboxSync';
import {
  Store,
  LayoutGrid,
  UtensilsCrossed,
  Flame,
  Banknote,
  Boxes,
  ShieldCheck,
  BarChart3,
  Cpu,
  Settings,
  Wifi,
  WifiOff,
  Globe,
  Sun,
  Moon,
  Bell,
  UserCheck,
  ChevronDown,
  Building,
  Utensils,
  Users,
  UserPlus,
  BookOpen,
  Lock,
  Building2,
  PlayCircle,
  Truck,
  ShoppingCart,
  Globe2,
  Navigation,
  Factory,
  GitFork,
  BrainCircuit,
  Cable,
  CreditCard,
  ShieldAlert,
  Activity,
  Award,
  Sparkles,
  Bot,
  Rocket,
} from 'lucide-react';

export type NavModule =
  | 'V2_OPERATIONS'
  | 'SAAS_PLATFORM'
  | 'COGNITIVE_AI'
  | 'AI_AGENTS'
  | 'AI_APPS'
  | 'AI_FOUNDATION'
  | 'SPRINT1_FOUNDATION'
  | 'RUNTIME_OPS'
  | 'POS'
  | 'FLOOR_PLAN'
  | 'KDS'
  | 'SHIFTS'
  | 'MENU'
  | 'INVENTORY'
  | 'PROCUREMENT'
  | 'CUSTOMERS'
  | 'DELIVERY'
  | 'CENTRAL_KITCHEN'
  | 'FRANCHISE'
  | 'HR'
  | 'ACCOUNTING'
  | 'WORKFLOW'
  | 'AI_SERVICES'
  | 'INTEGRATIONS'
  | 'SAAS_BILLING'
  | 'DISASTER_RECOVERY'
  | 'PRODUCTION'
  | 'ZATCA'
  | 'ANALYTICS'
  | 'SECURITY'
  | 'HARDWARE'
  | 'ADMIN'
  | 'TESTS'
  | 'SETTINGS';

interface HeaderNavProps {
  tenant: TenantConfig;
  activeModule: NavModule;
  activeBranch: Branch;
  activeUser: User;
  isArabic: boolean;
  darkMode: boolean;
  onSelectModule: (module: NavModule) => void;
  onSelectBranch: (branch: Branch) => void;
  onToggleLanguage: () => void;
  onToggleDarkMode: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  tenant,
  activeModule,
  activeBranch,
  activeUser,
  isArabic,
  darkMode,
  onSelectModule,
  onSelectBranch,
  onToggleLanguage,
  onToggleDarkMode,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setPendingSyncCount(outboxManager.getQueue().length);
    }, 1000);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const navItems: { id: NavModule; labelEn: string; labelAr: string; icon: any; badge?: string }[] = [
    { id: 'V2_OPERATIONS', labelEn: 'Version 2.0 Enterprise Ops', labelAr: 'العمليات والإطلاق المؤسسي 2.0', icon: Rocket, badge: 'GA Release' },
    { id: 'SAAS_PLATFORM', labelEn: 'Enterprise SaaS Platform', labelAr: 'المنصة السحابية والتجارية', icon: Sparkles, badge: 'Sprint 4.0' },
    { id: 'COGNITIVE_AI', labelEn: 'Cognitive & Multimodal AI', labelAr: 'الذكاء الإدراكي والمتعدد الوسائط', icon: Sparkles, badge: 'Sprint 3.3' },
    { id: 'AI_AGENTS', labelEn: 'Autonomous AI Agents', labelAr: 'الوكلاء الأذكياء والأتمتة', icon: Bot, badge: 'Sprint 3.2' },
    { id: 'AI_APPS', labelEn: 'Enterprise AI Apps', labelAr: 'تطبيقات الذكاء الاصطناعي', icon: Sparkles, badge: 'Sprint 3.1' },
    { id: 'AI_FOUNDATION', labelEn: 'AI Foundation', labelAr: 'أساس الذكاء الاصطناعي', icon: Cpu, badge: 'Sprint 3.0' },
    { id: 'SPRINT1_FOUNDATION', labelEn: 'Sprint 1 Foundation', labelAr: 'الأساس المعماري (سبرنت 1)', icon: Cpu, badge: 'P1-10' },
    { id: 'RUNTIME_OPS', labelEn: 'Runtime Ops & Diagnostics', labelAr: 'مركز تشخيص وتشغيل النظام', icon: Activity, badge: 'Auto-Heal' },
    { id: 'POS', labelEn: 'POS Terminal', labelAr: 'نقطة البيع', icon: LayoutGrid },
    { id: 'FLOOR_PLAN', labelEn: 'Floor Plan', labelAr: 'الطاولات والحجوزات', icon: UtensilsCrossed },
    { id: 'KDS', labelEn: 'Kitchen KDS', labelAr: 'شاشة المطبخ', icon: Flame, badge: 'Live' },
    { id: 'SHIFTS', labelEn: 'Shift & Cash', labelAr: 'الورديات والخزينة', icon: Banknote },
    { id: 'MENU', labelEn: 'Advanced Menu', labelAr: 'قوائم الطعام والأسعار', icon: Utensils, badge: 'COGS' },
    { id: 'INVENTORY', labelEn: 'Inventory & BOM', labelAr: 'المخزون والوصفات', icon: Boxes },
    { id: 'PROCUREMENT', labelEn: 'Procurement & PO', labelAr: 'المشتريات والموردين', icon: ShoppingCart, badge: '3-Way' },
    { id: 'CENTRAL_KITCHEN', labelEn: 'Central Kitchen', labelAr: 'المطبخ المركزي', icon: Factory, badge: 'BOM' },
    { id: 'DELIVERY', labelEn: 'Delivery Fleet', labelAr: 'أسطول التوصيل', icon: Navigation, badge: 'GPS' },
    { id: 'CUSTOMERS', labelEn: 'CRM & Loyalty', labelAr: 'العملاء والمحفظة', icon: Users, badge: 'VIP' },
    { id: 'FRANCHISE', labelEn: 'Franchise HQ', labelAr: 'الامتياز التجاري', icon: Globe2, badge: 'Royalty' },
    { id: 'HR', labelEn: 'HR & Biometrics', labelAr: 'الموظفين وحماية الأجور', icon: UserCheck, badge: 'WPS' },
    { id: 'ACCOUNTING', labelEn: 'Accounting & VAT', labelAr: 'المحاسبة والضريبة', icon: BookOpen, badge: '15%' },
    { id: 'WORKFLOW', labelEn: 'Workflows & Sagas', labelAr: 'مسارات العمل والاعتمادات', icon: GitFork },
    { id: 'AI_SERVICES', labelEn: 'AI Intelligence', labelAr: 'الذكاء الاصطناعي والتنبؤ', icon: BrainCircuit, badge: 'AI' },
    { id: 'INTEGRATIONS', labelEn: 'Integrations & API', labelAr: 'سوق التكامل والمطورين', icon: Cable, badge: 'API' },
    { id: 'SAAS_BILLING', labelEn: 'SaaS Billing', labelAr: 'اشتراك المنصة والفوترة', icon: CreditCard },
    { id: 'DISASTER_RECOVERY', labelEn: 'Disaster Recovery', labelAr: 'التعافي من الكوارث', icon: ShieldAlert, badge: 'HA' },
    { id: 'PRODUCTION', labelEn: 'Production & Gov', labelAr: 'الجاهزية والعمليات والحوكمة', icon: ShieldCheck, badge: 'PROD' },
    { id: 'ZATCA', labelEn: 'ZATCA Phase 2', labelAr: 'الامتثال والفوترة', icon: ShieldCheck, badge: 'EGS' },
    { id: 'ANALYTICS', labelEn: 'Analytics BI', labelAr: 'التحليلات والذكاء', icon: BarChart3 },
    { id: 'SECURITY', labelEn: 'Zero Trust Security', labelAr: 'الأمن والسياسات OPA', icon: Lock },
    { id: 'HARDWARE', labelEn: 'Hardware', labelAr: 'الأجهزة والعتاد', icon: Cpu },
    { id: 'ADMIN', labelEn: 'Central Admin', labelAr: 'الإدارة المركزية', icon: Building2 },
    { id: 'TESTS', labelEn: 'Quality & Global Release', labelAr: 'منصة الجودة والإطلاق العالمي', icon: Award, badge: 'QA & GA' },
    { id: 'SETTINGS', labelEn: 'Settings', labelAr: 'الإعدادات', icon: Settings },
  ];

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 shrink-0 z-30 select-none">
      {/* Top Utility Bar */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-slate-800/80 text-xs">
        {/* Brand & Branch Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-sm text-white shadow-md shadow-indigo-600/30">
              Ω
            </div>
            <span className="font-black text-sm tracking-tight text-white hidden sm:inline">
              OmniPOS <span className="text-indigo-400 font-normal">Enterprise</span>
            </span>
          </div>

          <div className="h-4 w-px bg-slate-700 hidden sm:block" />

          {/* Branch Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
            >
              <Building className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isArabic ? activeBranch.nameAr : activeBranch.nameEn}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isBranchDropdownOpen && (
              <div className="absolute top-full mt-1 left-0 rtl:left-auto rtl:right-0 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in">
                {tenant.branches.map(b => (
                  <button
                    key={b.id}
                    onClick={() => {
                      onSelectBranch(b);
                      setIsBranchDropdownOpen(false);
                    }}
                    className={`w-full text-left rtl:text-right px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between ${
                      activeBranch.id === b.id
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span>{isArabic ? b.nameAr : b.nameEn}</span>
                    <span className="text-[10px] opacity-75 font-mono">{b.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Info: Sync Status, Clock, User, Language Toggle */}
        <div className="flex items-center gap-3">
          {/* Real-time CRDT sync status */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-800 text-[11px] font-mono">
            {isOnline ? (
              <Wifi className="w-3 h-3 text-emerald-400" />
            ) : (
              <WifiOff className="w-3 h-3 text-amber-400" />
            )}
            <span className={isOnline ? 'text-emerald-400' : 'text-amber-400'}>
              {isOnline ? (pendingSyncCount > 0 ? `Syncing (${pendingSyncCount})` : 'Cloud Synced') : 'Offline Mode (Local Storage)'}
            </span>
          </div>

          {/* Clock */}
          <div className="hidden md:block text-[11px] text-slate-400 font-mono">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>

          {/* Language Switch */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isArabic ? 'English' : 'عربي'}</span>
          </button>

          {/* Dark Mode */}
          <button
            onClick={onToggleDarkMode}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* User profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-700 rtl:border-l-0 rtl:border-r rtl:pl-0 rtl:pr-2">
            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-[11px] text-white">
              {activeUser.name.charAt(0)}
            </div>
            <div className="hidden lg:block text-left rtl:text-right">
              <span className="block text-xs font-bold leading-none">{activeUser.name}</span>
              <span className="text-[10px] text-slate-400">{activeUser.role}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Module Tabs Bar */}
      <div className="px-4 flex items-center gap-1 overflow-x-auto scrollbar-none py-1 bg-slate-950/60">
        {navItems.filter(item => canAccessNav(activeUser.role, item.id)).map(item => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectModule(item.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all relative ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{isArabic ? item.labelAr : item.labelEn}</span>
              {item.badge && (
                <span
                  className={`text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase ${
                    isActive
                      ? 'bg-white text-indigo-700'
                      : 'bg-indigo-950 text-indigo-300 border border-indigo-700/50'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
