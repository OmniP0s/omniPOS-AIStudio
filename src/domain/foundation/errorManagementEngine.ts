import {
  EnterpriseErrorDefinition,
  ErrorCategory,
  ErrorSeverity,
  RFC7807ProblemDetails,
} from './types';

export class EnterpriseErrorManagementEngine {
  private errorCatalog: Map<string, EnterpriseErrorDefinition> = new Map();

  constructor() {
    this.registerStandardCatalog();
  }

  private registerStandardCatalog(): void {
    const definitions: EnterpriseErrorDefinition[] = [
      {
        errorCode: 'ERR_VALIDATION_SCHEMA_FAILED',
        category: 'VALIDATION',
        severity: 'LOW',
        httpStatus: 422,
        retryable: false,
        messageTemplate: {
          en: 'Input payload failed schema validation: {details}',
          ar: 'فشل التحقق من صحة بنية البيانات المدخلة: {details}',
        },
        developerMessage: 'DTO validation failed against JSON schema or entity constraints.',
        remediationAdviceEn: 'Verify all required fields and type constraints before resending.',
        remediationAdviceAr: 'تحقق من اكتمال كافة الحقول المطلوبة وصحة الأنواع قبل إعادة الإرسال.',
      },
      {
        errorCode: 'ERR_DOMAIN_INSUFFICIENT_STOCK',
        category: 'DOMAIN',
        severity: 'MEDIUM',
        httpStatus: 409,
        retryable: false,
        messageTemplate: {
          en: 'Insufficient inventory stock for item "{itemName}". Available: {available}, Requested: {requested}',
          ar: 'الكمية المتوفرة في المخزون غير كافية للصنف "{itemName}". المتاح: {available}، المطلوب: {requested}',
        },
        developerMessage: 'Aggregate inventory invariant violated. Item stock count is lower than requested quantity.',
        remediationAdviceEn: 'Perform an inventory replenishment or adjust the requested order quantity.',
        remediationAdviceAr: 'قم بتوريد كميات إضافية للمخزون أو تعديل الكمية المطلوبة في الطلب.',
      },
      {
        errorCode: 'ERR_AUTH_EXPIRED_JWT',
        category: 'SECURITY',
        severity: 'HIGH',
        httpStatus: 401,
        retryable: true,
        retryStrategy: { maxRetries: 1, backoffMs: 100, exponential: false },
        messageTemplate: {
          en: 'Authentication token has expired. Please refresh your session.',
          ar: 'انتهت صلاحية رمز الدخول. يرجى تجديد الجلسة.',
        },
        developerMessage: 'JWT exp claim timestamp is in the past. Client must execute OAuth refresh flow.',
        remediationAdviceEn: 'Call the /api/v1/auth/refresh endpoint using the refresh token.',
        remediationAdviceAr: 'استدعِ نقطة النهاية /api/v1/auth/refresh باستخدام رمز التجديد.',
      },
      {
        errorCode: 'ERR_ZATCA_EGS_UNAUTHORIZED',
        category: 'INTEGRATION',
        severity: 'CRITICAL',
        httpStatus: 502,
        retryable: true,
        retryStrategy: { maxRetries: 3, backoffMs: 1000, exponential: true },
        messageTemplate: {
          en: 'ZATCA Phase 2 EGS signature verification failed: {reason}',
          ar: 'فشل التحقق من التوقيع الرقمي لهيئة الزكاة والضريبة (المرحلة 2): {reason}',
        },
        developerMessage: 'ZATCA Fatoora Portal returned HTTP 401/403 for cryptographic CSID certificate.',
        remediationAdviceEn: 'Verify CSID certificate validity, compliance onboarding status, and private key signature.',
        remediationAdviceAr: 'تحقق من صلاحية شهادة CSID وحالة الربط التشغيلي والتوقيع بالمفتاح الخاص.',
      },
      {
        errorCode: 'ERR_DISTRIBUTED_LOCK_TIMEOUT',
        category: 'CONCURRENCY',
        severity: 'HIGH',
        httpStatus: 409,
        retryable: true,
        retryStrategy: { maxRetries: 5, backoffMs: 300, exponential: true },
        messageTemplate: {
          en: 'Resource "{resourceId}" is locked by another concurrent process. Acquisition timed out.',
          ar: 'المورد "{resourceId}" مقفل حالياً بواسطة عملية متزامنة أخرى. انتهت مهلة الحجز.',
        },
        developerMessage: 'Redlock distributed lease could not be acquired within the configured TTL timeout.',
        remediationAdviceEn: 'Retry the transaction with exponential jitter backoff.',
        remediationAdviceAr: 'أعد المحاولة مع تطبيق تباعد زمني تصاعدي.',
      },
      {
        errorCode: 'ERR_IDEMPOTENCY_KEY_IN_FLIGHT',
        category: 'CONCURRENCY',
        severity: 'MEDIUM',
        httpStatus: 409,
        retryable: true,
        retryStrategy: { maxRetries: 3, backoffMs: 500, exponential: false },
        messageTemplate: {
          en: 'An operation with Idempotency Key "{key}" is currently being processed.',
          ar: 'العملية ذات مفتاح منع التكرار "{key}" قيد المعالجة حالياً.',
        },
        developerMessage: 'Concurrent duplicate request detected with identical Idempotency-Key header.',
        remediationAdviceEn: 'Wait for the initial request to finalize or poll the transaction status.',
        remediationAdviceAr: 'انتظر حتى تكتمل العملية الأصلية أو استعلم عن حالتها.',
      },
      {
        errorCode: 'ERR_CIRCUIT_BREAKER_OPEN',
        category: 'INFRASTRUCTURE',
        severity: 'CRITICAL',
        httpStatus: 503,
        retryable: true,
        retryStrategy: { maxRetries: 3, backoffMs: 2000, exponential: true },
        messageTemplate: {
          en: 'Downstream service "{serviceName}" is unavailable. Circuit breaker is OPEN.',
          ar: 'الخدمة التابعة "{serviceName}" غير متاحة حالياً. قاطع الدائرة في حالة العزل (OPEN).',
        },
        developerMessage: 'Circuit breaker tripped due to error rate exceeding threshold over the evaluation window.',
        remediationAdviceEn: 'Fallback to offline queue or wait for half-open health probe recovery.',
        remediationAdviceAr: 'استخدم طابور العمليات دون اتصال أو انتظر استعادة الخدمة تلقائياً.',
      },
      {
        errorCode: 'ERR_OBJECT_VIRUS_DETECTED',
        category: 'SECURITY',
        severity: 'FATAL',
        httpStatus: 403,
        retryable: false,
        messageTemplate: {
          en: 'File upload "{fileName}" failed ClamAV security scan. Malicious signature detected.',
          ar: 'فشل فحص الأمان لملف "{fileName}". تم اكتشاف توقيع برمجي خبيث.',
        },
        developerMessage: 'ClamAV antivirus daemon identified malware signature in multipart payload stream.',
        remediationAdviceEn: 'Reject file immediately, quarantine the object, and alert Security SOC.',
        remediationAdviceAr: 'ارفض الملف فوراً، واعزل الكائن في بيئة آمنة، وأرسل تنبيهاً لمركز العمليات الأمنية.',
      },
      {
        errorCode: 'ERR_SAGA_COMPENSATION_FAILED',
        category: 'TRANSACTION',
        severity: 'CRITICAL',
        httpStatus: 500,
        retryable: true,
        retryStrategy: { maxRetries: 10, backoffMs: 1500, exponential: true },
        messageTemplate: {
          en: 'Distributed Saga step "{stepName}" failed and automatic rollback encountered an error.',
          ar: 'فشلت خطوة المعاملة الموزعة "{stepName}" وواجه التراجع التلقائي خطأ.',
        },
        developerMessage: 'Saga compensator aborted mid-flow. Event published to DLQ for administrative intervention.',
        remediationAdviceEn: 'Inspect DLQ topic and execute manual compensating transaction replay.',
        remediationAdviceAr: 'افحص طابور الرسائل المتعثرة DLQ ونفذ إعادة تشغيل التعويض يدوياً.',
      },
    ];

    definitions.forEach(d => this.errorCatalog.set(d.errorCode, d));
  }

