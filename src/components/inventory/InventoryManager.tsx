import React, { useState } from 'react';
import { InventoryItem, Warehouse, MenuItem } from '../../types';
import {
  Package,
  Boxes,
  ArrowRightLeft,
  FileCheck,
  AlertTriangle,
  Plus,
  Search,
  BookOpen,
  PieChart,
  Trash2,
  Building2,
  CheckCircle,
} from 'lucide-react';

interface InventoryManagerProps {
  inventory: InventoryItem[];
  warehouses: Warehouse[];
  menuItems: MenuItem[];
  currency: string;
  isArabic: boolean;
  onAdjustStock: (itemId: string, warehouseId: string, newQty: number, reason: string) => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  inventory,
  warehouses,
  menuItems,
  currency,
  isArabic,
  onAdjustStock,
}) => {
  const [activeTab, setActiveTab] = useState<'STOCK_LEVELS' | 'RECIPES' | 'PURCHASE_ORDERS' | 'TRANSFERS' | 'WASTE'>('STOCK_LEVELS');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRecipeItem, setSelectedRecipeItem] = useState<MenuItem>(menuItems[0]);

  // Adjust stock quick modal
  const [adjustModalItem, setAdjustModalItem] = useState<InventoryItem | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('Stock Take Variance Reconciliation');

  const filteredInventory = inventory.filter(item => {
    return (
      item.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nameAr.includes(searchQuery) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getComputedRecipeCost = (item: MenuItem) => {
    if (!item.recipe || item.recipe.length === 0) return item.costPrice;
    let totalCost = 0;
    item.recipe.forEach(r => {
      const inv = inventory.find(i => i.id === r.inventoryItemId);
      if (inv) {
        totalCost += inv.costPerUnit * r.quantity * (1 + r.wastePercentage / 100);
      }
    });
    return Number(totalCost.toFixed(2));
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 bg-slate-100 dark:bg-slate-950 gap-4">
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {isArabic ? 'إدارة المخزون، المستودعات وتكاليف الوصفات (BOM)' : 'Inventory, Multi-Warehouse & Recipe BOM Engine'}
            </h2>
            <p className="text-xs text-slate-500">
              {isArabic ? 'تتبع المواد الخام، الخصم الآلي، التحويلات، وتكلفة الوجبات' : 'Raw material tracking, automated BOM deduction, transfers & food costing'}
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {[
              { id: 'STOCK_LEVELS', labelEn: 'Stock On Hand', labelAr: 'مستويات المخزون' },
              { id: 'RECIPES', labelEn: 'Recipes & BOM Costing', labelAr: 'الوصفات وتكلفة الوجبات' },
              { id: 'TRANSFERS', labelEn: 'Stock Transfers', labelAr: 'التحويلات بين الفروع' },
              { id: 'PURCHASE_ORDERS', labelEn: 'Purchase Orders', labelAr: 'أوامر الشراء' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {isArabic ? tab.labelAr : tab.labelEn}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab 1: Stock Levels */}
      {activeTab === 'STOCK_LEVELS' && (
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm overflow-hidden gap-4">
          {/* Warehouse Selector & Search */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">
                {isArabic ? 'المستودع:' : 'Warehouse:'}
              </span>
              <select
                value={selectedWarehouseId}
                onChange={e => setSelectedWarehouseId(e.target.value)}
                className="text-xs font-bold p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white"
              >
                <option value="ALL">{isArabic ? 'كافة المستودعات (إجمالي الشركة)' : 'All Warehouses (Company Total)'}</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>
                    {isArabic ? w.nameAr : w.nameEn} ({w.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 rtl:right-3 rtl:left-auto" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isArabic ? 'بحث بالاسم أو رمز SKU...' : 'Search raw material by SKU or name...'}
                className="w-full text-xs pl-9 pr-3 rtl:pr-9 rtl:pl-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white"
              />
            </div>
          </div>

          {/* Inventory Table */}
          <div className="flex-1 overflow-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left rtl:text-right border-collapse text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 sticky top-0 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">SKU</th>
                  <th className="p-3">{isArabic ? 'اسم المادة الخام' : 'Ingredient / Item'}</th>
                  <th className="p-3">{isArabic ? 'التصنيف' : 'Category'}</th>
                  <th className="p-3">{isArabic ? 'تكلفة الوحدة' : 'Unit Cost'}</th>
                  <th className="p-3">{isArabic ? 'المخزون الحالي' : 'Stock On Hand'}</th>
                  <th className="p-3">{isArabic ? 'حد إعادة الطلب' : 'Min Level'}</th>
                  <th className="p-3">{isArabic ? 'الحالة' : 'Status'}</th>
                  <th className="p-3">{isArabic ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredInventory.map(item => {
                  let totalStock = 0;
                  if (selectedWarehouseId === 'ALL') {
                    totalStock = Object.values(item.currentStock).reduce((a: number, b: number) => a + Number(b || 0), 0);
                  } else {
                    totalStock = Number(item.currentStock[selectedWarehouseId] || 0);
                  }


                  const isLow = totalStock <= item.minStockLevel;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{item.sku}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        {isArabic ? item.nameAr : item.nameEn}
                      </td>
                      <td className="p-3 text-slate-500">{item.category}</td>
                      <td className="p-3 font-semibold">
                        {item.costPerUnit.toFixed(2)} {currency} / {item.unit}
                      </td>
                      <td className="p-3 font-black text-slate-900 dark:text-white text-sm">
                        {totalStock.toFixed(2)} {item.unit}
                      </td>
                      <td className="p-3 text-slate-500">
                        {item.minStockLevel} {item.unit}
                      </td>
                      <td className="p-3">
                        {isLow ? (
                          <span className="bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3" />
                            {isArabic ? 'منخفض' : 'Low Stock'}
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full text-[10px] w-fit">
                            {isArabic ? 'متوفر' : 'Optimal'}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => {
                            setAdjustModalItem(item);
                            setAdjustQty(totalStock);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-bold text-[11px] hover:bg-indigo-100"
                        >
                          {isArabic ? 'تعديل / جرد' : 'Adjust'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Recipes & BOM Costing */}
      {activeTab === 'RECIPES' && (
        <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
          {/* Menu items sidebar */}
          <div className="w-full lg:w-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-3 shrink-0 shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {isArabic ? 'قائمة وجبات المطعم' : 'Restaurant Menu Items'}
            </h3>
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {menuItems.map(m => {
                const isSelected = selectedRecipeItem.id === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedRecipeItem(m)}
                    className={`w-full p-3 rounded-xl border text-left rtl:text-right flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold">{isArabic ? m.nameAr : m.nameEn}</p>
                      <span className="text-[10px] text-slate-400">{m.sku}</span>
                    </div>
                    <span className="text-xs font-bold text-indigo-600">{m.price} SAR</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* BOM Breakdown detail */}
          <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col overflow-y-auto space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={selectedRecipeItem.image}
                  alt={selectedRecipeItem.nameEn}
                  className="w-14 h-14 rounded-xl object-cover"
                />
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">
                    {isArabic ? selectedRecipeItem.nameAr : selectedRecipeItem.nameEn}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedRecipeItem.sku} • Category: {selectedRecipeItem.categoryId}</p>
                </div>
              </div>

              {/* Cost vs Price KPI */}
              <div className="flex items-center gap-3">
                <div className="text-right rtl:text-left bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 block">{isArabic ? 'سعر البيع (شامل الضريبة)' : 'Selling Price'}</span>
                  <span className="text-base font-black text-slate-900 dark:text-white">{selectedRecipeItem.price.toFixed(2)} SAR</span>
                </div>
                <div className="text-right rtl:text-left bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-300 block">{isArabic ? 'تكلفة المكونات (COGS)' : 'Recipe Cost'}</span>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                    {getComputedRecipeCost(selectedRecipeItem).toFixed(2)} SAR
                  </span>
                </div>
                <div className="text-right rtl:text-left bg-indigo-50 dark:bg-indigo-950/40 p-3 rounded-xl border border-indigo-200 dark:border-indigo-800">
                  <span className="text-[10px] text-indigo-700 dark:text-indigo-300 block">{isArabic ? 'هامش الربح الإجمالي' : 'Gross Margin'}</span>
                  <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
                    {(
                      ((selectedRecipeItem.price / 1.15 - getComputedRecipeCost(selectedRecipeItem)) /
                        (selectedRecipeItem.price / 1.15)) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* BOM Table */}
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">
                {isArabic ? 'جدول مكونات الوصفة المعيارية (Bill of Materials):' : 'Standard Bill of Materials (BOM) Breakdown:'}
              </h4>
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left rtl:text-right text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">{isArabic ? 'المادة الخام' : 'Ingredient'}</th>
                      <th className="p-3">{isArabic ? 'الكمية المطلوبة للوجبة' : 'Portion Required'}</th>
                      <th className="p-3">{isArabic ? 'نسبة الهدر الطبيعي' : 'Waste %'}</th>
                      <th className="p-3">{isArabic ? 'سعر وحدة الشراء' : 'Unit Cost'}</th>
                      <th className="p-3">{isArabic ? 'تكلفة المكون بالوجبة' : 'Line Cost'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedRecipeItem.recipe.map((r, idx) => {
                      const inv = inventory.find(i => i.id === r.inventoryItemId);
                      const unitCost = inv?.costPerUnit || 0;
                      const lineCost = unitCost * r.quantity * (1 + r.wastePercentage / 100);

                      return (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-3 font-bold text-slate-900 dark:text-white">
                            {inv ? (isArabic ? inv.nameAr : inv.nameEn) : r.inventoryItemId}
                          </td>
                          <td className="p-3 font-mono font-semibold">
                            {r.quantity} {r.unit}
                          </td>
                          <td className="p-3 text-slate-500">{r.wastePercentage}%</td>
                          <td className="p-3 text-slate-500">
                            {unitCost.toFixed(2)} SAR / {r.unit}
                          </td>
                          <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">
                            {lineCost.toFixed(2)} SAR
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Stock Transfers */}
      {activeTab === 'TRANSFERS' && (
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {isArabic ? 'أوامر التحويل بين المستودعات والفروع' : 'Inter-Warehouse & Inter-Branch Transfers'}
            </h3>
            <button className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              {isArabic ? 'طلب تحويل جديد' : 'New Stock Transfer'}
            </button>
          </div>

          <div className="space-y-3">
            {[
              {
                id: 'TR-2026-089',
                from: 'المستودع الرئيسي (الرياض)',
                to: 'مطبخ فرع العليا',
                date: '2026-08-27',
                items: '65 كجم لحم واغيو، 200 خبز بريوش',
                status: 'COMPLETED',
              },
              {
                id: 'TR-2026-090',
                from: 'المستودع الرئيسي (الرياض)',
                to: 'فرع الواجهة البحرية (جدة)',
                date: '2026-08-26',
                items: '80 كجم لحم أنجوس، 300 عبوة صودا',
                status: 'IN_TRANSIT',
              },
            ].map(tr => (
              <div
                key={tr.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{tr.id}</span>
                    <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-xs font-bold px-2 py-0.5 rounded-full">
                      {tr.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {tr.from} ➔ {tr.to}
                  </p>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                    {tr.items}
                  </p>
                </div>

                <div className="text-right rtl:text-left text-xs text-slate-400">
                  {tr.date}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Purchase Orders */}
      {activeTab === 'PURCHASE_ORDERS' && (
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {isArabic ? 'أوامر الشراء وعقود الموردين (POs)' : 'Supplier Purchase Orders & Deliveries'}
            </h3>
            <button className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              {isArabic ? 'إنشاء أمر شراء PO' : 'Create Purchase Order'}
            </button>
          </div>

          <div className="space-y-3">
            {[
              {
                id: 'PO-2026-104',
                supplier: 'شركة اللحوم الفاخرة العالمية (Gourmet Meats Ltd.)',
                total: 14850.0,
                status: 'RECEIVED',
                date: '2026-08-25',
              },
              {
                id: 'PO-2026-105',
                supplier: 'مخبز الحرفيين للحلويات والمخبوزات',
                total: 2400.0,
                status: 'ORDERED',
                date: '2026-08-27',
              },
            ].map(po => (
              <div
                key={po.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{po.id}</span>
                    <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold px-2 py-0.5 rounded-full">
                      {po.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{po.supplier}</p>
                </div>

                <div className="text-right rtl:text-left">
                  <span className="font-black text-sm text-slate-900 dark:text-white">{po.total.toFixed(2)} SAR</span>
                  <p className="text-[11px] text-slate-400">{po.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {adjustModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {isArabic ? `جرد وتسوية مخزون: ${adjustModalItem.nameAr}` : `Adjust Stock: ${adjustModalItem.nameEn}`}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isArabic ? 'الكمية الفعلية المحصاة' : 'Actual Counted Quantity'} ({adjustModalItem.unit})
              </label>
              <input
                type="number"
                value={adjustQty}
                onChange={e => setAdjustQty(Number(e.target.value))}
                className="w-full text-lg font-black p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isArabic ? 'سبب التسوية' : 'Reason for Adjustment'}
              </label>
              <input
                type="text"
                value={adjustReason}
                onChange={e => setAdjustReason(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setAdjustModalItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  onAdjustStock(adjustModalItem.id, 'wh-kitchen', adjustQty, adjustReason);
                  setAdjustModalItem(null);
                }}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
              >
                {isArabic ? 'تأكيد التسوية' : 'Save Adjustment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
