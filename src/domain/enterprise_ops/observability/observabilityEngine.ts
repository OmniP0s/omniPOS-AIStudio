// ============================================================================
// OBSERVABILITY 2.0 & TELEMETRY ENGINE
// Sprint 5.0 / Version 2.0 Enterprise Operations
// Business KPIs, User Journey Funnels, Crash Analytics, Session Replay
// ============================================================================

export interface BusinessKpiTelemetry {
  timestamp: string;
  grossTransactionValuePerSecSar: number;
  orderVelocityPerMinute: number;
  averageOrderValueSar: number;
  kitchenPrepTimeP95Minutes: number;
  zatcaSigningLatencyMs: number;
  crdtSyncLatencyMs: number;
  activeTerminalsOnline: number;
  activeGuestsServed: number;
}

export interface FunnelStage {
  stageId: string;
  nameEn: string;
  nameAr: string;
  enteredCount: number;
  completedCount: number;
  dropOffCount: number;
  conversionRatePct: number;
  averageDurationSec: number;
}

export interface CrashReport {
  id: string;
  title: string;
  service: string;
  errorType: string;
  stackTrace: string;
  occurrencesCount: number;
  affectedUsersCount: number;
  devicePlatform: string;
  browserVersion: string;
  firstSeenAt: string;
  lastSeenAt: string;
  status: 'INVESTIGATING' | 'RESOLVED' | 'AUTO_MITIGATED';
}

export interface SessionReplayEvent {
  step: number;
  timeOffsetMs: number;
  actionType: 'CLICK_CATEGORY' | 'SELECT_ITEM' | 'ADD_MODIFIER' | 'SPLIT_BILL' | 'TAP_MADA_PAYMENT' | 'PRINT_RECEIPT';
  elementId: string;
  descriptionEn: string;
  descriptionAr: string;
  durationMs: number;
  screenStateSnapshot?: string;
}

export interface CashierSessionReplay {
  sessionId: string;
  cashierName: string;
  terminalId: string;
  orderId: string;
  totalAmountSar: number;
  startedAt: string;
  completedAt: string;
  totalDurationSec: number;
  events: SessionReplayEvent[];
}

export class ObservabilityEngine {
  private currentKpis: BusinessKpiTelemetry = {
    timestamp: new Date().toISOString(),
    grossTransactionValuePerSecSar: 42.8,
    orderVelocityPerMinute: 18.5,
    averageOrderValueSar: 138.4,
    kitchenPrepTimeP95Minutes: 7.2,
    zatcaSigningLatencyMs: 8.4,
    crdtSyncLatencyMs: 14.1,
    activeTerminalsOnline: 8,
    activeGuestsServed: 246,
  };

  private funnelStages: FunnelStage[] = [
    {
      stageId: 'stage-1-menu-browse',
      nameEn: '1. Menu & Category Selection',
      nameAr: '1. استعراض القائمة واختيار القسم',
      enteredCount: 1000,
      completedCount: 980,
      dropOffCount: 20,
      conversionRatePct: 98.0,
      averageDurationSec: 2.1,
    },
    {
      stageId: 'stage-2-modifiers',
      nameEn: '2. Modifier & Cooking Customization',
      nameAr: '2. تخصيص الإضافات ودرجة الطهي',
      enteredCount: 980,
      completedCount: 940,
      dropOffCount: 40,
      conversionRatePct: 95.9,
      averageDurationSec: 3.4,
    },
    {
      stageId: 'stage-3-cart',
      nameEn: '3. Cart Review & Table Assignment',
      nameAr: '3. مراجعة السلة وتعيين الطاولة',
      enteredCount: 940,
      completedCount: 925,
      dropOffCount: 15,
      conversionRatePct: 98.4,
      averageDurationSec: 1.8,
    },
    {
      stageId: 'stage-4-payment',
      nameEn: '4. Mada / Apple Pay Split Tender',
      nameAr: '4. الدفع عبر مدى / أبل باي وتقسيم الحساب',
      enteredCount: 925,
      completedCount: 920,
      dropOffCount: 5,
      conversionRatePct: 99.4,
      averageDurationSec: 4.2,
    },
    {
      stageId: 'stage-5-zatca-receipt',
      nameEn: '5. ZATCA QR Clearance & Receipt Print',
      nameAr: '5. توقيع الفاتورة بالباركود وطباعة الإيصال',
      enteredCount: 920,
      completedCount: 920,
      dropOffCount: 0,
      conversionRatePct: 100.0,
      averageDurationSec: 0.8,
    },
  ];

