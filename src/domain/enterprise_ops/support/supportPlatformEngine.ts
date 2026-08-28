// ============================================================================
// ENTERPRISE SUPPORT PLATFORM & REMOTE DIAGNOSTICS ENGINE
// Sprint 5.0 / Version 2.0 Enterprise Operations
// ============================================================================

export type TicketPriority = 'P1_CRITICAL_BLOCKER' | 'P2_MAJOR_SERVICE' | 'P3_MINOR_FEATURE' | 'P4_GENERAL_INQUIRY';
export type TicketStatus = 'OPEN' | 'IN_TRIAGE' | 'AI_RESOLVED' | 'ENGINEER_ASSIGNED' | 'RESOLVED' | 'CLOSED';

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  tenantId: string;
  branchId: string;
  branchName: string;
  creatorName: string;
  priority: TicketPriority;
  slaTargetMinutes: number;
  slaRemainingMinutes: number;
  category: 'HARDWARE_PRINTER' | 'ZATCA_CLEARANCE' | 'NETWORK_OFFLINE' | 'PAYMENT_MADA' | 'MENU_SYNC' | 'ACCOUNTING';
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  status: TicketStatus;
  createdAt: string;
  aiSuggestedFixEn?: string;
  aiSuggestedFixAr?: string;
  resolvedAt?: string;
}

export interface RemoteDiagnosticProbe {
  deviceId: string;
  deviceName: string;
  deviceType: 'POS_TERMINAL' | 'KDS_STATION' | 'THERMAL_PRINTER' | 'MADA_PINPAD' | 'ZATCA_EGS_GATEWAY';
  ipAddress: string;
  macAddress: string;
  firmwareVersion: string;
  pingLatencyMs: number;
  packetLossPct: number;
  memoryUsagePct: number;
  storageUsagePct: number;
  thermalHeadTempCelsius?: number;
  serialPortStatus?: string;
  crdtPendingOutboxCount: number;
  status: 'ONLINE_HEALTHY' | 'WARNING_HIGH_LATENCY' | 'OFFLINE_UNREACHABLE' | 'DEGRADED';
}

export interface SystemLogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'FATAL' | 'AUDIT';
  service: string;
  component: string;
  message: string;
  metadata?: Record<string, any>;
}

export class SupportPlatformEngine {
  private tickets: SupportTicket[] = [
    {
      id: 'tick-901',
      ticketNumber: 'OMNI-TICK-9012',
      tenantId: 'tenant-omnipos-sa',
      branchId: 'BR-01',
      branchName: 'فرع طريق الملك فهد (King Fahd Branch)',
      creatorName: 'أحمد الغامدي (مدير الفرع)',
      priority: 'P2_MAJOR_SERVICE',
      slaTargetMinutes: 60,
      slaRemainingMinutes: 45,
      category: 'HARDWARE_PRINTER',
      titleEn: 'Kitchen Grill Station Printer Paper Jam & Buffer Overflow',
      titleAr: 'انحشار ورق في طابعة محطة الشواء وتراكم طابور الطباعة',
      descriptionEn: 'Thermal printer stopped printing kitchen tickets; 6 orders buffered in local memory.',
      descriptionAr: 'طابعة الإيصالات الحرارية توقفت عن العمل مع وجود 6 طلبات معلقة في الذاكرة المؤقتة.',
      status: 'OPEN',
      createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
      aiSuggestedFixEn: 'Clear hardware paper feeder, power-cycle printer, and execute spooler flush command.',
      aiSuggestedFixAr: 'قم بفتح غطاء الطابعة وتغذية الورق، ثم إعادة التشغيل وإرسال أمر تفريغ طابور الطباعة تلقائياً.',
    },
    {
      id: 'tick-902',
      ticketNumber: 'OMNI-TICK-8994',
      tenantId: 'tenant-omnipos-sa',
      branchId: 'BR-02',
      branchName: 'فرع التحلية (Tahliya Branch)',
      creatorName: 'سارة العتيبي (مشرفة الصالة)',
      priority: 'P3_MINOR_FEATURE',
      slaTargetMinutes: 240,
      slaRemainingMinutes: 180,
      category: 'ZATCA_CLEARANCE',
      titleEn: 'B2B Tax Invoice Buyer CR Number Format Query',
      titleAr: 'استفسار عن طريقة التحقق من السجل التجاري لفواتير الشركات B2B',
      descriptionEn: 'Need to issue a B2B tax invoice for corporate catering with 10-digit CR and 15-digit VAT.',
      descriptionAr: 'طلب إصدار فاتورة ضريبية B2B لشركة توريد طعام مع تسجيل الرقم الضريبي والسجل التجاري.',
      status: 'AI_RESOLVED',
      createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
      aiSuggestedFixEn: 'Enabled B2B toggle on POS checkout; customer VAT validated via ZATCA lookup API.',
      aiSuggestedFixAr: 'تم تفعيل خيار فاتورة الشركات وإدخال الرقم الضريبي مع التحقق الفوري.',
      resolvedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    },
  ];

