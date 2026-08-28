import React, { useState } from 'react';
import { globalFranchise } from '../../domain/franchise/franchiseEngine';
import { Franchisee, CorporateMenuDistribution } from '../../types';
import {
  Globe2,
  Building2,
  Percent,
  TrendingUp,
  ShieldCheck,
  Send,
  Award,
  Layers,
  Sparkles,
  MapPin,
  CheckCircle2,
  FileText,
} from 'lucide-react';

interface FranchiseManagementViewProps {
  isArabic: boolean;
}

export const FranchiseManagementView: React.FC<FranchiseManagementViewProps> = ({ isArabic }) => {
  const [franchisees, setFranchisees] = useState<Franchisee[]>(() => globalFranchise.getFranchisees());
  const [distributions, setDistributions] = useState<CorporateMenuDistribution[]>(() => globalFranchise.getDistributions());
  const [selectedFranchisee, setSelectedFranchisee] = useState<Franchisee | null>(franchisees[0] || null);

  const [isPushModalOpen, setIsPushModalOpen] = useState(false);
  const [menuTemplateName, setMenuTemplateName] = useState('Ramadan Premium Menu 2027');
  const [targetRegion, setTargetRegion] = useState('Western Province');

  const totalRoyaltyDue = franchisees.reduce((s, f) => s + f.royaltiesDueSar, 0);
  const totalRevenueYtd = franchisees.reduce((s, f) => s + f.totalRevenueYtdSar, 0);

  const handlePushCorporateMenu = (e: React.FormEvent) => {
    e.preventDefault();
    globalFranchise.publishCorporateMenu({
      templateName: menuTemplateName,
      targetRegions: [targetRegion],
      targetBranches: ['b1', 'b2'],
      version: 'v3.0.0',
      effectiveDate: new Date().toISOString().split('T')[0],
      priceAdjustmentType: 'PERCENT_INCREASE',
      priceAdjustmentValue: 0.0,
    });
    setDistributions([...globalFranchise.getDistributions()]);
    setIsPushModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 text-slate-100">
      {/* Top Header */}
      <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-indigo-400" />
            <h1 className="text-lg font-black tracking-tight text-white">
              {isArabic ? 'إدارة الامتياز التجاري وسلاسل الفروع (Franchise HQ)' : 'Enterprise Franchise & Multi-Unit HQ'}
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
              Multi-Region Hub
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {isArabic
              ? 'مراقبة الممنوحين للامتياز، احتساب الإتاوات الملكية (Royalties)، وتوزيع قوائم الأسعار المركزية وتدقيق الامتثال'
              : 'Franchisee lifecycle, automated royalty ledger calculations, central menu cascading, and brand compliance auditing'}
          </p>
        </div>

        <button
          onClick={() => setIsPushModalOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>{isArabic ? 'بث قائمة طعام مركزية للفروع' : 'Push Corporate Menu'}</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-slate-400 text-xs">{isArabic ? 'إجمالي مبيعات شبكة الامتياز' : 'Total Franchise Network GMV'}</span>
          <p className="text-xl font-black text-white font-mono mt-1">
            {totalRevenueYtd.toLocaleString()} <span className="text-xs text-indigo-400">SAR</span>
          </p>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-slate-400 text-xs">{isArabic ? 'عوائد الإتاوة المستحقة (Royalties)' : 'Accrued Royalty Dues'}</span>
          <p className="text-xl font-black text-emerald-400 font-mono mt-1">
            {totalRoyaltyDue.toLocaleString()} <span className="text-xs">SAR</span>
          </p>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-slate-400 text-xs">{isArabic ? 'معدل الامتثال لمعايير العلامة' : 'Avg. Brand Compliance'}</span>
          <p className="text-xl font-black text-indigo-400 font-mono mt-1">94.5%</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-slate-400 text-xs">{isArabic ? 'عدد الفروع التابعة' : 'Franchise Units'}</span>
          <p className="text-xl font-black text-white font-mono mt-1">6 Branches</p>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 pt-0">
        {/* Left 2 Cols: Franchisee Directory & Scorecards */}
        <div className="lg:col-span-2 space-y-3 overflow-y-auto pr-1">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {isArabic ? 'قائمة شركاء الامتياز التجاري' : 'Active Franchise Partners'}
          </h2>

          <div className="space-y-3">
            {franchisees.map(f => (
              <div
                key={f.id}
                onClick={() => setSelectedFranchisee(f)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedFranchisee?.id === f.id
                    ? 'bg-slate-900 border-indigo-500 shadow-md shadow-indigo-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-indigo-400 text-xs font-bold">{f.agreementNumber}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          f.status === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {f.status}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1">{f.legalEntityName}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                      {f.territoryRegion}
                    </p>
                  </div>

                  <div className="text-right rtl:text-left">
                    <span className="text-[11px] text-slate-400">{isArabic ? 'إتاوة مستحقة' : 'Royalty Due'}</span>
                    <p className="text-sm font-black text-emerald-400 font-mono">
                      {f.royaltiesDueSar.toLocaleString()} SAR
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-500">{isArabic ? 'نسبة الإتاوة' : 'Royalty Rate'}</span>
                    <p className="font-bold text-white font-mono">{f.royaltyFeePercent}% + {f.marketingFundFeePercent}% Mktg</p>
                  </div>
                  <div>
                    <span className="text-slate-500">{isArabic ? 'مبيعات العام' : 'YTD GMV'}</span>
                    <p className="font-bold text-white font-mono">{f.totalRevenueYtdSar.toLocaleString()} SAR</p>
                  </div>
                  <div>
                    <span className="text-slate-500">{isArabic ? 'مؤشر الجودة والامتثال' : 'Audit Score'}</span>
                    <p className="font-bold text-indigo-400 font-mono">★ {f.complianceScorePercent}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Corporate Distribution & Details */}
        <div className="space-y-4 overflow-y-auto">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                {isArabic ? 'تحديثات القوائم المركزية (Central Deployments)' : 'Corporate Menu Distributions'}
              </h3>
            </div>

            <div className="space-y-2">
              {distributions.map(d => (
                <div key={d.id} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{d.templateName}</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                      {d.version}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    {isArabic ? 'المناطق المستهدفة:' : 'Targets:'} {d.targetRegions.join(', ')}
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500">
                    <span>{isArabic ? 'تاريخ السريان:' : 'Effective:'} {d.effectiveDate}</span>
                    <span className="text-indigo-400 font-bold">{d.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedFranchisee && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-white uppercase tracking-wider">
                  {isArabic ? 'تفاصيل عقد الامتياز' : 'Contract & Franchisee Specs'}
                </h3>
              </div>
              <div className="space-y-2 text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-500">{isArabic ? 'بداية العقد:' : 'Contract Start:'}</span>
                  <span className="font-mono">{selectedFranchisee.contractStartDate}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-500">{isArabic ? 'نهاية العقد:' : 'Contract Expiry:'}</span>
                  <span className="font-mono">{selectedFranchisee.contractExpiryDate}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-500">{isArabic ? 'الفروع التابعة:' : 'Branches Assigned:'}</span>
                  <span className="font-mono">{selectedFranchisee.assignedBranches.length} locations</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Push Corporate Menu Modal */}
      {isPushModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white">
              {isArabic ? 'بث وتوزيع قائمة طعام وأسعار مركزية' : 'Publish Corporate Menu & Pricing'}
            </h3>
            <form onSubmit={handlePushCorporateMenu} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold mb-1 block">
                  {isArabic ? 'اسم قالب القائمة' : 'Menu Template Name'}
                </label>
                <input
                  type="text"
                  value={menuTemplateName}
                  onChange={e => setMenuTemplateName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-semibold focus:outline-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold mb-1 block">
                  {isArabic ? 'المنطقة المستهدفة' : 'Target Territory'}
                </label>
                <select
                  value={targetRegion}
                  onChange={e => setTargetRegion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-semibold focus:outline-indigo-500"
                >
                  <option value="Western Province">Western Province (Jeddah & Makkah)</option>
                  <option value="Eastern Province">Eastern Province (Dammam & Khobar)</option>
                  <option value="Central Province">Central Province (Riyadh)</option>
                  <option value="All Territories">All Territories (National)</option>
                </select>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-400">
                {isArabic
                  ? 'سيتم تحديث قوائم الأسعار وشاشات نقاط البيع وكافة أجهزة KDS التابعة للمنطقة المحددة تلقائياً.'
                  : 'All POS terminals and digital menus in the selected region will update in real-time.'}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPushModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 cursor-pointer"
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-500 cursor-pointer shadow-lg shadow-indigo-600/30"
                >
                  {isArabic ? 'تأكيد البث المباشر' : 'Deploy Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
