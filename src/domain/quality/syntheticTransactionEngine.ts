import { SyntheticWorker } from './types';

export const INITIAL_SYNTHETIC_WORKERS: SyntheticWorker[] = [
  {
    id: 'BOT-RUH-01',
    name: 'Virtual Cashier #1 (Riyadh Flagship)',
    branchName: 'Riyadh Olaya Branch',
    terminalId: 'POS-RUH-T01',
    currentStep: 'ZATCA_INVOICE',
    status: 'RUNNING',
    completedCycles: 14280,
    avgCycleTimeSec: 14.2,
    slaPassRate: 99.98,
    lastCycleLatencyMs: 142,
    activeSince: '2026-08-01T00:00:00Z',
    logs: [
      { timestamp: '10:04:12', step: 'LOGIN', latencyMs: 12, success: true, details: 'JWT token issued & biometrics verified' },
      { timestamp: '10:04:14', step: 'OPEN_SHIFT', latencyMs: 18, success: true, details: 'Opening float SAR 1,000.00 registered in ledger' },
      { timestamp: '10:04:17', step: 'CREATE_ORDER', latencyMs: 24, success: true, details: 'Order #ORD-99120 (3 items, modifers) created' },
      { timestamp: '10:04:19', step: 'SEND_KITCHEN', latencyMs: 15, success: true, details: 'CRDT order item synced to KDS station #2' },
      { timestamp: '10:04:22', step: 'PAY_MADA', latencyMs: 45, success: true, details: 'Mada EMV NFC simulated SAR 148.50 approved' },
      { timestamp: '10:04:24', step: 'PRINT_RECEIPT', latencyMs: 8, success: true, details: 'ESC/POS thermal binary stream generated' },
      { timestamp: '10:04:26', step: 'ZATCA_INVOICE', latencyMs: 20, success: true, details: 'ECDSA SHA-256 signed, cryptographic stamp valid' },
    ],
  },
  {
    id: 'BOT-JED-02',
    name: 'Virtual Cashier #2 (Jeddah Waterfront)',
    branchName: 'Jeddah Waterfront',
    terminalId: 'POS-JED-T04',
    currentStep: 'PAY_MADA',
    status: 'RUNNING',
    completedCycles: 12890,
    avgCycleTimeSec: 13.8,
    slaPassRate: 100.0,
    lastCycleLatencyMs: 118,
    activeSince: '2026-08-01T00:00:00Z',
    logs: [
      { timestamp: '10:04:30', step: 'LOGIN', latencyMs: 11, success: true, details: 'Shift lead PIN authenticated' },
      { timestamp: '10:04:32', step: 'OPEN_SHIFT', latencyMs: 15, success: true, details: 'Cash drawer sensor baseline confirmed' },
      { timestamp: '10:04:35', step: 'CREATE_ORDER', latencyMs: 21, success: true, details: 'Combo meal with allergen modifiers added' },
      { timestamp: '10:04:37', step: 'SEND_KITCHEN', latencyMs: 14, success: true, details: 'Dispatched to Fryer and Grill screens' },
      { timestamp: '10:04:40', step: 'PAY_MADA', latencyMs: 57, success: true, details: 'Apple Pay tokenized transaction SAR 82.00 OK' },
    ],
  },
  {
    id: 'BOT-DMM-03',
    name: 'Virtual Drive-Thru Operator (Dammam)',
    branchName: 'Dammam Corniche',
    terminalId: 'POS-DMM-DT01',
    currentStep: 'CREATE_ORDER',
    status: 'RUNNING',
    completedCycles: 18450,
    avgCycleTimeSec: 9.4,
    slaPassRate: 99.96,
    lastCycleLatencyMs: 98,
    activeSince: '2026-08-01T00:00:00Z',
    logs: [
      { timestamp: '10:04:44', step: 'LOGIN', latencyMs: 10, success: true, details: 'High-speed drive-thru operator session active' },
      { timestamp: '10:04:46', step: 'OPEN_SHIFT', latencyMs: 14, success: true, details: 'Opening batch initial count verified' },
      { timestamp: '10:04:48', step: 'CREATE_ORDER', latencyMs: 19, success: true, details: 'Rapid keypad entry: 2 Burgers, 2 Fries, 2 Colas' },
    ],
  },
  {
    id: 'BOT-MED-04',
    name: 'Virtual Kiosk Worker (Madinah Central)',
    branchName: 'Madinah Central Walk',
    terminalId: 'KIOSK-MED-02',
    currentStep: 'CLOSE_SHIFT',
    status: 'RUNNING',
    completedCycles: 11200,
    avgCycleTimeSec: 16.5,
    slaPassRate: 99.92,
    lastCycleLatencyMs: 165,
    activeSince: '2026-08-01T00:00:00Z',
    logs: [
      { timestamp: '10:03:50', step: 'CREATE_ORDER', latencyMs: 25, success: true, details: 'Self-ordering guest selection finalized' },
      { timestamp: '10:03:55', step: 'PAY_MADA', latencyMs: 48, success: true, details: 'Contactless payment captured' },
      { timestamp: '10:04:00', step: 'ZATCA_INVOICE', latencyMs: 22, success: true, details: 'B2C Simplified tax invoice QR encoded' },
      { timestamp: '10:04:15', step: 'CLOSE_SHIFT', latencyMs: 70, success: true, details: 'Daily kiosk Z-Report finalized and synced to cloud ledger' },
    ],
  },
];

export const SYNTHETIC_STEPS: {
  step: SyntheticWorker['currentStep'];
  nameEn: string;
  nameAr: string;
  targetLatencyMs: number;
}[] = [
  { step: 'LOGIN', nameEn: '1. User Login & Token Auth', nameAr: '1. تسجيل الدخول والتوثيق', targetLatencyMs: 50 },
  { step: 'OPEN_SHIFT', nameEn: '2. Register Float & Open Shift', nameAr: '2. فتح الوردية وعهدة النقد', targetLatencyMs: 60 },
  { step: 'CREATE_ORDER', nameEn: '3. Build Order & Apply Modifiers', nameAr: '3. إنشاء الطلب والمعدلات', targetLatencyMs: 80 },
  { step: 'SEND_KITCHEN', nameEn: '4. Dispatch to Kitchen KDS (CRDT)', nameAr: '4. إرسال للمطبخ KDS وتزامن', targetLatencyMs: 40 },
  { step: 'PAY_MADA', nameEn: '5. Mada/NFC Payment Processing', nameAr: '5. الدفع عبر مدى / البطاقات', targetLatencyMs: 120 },
  { step: 'PRINT_RECEIPT', nameEn: '6. Generate Receipt & Print Payload', nameAr: '6. توليد الإيصال الحراري', targetLatencyMs: 30 },
  { step: 'ZATCA_INVOICE', nameEn: '7. ZATCA Phase 2 Sign & QR Seal', nameAr: '7. ختم وتوقيع فاتورة زاتكا', targetLatencyMs: 75 },
  { step: 'CLOSE_SHIFT', nameEn: '8. Reconcile & Close Cash Shift', nameAr: '8. مطابقة وإغلاق الوردية (Z-Report)', targetLatencyMs: 150 },
];
