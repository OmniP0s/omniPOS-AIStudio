# OmniPOS Cloud - دليل المعمارية الثابتة

هذا المجلد هو **المرجع الصلب** الذي يُبنى عليه المشروع بالكامل. لا تغير فيه إلا بـ ADR.

## الملفات

| الملف | الوصف |
|---|---|
| `00_OVERVIEW.md` | نظرة عامة ومبادئ غير قابلة للتفاوض |
| `01_ARCHITECTURE_BLUEPRINT.md` | Blueprint المعماري + نماذج الشركات |
| `02_FOUNDATION_DECISIONS.md` | القرارات التأسيسية (ADRs مجمعة) |
| `03_COMPANY_HIERARCHY_DESIGN.md` | تصميم نظام الشركات بالتفصيل + اقتراحات |
| `04_DATA_MODEL_FOUNDATION.md` | نموذج البيانات الثابت + Migrations |
| `05_SECURITY_FOUNDATION.md` | الأمان Zero Trust |
| `06_API_CONTRACTS.md` | عقود API ثابتة |
| `07_FRONTEND_ARCHITECTURE.md` | معمارية الواجهة الأمامية |
| `08_DEPLOYMENT_ROADMAP.md` | خارطة طريق تنفيذ + تسعير |
| `adr/` | سجلات القرارات المعمارية المنفصلة |

## كيف تستخدم هذا كمرجع؟

1.  **قبل كتابة أي كود جديد:** اقرأ `00_OVERVIEW.md` + `02_FOUNDATION_DECISIONS.md`
2.  **عند إضافة Module جديد:** اتبع الهيكل في `01_ARCHITECTURE_BLUEPRINT.md` (domain -> application -> infrastructure -> presentation)
3.  **عند إضافة جدول:** اتبع القواعد في `04_DATA_MODEL_FOUNDATION.md` (tenant_id + company_id + BIGINT minor + RLS)
4.  **عند إضافة API:** اتبع العقود في `06_API_CONTRACTS.md` (v1, Idempotency-Key, Money minor)
5.  **عند إضافة شاشة:** اتبع `07_FRONTEND_ARCHITECTURE.md` (Feature-Sliced + TenantProvider)

## الأساس الثابت في الكود

```
src/foundation/
├── core/
│   ├── result.ts          # Result<T,E> - لا Exceptions في Domain
│   ├── domainEvent.ts     # DomainEvent + Factory
│   ├── errors.ts          # هرم الأخطاء الثابت
│   └── money.ts (re-export from domain/financial/money.ts)
├── tenancy/
│   └── tenantContext.ts   # ITenantContext + CompanyRoles + AsyncLocalStorage
├── company/
│   └── index.ts           # Public API للشركات
└── api/
    └── apiClient.ts       # ApiClient مع Idempotency + Offline

src/domain/company/
├── companyEntity.ts       # Company Entity + Rules + Factory
├── companyRepository.ts   # ICompanyRepository + UseCase Contracts
└── companyService.ts      # CompanyService (Application Logic)

src/server/db/migrations/
└── 003_companies_hierarchy.sql  # Migration الأساس لنظام الشركات
```

## قرارات سريعة (Cheatsheet)

- **Money:** استخدم `Money.fromMinor(10000n, 'SAR')` وليس `100`
- **Tenant:** كل query يجب أن يمر بـ `tenantId`، حتى لو RLS موجود
- **Company:** كل عملية تشغيلية يجب أن تحمل `companyId`
- **Outbox:** أي side effect (ZATCA, webhook) -> اكتب في `outbox_events` داخل نفس Transaction
- **Idempotency:** كل POST/PUT/PATCH يحتاج `Idempotency-Key`
- **Events:** لا تستدعي ZATCA من Order مباشرة، أصدر `OrderCompleted` event
- **Frontend:** لا تستورد من `domain/` مباشرة، مر عبر `features/{x}/api/`

## اقتراحات نظام الشركات (ملخص)

**النموذج الموصى به:** Multi-Company Holding

```
Organization (Tenant) - يدفع SaaS
  └── Company (Legal Entity) - VAT + CR مستقل
       └── Branch
            └── Terminal
```

**المميزات:**
- فاتورة SaaS واحدة لمجموعة شركات
- كل شركة لها VAT و CoA و ZATCA مستقل
- تقارير مجمعة (Consolidated)
- يمهد للفرنشايز لاحقاً
- نقل مخزون بين الشركات (Inter-Company)

**الخطوة التالية:** نفذ `003_companies_hierarchy.sql` + ابنِ `features/company` في Frontend.