  public registerCustomError(definition: EnterpriseErrorDefinition): void {
    this.errorCatalog.set(definition.errorCode, definition);
  }

  public getErrorDefinition(errorCode: string): EnterpriseErrorDefinition {
    const def = this.errorCatalog.get(errorCode);
    if (def) return def;

    return {
      errorCode,
      category: 'SYSTEM',
      severity: 'HIGH',
      httpStatus: 500,
      retryable: false,
      messageTemplate: {
        en: 'An unexpected system error occurred: {details}',
        ar: 'حدث خطأ غير متوقع في النظام: {details}',
      },
      developerMessage: `Unregistered error code [${errorCode}] encountered.`,
      remediationAdviceEn: 'Contact enterprise platform engineering support.',
      remediationAdviceAr: 'تواصل مع فريق الدعم الهندسي للمنصة.',
    };
  }

  public formatMessage(
    template: string,
    params?: Record<string, string | number | boolean>
  ): string {
    if (!params) return template;
    let result = template;
    for (const [key, val] of Object.entries(params)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(val));
    }
    return result;
  }

  public createProblemDetails(params: {
    errorCode: string;
    instanceUrl: string;
    correlationId?: string;
    traceId?: string;
    spanId?: string;
    locale?: 'en' | 'ar';
    params?: Record<string, string | number | boolean>;
    invalidParams?: Array<{ name: string; reason: string; value?: any }>;
    customDetail?: string;
    extensions?: Record<string, any>;
  }): RFC7807ProblemDetails {
    const def = this.getErrorDefinition(params.errorCode);
    const locale = params.locale || 'en';
    const rawTemplate = locale === 'ar' ? def.messageTemplate.ar : def.messageTemplate.en;
    const detail = params.customDetail || this.formatMessage(rawTemplate, params.params);

    const correlationId = params.correlationId || `corr_${Math.random().toString(36).substring(2, 11)}`;
    const traceId = params.traceId || Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const spanId = params.spanId || Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    return {
      type: `https://omnipos.sa/errors/${def.errorCode.toLowerCase().replace(/_/g, '-')}`,
      title: def.errorCode.replace(/_/g, ' '),
      status: def.httpStatus,
      detail,
      instance: params.instanceUrl,
      errorCode: def.errorCode,
      category: def.category,
      severity: def.severity,
      retryable: def.retryable,
      timestamp: new Date().toISOString(),
      correlationId,
      traceId,
      spanId,
      invalidParams: params.invalidParams,
      extensions: {
        developerMessage: def.developerMessage,
        remediationAdvice: locale === 'ar' ? def.remediationAdviceAr : def.remediationAdviceEn,
        retryStrategy: def.retryStrategy,
        ...params.extensions,
      },
    };
  }

  public getAllRegisteredErrors(): EnterpriseErrorDefinition[] {
    return Array.from(this.errorCatalog.values());
  }
}

export const errorManagementEngine = new EnterpriseErrorManagementEngine();