  private diagnosticProbes: RemoteDiagnosticProbe[] = [
    {
      deviceId: 'dev-pos-main-01',
      deviceName: 'POS Terminal 01 (Main Cashier)',
      deviceType: 'POS_TERMINAL',
      ipAddress: '192.168.10.101',
      macAddress: 'BC:24:11:9A:88:01',
      firmwareVersion: 'v4.0.2-SunmiOS',
      pingLatencyMs: 4.2,
      packetLossPct: 0.0,
      memoryUsagePct: 42,
      storageUsagePct: 28,
      crdtPendingOutboxCount: 0,
      status: 'ONLINE_HEALTHY',
    },
    {
      deviceId: 'dev-kds-grill-01',
      deviceName: 'KDS Touch Station (Hot Grill)',
      deviceType: 'KDS_STATION',
      ipAddress: '192.168.10.108',
      macAddress: 'BC:24:11:9A:88:08',
      firmwareVersion: 'v4.0.0-AndroidTouch',
      pingLatencyMs: 6.8,
      packetLossPct: 0.0,
      memoryUsagePct: 56,
      storageUsagePct: 34,
      crdtPendingOutboxCount: 0,
      status: 'ONLINE_HEALTHY',
    },
    {
      deviceId: 'dev-prn-kitchen-02',
      deviceName: 'Epson TM-T88VI Thermal Printer',
      deviceType: 'THERMAL_PRINTER',
      ipAddress: '192.168.10.115',
      macAddress: '00:26:AB:44:91:22',
      firmwareVersion: 'v2.14-ESC/POS',
      pingLatencyMs: 12.4,
      packetLossPct: 1.2,
      memoryUsagePct: 88,
      storageUsagePct: 92,
      thermalHeadTempCelsius: 48.5,
      serialPortStatus: 'PORT_ACTIVE_SPOOLING',
      crdtPendingOutboxCount: 4,
      status: 'WARNING_HIGH_LATENCY',
    },
    {
      deviceId: 'dev-mada-pinpad-01',
      deviceName: 'PAX A920 Mada Payment PinPad',
      deviceType: 'MADA_PINPAD',
      ipAddress: '192.168.10.120',
      macAddress: '18:90:E4:FA:21:05',
      firmwareVersion: 'v5.88-SaudiMadaCert',
      pingLatencyMs: 8.1,
      packetLossPct: 0.0,
      memoryUsagePct: 38,
      storageUsagePct: 21,
      crdtPendingOutboxCount: 0,
      status: 'ONLINE_HEALTHY',
    },
    {
      deviceId: 'dev-zatca-egs-01',
      deviceName: 'ZATCA EGS Cryptographic Gateway',
      deviceType: 'ZATCA_EGS_GATEWAY',
      ipAddress: '192.168.10.150',
      macAddress: '00:1E:67:99:FF:31',
      firmwareVersion: 'v4.0-KMS-Secp256k1',
      pingLatencyMs: 2.1,
      packetLossPct: 0.0,
      memoryUsagePct: 24,
      storageUsagePct: 15,
      crdtPendingOutboxCount: 0,
      status: 'ONLINE_HEALTHY',
    },
  ];

