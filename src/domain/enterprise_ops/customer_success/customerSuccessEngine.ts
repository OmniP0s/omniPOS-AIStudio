// ============================================================================
// CUSTOMER SUCCESS & ADOPTION ANALYTICS ENGINE
// Sprint 5.0 / Version 2.0 Enterprise Operations
// ============================================================================

export interface InteractiveTutorial {
  id: string;
  titleEn: string;
  titleAr: string;
  category: 'CASHIER' | 'KITCHEN' | 'ACCOUNTING' | 'INVENTORY' | 'MANAGER';
  estimatedMinutes: number;
  stepsCount: number;
  completedSteps: number;
  badgeAward: string;
  descriptionEn: string;
  descriptionAr: string;
  videoUrl?: string;
}

export interface CustomerHealthMetric {
  category: 'ZATCA_COMPLIANCE' | 'SYSTEM_UPTIME' | 'SYNC_LATENCY' | 'INVENTORY_ACCURACY' | 'FEATURE_ADOPTION';
  score: number; // 0 - 100
  weightPct: number;
  status: 'EXCELLENT' | 'GOOD' | 'NEEDS_ATTENTION' | 'CRITICAL';
  metricDetailsEn: string;
  metricDetailsAr: string;
}

export interface CustomerHealthReport {
  tenantId: string;
  overallScore: number; // 0 - 100
  status: 'HEALTHY' | 'STABLE' | 'AT_RISK' | 'CHURN_THREAT';
  churnRiskPct: number;
  metrics: CustomerHealthMetric[];
  evaluatedAt: string;
}

export interface FeatureAdoptionStat {
  moduleName: string;
  moduleKey: string;
  adoptionRatePct: number;
  dailyActiveUsers: number;
  weeklyTrendPct: number;
  status: 'HIGH' | 'MODERATE' | 'LOW';
}

export interface SuccessRecommendation {
  id: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  titleEn: string;
  titleAr: string;
  impactEn: string;
  impactAr: string;
  actionButtonLabelEn: string;
  actionButtonLabelAr: string;
  actionType: 'ENABLE_FEATURE' | 'TRAIN_STAFF' | 'CALIBRATE_HARDWARE' | 'OPTIMIZE_MENU';
}

export class CustomerSuccessEngine {
  private tutorials: InteractiveTutorial[] = [
    {
      id: 'tut-cashier-rapid',
      titleEn: 'High-Velocity Cashier & Split-Billing Masterclass',
      titleAr: 'دليل الكاشير السريع وتقسيم الفواتير المتعددة',
      category: 'CASHIER',
      estimatedMinutes: 4,
      stepsCount: 5,
      completedSteps: 5,
      badgeAward: 'SPEED_CASHIER_PRO',
      descriptionEn: 'Learn sub-3-second order dispatch, multi-guest check splits, and offline Mada payments.',
      descriptionAr: 'تعلم إرسال الطلبات في أقل من 3 ثوان، وتقسيم الحساب، وعمليات مدى بدون اتصال.',
    },
    {
      id: 'tut-kds-expeditor',
      titleEn: 'Kitchen KDS Routing & Station Load Balancing',
      titleAr: 'توجيه شاشات المطبخ وموازنة أحمال محطات الطهي',
      category: 'KITCHEN',
      estimatedMinutes: 6,
      stepsCount: 6,
      completedSteps: 6,
      badgeAward: 'KITCHEN_ORCHESTRATOR',
      descriptionEn: 'Configure grill, fry, salad, and expeditor screen routing with color-coded preparation timers.',
      descriptionAr: 'تهيئة محطات الشواء والقلي وتوزيع المهام مع مؤشرات التوقيت الملونة.',
    },
    {
      id: 'tut-zatca-audit',
      titleEn: 'ZATCA Phase 2 E-Invoice Verification & Reconciliation',
      titleAr: 'تدقيق ومطابقة الفواتير المشفرة مع هيئة الزكاة',
      category: 'ACCOUNTING',
      estimatedMinutes: 5,
      stepsCount: 4,
      completedSteps: 4,
      badgeAward: 'COMPLIANCE_MASTER',
      descriptionEn: 'Audit XML UBL 2.1 invoices, cryptographic hashes, CSID validity, and tax period VAT returns.',
      descriptionAr: 'فحص ملفات XML وتشفير الهاش وصلاحية الشهادات الرقمية وإقرارات الضريبة.',
    },
    {
      id: 'tut-inventory-bom',
      titleEn: 'Recipe Costing & Dynamic Real-Time Inventory Deduction',
      titleAr: 'حساب تكلفة الوصفات والخصم الآلي اللحظي للمخزون',
      category: 'INVENTORY',
      estimatedMinutes: 7,
      stepsCount: 7,
      completedSteps: 5,
      badgeAward: 'BOM_VALUATION_EXPERT',
      descriptionEn: 'Link menu modifiers to raw ingredient inventory deductions and automated Purchase Orders.',
      descriptionAr: 'ربط إضافات الأطباق بالمواد الخام في المستودعات وإنشاء أوامر الشراء التلقائية.',
    },
    {
      id: 'tut-shift-reconciliation',
      titleEn: 'Blind Shift Drawer Close & Cash Variance Audit',
      titleAr: 'إغلاق الوردية الأعمى والتدقيق في فروقات الصندوق',
      category: 'MANAGER',
      estimatedMinutes: 3,
      stepsCount: 4,
      completedSteps: 4,
      badgeAward: 'AUDIT_EXCELLENCE',
      descriptionEn: 'Perform automated float reconciliation, Mada terminal totals audit, and supervisor sign-offs.',
      descriptionAr: 'مطابقة النقدية والشبكة وإغلاق اليومية مع التوقيع الإلكتروني للمشرف.',
    },
  ];

