import React, { useState, useEffect } from 'react';
import { HardwareDevice } from '../../types';
import { globalHardwareBridge } from '../../domain/hardware/hardwareBridge';
import {
  Cpu,
  Printer,
  Scale,
  Monitor,
  Barcode,
  CreditCard,
  Lock,
  Wifi,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCw,
  Sliders,
} from 'lucide-react';

interface HardwareManagerProps {
  devices: HardwareDevice[];
  isArabic: boolean;
  onUpdateDeviceStatus: (id: string, isOnline: boolean) => void;
}

export const HardwareManager: React.FC<HardwareManagerProps> = ({
  devices,
  isArabic,
  onUpdateDeviceStatus,
}) => {
  const [deviceList, setDeviceList] = useState<HardwareDevice[]>(devices);
  const [scaleWeight, setScaleWeight] = useState<number>(0.0);
  const [testLog, setTestLog] = useState<string[]>([]);
  const [scannerSimInput, setScannerSimInput] = useState<string>('6281001002001');

  useEffect(() => {
    const unsub = globalHardwareBridge.onEvent(evt => {
      const entry = `[${new Date(evt.timestamp).toLocaleTimeString()}] [${evt.type}] ${JSON.stringify(evt.payload)}`;
      setTestLog(prev => [entry, ...prev.slice(0, 30)]);
    });
    return () => unsub();
  }, []);

  const getDeviceIcon = (type: HardwareDevice['type']) => {
    switch (type) {
      case 'PRINTER': return Printer;
      case 'SCALE': return Scale;
      case 'CUSTOMER_DISPLAY': return Monitor;
      case 'BARCODE_SCANNER': return Barcode;
      case 'PAYMENT_TERMINAL': return CreditCard;
      case 'CASH_DRAWER': return Lock;
      default: return Cpu;
    }
  };

  const handleTestPrint = () => {
    globalHardwareBridge.formatEscPosReceipt({
      orderNumber: '#TEST-001',
      branchNameAr: 'مطعم أومني إنتربرايز',
      branchNameEn: 'OmniPOS Enterprise',
      vatNumber: '300123456700003',
      cashierName: 'System Test',
      items: [{ nameAr: 'وجبة اختبار', nameEn: 'Test Item', quantity: 1, unitPrice: 10, totalPrice: 10 }],
      subtotal: 10,
      discount: 0,
      vatAmount: 1.5,
      total: 11.5,
      paymentMethod: 'CASH',
      dateStr: new Date().toLocaleString(),
    });
  };

  const handleTestDrawer = () => {
    globalHardwareBridge.openCashDrawer('Hardware manager test kick');
  };

  const handleTestScale = (delta: number) => {
    const newW = Number(Math.max(0, scaleWeight + delta).toFixed(2));
    setScaleWeight(newW);
    globalHardwareBridge.setScaleWeight(newW);
  };

  const handleTestScanner = () => {
    globalHardwareBridge.triggerBarcodeScan(scannerSimInput);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 bg-slate-100 dark:bg-slate-950 gap-4">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {isArabic ? 'جسر العتاد والأجهزة الطرفية (Hardware Bridge)' : 'Hardware & Peripherals Bridge Manager'}
            </h2>
            <p className="text-xs text-slate-500">
              {isArabic ? 'طابعات ESC/POS، ميزان الباركود، شاشة العميل، وأجهزة الدفع mada EMV' : 'Native ESC/POS printers, Toledo digital scale, VFD displays & mada NFC EMV terminals'}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Device Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {deviceList.map(dev => {
            const Icon = getDeviceIcon(dev.type);
            return (
              <div
                key={dev.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{dev.name}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">{dev.connectionType} • {dev.address}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      dev.isOnline
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {dev.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>

                {/* Device Actions */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">Paper/Status: OK</span>
                  {dev.type === 'PRINTER' && (
                    <button
                      onClick={handleTestPrint}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 font-semibold"
                    >
                      {isArabic ? 'طباعة تجريبية' : 'Test Print'}
                    </button>
                  )}
                  {dev.type === 'CASH_DRAWER' && (
                    <button
                      onClick={handleTestDrawer}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 hover:text-amber-600 font-semibold"
                    >
                      {isArabic ? 'فتح الدرج' : 'Kick Drawer'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Simulator Station */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Scale & Scanner Simulator */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-500" />
              {isArabic ? 'محاكي أجهزة الوزن والباركود (Live Hardware Testing)' : 'Scale & Scanner Hardware Interactive Controls'}
            </h3>

            {/* Scale Testing */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isArabic ? 'الميزان الرقمي المتصل (RS232 Weight):' : 'Digital Scale Live Weight:'}
                </span>
                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                  {scaleWeight.toFixed(2)} kg
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTestScale(-0.25)}
                  className="flex-1 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                >
                  -0.25 kg
                </button>
                <button
                  onClick={() => handleTestScale(0.25)}
                  className="flex-1 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                >
                  +0.25 kg
                </button>
                <button
                  onClick={() => handleTestScale(0.5)}
                  className="flex-1 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                >
                  +0.50 kg
                </button>
                <button
                  onClick={() => {
                    setScaleWeight(0);
                    globalHardwareBridge.setScaleWeight(0);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300 text-xs font-bold"
                >
                  Tare (صفر)
                </button>
              </div>
            </div>

            {/* Scanner Testing */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {isArabic ? 'محاكاة قارئ الباركود (HID Barcode Scanner Event):' : 'HID Barcode Scanner Trigger:'}
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={scannerSimInput}
                  onChange={e => setScannerSimInput(e.target.value)}
                  className="flex-1 text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white"
                />
                <button
                  onClick={handleTestScanner}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold"
                >
                  {isArabic ? 'إرسال مسح' : 'Send Scan'}
                </button>
              </div>
            </div>
          </div>

          {/* Telemetry Hardware Log stream */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 shadow-sm space-y-2 flex flex-col">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-emerald-400">Peripheral Bus Telemetry Event Stream</span>
              <span>{testLog.length} events</span>
            </div>

            <div className="flex-1 max-h-64 overflow-y-auto space-y-1 font-mono text-[11px] text-slate-300 p-2 bg-slate-900 rounded-xl border border-slate-800">
              {testLog.length === 0 ? (
                <span className="text-slate-500">Waiting for hardware bus events...</span>
              ) : (
                testLog.map((log, idx) => (
                  <div key={idx} className="text-emerald-400/90 leading-tight">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
