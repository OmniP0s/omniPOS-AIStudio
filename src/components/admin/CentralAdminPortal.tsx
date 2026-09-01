import React, { useState } from 'react';
import { TenantConfig, Branch, User, Brand, LicensePlan, FeatureFlag, TerminalDevice, ExchangeRate } from '../../types';
import {
  Building2,
  Layers,
  ShieldAlert,
  Key,
  Globe,
  Clock,
  ToggleLeft,
  ToggleRight,
  Plus,
  CheckCircle2,
  Sliders,
  DollarSign,
  Smartphone,
  Check,
  RefreshCw,
  Award,
  Lock,
} from 'lucide-react';

interface CentralAdminPortalProps {
  tenant: TenantConfig;
  activeBranch: Branch;
  activeUser: User;
  isArabic: boolean;
  onUpdateTenant: (updated: Partial<TenantConfig>) => void;
}

export const CentralAdminPortal: React.FC<CentralAdminPortalProps> = ({
  tenant,
  activeBranch,
  activeUser,
  isArabic,
  onUpdateTenant,
}) => {
  const [activeTab, setActiveTab] = useState<'COMPANY' | 'BRANDS' | 'DEVICES' | 'LICENSE' | 'FLAGS' | 'LOCALIZATION'>('COMPANY');
  const [form, setForm] = useState({
    legalNameAr: tenant.legalNameAr,
    legalNameEn: tenant.legalNameEn,
    vatNumber: tenant.vatNumber,
    crNumber: tenant.crNumber,
    taxRate: tenant.taxRate,
    municipalityFeeRate: tenant.municipalityFeeRate,
    currency: tenant.currency as string,
    currencyDecimals: 2,
  });
  const [companyFormError, setCompanyFormError] = useState<string | null>(null);
  const [companyFormSaved, setCompanyFormSaved] = useState(false);

  const presetCurrencies = ['SAR', 'EGP', 'USD', 'AED'];
  const usesCustomCurrency = !presetCurrencies.includes(form.currency);

  const saveCompanySettings = () => {
    const taxPercent = form.taxRate * 100;
    const currency = form.currency.trim().toUpperCase();

    if (!/^\d{15}$/.test(form.vatNumber.trim())) {
      setCompanyFormError(isArabic ? 'يجب أن يتكون الرقم الضريبي من 15 رقماً.' : 'VAT number must contain exactly 15 digits.');
      return;
    }
    if (!Number.isFinite(taxPercent) || taxPercent < 0 || taxPercent > 100) {
      setCompanyFormError(isArabic ? 'يجب أن تكون نسبة الضريبة بين 0 و100.' : 'Tax rate must be between 0 and 100.');
      return;
    }
    if (!/^[A-Z]{3}$/.test(currency)) {
      setCompanyFormError(isArabic ? 'يجب أن يتكون رمز العملة من 3 أحرف إنجليزية كبيرة.' : 'Currency code must contain exactly 3 uppercase letters.');
      return;
    }

    setCompanyFormError(null);
    onUpdateTenant({ ...form, currency: currency as TenantConfig['currency'] });
    setCompanyFormSaved(true);
    window.setTimeout(() => setCompanyFormSaved(false), 2000);
  };

  const [brands, setBrands] = useState<Brand[]>([
    {
      id: 'br-01',
      nameEn: 'Omni Gourmet Burger',
      nameAr: 'أومني جورميه برجر',
      code: 'OGB',
      logo: '🍔',
      primaryColor: '#6366f1',
      active: true,
    },
    {
      id: 'br-02',
      nameEn: 'L’Artisan Coffee & Bakery',
      nameAr: 'لارتيزان كافيه ومخبوزات',
      code: 'LAC',
      logo: '☕',
      primaryColor: '#d97706',
      active: true,
    },
    {
      id: 'br-03',
      nameEn: 'Smoked & Wood BBQ (Cloud Kitchen)',
      nameAr: 'سموكت آند وود باربيكيو (مطبخ سحابي)',
      code: 'SWB',
      logo: '🥩',
      primaryColor: '#dc2626',
      active: true,
    },
  ]);

  const [terminals, setTerminals] = useState<TerminalDevice[]>([
    {
      id: 'trm-01',
      branchId: 'branch-01',
      branchName: 'Olaya Flagship',
      name: 'Cashier Terminal 01 (Main POS)',
      type: 'POS_MAIN',
      egsSerialNumber: 'EGS-RUH-01-2026-0091',
      pairingToken: 'PAIR-8849-XK2',
      ipAddress: '192.168.1.101',
      status: 'ONLINE',
      lastHeartbeat: 'Just now',
    },
    {
      id: 'trm-02',
      branchId: 'branch-01',
      branchName: 'Olaya Flagship',
      name: 'Kitchen Expo Screen 01',
      type: 'KDS_DISPLAY',
      egsSerialNumber: 'EGS-KDS-01-2026-0044',
      pairingToken: 'PAIR-9921-KP1',
      ipAddress: '192.168.1.201',
      status: 'ONLINE',
      lastHeartbeat: '10s ago',
    },
    {
      id: 'trm-03',
      branchId: 'branch-01',
      branchName: 'Olaya Flagship',
      name: 'Drive-Thru Ordering Tablet',
      type: 'WAITER_TABLET',
      egsSerialNumber: 'EGS-TAB-01-2026-0012',
      pairingToken: 'PAIR-4412-TZ9',
      ipAddress: '192.168.1.115',
      status: 'ONLINE',
      lastHeartbeat: '1m ago',
    },
    {
      id: 'trm-04',
      branchId: 'branch-02',
      branchName: 'Jeddah Corniche',
      name: 'Jeddah Main Cashier',
      type: 'POS_MAIN',
      egsSerialNumber: 'EGS-JED-01-2026-0018',
      pairingToken: 'PAIR-1190-QW4',
      ipAddress: '192.168.2.101',
      status: 'ONLINE',
      lastHeartbeat: 'Just now',
    },
  ]);

  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([
    { id: 'f-01', key: 'ENABLE_ZATCA_PHASE_2', nameEn: 'ZATCA Phase 2 E-Invoicing Live Reporting', nameAr: 'تفعيل الربط المباشر مع هيئة الزكاة (المرحلة الثانية)', description: 'Cryptographic UBL 2.1 XML generation and auto-reporting clearance within 24 hours.', enabled: true, category: 'ZATCA' },
    { id: 'f-02', key: 'ENABLE_AI_PREDICTIONS', nameEn: 'Gemini AI Demand & Waste Forecasting', nameAr: 'توقعات الطلب والهدر بالذكاء الاصطناعي (Gemini)', description: 'Real-time hourly sales prediction and prep volume guidance.', enabled: true, category: 'AI' },
    { id: 'f-03', key: 'ENABLE_HAPPY_HOUR', nameEn: 'Dynamic Happy Hour Pricing Engine', nameAr: 'محرك أسعار ساعات السعادة التلقائي', description: 'Automatic item discounts during afternoon and business lunch slots.', enabled: true, category: 'CORE' },
    { id: 'f-04', key: 'ENABLE_BIOMETRIC_CLOCKIN', nameEn: 'Biometric Face / Fingerprint Attendance', nameAr: 'تسجيل الحضور بالبصمة والتعرف على الوجه', description: 'Hardware bridge integration for employee shift timekeeping.', enabled: true, category: 'HARDWARE' },
    { id: 'f-05', key: 'ENABLE_OFFLINE_CRDT_VAULT', nameEn: 'Encrypted Offline Transaction Vault & CRDT', nameAr: 'خزينة المعاملات غير المتصلة المشفرة ومزامنة CRDT', description: 'Store transactions during network outages and auto-reconcile on reconnect.', enabled: true, category: 'CORE' },
    { id: 'f-06', key: 'ENABLE_CUSTOMER_WALLET', nameEn: 'Prepaid Digital Wallet & Gift Cards', nameAr: 'المحفظة الرقمية المدفوعة مسبقاً وبطاقات الهدايا', description: 'Allow customers to maintain balance and redeem points.', enabled: true, category: 'LOYALTY' },
  ]);

  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([
    { currency: 'SAR', rateToSar: 1.0, symbol: 'ر.س', lastUpdated: '2026-08-27' },
    { currency: 'USD', rateToSar: 3.75, symbol: '$', lastUpdated: '2026-08-27' },
    { currency: 'AED', rateToSar: 1.02, symbol: 'د.إ', lastUpdated: '2026-08-27' },
    { currency: 'KWD', rateToSar: 12.25, symbol: 'د.ك', lastUpdated: '2026-08-27' },
    { currency: 'EUR', rateToSar: 4.10, symbol: '€', lastUpdated: '2026-08-27' },
    { currency: 'GBP', rateToSar: 4.85, symbol: '£', lastUpdated: '2026-08-27' },
  ]);

  const licenseInfo: LicensePlan = {
    id: 'lic-saas-enterprise-99',
    planName: 'ENTERPRISE_PLUS',
    maxBranches: 50,
    maxTerminals: 250,
    status: 'ACTIVE',
    validUntil: '2028-12-31',
    features: [
      'Multi-Brand Virtual Kitchens',
      'ZATCA Phase 2 High-Volume Cryptographic Clearer',
      'Central Kitchen Production & Manufacturing',
      'Biometric Timeclock & WPS Payroll',
      'Real-Time CRDT Offline Mesh',
      'Gemini AI Revenue Operations & Fraud Detection',
      'Custom White-label & Dedicated SLA',
    ],
  };

  const toggleFlag = (id: string) => {
    setFeatureFlags(prev =>
      prev.map(f => (f.id === id ? { ...f, enabled: !f.enabled } : f))
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold border border-indigo-500/30">
              {isArabic ? 'بوابة الإدارة المركزية والامتياز التجاري' : 'Central Admin & Franchise Portal'}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
              v2.8 Enterprise
            </span>
          </div>
          <h1 className="text-2xl font-black mt-1">
            {isArabic ? 'إدارة الشركة والمجموعات والفروع' : 'Multi-Brand & Enterprise Management'}
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {isArabic
              ? 'التحكم الشامل في الهوية المؤسسية، نقاط البيع، التراخيص، ومفاتيح الميزات عبر جميع الفروع'
              : 'Centralized control for corporate structure, brands, POS terminals, feature flags, and multi-currency engine'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700 text-right rtl:text-left">
            <span className="text-[11px] text-slate-400 block">{isArabic ? 'حالة الترخيص' : 'License Tier'}</span>
            <span className="text-xs font-black text-amber-400 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> Enterprise Plus (50 Branches)
            </span>
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'COMPANY', labelEn: 'Company Profile', labelAr: 'بيانات المنشأة والضريبة', icon: Building2 },
          { id: 'BRANDS', labelEn: 'Multi-Brands', labelAr: 'العلامات والمطابخ السحابية', icon: Layers },
          { id: 'DEVICES', labelEn: 'Terminals & Devices', labelAr: 'أجهزة نقاط البيع والشاشات', icon: Smartphone },
          { id: 'LICENSE', labelEn: 'Subscription & License', labelAr: 'الاشتراك والتراخيص', icon: Award },
          { id: 'FLAGS', labelEn: 'Feature Flags', labelAr: 'مفاتيح الميزات المتقدمة', icon: Sliders },
          { id: 'LOCALIZATION', labelEn: 'Currencies & Timezone', labelAr: 'العملات والمنطقة الزمنية', icon: Globe },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{isArabic ? tab.labelAr : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* TAB: COMPANY */}
      {activeTab === 'COMPANY' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              {isArabic ? 'البيانات التجارية والقانونية للمنشأة' : 'Legal Entity & Commercial Credentials'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isArabic ? 'الاسم التجاري (عربي)' : 'Legal Name (Arabic)'}
                </label>
                <input
                  type="text"
                  value={form.legalNameAr}
                  onChange={event => setForm(current => ({ ...current, legalNameAr: event.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isArabic ? 'الاسم التجاري (إنجليزي)' : 'Legal Name (English)'}
                </label>
                <input
                  type="text"
                  value={form.legalNameEn}
                  onChange={event => setForm(current => ({ ...current, legalNameEn: event.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isArabic ? 'الرقم الضريبي (ZATCA 15-Digit VAT)' : 'ZATCA VAT Registration Number'}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.vatNumber}
                  onChange={event => setForm(current => ({ ...current, vatNumber: event.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-indigo-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isArabic ? 'رقم السجل التجاري (CR Number)' : 'Commercial Registration (CR)'}
                </label>
                <input
                  type="text"
                  value={form.crNumber}
                  onChange={event => setForm(current => ({ ...current, crNumber: event.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isArabic ? 'نسبة ضريبة القيمة المضافة القياسية' : 'Standard VAT Rate'}
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={form.taxRate * 100}
                  onChange={event => setForm(current => ({ ...current, taxRate: Number(event.target.value) / 100 }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-emerald-600"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  {isArabic ? 'أدخل نسبة الضريبة حسب بلدك (مثال: السعودية 15، مصر 14)' : 'Enter the tax rate for your country (for example: Saudi Arabia 15, Egypt 14).'}
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isArabic ? 'رسوم البلدية للتبغ / المطاعم الراقية' : 'Municipality Fee Rate'}
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={form.municipalityFeeRate * 100}
                  onChange={event => setForm(current => ({ ...current, municipalityFeeRate: Number(event.target.value) / 100 }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isArabic ? 'العملة' : 'Currency'}
                </label>
                <select
                  value={usesCustomCurrency ? 'OTHER' : form.currency}
                  onChange={event => setForm(current => ({ ...current, currency: event.target.value === 'OTHER' ? '' : event.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                >
                  <option value="SAR">SAR ر.س</option>
                  <option value="EGP">EGP ج.م</option>
                  <option value="USD">USD $</option>
                  <option value="AED">AED د.إ</option>
                  <option value="OTHER">{isArabic ? 'أخرى' : 'Other'}</option>
                </select>
              </div>

              {usesCustomCurrency && (
                <>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {isArabic ? 'رمز العملة المخصص' : 'Custom Currency Code'}
                    </label>
                    <input
                      type="text"
                      maxLength={3}
                      value={form.currency}
                      onChange={event => setForm(current => ({ ...current, currency: event.target.value.toUpperCase() }))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold uppercase"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {isArabic ? 'عدد الكسور العشرية للعملة' : 'Currency Decimal Places'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="3"
                      value={form.currencyDecimals}
                      onChange={event => setForm(current => ({ ...current, currencyDecimals: Number(event.target.value) }))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                    />
                  </div>
                </>
              )}
            </div>

            <p className="text-[11px] text-slate-500">
              {isArabic
                ? 'ملاحظة: يُحفظ إعداد العملة فقط، ولا يغيّر أي منطق حسابي.'
                : 'Note: This saves the currency setting only and does not change any calculation logic.'}
            </p>

            {companyFormError && <p role="alert" className="text-xs font-bold text-red-600">{companyFormError}</p>}
            {companyFormSaved && (
              <p role="status" className="text-xs font-bold text-emerald-600">
                {isArabic ? 'تم حفظ الإعدادات ✓' : 'Settings saved ✓'}
              </p>
            )}

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={saveCompanySettings}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                {isArabic ? 'حفظ وتحديث السجلات' : 'Save & Publish Organization Info'}
              </button>
            </div>
          </div>

          {/* Active Branches Snapshot */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {isArabic ? 'شبكة الفروع النشطة' : 'Active Branch Network'}
              </h3>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full">
                {tenant.branches.length} {isArabic ? 'فروع' : 'Branches'}
              </span>
            </div>

            <div className="space-y-3">
              {tenant.branches.map(branch => (
                <div
                  key={branch.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {isArabic ? branch.nameAr : branch.nameEn}
                    </span>
                    {branch.isMainBranch && (
                      <span className="text-[10px] bg-indigo-600 text-white font-bold px-2 py-0.2 rounded-full">
                        {isArabic ? 'الفرع الرئيسي' : 'Main Hub'}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {branch.buildingNumber}, {isArabic ? branch.districtAr : branch.districtEn}, {isArabic ? branch.cityAr : branch.cityEn}
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-slate-400">
                    <span>Code: {branch.code}</span>
                    <span>{branch.kitchenStations.length} Kitchen Stations</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: BRANDS */}
      {activeTab === 'BRANDS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {isArabic ? 'العلامات التجارية والمطابخ السحابية التابعة' : 'Virtual Brands & Multi-Concepts'}
              </h3>
              <p className="text-xs text-slate-500">
                {isArabic
                  ? 'إدارة الهويات المختلفة التي يتم تشغيلها من نفس المطبخ المركزي أو الفروع'
                  : 'Manage multiple concepts operating from central kitchens or shared dine-in locations'}
              </p>
            </div>
            <button className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              {isArabic ? 'إضافة علامة تجارية' : 'Add Brand Concept'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {brands.map(brand => (
              <div
                key={brand.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl shadow-inner">
                    {brand.logo}
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {brand.active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {isArabic ? brand.nameAr : brand.nameEn}
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">Code: {brand.code}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Theme Color</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: brand.primaryColor }} />
                    <span className="font-mono text-[11px] text-slate-400">{brand.primaryColor}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: DEVICES & TERMINALS */}
      {activeTab === 'DEVICES' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-indigo-600" />
                {isArabic ? 'سجل نقاط البيع والأجهزة المسجلة (EGS Terminals)' : 'Registered POS & EGS Hardware Terminals'}
              </h3>
              <p className="text-xs text-slate-500">
                {isArabic
                  ? 'الأجهزة المقترنة بنظام الفوترة الإلكترونية والمشفرة بشهادات ZATCA CSID المعتمدة'
                  : 'Terminals paired with cryptographic CSID certificates and hardware security keys'}
              </p>
            </div>
            <button className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              {isArabic ? 'تسجيل جهاز / نقطة بيع جديدة' : 'Register New Terminal'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 uppercase font-black text-[10px]">
                <tr>
                  <th className="p-3">Device Name</th>
                  <th className="p-3">Branch</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">EGS Serial Number</th>
                  <th className="p-3">Pairing Token</th>
                  <th className="p-3">IP Address</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {terminals.map(term => (
                  <tr key={term.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{term.name}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{term.branchName}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-[10px] font-bold">
                        {term.type}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-indigo-600 font-bold">{term.egsSerialNumber}</td>
                    <td className="p-3 font-mono text-slate-500">{term.pairingToken}</td>
                    <td className="p-3 font-mono text-slate-500">{term.ipAddress}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {term.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: LICENSE */}
      {activeTab === 'LICENSE' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-xs font-black">
                {licenseInfo.planName}
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                {isArabic ? 'اشتراك الامتياز التجاري وسعة النظام' : 'Enterprise SaaS Franchise License'}
              </h3>
              <p className="text-xs text-slate-500">
                Valid through <span className="font-bold text-slate-700 dark:text-slate-300">{licenseInfo.validUntil}</span> (Continuous Enterprise SLA)
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-slate-900 dark:text-white">50</span>
              <span className="text-xs text-slate-400 block">{isArabic ? 'أقصى عدد فروع مسموح' : 'Max Licensed Branches'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {licenseInfo.features.map((feat, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: FEATURE FLAGS */}
      {activeTab === 'FLAGS' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-600" />
              {isArabic ? 'مفاتيح التبديل والتحكم بالميزات (Feature Flags)' : 'Runtime Feature Toggles & System Flags'}
            </h3>
            <p className="text-xs text-slate-500">
              {isArabic
                ? 'تفعيل أو تعطيل القدرات المتقدمة فوريًا عبر جميع نقاط البيع والسحابة دون إعادة تشغيل'
                : 'Instantly toggle enterprise modules across all connected POS terminals and kitchen stations'}
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {featureFlags.map(flag => (
              <div key={flag.id} className="py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                      {isArabic ? flag.nameAr : flag.nameEn}
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {flag.key}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{flag.description}</p>
                </div>

                <button
                  onClick={() => toggleFlag(flag.id)}
                  className={`p-2 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all ${
                    flag.enabled
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {flag.enabled ? (
                    <>
                      <ToggleRight className="w-5 h-5" />
                      <span>{isArabic ? 'مفعل' : 'Enabled'}</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-5 h-5" />
                      <span>{isArabic ? 'معطل' : 'Disabled'}</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: LOCALIZATION & CURRENCIES */}
      {activeTab === 'LOCALIZATION' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-indigo-600" />
              {isArabic ? 'محرك تحويل العملات المعتمد' : 'Multi-Currency Conversion Engine'}
            </h3>

            <div className="space-y-2">
              {exchangeRates.map(rate => (
                <div
                  key={rate.currency}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 font-black flex items-center justify-center">
                      {rate.symbol}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{rate.currency}</span>
                  </div>
                  <div className="text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                    1 {rate.currency} = {rate.rateToSar.toFixed(3)} SAR
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              {isArabic ? 'المنطقة الزمنية والتقويم' : 'Timezone & Regional Locale'}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Standard Timezone</label>
                <input
                  type="text"
                  readOnly
                  value="Asia/Riyadh (UTC+03:00)"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Default Fiscal Currency</label>
                <input
                  type="text"
                  readOnly
                  value="SAR - Saudi Arabian Riyal (ر.س)"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">ZATCA Tax Invoice Layout</label>
                <input
                  type="text"
                  readOnly
                  value="Bilingual (Arabic Primary + English Subtitle) UBL 2.1"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-indigo-600"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