  private recommendations: SuccessRecommendation[] = [
    {
      id: 'rec-ai-voice',
      priority: 'HIGH',
      titleEn: 'Activate Najdi Voice AI for Drive-Thru',
      titleAr: 'تفعيل الذكاء الصوتي باللهجة النجدية للدرايف ثرو',
      impactEn: 'Reduces order queue time by 42% and increases combo upselling by 18%.',
      impactAr: 'يقلل وقت طابور الطلبات بنسبة 42% ويزيد مبيعات الوجبات بنسبة 18%.',
      actionButtonLabelEn: 'Configure Voice AI',
      actionButtonLabelAr: 'تفعيل الطلب الصوتي',
      actionType: 'ENABLE_FEATURE',
    },
    {
      id: 'rec-auto-po',
      priority: 'MEDIUM',
      titleEn: 'Enable 3-Way Procurement Automated POs',
      titleAr: 'تفعيل أوامر الشراء الآلية والمطابقة الثلاثية',
      impactEn: 'Eliminates raw ingredient stockouts for high-demand Wagyu beef and dairy.',
      impactAr: 'يمنع نفاد المواد الأساسية عالية الطلب مثل اللحوم ومنتجات الألبان.',
      actionButtonLabelEn: 'Set Reorder Points',
      actionButtonLabelAr: 'ضبط نقاط إعادة الطلب',
      actionType: 'OPTIMIZE_MENU',
    },
    {
      id: 'rec-kds-training',
      priority: 'LOW',
      titleEn: 'Certify 3 Kitchen Staff on Expeditor Screen',
      titleAr: 'تدريب 3 طهاة على شاشة التنسيق والتسليم (Expeditor)',
      impactEn: 'Increases order dispatch coordination during Friday evening peak hours.',
      impactAr: 'يحسن كفاءة تسليم الطلبات خلال ساعات الذروة في عطلة نهاية الأسبوع.',
      actionButtonLabelEn: 'Start Tutorial',
      actionButtonLabelAr: 'بدء التدريب',
      actionType: 'TRAIN_STAFF',
    },
  ];

  public getTutorials(): InteractiveTutorial[] {
    return [...this.tutorials];
  }

