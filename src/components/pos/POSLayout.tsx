import React, { useState } from 'react';
import {
  MenuItem,
  Category,
  ModifierGroup,
  Order,
  DiningTable,
  Customer,
  TenantConfig,
  OrderItem,
  SelectedModifier,
  OrderType,
} from '../../types';
import { ProductModifierModal } from './ProductModifierModal';
import { SplitPaymentModal } from './SplitPaymentModal';
import { ReceiptModal } from './ReceiptModal';
import { globalHardwareBridge } from '../../domain/hardware/hardwareBridge';
import {
  Search,
  Barcode,
  Scale,
  Plus,
  Minus,
  Trash2,
  User,
  Users,
  Percent,
  Flame,
  Utensils,
  Beef,
  Coffee,
  Cake,
  Layers,
  ArrowRight,
  Receipt,
  Sparkles,
  ShoppingBag,
  Car,
  Truck,
  Monitor,
  Store,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface POSLayoutProps {
  tenant: TenantConfig;
  categories: Category[];
  menuItems: MenuItem[];
  modifierGroups: ModifierGroup[];
  tables: DiningTable[];
  customers: Customer[];
  activeOrder: Order | null;
  currency: string;
  isArabic: boolean;
  onSaveOrder: (order: Order) => void;
  onProcessPayment: (
    orderId: string,
    method: any,
    tenderedAmount: number,
    tipAmount: number,
    cardLast4?: string,
    isB2B?: boolean,
    buyerDetails?: { name: string; vat: string }
  ) => Promise<{ order: Order; zatcaResult: any }>;
  onSelectTable?: (table: DiningTable) => void;
}

export const POSLayout: React.FC<POSLayoutProps> = ({
  tenant,
  categories,
  menuItems,
  modifierGroups,
  tables,
  customers,
  activeOrder,
  currency,
  isArabic,
  onSaveOrder,
  onProcessPayment,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [orderType, setOrderType] = useState<OrderType>('DINE_IN');
  const [selectedTableId, setSelectedTableId] = useState<string>('tbl-1');
  const [guestCount, setGuestCount] = useState<number>(2);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [currentOrderItems, setCurrentOrderItems] = useState<OrderItem[]>(() => {
    return activeOrder?.items || [];
  });
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [activeCourseFilter, setActiveCourseFilter] = useState<number | null>(null);

  // Modals
  const [activeModItem, setActiveModItem] = useState<MenuItem | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);
  const [completedOrderForReceipt, setCompletedOrderForReceipt] = useState<Order | null>(null);

  // Simulated Hardware Scale weight
  const [simulatedScaleWeight, setSimulatedScaleWeight] = useState<number>(0.45);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame': return Flame;
      case 'Beef': return Beef;
      case 'Utensils': return Utensils;
      case 'Coffee': return Coffee;
      case 'Cake': return Cake;
      default: return Layers;
    }
  };

  // Filter menu items
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategoryId === 'ALL' || item.categoryId === selectedCategoryId;
    const matchesSearch =
      item.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nameAr.includes(searchQuery) ||
      (item.sku && item.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.barcode && item.barcode.includes(searchQuery));
    return matchesCategory && matchesSearch;
  });

  // Calculate Cart Totals
  const rawSubtotal = currentOrderItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const discountAmount = discountPercent > 0 ? (rawSubtotal * discountPercent) / 100 : 0;
  const taxableAmount = (rawSubtotal - discountAmount) / (1 + tenant.taxRate);
  const taxAmount = (rawSubtotal - discountAmount) - taxableAmount;
  const finalTotal = Math.max(0, rawSubtotal - discountAmount);

  // Add Item to Cart
  const handleAddItemToCart = (
    item: MenuItem,
    selectedModifiers: SelectedModifier[] = [],
    quantity: number = 1,
    specialInstructions: string = '',
    customUnitPrice?: number
  ) => {
    const unitPrice = customUnitPrice !== undefined ? customUnitPrice : item.price;
    const lineTotal = unitPrice * quantity;
    const itemVat = (lineTotal * tenant.taxRate) / (1 + tenant.taxRate);

    const newItem: OrderItem = {
      id: `ITEM-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      menuItemId: item.id,
      nameEn: item.nameEn,
      nameAr: item.nameAr,
      unitPrice,
      quantity,
      discountAmount: 0,
      taxAmount: itemVat,
      totalPrice: lineTotal,
      stationId: item.stationId,
      stationName: item.stationId === 'st-grill' ? 'محطة الشواء' : 'المطبخ',
      status: 'QUEUED',
      selectedModifiers,
      courseNumber: activeCourseFilter || (item.categoryId === 'cat-appetizers' ? 1 : item.categoryId === 'cat-desserts' ? 3 : 2),
      specialInstructions,
    };

    setCurrentOrderItems(prev => [...prev, newItem]);
    globalHardwareBridge.updateCustomerDisplay(
      `Added: ${isArabic ? item.nameAr : item.nameEn}`,
      `Total: SAR ${(finalTotal + lineTotal).toFixed(2)}`
    );
  };

  const handleUpdateItemQty = (id: string, delta: number) => {
    setCurrentOrderItems(prev => {
      return prev
        .map(item => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            const unit = item.totalPrice / item.quantity;
            const newTotal = unit * newQty;
            const newTax = (newTotal * tenant.taxRate) / (1 + tenant.taxRate);
            return {
              ...item,
              quantity: newQty,
              totalPrice: newTotal,
              taxAmount: newTax,
            };
          }
          return item;
        })
        .filter(Boolean) as OrderItem[];
    });
  };

  const handleRemoveItem = (id: string) => {
    setCurrentOrderItems(prev => prev.filter(i => i.id !== id));
  };

  // Build full Order Object
  const currentOrder: Order = {
    id: activeOrder?.id || `ORD-${Date.now()}`,
    orderNumber: activeOrder?.orderNumber || `#ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    dailySequence: activeOrder?.dailySequence || 52,
    tenantId: tenant.id,
    branchId: tenant.branches[0]?.id || 'branch-01',
    orderType,
    tableId: orderType === 'DINE_IN' ? selectedTableId : undefined,
    tableName: orderType === 'DINE_IN' ? tables.find(t => t.id === selectedTableId)?.nameAr : undefined,
    guestCount,
    customerId: selectedCustomerId || undefined,
    customerName: customers.find(c => c.id === selectedCustomerId)?.name,
    items: currentOrderItems,
    subtotal: rawSubtotal,
    discountAmount,
    discountType: discountPercent > 0 ? 'PERCENTAGE' : undefined,
    taxableAmount,
    taxAmount,
    municipalityFeeAmount: 0,
    serviceChargeAmount: 0,
    tipAmount: activeOrder?.tipAmount || 0,
    totalAmount: finalTotal,
    paidAmount: activeOrder?.paidAmount || 0,
    balanceAmount: finalTotal - (activeOrder?.paidAmount || 0),
    status: activeOrder?.status || 'PENDING',
    paymentStatus: activeOrder?.paymentStatus || 'UNPAID',
    payments: activeOrder?.payments || [],
    openedAt: activeOrder?.openedAt || new Date().toISOString(),
    cashierId: 'usr-cashier-01',
    cashierName: 'فهد العتيبي',
    shiftId: 'shift-2026-0827-01',
    zatcaStatus: activeOrder?.zatcaStatus || 'NOT_APPLICABLE',
    zatcaInvoiceType: 'SIMPLIFIED',
    vectorClock: { 'POS-01': Date.now() },
    version: (activeOrder?.version || 0) + 1,
  };

  const handleSaveDraft = () => {
    if (currentOrderItems.length === 0) return;
    onSaveOrder(currentOrder);
  };

  const handleCompletePaymentAndShowReceipt = async (
    orderId: string,
    method: any,
    tenderedAmount: number,
    tipAmount: number,
    cardLast4?: string,
    isB2B?: boolean,
    buyerDetails?: { name: string; vat: string }
  ) => {
    // Make sure latest items are saved in order
    onSaveOrder(currentOrder);

    const result = await onProcessPayment(
      orderId,
      method,
      tenderedAmount,
      tipAmount,
      cardLast4,
      isB2B,
      buyerDetails
    );

    // Trigger celebration confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    setCompletedOrderForReceipt(result.order);
    setCurrentOrderItems([]);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-slate-100 dark:bg-slate-950">
      {/* Left / Middle: Catalog & Filter area */}
      <div className="flex-1 flex flex-col overflow-hidden p-3 sm:p-4 gap-3">
        {/* Top Controls Bar */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
          {/* Order Type Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'DINE_IN', labelEn: 'Dine-In', labelAr: 'محلي (طاولات)', icon: Store },
              { id: 'TAKEAWAY', labelEn: 'Takeaway', labelAr: 'سفري', icon: ShoppingBag },
              { id: 'DRIVE_THRU', labelEn: 'Drive-Thru', labelAr: 'خدمة السيارات', icon: Car },
              { id: 'DELIVERY', labelEn: 'Delivery', labelAr: 'توصيل', icon: Truck },
              { id: 'KIOSK', labelEn: 'Self Kiosk', labelAr: 'كشك ذاتي', icon: Monitor },
            ].map(type => {
              const Icon = type.icon;
              const isSelected = orderType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => setOrderType(type.id as OrderType)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{isArabic ? type.labelAr : type.labelEn}</span>
                </button>
              );
            })}
          </div>

          {/* Search + Barcode + Scale simulation */}
          <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 rtl:right-3 rtl:left-auto" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isArabic ? 'بحث بالاسم، الباركود أو الرمز SKU...' : 'Search items, SKU, or scan barcode...'}
                className="w-full text-xs sm:text-sm pl-9 pr-3 rtl:pr-9 rtl:pl-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
              />
            </div>

            <button
              onClick={() => {
                // Simulate scanning a barcode
                const randomItem = menuItems[Math.floor(Math.random() * menuItems.length)];
                if (randomItem.barcode) {
                  globalHardwareBridge.triggerBarcodeScan(randomItem.barcode);
                  handleAddItemToCart(randomItem);
                }
              }}
              title="Scan Barcode (Simulator)"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 transition-colors"
            >
              <Barcode className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                // Simulate tare/weight
                const newWeight = Number((0.3 + Math.random() * 0.5).toFixed(2));
                setSimulatedScaleWeight(newWeight);
                globalHardwareBridge.setScaleWeight(newWeight);
              }}
              title={`Digital Scale (${simulatedScaleWeight} kg)`}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 flex items-center gap-1"
            >
              <Scale className="w-3.5 h-3.5 text-blue-500" />
              <span>{simulatedScaleWeight} kg</span>
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategoryId('ALL')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedCategoryId === 'ALL'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{isArabic ? 'الكل' : 'All Items'}</span>
          </button>

          {categories.map(cat => {
            const Icon = getCategoryIcon(cat.icon);
            const isSelected = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{isArabic ? cat.nameAr : cat.nameEn}</span>
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-3">
            {filteredItems.map(item => {
              const hasModifiers = item.modifierGroupIds && item.modifierGroupIds.length > 0;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (hasModifiers || item.weighable) {
                      setActiveModItem(item);
                    } else {
                      handleAddItemToCart(item);
                    }
                  }}
                  className="group flex flex-col text-left rtl:text-right bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-indigo-500/50 transition-all duration-150 active:scale-[0.98]"
                >
                  <div className="relative h-28 sm:h-32 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.nameEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                      {hasModifiers && (
                        <span className="bg-indigo-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                          {isArabic ? 'تخصيص' : 'Modifiers'}
                        </span>
                      )}
                      {item.weighable && (
                        <span className="bg-blue-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-sm">
                          <Scale className="w-2.5 h-2.5" />
                          /kg
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 flex-1 flex flex-col justify-between w-full">
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1">
                        {isArabic ? item.nameAr : item.nameEn}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {isArabic ? item.descriptionAr : item.descriptionEn}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="font-black text-sm text-indigo-600 dark:text-indigo-400">
                        {item.price.toFixed(2)} {currency}
                      </span>
                      <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right / Cart Side Panel */}
      <div className="w-full lg:w-96 xl:w-[410px] bg-white dark:bg-slate-900 border-t lg:border-t-0 lg:border-l rtl:lg:border-l-0 rtl:lg:border-r border-slate-200 dark:border-slate-800 flex flex-col h-auto lg:h-full shrink-0 shadow-lg">
        {/* Ticket Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                {currentOrder.orderNumber}
              </span>
              <span className="text-xs font-medium text-slate-500">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Clear Cart Button */}
            {currentOrderItems.length > 0 && (
              <button
                onClick={() => setCurrentOrderItems([])}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isArabic ? 'إفراغ' : 'Clear'}
              </button>
            )}
          </div>

          {/* Table & Customer Row */}
          <div className="grid grid-cols-2 gap-2">
            {orderType === 'DINE_IN' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  {isArabic ? 'رقم الطاولة' : 'Dining Table'}
                </label>
                <select
                  value={selectedTableId}
                  onChange={e => setSelectedTableId(e.target.value)}
                  className="w-full text-xs font-bold p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
                >
                  {tables.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.number} - {isArabic ? t.nameAr : t.nameEn} ({t.status})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                {isArabic ? 'العميل / الولاء' : 'Customer / Loyalty'}
              </label>
              <select
                value={selectedCustomerId}
                onChange={e => setSelectedCustomerId(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
              >
                <option value="">{isArabic ? 'عميل عام (Walk-in)' : 'Walk-in Guest'}</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.loyaltyTier} - {c.walletBalance} SAR)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Cart Line Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-slate-100 dark:divide-slate-800">
          {currentOrderItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <ShoppingBag className="w-12 h-12 stroke-1 opacity-40 mb-2" />
              <p className="text-sm font-semibold">{isArabic ? 'لا توجد أصناف في الطلب' : 'Cart is Empty'}</p>
              <p className="text-xs text-slate-400 mt-1">
                {isArabic ? 'انقر على الأصناف لإضافتها للفاتورة' : 'Select menu items to add to the order ticket'}
              </p>
            </div>
          ) : (
            currentOrderItems.map(item => (
              <div key={item.id} className="pt-2 first:pt-0 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {isArabic ? item.nameAr : item.nameEn}
                    </h5>
                    {item.selectedModifiers.length > 0 && (
                      <div className="text-[11px] text-slate-500 space-y-0.5 mt-0.5">
                        {item.selectedModifiers.map((m, idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            <span>• {m.optionName}</span>
                            {m.price > 0 && <span className="text-slate-400">+{m.price}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                    {item.specialInstructions && (
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 italic">
                        {item.specialInstructions}
                      </p>
                    )}
                  </div>

                  <div className="text-right rtl:text-left">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {item.totalPrice.toFixed(2)} {currency}
                    </span>
                  </div>
                </div>

                {/* Item Quantity Controller */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400">
                    Course {item.courseNumber || 1} • {item.stationName}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateItemQty(item.id, -1)}
                      className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 flex items-center justify-center"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold px-1.5 text-slate-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateItemQty(item.id, 1)}
                      className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 flex items-center justify-center"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Calculation & Quick Discounts */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3">
          {/* Quick Discount buttons */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
              <Percent className="w-3.5 h-3.5 text-indigo-500" />
              {isArabic ? 'خصم سريع:' : 'Discount:'}
            </span>
            <div className="flex items-center gap-1">
              {[0, 5, 10, 15, 20].map(pct => (
                <button
                  key={pct}
                  onClick={() => setDiscountPercent(pct)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    discountPercent === pct
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {pct === 0 ? (isArabic ? 'بدون' : '0%') : `${pct}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Breakdown */}
          <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-1">
            <div className="flex justify-between">
              <span>{isArabic ? 'المجموع غير شامل الضريبة' : 'Subtotal (Excl. Tax)'}:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {(finalTotal - taxAmount).toFixed(2)} {currency}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>{isArabic ? 'مبلغ الخصم' : 'Discount Applied'}:</span>
                <span className="font-semibold">-{discountAmount.toFixed(2)} {currency}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>{isArabic ? 'ضريبة القيمة المضافة (15%)' : 'VAT (15%)'}:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {taxAmount.toFixed(2)} {currency}
              </span>
            </div>
            <div className="flex justify-between text-sm sm:text-base font-black text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
              <span>{isArabic ? 'الإجمالي شامل الضريبة' : 'Total Amount'}:</span>
              <span className="text-indigo-600 dark:text-indigo-400">
                {finalTotal.toFixed(2)} {currency}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              disabled={currentOrderItems.length === 0}
              onClick={handleSaveDraft}
              className="py-3 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm disabled:opacity-40"
            >
              {isArabic ? 'حفظ / تعليق الطلب' : 'Hold / Save Order'}
            </button>

            <button
              type="button"
              disabled={currentOrderItems.length === 0}
              onClick={() => setIsPaymentOpen(true)}
              className="py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/30 disabled:opacity-40"
            >
              <span>{isArabic ? 'سداد ودفع' : 'Pay & Settle'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Product Modifier Modal */}
      {activeModItem && (
        <ProductModifierModal
          item={activeModItem}
          modifierGroups={modifierGroups}
          currency={currency}
          isArabic={isArabic}
          scaleWeightKg={activeModItem.weighable ? simulatedScaleWeight : undefined}
          onClose={() => setActiveModItem(null)}
          onAddToCart={handleAddItemToCart}
        />
      )}

      {/* Split Payment Modal */}
      {isPaymentOpen && (
        <SplitPaymentModal
          order={currentOrder}
          currency={currency}
          isArabic={isArabic}
          customers={customers}
          onClose={() => setIsPaymentOpen(false)}
          onProcessPayment={handleCompletePaymentAndShowReceipt}
        />
      )}

      {/* Receipt & ZATCA Modal */}
      {completedOrderForReceipt && (
        <ReceiptModal
          order={completedOrderForReceipt}
          tenant={tenant}
          currency={currency}
          isArabic={isArabic}
          onClose={() => setCompletedOrderForReceipt(null)}
        />
      )}
    </div>
  );
};
