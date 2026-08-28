import React, { useState, useEffect } from 'react';
import { Order, KitchenStation, OrderItem } from '../../types';
import { Clock, CheckCircle2, Flame, Utensils, RotateCcw, AlertTriangle, Filter, BellRing } from 'lucide-react';

interface KitchenDisplaySystemProps {
  orders: Order[];
  stations: KitchenStation[];
  isArabic: boolean;
  onUpdateItemStatus: (orderId: string, itemId: string, status: OrderItem['status']) => void;
  onCompleteOrder: (order: Order) => void;
}

export const KitchenDisplaySystem: React.FC<KitchenDisplaySystemProps> = ({
  orders,
  stations,
  isArabic,
  onUpdateItemStatus,
}) => {
  const [selectedStationId, setSelectedStationId] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<'ACTIVE' | 'ALL'>('ACTIVE');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Update clock every 10 seconds for SLA timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Filter orders that need kitchen prep
  const kitchenOrders = orders.filter(o => {
    if (filterType === 'ACTIVE') {
      return o.status === 'PREPARING' || o.status === 'PENDING';
    }
    return true;
  });

  const calculateElapsedMinutes = (openedAt: string) => {
    const start = new Date(openedAt).getTime();
    const now = currentTime.getTime();
    return Math.max(0, Math.floor((now - start) / 60000));
  };

  const getSlaColor = (mins: number) => {
    if (mins < 6) return 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
    if (mins < 12) return 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300';
    return 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300 animate-pulse';
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-900 text-white p-4 gap-4">
      {/* KDS Header Bar */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/30">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight">
              {isArabic ? 'شاشة عرض وتحضير المطبخ (KDS)' : 'Kitchen Display System (KDS)'}
            </h2>
            <p className="text-xs text-slate-400">
              {isArabic ? 'توجيه طلبات الطهي للمحطات وإدارة أوقات الخدمة SLA' : 'Real-time station order routing & SLA timers'}
            </p>
          </div>
        </div>

        {/* Station Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setSelectedStationId('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedStationId === 'ALL'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {isArabic ? 'كافة المحطات (Expo)' : 'All Stations (Expo)'}
          </button>

          {stations.map(station => (
            <button
              key={station.id}
              onClick={() => setSelectedStationId(station.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedStationId === station.id
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: station.color }} />
              <span>{isArabic ? station.nameAr : station.nameEn}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Live Order Tickets Grid */}
      <div className="flex-1 overflow-y-auto">
        {kitchenOrders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3">
            <CheckCircle2 className="w-16 h-16 text-emerald-500/40" />
            <h3 className="text-base font-bold text-slate-300">
              {isArabic ? 'لا توجد طلبات معلقة في المطبخ حالياً' : 'All Kitchen Orders Cleared!'}
            </h3>
            <p className="text-xs text-slate-500">
              {isArabic ? 'المطبخ جاهز لاستقبال طلبات جديدة' : 'Kitchen line is ready for incoming tickets.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {kitchenOrders.map(order => {
              const elapsedMins = calculateElapsedMinutes(order.openedAt);
              const itemsForStation = order.items.filter(i => {
                if (selectedStationId === 'ALL') return true;
                return i.stationId === selectedStationId;
              });

              if (itemsForStation.length === 0) return null;

              const allItemsReady = itemsForStation.every(i => i.status === 'READY' || i.status === 'SERVED');

              return (
                <div
                  key={order.id}
                  className={`flex flex-col bg-slate-800 rounded-2xl border-2 overflow-hidden shadow-xl transition-all ${
                    allItemsReady ? 'border-emerald-600/60' : 'border-slate-700'
                  }`}
                >
                  {/* Ticket Header */}
                  <div className="p-3.5 bg-slate-850 border-b border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-base text-white">
                          {order.orderNumber}
                        </span>
                        <span className="text-xs bg-slate-700 text-slate-200 font-bold px-2 py-0.5 rounded-md">
                          {order.orderType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {order.tableName ? `${order.tableName} (${order.guestCount} G)` : 'Takeaway / Direct'}
                      </p>
                    </div>

                    {/* SLA Timer Badge */}
                    <div className={`px-2.5 py-1 rounded-xl border font-mono font-bold text-xs flex items-center gap-1.5 ${getSlaColor(elapsedMins)}`}>
                      <Clock className="w-3.5 h-3.5" />
                      <span>{elapsedMins}m</span>
                    </div>
                  </div>

                  {/* Ticket Items List */}
                  <div className="flex-1 p-3.5 space-y-2.5 overflow-y-auto max-h-72">
                    {itemsForStation.map(item => {
                      const isReady = item.status === 'READY' || item.status === 'SERVED';
                      return (
                        <div
                          key={item.id}
                          className={`p-2.5 rounded-xl border transition-all ${
                            isReady
                              ? 'bg-emerald-950/30 border-emerald-800/60 opacity-60'
                              : 'bg-slate-750 border-slate-650'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2">
                              <span className="w-6 h-6 rounded-lg bg-slate-700 text-white font-black text-xs flex items-center justify-center shrink-0">
                                {item.quantity}×
                              </span>
                              <div>
                                <h4 className={`font-bold text-sm ${isReady ? 'line-through text-slate-400' : 'text-white'}`}>
                                  {isArabic ? item.nameAr : item.nameEn}
                                </h4>
                                {item.selectedModifiers.length > 0 && (
                                  <div className="text-[11px] text-amber-400 space-y-0.5 mt-0.5">
                                    {item.selectedModifiers.map((m, idx) => (
                                      <div key={idx}>+ {m.optionName}</div>
                                    ))}
                                  </div>
                                )}
                                {item.specialInstructions && (
                                  <p className="text-[11px] text-rose-300 italic font-semibold mt-1">
                                    ⚠️ {item.specialInstructions}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Item Bump Button */}
                            <button
                              onClick={() => {
                                const nextStatus = item.status === 'READY' ? 'COOKING' : 'READY';
                                onUpdateItemStatus(order.id, item.id, nextStatus);
                              }}
                              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
                                isReady
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                              }`}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Ticket Footer / Bump Bar */}
                  <div className="p-3 bg-slate-850 border-t border-slate-700 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400">
                      Waiter: {order.waiterName || 'POS Terminal'}
                    </span>

                    <button
                      onClick={() => {
                        // Mark all items in this ticket as ready
                        itemsForStation.forEach(i => {
                          onUpdateItemStatus(order.id, i.id, 'READY');
                        });
                      }}
                      className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isArabic ? 'تسليم التذكرة (Bump)' : 'Bump Ticket'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
