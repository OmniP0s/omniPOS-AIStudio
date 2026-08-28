// ============================================================================
// ENTERPRISE ONBOARDING & GUIDED SETUP ENGINE
// Sprint 5.0 / Version 2.0 Enterprise Operations
// ============================================================================

export interface OnboardingStep {
  id: string;
  stepNumber: number;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  category: 'IDENTITY' | 'TAX_ZATCA' | 'TERMINALS' | 'MENU_BOM' | 'PAYMENTS' | 'STAFF' | 'VERIFICATION';
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'SKIPPED';
  required: boolean;
  completionData?: Record<string, any>;
}

export interface DemoCompanyConfig {
  companyId: string;
  nameEn: string;
  nameAr: string;
  brandType: 'FINE_DINING' | 'FAST_CASUAL' | 'DRIVE_THRU' | 'CLOUD_KITCHEN' | 'CAFE_BAKERY';
  crNumber: string;
  vatNumber: string;
  branchCount: number;
  terminalCount: number;
  sampleOrdersCount: number;
  activeStaffCount: number;
  currency: string;
  isSandboxMode: boolean;
}

export interface SampleDataPreset {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  concept: string;
  itemCount: number;
  categoryCount: number;
  recipeBomCount: number;
  taxConfig: { vatRatePct: number; zatcaPhase2Ready: boolean };
}

export class OnboardingEngine {
  private steps: OnboardingStep[] = [
    {
      id: 'step-identity',
      stepNumber: 1,
      titleEn: 'Company Identity & Commercial Registration',
      titleAr: 'الهوية المؤسسية والسجل التجاري',
      descriptionEn: 'Verify Ministry of Commerce CR, legal entity names in Arabic & English, and headquarters location.',
      descriptionAr: 'التحقق من السجل التجاري والاسم القانوني بالعربية والإنجليزية وموقع المقر الرئيسي.',
      category: 'IDENTITY',
      status: 'COMPLETED',
      required: true,
      completionData: { crNumber: '1010892341', legalNameAr: 'مجموعة الضيافة المتميزة المحدودة' },
    },
    {
      id: 'step-zatca',
      stepNumber: 2,
      titleEn: 'ZATCA Phase 2 E-Invoicing Setup',
      titleAr: 'إعداد الربط والتكامل مع منصة فاتورة (هيئة الزكاة)',
      descriptionEn: 'Provision cryptographic CSID, ECDSA secp256k1 keypair, and onboard EGS serial numbers.',
      descriptionAr: 'إصدار شهادات الامتثال الرقمية وتوليد مفاتيح التشفير وتسجيل الأجهزة المعتمدة.',
      category: 'TAX_ZATCA',
      status: 'COMPLETED',
      required: true,
      completionData: { vatNumber: '310928374100003', csidStatus: 'ACTIVE_PRODUCTION', egsCount: 8 },
    },
    {
      id: 'step-terminals',
      stepNumber: 3,
      titleEn: 'POS Terminals & Hardware Pairing',
      titleAr: 'ربط نقاط البيع والأجهزة الطرفية',
      descriptionEn: 'Discover LAN POS terminals, Sunmi/PAX payment terminals, KDS screens, and thermal printers.',
      descriptionAr: 'استكشاف وربط أجهزة الكاشير وأجهزة مدى وشاشات المطبخ وطابعات الإيصالات.',
      category: 'TERMINALS',
      status: 'IN_PROGRESS',
      required: true,
      completionData: { activeTerminals: 6, pairedPrinters: 4, kdsScreens: 2 },
    },
    {
      id: 'step-menu',
      stepNumber: 4,
      titleEn: 'Menu, BOM Recipes & Costing',
      titleAr: 'قوائم الطعام ووصفات التكاليف والمخزون',
      descriptionEn: 'Configure categories, dynamic modifiers, dietary tags, multi-tier pricing, and recipe inventory link.',
      descriptionAr: 'تهيئة التصنيفات والإضافات والمسببات للتحسس والتسعير وربط الوصفات بخصم المخزون.',
      category: 'MENU_BOM',
      status: 'IN_PROGRESS',
      required: true,
      completionData: { categories: 8, menuItems: 48, rawIngredients: 76 },
    },
    {
      id: 'step-payments',
      stepNumber: 5,
      titleEn: 'Payment Gateways & Mada Terminals',
      titleAr: 'بوابات الدفع وأجهزة مدى والمدفوعات الإلكترونية',
      descriptionEn: 'Configure Mada, Visa/Mastercard, Apple Pay, Geidea, Moyasar, and Cash drawer float limits.',
      descriptionAr: 'تفعيل مدى، أبل باي، البطاقات الائتمانية، جيديا، ميسر، وحدود السيولة النقدية للخزينة.',
      category: 'PAYMENTS',
      status: 'PENDING',
      required: true,
    },
    {
      id: 'step-staff',
      stepNumber: 6,
      titleEn: 'Staff RBAC, Biometrics & Pin Codes',
      titleAr: 'الموظفين والصلاحيات والبصمة ورموز الدخول',
      descriptionEn: 'Enroll cashiers, supervisors, branch managers, kitchen leads, and configure WPS payroll compliance.',
      descriptionAr: 'تسجيل الكاشيرات والمشرفين ومدراء الفروع وتفعيل نظام حماية الأجور.',
      category: 'STAFF',
      status: 'PENDING',
      required: false,
    },
    {
      id: 'step-verification',
      stepNumber: 7,
      titleEn: 'First Live Order Dry-Run & Certification',
      titleAr: 'محاكاة الطلب الأول والاعتماد النهائي للتشغيل',
      descriptionEn: 'Perform end-to-end simulated order from POS -> KDS -> Mada payment -> ZATCA signed receipt.',
      descriptionAr: 'إجراء دورة تجريبية متكاملة من نقطة البيع للمطبخ والدفع وإصدار الفاتورة المشفرة.',
      category: 'VERIFICATION',
      status: 'PENDING',
      required: true,
    },
  ];

