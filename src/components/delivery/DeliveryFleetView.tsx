import React, { useState } from 'react';
import { globalDeliveryFleet } from '../../domain/delivery/deliveryFleetEngine';
import { DeliveryDriver, DeliveryZone, DeliveryOrderPayload } from '../../types';
import {
  Navigation,
  Bike,
  Car,
  MapPin,
  Clock,
  Phone,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
  Plus,
  Battery,
  Banknote,
  Send,
} from 'lucide-react';

interface DeliveryFleetViewProps {
  isArabic: boolean;
}

export const DeliveryFleetView: React.FC<DeliveryFleetViewProps> = ({ isArabic }) => {
  const [drivers, setDrivers] = useState<DeliveryDriver[]>(() => globalDeliveryFleet.getDrivers());
  const [zones, setZones] = useState<DeliveryZone[]>(() => globalDeliveryFleet.getZones());
  const [deliveries, setDeliveries] = useState<DeliveryOrderPayload[]>(() => globalDeliveryFleet.getActiveDeliveries());

  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOrderPayload | null>(deliveries[0] || null);
  const [otpInput, setOtpInput] = useState('');
  const [podSuccessMsg, setPodSuccessMsg] = useState<string | null>(null);

  const [newCustName, setNewCustName] = useState('Nasser Al-Subaie');
  const [newCustPhone, setNewCustPhone] = useState('+966 55 443 2211');
  const [newAddress, setNewAddress] = useState('Olaya View Commercial Center, Riyadh');
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);

  const refreshState = () => {
    setDrivers([...globalDeliveryFleet.getDrivers()]);
    setDeliveries([...globalDeliveryFleet.getActiveDeliveries()]);
    setZones([...globalDeliveryFleet.getZones()]);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDelivery) return;
    const success = globalDeliveryFleet.confirmProofOfDelivery(selectedDelivery.orderId, otpInput);
    if (success) {
      setPodSuccessMsg(isArabic ? 'تم تأكيد تسليم الطلب بنجاح عبر رمز OTP!' : 'Proof of Delivery (POD) confirmed via OTP!');
      setOtpInput('');
      refreshState();
      setTimeout(() => setPodSuccessMsg(null), 4000);
    } else {
      alert(isArabic ? 'رمز OTP غير صحيح!' : 'Invalid OTP code! Please check with customer.');
    }
  };

  const handleCreateDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    const orderId = `#ORD-${Math.floor(8000 + Math.random() * 1999)}`;
    globalDeliveryFleet.autoDispatchOrder(orderId, newCustName, newCustPhone, newAddress);
    refreshState();
    setIsDispatchModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-indigo-400" />
            <h1 className="text-lg font-black tracking-tight text-white">
              {isArabic ? 'إدارة أسطول التوصيل والتتبع المباشر (Fleet & Logistics)' : 'Enterprise Delivery Fleet & GPS Dispatch'}
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
              Live Telemetry GPS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {isArabic
              ? 'تتبع السائقين بالخرائط الحية، حساب أوقات الوصول ETA، التحقق برمز التسليم OTP وإدارة محافظ السائقين'
              : 'Real-time GPS routing, dynamic delivery radius & fees, Proof-of-Delivery OTP confirmation, and driver wallets'}
          </p>
        </div>

        <button
          onClick={() => setIsDispatchModalOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Zap className="w-4 h-4" />
          <span>{isArabic ? 'إرسال طلب توصيل فوري' : 'Dispatch Order'}</span>
        </button>
      </div>

      {/* Main Layout: 3 Columns (Active Deliveries, Map Simulator, Driver Fleet) */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-4 p-4">
        {/* Col 1: Active Deliveries (3 cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-3 overflow-hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {isArabic ? 'الطلبات الجارية للتوصيل' : 'Active Dispatched Orders'} ({deliveries.length})
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {deliveries.map(del => (
              <div
                key={del.orderId}
                onClick={() => setSelectedDelivery(del)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  selectedDelivery?.orderId === del.orderId
                    ? 'bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono font-bold text-indigo-400 text-xs">{del.orderId}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      del.status === 'DELIVERED'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : del.status === 'IN_TRANSIT'
                        ? 'bg-blue-500/20 text-blue-300 animate-pulse'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {del.status}
                  </span>
                </div>

                <p className="text-sm font-bold text-white">{del.customerName}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                  <span className="truncate">{del.deliveryAddress}</span>
                </p>

                <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-slate-800 text-xs">
                  <span className="text-slate-400">
                    {isArabic ? 'السائق:' : 'Driver:'} <span className="text-white font-semibold">{del.driverName}</span>
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">{del.estimatedArrivalTimestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Col 2: GPS Map & POD Verification Simulator (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-3 overflow-hidden">
          <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between relative overflow-hidden">
            {/* Simulated Live Radar Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#312e81_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />

            <div className="relative z-10 flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {isArabic ? 'نظام تحديد المواقع المباشر (Riyadh Central GPS Grid)' : 'Live Riyadh GPS Fleet Radar'}
                </span>
              </div>
              <span className="text-[11px] font-mono text-indigo-400">P99 Accuracy: 1.2m</span>
            </div>

            {/* Radar Visual Center */}
            <div className="relative z-10 my-auto py-8 flex flex-col items-center justify-center space-y-4">
              <div className="w-32 h-32 rounded-full border-2 border-dashed border-indigo-500/40 flex items-center justify-center relative animate-[spin_20s_linear_infinite]">
                <div className="w-20 h-20 rounded-full border border-indigo-400/60 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/50">
                    <Navigation className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>

              {selectedDelivery && (
                <div className="bg-slate-950/80 backdrop-blur border border-slate-800 p-3 rounded-xl max-w-sm text-center space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono">TRACKING TARGET: {selectedDelivery.orderId}</span>
                  <p className="text-xs font-bold text-white">{selectedDelivery.deliveryAddress}</p>
                  <p className="text-[11px] text-emerald-400 font-mono">
                    Driver ETA: {selectedDelivery.estimatedArrivalTimestamp}
                  </p>
                </div>
              )}
            </div>

            {/* Proof of Delivery OTP Box */}
            {selectedDelivery && selectedDelivery.status !== 'DELIVERED' && (
              <div className="relative z-10 bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    {isArabic ? 'التحقق وتسليم الطلب للعميل (POD)' : 'Proof of Delivery Confirmation'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Demo OTP: <strong className="text-amber-400">{selectedDelivery.otpCode}</strong>
                  </span>
                </div>

                <form onSubmit={handleVerifyOtp} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter 4-digit OTP"
                    value={otpInput}
                    onChange={e => setOtpInput(e.target.value)}
                    maxLength={4}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono tracking-widest text-center focus:outline-indigo-500"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    {isArabic ? 'تأكيد التسليم' : 'Verify & POD'}
                  </button>
                </form>

                {podSuccessMsg && (
                  <p className="text-[11px] text-emerald-400 font-bold text-center animate-in fade-in">
                    ✓ {podSuccessMsg}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Col 3: Driver Fleet Roster & Wallet (3 cols) */}
        <div className="lg:col-span-3 flex flex-col space-y-3 overflow-hidden">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {isArabic ? 'كادر السائقين والمحافظ' : 'Driver Fleet & Wallets'}
          </h2>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {drivers.map(drv => {
              const VehicleIcon = drv.vehicleType === 'MOTORCYCLE' ? Bike : Car;
              return (
                <div key={drv.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[10px] text-indigo-400 font-bold">{drv.code}</span>
                      <h4 className="font-bold text-white text-xs mt-0.5">{drv.name}</h4>
                      <p className="text-[11px] text-slate-400">{drv.phone}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        drv.currentStatus === 'ON_THE_WAY'
                          ? 'bg-blue-500/20 text-blue-300'
                          : drv.currentStatus === 'IDLE'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {drv.currentStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <VehicleIcon className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{drv.licensePlate}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Battery className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{drv.batteryLevelPercent}%</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Banknote className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-mono">{drv.cashCollectedSar} SAR Cash</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{drv.completedDeliveriesToday} done</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dispatch Modal */}
      {isDispatchModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white">
              {isArabic ? 'إرسال وتوجيه طلب توصيل فوري' : 'Instant Delivery Dispatch'}
            </h3>
            <form onSubmit={handleCreateDispatch} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold mb-1 block">
                  {isArabic ? 'اسم العميل' : 'Customer Name'}
                </label>
                <input
                  type="text"
                  value={newCustName}
                  onChange={e => setNewCustName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-semibold focus:outline-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold mb-1 block">
                  {isArabic ? 'رقم الهاتف للتواصل وتأكيد OTP' : 'Customer Phone (for OTP)'}
                </label>
                <input
                  type="text"
                  value={newCustPhone}
                  onChange={e => setNewCustPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold mb-1 block">
                  {isArabic ? 'عنوان التوصيل' : 'Delivery Address'}
                </label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={e => setNewAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-semibold focus:outline-indigo-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDispatchModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 cursor-pointer"
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-500 cursor-pointer shadow-lg shadow-indigo-600/30"
                >
                  {isArabic ? 'تأكيد التوجيه للسائق' : 'Dispatch to Fleet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
