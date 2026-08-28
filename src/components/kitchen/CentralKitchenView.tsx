import React, { useState } from 'react';
import { globalCentralKitchen } from '../../domain/kitchen/centralKitchenEngine';
import { ManufacturingOrder } from '../../types';
import {
  ChefHat,
  Factory,
  Layers,
  Sparkles,
  Truck,
  CheckCircle2,
  Clock,
  Plus,
  Scale,
  Percent,
  Play,
  CheckCheck,
} from 'lucide-react';

interface CentralKitchenViewProps {
  isArabic: boolean;
}

export const CentralKitchenView: React.FC<CentralKitchenViewProps> = ({ isArabic }) => {
  const [orders, setOrders] = useState<ManufacturingOrder[]>(() => globalCentralKitchen.getOrders());
  const [selectedOrder, setSelectedOrder] = useState<ManufacturingOrder | null>(orders[0] || null);

  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [recipeName, setRecipeName] = useState('Smoked BBQ Ribs Glaze Sauce');
  const [targetQty, setTargetQty] = useState(80);
  const [unit, setUnit] = useState('L');
  const [estCost, setEstCost] = useState(1200);

  const refreshState = () => {
    setOrders([...globalCentralKitchen.getOrders()]);
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    globalCentralKitchen.createManufacturingOrder({
      centralKitchenBranchId: 'b-central-kitchen',
      recipeId: 'rec-custom',
      recipeName,
      scheduledDate: new Date().toISOString().split('T')[0],
      targetOutputQty: targetQty,
      unit,
      actualOutputYieldQty: 0,
      wastePercentage: 1.5,
      totalCostSar: estCost,
      costPerUnitSar: estCost / targetQty,
      ingredientsUsed: [
        { inventoryItemId: 'inv-raw-bulk', itemName: `${recipeName} Raw Base Mix`, requiredQty: targetQty * 0.95, actualQty: targetQty * 0.95, unit },
      ],
      destinationBranchAllocations: [
        { branchId: 'b1', branchName: 'Al Olaya Flagship (Riyadh)', allocatedQty: targetQty * 0.6, transferStatus: 'PENDING' },
        { branchId: 'b2', branchName: 'Jeddah Waterfront', allocatedQty: targetQty * 0.4, transferStatus: 'PENDING' },
      ],
    });
    refreshState();
    setIsNewOrderModalOpen(false);
  };

  const handleAdvanceStatus = (orderId: string, currentStatus: ManufacturingOrder['status']) => {
    const nextStatus: Record<ManufacturingOrder['status'], ManufacturingOrder['status']> = {
      PLANNED: 'IN_PREPARATION',
      IN_PREPARATION: 'COOKING',
      COOKING: 'QUALITY_CHECK',
      QUALITY_CHECK: 'COMPLETED',
      COMPLETED: 'COMPLETED',
    };
    globalCentralKitchen.updateOrderStatus(orderId, nextStatus[currentStatus]);
    refreshState();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 text-slate-100">
      {/* Top Header */}
      <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Factory className="w-5 h-5 text-indigo-400" />
            <h1 className="text-lg font-black tracking-tight text-white">
              {isArabic ? 'المطبخ المركزي وإدارة خطوط الإنتاج والتصنيع (Commissary & Production)' : 'Central Kitchen & Manufacturing BOM'}
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
              BOM & Yield Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {isArabic
              ? 'تجهيز الدفعات الكبرى، قياس الهدر والإنتاجية (Yield %)، وتوزيع المنتجات نصف المصنعة للفروع'
              : 'Bulk recipe scaling, batch yield optimization, semi-finished production, and inter-branch stock transfers'}
          </p>
        </div>

        <button
          onClick={() => setIsNewOrderModalOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isArabic ? 'أمر إنتاج جديد (MO)' : 'New Manufacturing Order'}</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-4 p-4">
        {/* Left: Manufacturing Orders List (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-3 overflow-hidden">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {isArabic ? 'أوامر التصنيع والتحضير المركزية' : 'Manufacturing Orders Roster'}
          </h2>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {orders.map(mo => (
              <div
                key={mo.id}
                onClick={() => setSelectedOrder(mo)}
                className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                  selectedOrder?.id === mo.id
                    ? 'bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-indigo-400 font-bold text-xs">{mo.moNumber}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          mo.status === 'COMPLETED'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : mo.status === 'COOKING'
                            ? 'bg-amber-500/20 text-amber-300 animate-pulse'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}
                      >
                        {mo.status}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-1">{mo.recipeName}</h3>
                    <p className="text-xs text-slate-400">{isArabic ? 'تاريخ الإنتاج:' : 'Batch Date:'} {mo.scheduledDate}</p>
                  </div>

                  <div className="text-right rtl:text-left">
                    <span className="text-[11px] text-slate-400">{isArabic ? 'الكمية المستهدفة' : 'Target Output'}</span>
                    <p className="text-base font-black text-white font-mono">
                      {mo.targetOutputQty} {mo.unit}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
                  <div>
                    <span className="text-slate-500">{isArabic ? 'تكلفة الدفعة' : 'Batch Cost'}</span>
                    <p className="font-bold text-white font-mono">{mo.totalCostSar.toLocaleString()} SAR</p>
                  </div>
                  <div>
                    <span className="text-slate-500">{isArabic ? 'تكلفة الوحدة' : 'Unit Cost'}</span>
                    <p className="font-bold text-indigo-400 font-mono">{mo.costPerUnitSar.toFixed(2)} SAR/{mo.unit}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">{isArabic ? 'نسبة الهدر' : 'Waste %'}</span>
                    <p className="font-bold text-emerald-400 font-mono">{mo.wastePercentage}%</p>
                  </div>
                </div>

                {mo.status !== 'COMPLETED' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdvanceStatus(mo.id, mo.status);
                    }}
                    className="w-full py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{isArabic ? 'تقديم مرحلة الإنتاج (Advance Stage)' : 'Advance Production Stage'}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: BOM & Branch Distribution Details (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4 overflow-y-auto">
          {selectedOrder && (
            <>
              {/* BOM Details */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <h3 className="font-bold text-white uppercase tracking-wider">
                    {isArabic ? 'قائمة المواد الخام المستخدمة (Bill of Materials BOM)' : 'Bill of Materials (BOM)'}
                  </h3>
                </div>

                <div className="space-y-2">
                  {selectedOrder.ingredientsUsed.map((ing, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-white">{ing.itemName}</p>
                        <span className="text-[10px] text-slate-500 font-mono">{ing.inventoryItemId}</span>
                      </div>
                      <span className="font-mono font-bold text-indigo-400">
                        {ing.actualQty} {ing.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inter-Branch Allocations */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-indigo-400" />
                  <h3 className="font-bold text-white uppercase tracking-wider">
                    {isArabic ? 'توزيع الكميات على الفروع التابعة' : 'Branch Stock Transfers & Allocations'}
                  </h3>
                </div>

                <div className="space-y-2">
                  {selectedOrder.destinationBranchAllocations.map((alloc, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-white">{alloc.branchName}</p>
                        <span className="text-[10px] font-bold text-emerald-400">{alloc.transferStatus}</span>
                      </div>
                      <span className="font-mono font-bold text-white">
                        {alloc.allocatedQty} {selectedOrder.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* New Order Modal */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white">
              {isArabic ? 'إنشاء أمر تصنيع مركزي جديد' : 'New Commissary Manufacturing Order'}
            </h3>
            <form onSubmit={handleCreateOrder} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold mb-1 block">
                  {isArabic ? 'اسم الوصفة المركزية' : 'Central Recipe / Semi-Finished Item'}
                </label>
                <input
                  type="text"
                  value={recipeName}
                  onChange={e => setRecipeName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-semibold focus:outline-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold mb-1 block">
                    {isArabic ? 'الكمية المستهدفة' : 'Target Quantity'}
                  </label>
                  <input
                    type="number"
                    value={targetQty}
                    onChange={e => setTargetQty(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold mb-1 block">
                    {isArabic ? 'الوحدة' : 'Unit (kg / L)'}
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold mb-1 block">
                  {isArabic ? 'التكلفة الإجمالية التقديرية (SAR)' : 'Estimated Batch Cost (SAR)'}
                </label>
                <input
                  type="number"
                  value={estCost}
                  onChange={e => setEstCost(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-indigo-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewOrderModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 cursor-pointer"
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-500 cursor-pointer shadow-lg shadow-indigo-600/30"
                >
                  {isArabic ? 'إطلاق أمر الإنتاج' : 'Launch Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