  private demoCompanies: DemoCompanyConfig[] = [
    {
      companyId: 'demo-royal-diwan',
      nameEn: 'Royal Diwan Hospitality Group',
      nameAr: 'مجموعة مطاعم الديوان الملكي',
      brandType: 'FINE_DINING',
      crNumber: '1010992345',
      vatNumber: '310998877600003',
      branchCount: 5,
      terminalCount: 18,
      sampleOrdersCount: 1420,
      activeStaffCount: 48,
      currency: 'SAR',
      isSandboxMode: true,
    },
    {
      companyId: 'demo-burger-forge',
      nameEn: 'Burger Forge Quick-Service Chain',
      nameAr: 'سلسلة برجر فورج للوجبات السريعة',
      brandType: 'DRIVE_THRU',
      crNumber: '1010774321',
      vatNumber: '310776655400003',
      branchCount: 12,
      terminalCount: 36,
      sampleOrdersCount: 5890,
      activeStaffCount: 94,
      currency: 'SAR',
      isSandboxMode: true,
    },
    {
      companyId: 'demo-qahwa-roasters',
      nameEn: 'Artisan Qahwa & Specialty Roastery',
      nameAr: 'محمصة ومقهى قهوة الحرفيين المختصة',
      brandType: 'CAFE_BAKERY',
      crNumber: '1010558899',
      vatNumber: '310554433200003',
      branchCount: 3,
      terminalCount: 6,
      sampleOrdersCount: 2150,
      activeStaffCount: 18,
      currency: 'SAR',
      isSandboxMode: true,
    },
  ];

