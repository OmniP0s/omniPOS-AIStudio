export interface DynamicRuntimeConfig {
  key: string;
  category: 'DATABASE' | 'CACHE' | 'JWT' | 'REDIS' | 'KAFKA' | 'FEATURE_FLAGS' | 'TIMEOUTS' | 'TAX' | 'CURRENCY' | 'LOCALIZATION' | 'BUSINESS_RULES';
  value: any;
  defaultValue: any;
  descriptionEn: string;
  descriptionAr: string;
  version: number;
  updatedAt: string;
  updatedBy: string;
  scope: 'GLOBAL' | 'TENANT' | 'BRANCH';
}

export class EnterpriseConfigCenter {
  private configs: Map<string, DynamicRuntimeConfig> = new Map();
  private auditHistory: Array<{
    configKey: string;
    oldValue: any;
    newValue: any;
    version: number;
    changedAt: string;
    changedBy: string;
    reason: string;
  }> = [];

  constructor() {
    this.seedDefaultConfigurations();
  }

  private seedDefaultConfigurations(): void {
    const defaults: DynamicRuntimeConfig[] = [
      {
        key: 'db.connection_pool.max_size',
        category: 'DATABASE',
        value: 50,
        defaultValue: 50,
        descriptionEn: 'PostgreSQL maximum concurrent connection pool size per pod.',
        descriptionAr: 'الحد الأقصى لعدد الاتصالات المتزامنة بقاعدة بيانات PostgreSQL لكل خادم.',
        version: 1,
        updatedAt: new Date().toISOString(),
        updatedBy: 'SYSTEM_BOOTSTRAP',
        scope: 'GLOBAL',
      },
      {
        key: 'db.query.statement_timeout_ms',
        category: 'DATABASE',
        value: 3000,
        defaultValue: 3000,
        descriptionEn: 'Max execution time before terminating runaway SQL queries.',
        descriptionAr: 'أقصى وقت مسموح لتنفيذ استعلام SQL قبل إلغائه تلقائياً.',
        version: 1,
        updatedAt: new Date().toISOString(),
        updatedBy: 'SYSTEM_BOOTSTRAP',
        scope: 'GLOBAL',
      },
      {
        key: 'cache.redis.l2_ttl_seconds',
        category: 'CACHE',
        value: 900,
        defaultValue: 900,
        descriptionEn: 'Default time-to-live for Redis L2 distributed cache entries (15 minutes).',
        descriptionAr: 'مدة صلاحية التخزين المؤقت الموزع Redis L2 (15 دقيقة).',
        version: 1,
        updatedAt: new Date().toISOString(),
        updatedBy: 'SYSTEM_BOOTSTRAP',
        scope: 'GLOBAL',
      },
      {
        key: 'auth.jwt.access_token_ttl_seconds',
        category: 'JWT',
        value: 900,
        defaultValue: 900,
        descriptionEn: 'Access token expiration time (15 mins) forcing short-lived tokens.',
        descriptionAr: 'مدة صلاحية رمز الدخول JWT (15 دقيقة) لتعزيز الأمان.',
        version: 1,
        updatedAt: new Date().toISOString(),
        updatedBy: 'SYSTEM_BOOTSTRAP',
        scope: 'GLOBAL',
      },
      {
        key: 'auth.jwt.algorithm',
        category: 'JWT',
        value: 'RS256',
        defaultValue: 'RS256',
        descriptionEn: 'Asymmetric signing algorithm for JWT tokens (RSA-2048 with SHA-256).',
        descriptionAr: 'خوارزمية التوقيع غير المتماثل لرموز JWT (RSA-2048).',
        version: 1,
        updatedAt: new Date().toISOString(),
        updatedBy: 'SYSTEM_BOOTSTRAP',
        scope: 'GLOBAL',
      },
      {
        key: 'messaging.kafka.ack_mode',
        category: 'KAFKA',
        value: 'all',
        defaultValue: 'all',
        descriptionEn: 'Kafka producer acknowledgment mode ensuring zero data loss across in-sync replicas.',
        descriptionAr: 'وضع تأكيد وصول رسائل كافكا لضمان عدم فقدان البيانات إطلاقاً.',
        version: 1,
        updatedAt: new Date().toISOString(),
        updatedBy: 'SYSTEM_BOOTSTRAP',
        scope: 'GLOBAL',
      },
      {
        key: 'flags.kds_smart_prep_prediction',
        category: 'FEATURE_FLAGS',
        value: { enabled: true, rolloutPercentage: 100, targetTenants: ['*'] },
        defaultValue: { enabled: false, rolloutPercentage: 0, targetTenants: [] },
        descriptionEn: 'Enable AI-driven prep time prediction on Kitchen Display Screens.',
        descriptionAr: 'تفعيل التنبؤ الذكي بزمن تحضير الطلبات في شاشات المطبخ.',
        version: 1,
        updatedAt: new Date().toISOString(),
        updatedBy: 'SYSTEM_BOOTSTRAP',
        scope: 'TENANT',
      },
      {
        key: 'timeouts.downstream_http_ms',
        category: 'TIMEOUTS',
        value: 2500,
        defaultValue: 2500,
        descriptionEn: 'HTTP timeout for external APIs (ZATCA, SMS, MADA).',
        descriptionAr: 'المهلة القصوى للاتصال بالخدمات الخارجية (هيئة الزكاة، الرسائل، مدى).',
        version: 1,
        updatedAt: new Date().toISOString(),
        updatedBy: 'SYSTEM_BOOTSTRAP',
        scope: 'GLOBAL',
      },
      {
        key: 'tax.zatca.standard_vat_rate',
        category: 'TAX',
        value: 0.15,
        defaultValue: 0.15,
        descriptionEn: 'Kingdom of Saudi Arabia standard Value Added Tax rate (15%).',
        descriptionAr: 'نسبة ضريبة القيمة المضافة القياسية في المملكة العربية السعودية (15%).',
        version: 1,
        updatedAt: new Date().toISOString(),
        updatedBy: 'SYSTEM_BOOTSTRAP',
        scope: 'GLOBAL',
      },
      {
        key: 'currency.primary_code',
        category: 'CURRENCY',
        value: { code: 'SAR', symbol: 'ر.س', decimals: 2, nameEn: 'Saudi Riyal', nameAr: 'ريال سعودي' },
        defaultValue: { code: 'SAR', symbol: 'ر.س', decimals: 2, nameEn: 'Saudi Riyal', nameAr: 'ريال سعودي' },
        descriptionEn: 'Primary base operating currency and decimal precision.',
        descriptionAr: 'العملة الأساسية للعمليات ودقة الكسور العشرية.',
        version: 1,
        updatedAt: new Date().toISOString(),
        updatedBy: 'SYSTEM_BOOTSTRAP',
        scope: 'GLOBAL',
      },
      {
        key: 'localization.system_default',
        category: 'LOCALIZATION',
        value: { defaultLocale: 'ar', fallbackLocale: 'en', defaultCalendar: 'GREGORIAN', timeZone: 'Asia/Riyadh' },
        defaultValue: { defaultLocale: 'ar', fallbackLocale: 'en', defaultCalendar: 'GREGORIAN', timeZone: 'Asia/Riyadh' },
        descriptionEn: 'Default platform locale, timezone, and calendar settings.',
        descriptionAr: 'إعدادات اللغة الافتراضية، والمنطقة الزمنية، والتقويم للمنصة.',
        version: 1,
        updatedAt: new Date().toISOString(),
        updatedBy: 'SYSTEM_BOOTSTRAP',
        scope: 'GLOBAL',
      },
      {
        key: 'biz.cashier.max_unauthorized_discount_pct',
        category: 'BUSINESS_RULES',
        value: 15,
        defaultValue: 15,
        descriptionEn: 'Maximum discount percent a cashier can grant without manager PIN approval.',
        descriptionAr: 'أقصى نسبة خصم يمكن للكاشير تطبيقها دون الحاجة لرمز موافقة المدير.',
        version: 1,
        updatedAt: new Date().toISOString(),
        updatedBy: 'SYSTEM_BOOTSTRAP',
        scope: 'TENANT',
      },
      {
        key: 'biz.tables.inactivity_auto_release_minutes',
        category: 'BUSINESS_RULES',
        value: 45,
        defaultValue: 45,
        descriptionEn: 'Minutes of inactivity before auto-clearing abandoned dine-in tables.',
        descriptionAr: 'عدد دقائق الخمول قبل تحرير الطاولة غير النشطة تلقائياً.',
        version: 1,
        updatedAt: new Date().toISOString(),
        updatedBy: 'SYSTEM_BOOTSTRAP',
        scope: 'BRANCH',
      },
    ];

    defaults.forEach(d => this.configs.set(d.key, d));
  }

  public get<T = any>(key: string): T {
    const cfg = this.configs.get(key);
    if (!cfg) throw new Error(`Configuration key [${key}] not found.`);
    return cfg.value as T;
  }

  public getAllConfigs(): DynamicRuntimeConfig[] {
    return Array.from(this.configs.values());
  }

  public updateConfig(key: string, newValue: any, changedBy: string, reason: string): DynamicRuntimeConfig {
    const existing = this.configs.get(key);
    if (!existing) throw new Error(`Cannot update non-existent config key [${key}].`);

    const oldVal = existing.value;
    const newVersion = existing.version + 1;

    existing.value = newValue;
    existing.version = newVersion;
    existing.updatedAt = new Date().toISOString();
    existing.updatedBy = changedBy;

    this.auditHistory.unshift({
      configKey: key,
      oldValue: oldVal,
      newValue,
      version: newVersion,
      changedAt: new Date().toISOString(),
      changedBy,
      reason,
    });

    return existing;
  }

  public getAuditHistory() {
    return this.auditHistory;
  }
}

export const enterpriseConfigCenter = new EnterpriseConfigCenter();
