import React, { useState } from 'react';
import { DiningTable, Reservation, Order } from '../../types';
import { Users, Calendar, Plus, Check, Clock, Sparkles, MapPin, Coffee, UtensilsCrossed, X } from 'lucide-react';

interface TableFloorPlanProps {
  tables: DiningTable[];
  reservations: Reservation[];
  orders: Order[];
  currency: string;
  isArabic: boolean;
  onSelectTable: (table: DiningTable) => void;
  onUpdateTableStatus: (tableId: string, status: DiningTable['status']) => void;
}

export const TableFloorPlan: React.FC<TableFloorPlanProps> = ({
  tables,
  reservations,
  orders,
  currency,
  isArabic,
  onSelectTable,
  onUpdateTableStatus,
}) => {
  const [selectedSection, setSelectedSection] = useState<'ALL' | 'INDOOR' | 'TERRACE' | 'VIP'>('ALL');
  const [activeTab, setActiveTab] = useState<'FLOOR_PLAN' | 'RESERVATIONS'>('FLOOR_PLAN');
  const [selectedTableForAction, setSelectedTableForAction] = useState<DiningTable | null>(null);
  const [isNewResOpen, setIsNewResOpen] = useState(false);
  const [resList, setResList] = useState<Reservation[]>(reservations);

  // Form State for new reservation
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [partySize, setPartySize] = useState(4);
  const [resTime, setResTime] = useState('20:00');
  const [notes, setNotes] = useState('');

  const filteredTables = tables.filter(t => {
    if (selectedSection === 'ALL') return true;
    return t.section === selectedSection;
  });

  const getStatusColor = (status: DiningTable['status']) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-950/40';
      case 'OCCUPIED':
        return 'bg-indigo-500/15 border-indigo-600 text-indigo-700 dark:text-indigo-300 dark:bg-indigo-950/50';
      case 'BILL_PRINTED':
        return 'bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-300 dark:bg-amber-950/40';
      case 'RESERVED':
        return 'bg-purple-500/15 border-purple-500 text-purple-700 dark:text-purple-300 dark:bg-purple-950/40';
      case 'DIRTY':
        return 'bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300 dark:bg-rose-950/40';
      default:
        return 'bg-slate-100 border-slate-300 text-slate-700';
    }
  };

  const getStatusBadge = (status: DiningTable['status']) => {
    switch (status) {
      case 'AVAILABLE': return isArabic ? 'متاحة' : 'Available';
      case 'OCCUPIED': return isArabic ? 'مشغولة' : 'Occupied';
      case 'BILL_PRINTED': return isArabic ? 'تمت طباعة الحساب' : 'Bill Printed';
      case 'RESERVED': return isArabic ? 'محجوزة' : 'Reserved';
      case 'DIRTY': return isArabic ? 'تحت التنظيف' : 'Needs Cleaning';
    }
  };

  const handleCreateReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestPhone) return;

    const newRes: Reservation = {
      id: `RES-${Date.now()}`,
      customerName: guestName,
      phone: guestPhone,
      partySize,
      reservationTime: `2026-08-27T${resTime}:00Z`,
      status: 'CONFIRMED',
      specialRequests: notes,
    };

    setResList([newRes, ...resList]);
    setIsNewResOpen(false);
    setGuestName('');
    setGuestPhone('');
    setNotes('');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 bg-slate-100 dark:bg-slate-950 gap-4">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {isArabic ? 'مخطط الصالة وإدارة الطاولات' : 'Dining Floor Plan & Reservations'}
            </h2>
            <p className="text-xs text-slate-500">
              {isArabic ? 'الفرع الرئيسي - الصالة الداخلية والشرفة' : 'Main Branch - Indoor & Terrace Floor layout'}
            </p>
          </div>
        </div>

        {/* View switcher */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('FLOOR_PLAN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'FLOOR_PLAN'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {isArabic ? 'المخطط التفاعلي' : 'Visual Floor Plan'}
            </button>
            <button
              onClick={() => setActiveTab('RESERVATIONS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'RESERVATIONS'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {isArabic ? 'الحجوزات المجدولة' : 'Reservations'}
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'FLOOR_PLAN' ? (
        <div className="flex-1 flex flex-col gap-3 overflow-hidden">
          {/* Section Filter & Legend */}
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Section tabs */}
            <div className="flex items-center gap-1.5">
              {[
                { id: 'ALL', labelEn: 'All Areas', labelAr: 'كافة الأقسام' },
                { id: 'INDOOR', labelEn: 'Indoor Dining', labelAr: 'الصالة الداخلية' },
                { id: 'TERRACE', labelEn: 'Outdoor Terrace', labelAr: 'الشرفة الخارجية' },
                { id: 'VIP', labelEn: 'VIP Suites', labelAr: 'أجنحة VIP' },
              ].map(sec => (
                <button
                  key={sec.id}
                  onClick={() => setSelectedSection(sec.id as any)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    selectedSection === sec.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {isArabic ? sec.labelAr : sec.labelEn}
                </button>
              ))}
            </div>

            {/* Status Legend */}
            <div className="flex items-center gap-3 text-[11px] text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                {isArabic ? 'متاحة' : 'Available'}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                {isArabic ? 'مشغولة' : 'Occupied'}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                {isArabic ? 'حساب' : 'Billed'}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                {isArabic ? 'محجوزة' : 'Reserved'}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                {isArabic ? 'تنظيف' : 'Dirty'}
              </span>
            </div>
          </div>

          {/* Interactive 2D Grid Floor Canvas */}
          <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-auto relative">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredTables.map(table => {
                const activeOrderForTable = orders.find(o => o.tableId === table.id && o.paymentStatus !== 'PAID');
                const isRound = table.shape === 'ROUND';

                return (
                  <div
                    key={table.id}
                    onClick={() => {
                      setSelectedTableForAction(table);
                    }}
                    className={`relative p-5 border-2 rounded-${isRound ? 'full' : '2xl'} transition-all cursor-pointer hover:shadow-lg flex flex-col items-center justify-center text-center group ${getStatusColor(
                      table.status
                    )} min-h-[140px]`}
                  >
                    <div className="flex items-center gap-1 text-[11px] font-bold opacity-75 mb-1">
                      <Users className="w-3 h-3" />
                      <span>{table.capacity} {isArabic ? 'مقاعد' : 'Guests'}</span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      {isArabic ? table.nameAr : table.nameEn}
                    </h3>

                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/60 dark:bg-slate-900/60 mt-1">
                      {getStatusBadge(table.status)}
                    </span>

                    {activeOrderForTable && (
                      <div className="mt-2 text-xs font-black text-indigo-600 dark:text-indigo-300">
                        {activeOrderForTable.totalAmount.toFixed(2)} {currency}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Reservations Tab */
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {isArabic ? 'قائمة الحجوزات المؤكدة لليوم' : "Today's Confirmed Table Reservations"}
            </h3>
            <button
              onClick={() => setIsNewResOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              {isArabic ? 'حجز جديد' : 'New Reservation'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {resList.map(res => (
              <div
                key={res.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {res.customerName}
                  </span>
                  <span className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-bold px-2 py-0.5 rounded-md">
                    {res.status}
                  </span>
                </div>

                <div className="text-xs text-slate-500 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(res.reservationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>{res.partySize} {isArabic ? 'أشخاص' : 'People'}</span>
                  </div>
                  {res.tableName && (
                    <div className="flex items-center gap-1.5 text-indigo-600 font-medium">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{res.tableName}</span>
                    </div>
                  )}
                </div>

                {res.specialRequests && (
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg italic">
                    "{res.specialRequests}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table Action Modal */}
      {selectedTableForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {isArabic ? selectedTableForAction.nameAr : selectedTableForAction.nameEn}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedTableForAction.section} • {selectedTableForAction.capacity} Guests
                </p>
              </div>
              <button
                onClick={() => setSelectedTableForAction(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  onSelectTable(selectedTableForAction);
                  setSelectedTableForAction(null);
                }}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2"
              >
                <UtensilsCrossed className="w-4 h-4" />
                {isArabic ? 'فتح الطاولة وبدء الطلب في الكاشير' : 'Open in POS & Take Order'}
              </button>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => {
                    onUpdateTableStatus(selectedTableForAction.id, 'AVAILABLE');
                    setSelectedTableForAction(null);
                  }}
                  className="py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-bold text-xs"
                >
                  {isArabic ? 'تحديد كمتاحة' : 'Mark Available'}
                </button>
                <button
                  onClick={() => {
                    onUpdateTableStatus(selectedTableForAction.id, 'DIRTY');
                    setSelectedTableForAction(null);
                  }}
                  className="py-2.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 font-bold text-xs"
                >
                  {isArabic ? 'تحت التنظيف' : 'Mark Dirty'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Reservation Modal */}
      {isNewResOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {isArabic ? 'تسجيل حجز طاولة جديد' : 'New Table Reservation'}
              </h3>
              <button onClick={() => setIsNewResOpen(false)} className="p-1 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReservation} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isArabic ? 'اسم الضيف / العميل' : 'Guest Name'}
                </label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={e => setGuestName(e.target.value)}
                  placeholder="محمد العبدالله..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isArabic ? 'رقم الهاتف' : 'Phone'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={guestPhone}
                    onChange={e => setGuestPhone(e.target.value)}
                    placeholder="+966 50..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isArabic ? 'عدد الأشخاص' : 'Party Size'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={partySize}
                    onChange={e => setPartySize(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isArabic ? 'وقت الحضور' : 'Time'}
                </label>
                <input
                  type="time"
                  value={resTime}
                  onChange={e => setResTime(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isArabic ? 'طلبات خاصة' : 'Special Notes'}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="كرسي أطفال، مناسبة خاصة..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm"
              >
                {isArabic ? 'تأكيد الحجز' : 'Confirm Reservation'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