  private samplePresets: SampleDataPreset[] = [
    {
      id: 'preset-saudi-fine-dining',
      nameEn: 'Saudi Luxury Hospitality & Fine Dining',
      nameAr: 'مطعم فاخر ومأكولات سعودية راقية',
      descriptionEn: 'Kabsa royal cuts, Wagyu mandi, Arabic mezze, artisanal dates, saffron infusions with multi-course BOM.',
      descriptionAr: 'كبسة باللحم الفاخر، مندي واغيو، مقبلات شامية، حلويات تمر بالزعفران مع وصفات مخزون متقدمة.',
      concept: 'Fine Dining / Heritage Modern',
      itemCount: 54,
      categoryCount: 9,
      recipeBomCount: 54,
      taxConfig: { vatRatePct: 15, zatcaPhase2Ready: true },
    },
    {
      id: 'preset-smash-drive-thru',
      nameEn: 'Drive-Thru Smash Burgers & Shakes',
      nameAr: 'سلسلة برجر درايف ثرو وميلك شيك',
      descriptionEn: 'Double smash Angus, truffle fries, brioche buns, speed-optimized KDS routing and dynamic combos.',
      descriptionAr: 'برجر أنجوس مدخن، بطاطس بالكمأة، صوصات خاصة، توجيه سريع لشاشات المطبخ ووجبات كومبو.',
      concept: 'Fast Casual / Drive-Thru',
      itemCount: 32,
      categoryCount: 6,
      recipeBomCount: 32,
      taxConfig: { vatRatePct: 15, zatcaPhase2Ready: true },
    },
    {
      id: 'preset-specialty-coffee',
      nameEn: 'Specialty Coffee & European Bakery',
      nameAr: 'مقهى مختص ومخبوزات فرنسية',
      descriptionEn: 'Geisha V60, flat whites, artisan croissants, sourdough sandwiches with milk alternative modifiers.',
      descriptionAr: 'قهوة غيشا مختصة، فلات وايت، كرواسون طازج، وخيارات بدائل الحليب والنكهات.',
      concept: 'Specialty Cafe & Bakery',
      itemCount: 42,
      categoryCount: 7,
      recipeBomCount: 42,
      taxConfig: { vatRatePct: 15, zatcaPhase2Ready: true },
    },
  ];

  public getSteps(): OnboardingStep[] {
    return [...this.steps];
  }

  public getCompletionPercentage(): number {
    const completedCount = this.steps.filter((s) => s.status === 'COMPLETED').length;
    return Math.round((completedCount / this.steps.length) * 100);
  }

  public updateStepStatus(
    stepId: string,
    status: OnboardingStep['status'],
    data?: Record<string, any>
  ): OnboardingStep | undefined {
    const step = this.steps.find((s) => s.id === stepId);
    if (step) {
      step.status = status;
      if (data) {
        step.completionData = { ...(step.completionData || {}), ...data };
      }
    }
    return step;
  }

  public getDemoCompanies(): DemoCompanyConfig[] {
    return [...this.demoCompanies];
  }

  public getSamplePresets(): SampleDataPreset[] {
    return [...this.samplePresets];
  }

  public seedSampleData(presetId: string): { success: boolean; seededItems: number; messageEn: string; messageAr: string } {
    const preset = this.samplePresets.find((p) => p.id === presetId) || this.samplePresets[0];
    return {
      success: true,
      seededItems: preset.itemCount,
      messageEn: `Successfully seeded ${preset.nameEn} with ${preset.itemCount} items, ${preset.categoryCount} categories, and ZATCA Phase 2 tax definitions.`,
      messageAr: `تم بنجاح تحميل بيانات العينة: ${preset.nameAr} (${preset.itemCount} صنف، ${preset.categoryCount} أقسام مع الامتثال الضريبي).`,
    };
  }

  public activateDemoCompany(companyId: string): DemoCompanyConfig | undefined {
    const comp = this.demoCompanies.find((c) => c.companyId === companyId);
    if (comp) {
      comp.isSandboxMode = true;
    }
    return comp;
  }
}

export const onboardingEngine = new OnboardingEngine();