  private logs: SystemLogEntry[] = [
    {
      id: 'log-101',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      level: 'INFO',
      service: 'ZatcaEgsGateway',
      component: 'ecdsaSigner',
      message: 'Successfully generated ECDSA secp256k1 signature and UBL 2.1 XML digest for invoice OMNI-INV-2026-9901.',
      metadata: { invoiceId: 'OMNI-INV-2026-9901', durationMs: 18.4 },
    },
    {
      id: 'log-102',
      timestamp: new Date(Date.now() - 60000).toISOString(),
      level: 'INFO',
      service: 'CrdtOutboxSync',
      component: 'merkleMesh',
      message: 'Mesh delta exchange completed with 0 vector clock conflicts. 12 orders synchronized to cloud replica.',
      metadata: { syncedOrders: 12, latencyMs: 14.1 },
    },
    {
      id: 'log-103',
      timestamp: new Date(Date.now() - 30000).toISOString(),
      level: 'WARN',
      service: 'HardwareSpooler',
      component: 'epsonThermalDriver',
      message: 'Printer dev-prn-kitchen-02 buffer near capacity (88%). Auto-retrying buffered print queue.',
      metadata: { printerIp: '192.168.10.115', bufferedTickets: 6 },
    },
  ];

  public getTickets(): SupportTicket[] {
    return [...this.tickets];
  }

  public createTicket(
    tenantId: string,
    branchId: string,
    branchName: string,
    creatorName: string,
    priority: TicketPriority,
    category: SupportTicket['category'],
    titleEn: string,
    titleAr: string,
    descriptionEn: string,
    descriptionAr: string
  ): SupportTicket {
    const slaTarget = priority === 'P1_CRITICAL_BLOCKER' ? 15 : priority === 'P2_MAJOR_SERVICE' ? 60 : priority === 'P3_MINOR_FEATURE' ? 240 : 1440;
    const ticket: SupportTicket = {
      id: `tick-${Date.now()}`,
      ticketNumber: `OMNI-TICK-${Math.floor(1000 + Math.random() * 9000)}`,
      tenantId,
      branchId,
      branchName,
      creatorName,
      priority,
      slaTargetMinutes: slaTarget,
      slaRemainingMinutes: slaTarget,
      category,
      titleEn,
      titleAr,
      descriptionEn,
      descriptionAr,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    };
    this.tickets.unshift(ticket);
    return ticket;
  }

  public getDiagnosticProbes(): RemoteDiagnosticProbe[] {
    return [...this.diagnosticProbes];
  }

  public runProbeHealthCheck(deviceId: string): RemoteDiagnosticProbe | undefined {
    const dev = this.diagnosticProbes.find((d) => d.deviceId === deviceId);
    if (dev) {
      dev.pingLatencyMs = Number((2 + Math.random() * 6).toFixed(1));
      dev.memoryUsagePct = Math.floor(35 + Math.random() * 25);
      if (dev.deviceType === 'THERMAL_PRINTER') {
        dev.status = 'ONLINE_HEALTHY';
        dev.crdtPendingOutboxCount = 0;
      }
    }
    return dev;
  }

  public getLogs(): SystemLogEntry[] {
    return [...this.logs];
  }

  public queryAiAssistant(issueQuery: string): {
    diagnosisEn: string;
    diagnosisAr: string;
    rootCauseEn: string;
    rootCauseAr: string;
    recommendedActions: { labelEn: string; labelAr: string; actionId: string }[];
  } {
    return {
      diagnosisEn: 'AI Diagnostics identified a temporary ESC/POS network spooler congestion on the kitchen thermal printer.',
      diagnosisAr: 'حدد نظام الذكاء الاصطناعي وجود تراكم مؤقت في طابور الطباعة الشبكي لطابعة المطبخ الحرارية.',
      rootCauseEn: 'TCP packet delay on sub-network switch port 4 during high order burst.',
      rootCauseAr: 'تأخير في حزم TCP على المنفذ رقم 4 لموزع الشبكة الداخلي أثناء ذروة الطلبات.',
      recommendedActions: [
        { labelEn: 'Flush Printer Spooler Queue', labelAr: 'تفريغ طابور الطباعة المعلق', actionId: 'ACTION_FLUSH_SPOOLER' },
        { labelEn: 'Re-Route Orders to Expeditor KDS Screen', labelAr: 'إعادة توجيه التذاكر لشاشة المطبخ', actionId: 'ACTION_REROUTE_KDS' },
        { labelEn: 'Send Remote Reboot Signal to Printer', labelAr: 'إعادة تشغيل الطابعة عن بُعد', actionId: 'ACTION_REBOOT_PRINTER' },
      ],
    };
  }
}

export const supportPlatformEngine = new SupportPlatformEngine();