  public getHealthReport(tenantId: string = 'tenant-omnipos-sa'): CustomerHealthReport {
    const metrics: CustomerHealthMetric[] = [
      {
        category: 'ZATCA_COMPLIANCE',
        score: 100,
        weightPct: 30,
        status: 'EXCELLENT',
        metricDetailsEn: '100% of e-invoices cryptographically signed with 0 rejections from ZATCA.',
        metricDetailsAr: '100% من الفواتير تم توقيعها تشفيرياً بدون أي رفض من هيئة الزكاة.',
      },
      {
        category: 'SYSTEM_UPTIME',
        score: 99.999,
        weightPct: 25,
        status: 'EXCELLENT',
        metricDetailsEn: 'Zero unplanned downtime across all 8 POS terminals in the last 90 days.',
        metricDetailsAr: 'صفر انقطاع غير مجدول في جميع نقاط البيع الثمانية خلال 90 يوماً.',
      },
      {
        category: 'SYNC_LATENCY',
        score: 98,
        weightPct: 15,
        status: 'EXCELLENT',
        metricDetailsEn: 'Average cloud CRDT outbox sync latency is 14ms.',
        metricDetailsAr: 'متوسط زمن مزامنة البيانات السحابية 14 ميلي ثانية.',
      },
      {
        category: 'INVENTORY_ACCURACY',
        score: 96,
        weightPct: 15,
        status: 'GOOD',
        metricDetailsEn: 'Inventory variance is under 0.4% post-shift reconciliation.',
        metricDetailsAr: 'فارق الجرد المخزني أقل من 0.4% بعد مطابقة الورديات.',
      },
      {
        category: 'FEATURE_ADOPTION',
        score: 94,
        weightPct: 15,
        status: 'EXCELLENT',
        metricDetailsEn: '14 out of 16 enterprise modules actively used daily.',
        metricDetailsAr: '14 وحدة تشغيلية من أصل 16 تُستخدم يومياً بكفاءة.',
      },
    ];

    const overallScore = Math.round(
      metrics.reduce((acc, m) => acc + (m.score * m.weightPct) / 100, 0)
    );

    return {
      tenantId,
      overallScore,
      status: overallScore >= 90 ? 'HEALTHY' : overallScore >= 75 ? 'STABLE' : 'AT_RISK',
      churnRiskPct: Math.max(1, 100 - overallScore),
      metrics,
      evaluatedAt: new Date().toISOString(),
    };
  }

  public getAdoptionAnalytics(): FeatureAdoptionStat[] {
    return [
      { moduleName: 'POS & Mada Payments', moduleKey: 'pos', adoptionRatePct: 100, dailyActiveUsers: 34, weeklyTrendPct: 2.4, status: 'HIGH' },
      { moduleName: 'Kitchen Display (KDS)', moduleKey: 'kds', adoptionRatePct: 98, dailyActiveUsers: 18, weeklyTrendPct: 4.1, status: 'HIGH' },
      { moduleName: 'ZATCA Phase 2 Invoicing', moduleKey: 'zatca', adoptionRatePct: 100, dailyActiveUsers: 34, weeklyTrendPct: 0.0, status: 'HIGH' },
      { moduleName: 'Inventory & Recipe BOM', moduleKey: 'inventory', adoptionRatePct: 92, dailyActiveUsers: 12, weeklyTrendPct: 6.8, status: 'HIGH' },
      { moduleName: 'Customer CRM & Loyalty', moduleKey: 'crm', adoptionRatePct: 86, dailyActiveUsers: 24, weeklyTrendPct: 11.2, status: 'HIGH' },
      { moduleName: 'AI Predictive Forecasting', moduleKey: 'ai', adoptionRatePct: 78, dailyActiveUsers: 8, weeklyTrendPct: 15.4, status: 'MODERATE' },
      { moduleName: 'Procurement 3-Way Match', moduleKey: 'procurement', adoptionRatePct: 84, dailyActiveUsers: 6, weeklyTrendPct: 8.0, status: 'HIGH' },
      { moduleName: 'Workflows & Approval Sagas', moduleKey: 'workflow', adoptionRatePct: 72, dailyActiveUsers: 5, weeklyTrendPct: 9.3, status: 'MODERATE' },
    ];
  }

  public getRecommendations(): SuccessRecommendation[] {
    return [...this.recommendations];
  }
}

export const customerSuccessEngine = new CustomerSuccessEngine();