  private crashReports: CrashReport[] = [
    {
      id: 'crash-201',
      title: 'EpsonESCPOSTimeoutException: Buffer write timed out after 3000ms',
      service: 'HardwareSpoolerService',
      errorType: 'ESC_POS_SOCKET_TIMEOUT',
      stackTrace: 'at Socket.onTimeout (/src/domain/hardware/printers.ts:142)\n    at emit (events.js:400:28)\n    at TCP.onStreamRead (internal/stream_base_commons.js:209)',
      occurrencesCount: 4,
      affectedUsersCount: 2,
      devicePlatform: 'SunmiOS Android 12',
      browserVersion: 'Chrome Webview 118',
      firstSeenAt: new Date(Date.now() - 48 * 3600000).toISOString(),
      lastSeenAt: new Date(Date.now() - 6 * 3600000).toISOString(),
      status: 'AUTO_MITIGATED',
    },
  ];

  private sampleSessionReplay: CashierSessionReplay = {
    sessionId: 'sess-replay-88912',
    cashierName: 'فاطمة الشهري',
    terminalId: 'POS-TERM-01',
    orderId: 'ORD-99120',
    totalAmountSar: 268.0,
    startedAt: new Date(Date.now() - 180000).toISOString(),
    completedAt: new Date(Date.now() - 165000).toISOString(),
    totalDurationSec: 15,
    events: [
      {
        step: 1,
        timeOffsetMs: 200,
        actionType: 'CLICK_CATEGORY',
        elementId: 'cat-btn-burgers',
        descriptionEn: 'Clicked "Specialty Burgers & Sandwiches" category tab.',
        descriptionAr: 'النقر على قسم "البرجر والساندوتشات الفاخرة".',
        durationMs: 120,
      },
      {
        step: 2,
        timeOffsetMs: 1400,
        actionType: 'SELECT_ITEM',
        elementId: 'item-wagyu-smash',
        descriptionEn: 'Selected "Double Smoked Wagyu Burger" (SAR 68.00).',
        descriptionAr: 'اختيار "دبل سموكد واغيو برجر" (68.00 ر.س).',
        durationMs: 150,
      },
      {
        step: 3,
        timeOffsetMs: 2800,
        actionType: 'ADD_MODIFIER',
        elementId: 'mod-truffle-sauce',
        descriptionEn: 'Added modifier "Extra Black Truffle Mayo" + "Caramelized Onions".',
        descriptionAr: 'إضافة "مايونيز الكمأة السوداء" + "بصل مكرمل".',
        durationMs: 310,
      },
      {
        step: 4,
        timeOffsetMs: 6200,
        actionType: 'SPLIT_BILL',
        elementId: 'btn-split-equal',
        descriptionEn: 'Split check into 2 equal parts (SAR 134.00 each) for Table 4.',
        descriptionAr: 'تقسيم الحساب بالتساوي لطاولة 4 (134.00 ر.س لكل جزء).',
        durationMs: 450,
      },
      {
        step: 5,
        timeOffsetMs: 9800,
        actionType: 'TAP_MADA_PAYMENT',
        elementId: 'btn-mada-contactless',
        descriptionEn: 'Processed Mada Contactless NFC card payment (Approval: #89123).',
        descriptionAr: 'معالجة الدفع عبر مدى باللمس (رقم الموافقة: #89123).',
        durationMs: 1200,
      },
      {
        step: 6,
        timeOffsetMs: 13400,
        actionType: 'PRINT_RECEIPT',
        elementId: 'btn-zatca-signed-receipt',
        descriptionEn: 'Generated ZATCA Phase 2 compliant QR code e-receipt with digital signature.',
        descriptionAr: 'إصدار الفاتورة الضريبية المعتمدة برمز الاستجابة السريع والتوقيع الرقمي.',
        durationMs: 400,
      },
    ],
  };

  public getTelemetry(): BusinessKpiTelemetry {
    return {
      ...this.currentKpis,
      grossTransactionValuePerSecSar: Number((38 + Math.random() * 10).toFixed(1)),
      orderVelocityPerMinute: Number((15 + Math.random() * 8).toFixed(1)),
      zatcaSigningLatencyMs: Number((7 + Math.random() * 3).toFixed(1)),
      timestamp: new Date().toISOString(),
    };
  }

  public getFunnelStages(): FunnelStage[] {
    return [...this.funnelStages];
  }

  public getCrashReports(): CrashReport[] {
    return [...this.crashReports];
  }

  public getSessionReplay(): CashierSessionReplay {
    return { ...this.sampleSessionReplay };
  }
}

export const observabilityEngine = new ObservabilityEngine();
