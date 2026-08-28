import React, { useState } from 'react';
import { MenuItem, Category, InventoryItem, MenuVersion, MenuSchedule } from '../../types';
import { globalMenuEngine } from '../../domain/menu/menuEngine';
import {
  Utensils,
  Sparkles,
  Clock,
  Layers,
  AlertTriangle,
  Flame,
  Check,
  Search,
  Plus,
  Percent,
  TrendingUp,
  Tag,
  ShieldCheck,
  Package,
} from 'lucide-react';

interface AdvancedMenuEngineProps {
  menuItems: MenuItem[];
  categories: Category[];
  inventoryItems: InventoryItem[];
  isArabic: boolean;
  onUpdateItemAvailability: (itemId: string, isAvailable: boolean) => void;
}

export const AdvancedMenuEngine: React.FC<AdvancedMenuEngineProps> = ({
  menuItems,
  categories,
  inventoryItems,
  isArabic,
  onUpdateItemAvailability,
}) => {
  const [activeTab, setActiveTab] = useState<'ITEMS_COGS' | 'VERSIONS' | 'SCHEDULES' | 'COMBOS' | 'ALLERGENS'>('ITEMS_COGS');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const versions = globalMenuEngine.getVersions();
  const schedules = globalMenuEngine.getSchedules();

  const filteredItems = menuItems.filter(item => {
    const matchesSearch =
      item.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nameAr.includes(searchQuery) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || item.categoryId === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
              {isArabic ? 'محرك قوائم الطعام وهندسة التكاليف' : 'Advanced Menu Engine & Recipe COGS'}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-mono font-bold">
              v2.8 Dynamic
            </span>
          </div>
          <h1 className="text-2xl font-black mt-1">
            {isArabic ? 'إدارة الوجبات، الأسعار الديناميكية، وهامش الربح' : 'Menu Engineering, Dynamic Pricing & Combos'}
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {isArabic
              ? 'تتبع تكاليف الوصفات الدقيقة، جدول أسعار ساعات السعادة، مسببات الحساسية، وبناء وجبات الكومبو'
              : 'Real-time BOM recipe cost calculations, happy hour scheduler, allergen badges, and combo builder'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700 text-right rtl:text-left">
            <span className="text-[11px] text-slate-400 block">{isArabic ? 'إجمالي الأصناف' : 'Total Items'}</span>
            <span className="text-sm font-black text-white">{menuItems.length} SKUs Active</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'ITEMS_COGS', labelEn: 'Item Catalog & Recipe COGS', labelAr: 'الأصناف وهوامش الربح', icon: Utensils },
          { id: 'VERSIONS', labelEn: 'Menu Versioning', labelAr: 'إصدارات القوائم والجدولة', icon: Layers },
          { id: 'SCHEDULES', labelEn: 'Happy Hour & Dayparting', labelAr: 'ساعات السعادة والأسعار الديناميكية', icon: Clock },
          { id: 'COMBOS', labelEn: 'Combo & Meal Builder', labelAr: 'الوجبات المركبة والكومبو', icon: Package },
          { id: 'ALLERGENS', labelEn: 'Allergens & Nutrition', labelAr: 'مسببات الحساسية والقيم الغذائية', icon: ShieldCheck },
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

      {/* TAB: ITEMS & COGS */}
      {activeTab === 'ITEMS_COGS' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 rtl:left-auto rtl:right-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isArabic ? 'البحث عن صنف أو رمز SKU...' : 'Search item name or SKU...'}
                className="w-full pl-9 pr-4 rtl:pl-4 rtl:pr-9 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap ${
                  selectedCategory === 'ALL'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {isArabic ? 'الكل' : 'All Categories'}
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {isArabic ? cat.nameAr : cat.nameEn}
                </button>
              ))}
            </div>
          </div>

          {/* Items Table with COGS & Live Margin */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 uppercase font-black text-[10px]">
                  <tr>
                    <th className="p-3.5">Item & SKU</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5 text-right rtl:text-left">Price (SAR)</th>
                    <th className="p-3.5 text-right rtl:text-left">Recipe Cost</th>
                    <th className="p-3.5 text-right rtl:text-left">Gross Margin</th>
                    <th className="p-3.5 text-center">Food Cost %</th>
                    <th className="p-3.5 text-center">Kitchen Availability (86)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {filteredItems.map(item => {
                    const cogs = globalMenuEngine.calculateRecipeCogs(item, inventoryItems);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.image}
                              alt={item.nameEn}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                            />
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block">
                                {isArabic ? item.nameAr : item.nameEn}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">{item.sku}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-bold text-[10px] text-slate-600 dark:text-slate-300">
                            {categories.find(c => c.id === item.categoryId)?.[isArabic ? 'nameAr' : 'nameEn'] || item.categoryId}
                          </span>
                        </td>

                        <td className="p-3.5 text-right rtl:text-left font-mono font-bold text-slate-900 dark:text-white">
                          SAR {item.price.toFixed(2)}
                        </td>

                        <td className="p-3.5 text-right rtl:text-left font-mono font-bold text-slate-500">
                          SAR {cogs.totalCost.toFixed(2)}
                        </td>

                        <td className="p-3.5 text-right rtl:text-left font-mono font-bold text-emerald-600">
                          SAR {cogs.grossProfit.toFixed(2)}
                        </td>

                        <td className="p-3.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-black ${
                              cogs.rating === 'HEALTHY'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : cogs.rating === 'WARNING'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {cogs.foodCostPercentage}%
                          </span>
                        </td>

                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => onUpdateItemAvailability(item.id, !item.isAvailable)}
                            className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-colors ${
                              item.isAvailable
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {item.isAvailable ? (isArabic ? 'متاح (Available)' : 'In Stock') : (isArabic ? 'نفد (86 List)' : 'Out of Stock')}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: VERSIONS */}
      {activeTab === 'VERSIONS' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {isArabic ? 'إصدارات قوائم الطعام وسجل التعديلات' : 'Menu Release Versioning & Rollback'}
              </h3>
              <p className="text-xs text-slate-500">
                {isArabic
                  ? 'إمكانية نشر قوائم مجدولة واسترجاع الإصدارات السابقة بنقرة واحدة'
                  : 'Manage versioned releases, stage seasonal menus, and instantly rollback pricing changes'}
              </p>
            </div>
            <button className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              {isArabic ? 'إنشاء مسودة إصدار جديد' : 'Create New Menu Version'}
            </button>
          </div>

          <div className="space-y-3">
            {versions.map(v => (
              <div
                key={v.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400">
                      {v.versionNumber}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{v.name}</h4>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        v.status === 'PUBLISHED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {v.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{v.changesSummary}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono text-slate-400">{v.itemCount} Items</span>
                  {v.status !== 'PUBLISHED' && (
                    <button className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700">
                      {isArabic ? 'نشر الإصدار' : 'Publish to POS'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: SCHEDULES */}
      {activeTab === 'SCHEDULES' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                {isArabic ? 'جدولة الأسعار وساعات السعادة (Happy Hour Engine)' : 'Automated Happy Hour & Daypart Schedules'}
              </h3>
              <p className="text-xs text-slate-500">
                {isArabic
                  ? 'تطبيق خصومات مبرمجة تلقائيًا حسب أوقات اليوم وأيام الأسبوع'
                  : 'Time-of-day pricing rules that trigger automatically on all cashier screens'}
              </p>
            </div>
            <button className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              {isArabic ? 'إضافة موعد جديد' : 'New Schedule Rule'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schedules.map(sch => (
              <div
                key={sch.id}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                    {sch.isHappyHour ? 'HAPPY HOUR' : 'BUSINESS DAYPART'}
                  </span>
                  <span className="font-mono text-xs font-black text-emerald-600">
                    -{sch.priceDiscountPercent}% Discount
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {isArabic ? sch.nameAr : sch.nameEn}
                  </h4>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {sch.startTime} - {sch.endTime} (Sun - Thu)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: COMBOS */}
      {activeTab === 'COMBOS' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            {isArabic ? 'الوجبات المجمعة وحزم الكومبو (Combos & Bundles)' : 'Step-by-Step Combo & Bundle Packages'}
          </h3>
          <p className="text-xs text-slate-500">
            {isArabic
              ? 'إنشاء وجبات متعددة الخطوات (اختيار البرجر + اختيار البطاطس + اختيار المشروب مع الفروقات السعرية)'
              : 'Configurable step-based combo packages with optional pricing deltas on premium sides and beverages'}
          </p>

          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-indigo-900 dark:text-indigo-200">
                {isArabic ? 'وجبة الواغيو الملكية (Wagyu Royal Combo)' : 'Wagyu Royal Feast Combo Package'}
              </span>
              <span className="font-mono font-black text-indigo-700 dark:text-indigo-300 text-sm">
                Base Price: SAR 85.00
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900">
                <span className="font-bold block text-slate-900 dark:text-white">Step 1: Choose Main</span>
                <span className="text-[11px] text-slate-500 block">Truffle Wagyu Burger (+0 SAR)</span>
                <span className="text-[11px] text-slate-500 block">Double Smokey Wagyu (+12 SAR)</span>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900">
                <span className="font-bold block text-slate-900 dark:text-white">Step 2: Choose Side</span>
                <span className="text-[11px] text-slate-500 block">Crispy Skin-on Fries (+0 SAR)</span>
                <span className="text-[11px] text-slate-500 block">Truffle Parmesan Fries (+6 SAR)</span>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900">
                <span className="font-bold block text-slate-900 dark:text-white">Step 3: Beverage</span>
                <span className="text-[11px] text-slate-500 block">Soft Drink 330ml (+0 SAR)</span>
                <span className="text-[11px] text-slate-500 block">Artisan Passion Mojito (+8 SAR)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: ALLERGENS */}
      {activeTab === 'ALLERGENS' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            {isArabic ? 'مصفوفة الحساسية الغذائية والمعلومات التغذوية' : 'Allergen Safety Matrix & Nutritional Values'}
          </h3>
          <p className="text-xs text-slate-500">
            {isArabic
              ? 'عرض شارات الحساسية الغذائية والسعرات الحرارية والماكروز لضمان سلامة العملاء'
              : 'SFDA food safety compliance with macro breakdowns (Protein, Carbs, Fat, KCal)'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menuItems.slice(0, 4).map(item => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    {isArabic ? item.nameAr : item.nameEn}
                  </span>
                  <span className="font-mono text-xs text-amber-600 font-bold">
                    {item.calories || 650} kcal
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['GLUTEN', 'DAIRY', 'EGGS'].map((alg, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    >
                      {alg}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
