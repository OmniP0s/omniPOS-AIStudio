# OmniPOS Cloud - الهيكل المعماري والأساس التقني الثابت
## وثيقة مرجعية لا تتغير - Senior Software Architect Blueprint

> **تاريخ الإعداد:** 2026-09-04  
> **الحالة:** Foundation v1.0 - مرجع صلب للمشروع  
> **اللغة:** العربية مع مصطلحات تقنية إنجليزية ثابتة

---

## 1. الملخص التنفيذي (Executive Summary)

نحن نبني **نظام نقاط بيع سحابي متعدد الشركات** يخدم 3 نماذج عمل:
1.  **شركة واحدة بفروع** (مطعم 1-10 فروع)
2.  **قابضة متعددة الشركات** (مجموعة تملك 3 براندات، كل براند VAT مختلف) - **الأساس الجديد**
3.  **شبكة فرنشايز** (Franchisor + Franchisees مستقلين)

**القرار المعماري الأهم:** نبني **Modular Monolith** بحدود واضحة، وليس Microservices مبكراً. مع 4 طبقات ثابتة لا تتغير أبداً:
- **Foundation:** Money VO, TenantContext, SecurityPipeline, DomainEvent, Result
- **Domain:** Entities + Rules (Pure, لا يعتمد على DB)
- **Application:** UseCases + Sagas
- **Infrastructure:** Postgres + RLS + Outbox + IndexedDB

هذا الأساس يضمن أن أي مطور جديد لا يستطيع كسر عزل المستأجرين أو استخدام float للفلوس.

---

## 2. المبادئ غير القابلة للتفاوض (Non-Negotiable Principles)

| المبدأ | القاعدة | لماذا؟ |
|---|---|---|
| **Tenant First** | كل query يجب أن يحمل tenantId، حتى لو RLS موجود | يمنع تسريب بيانات SaaS |
| **Money is Money** | لا يوجد `number` للفلوس، فقط `Money` VO بـ minor units (هللة) + BIGINT في DB | يمنع أخطاء الـ float وضياع الهللات |
| **Outbox** | أي حدث يغير حالة + يحتاج تكامل خارجي (ZATCA) يُكتب في `outbox_events` داخل نفس Transaction | يمنع dual-write problem |
| **Idempotency** | كل POST/PUT/PATCH يدعم `Idempotency-Key` header | يسمح بإعادة المحاولة بدون تكرار طلب |
| **Immutable Ledger** | القيود المحاسبية لا تُحذف، فقط عكس بقيد جديد | Audit + ZATCA compliance |
| **Offline is Normal** | نفترض انقطاع الشبكة هو الحالة الطبيعية | POS يجب أن يعمل بدون إنترنت |

---

## 3. الهيكل الطبقي الثابت (Layered Architecture)

```
┌─────────────────────────────────────────────────┐
│  Presentation Layer                              │
│  React 19 (Feature-Sliced) + Express Routes     │
├─────────────────────────────────────────────────┤
│  Application Layer                               │
│  UseCases: CreateOrder, PayOrder, ProvisionCompany│
│  Sagas: OrderFulfillmentSaga, ZatcaSubmissionSaga│
├─────────────────────────────────────────────────┤
│  Domain Layer (Pure, No DB, No Framework)       │
│  Entities: Order, Company, Branch               │
│  VOs: Money, OrderTotals, ZatcaState            │
│  Rules: CompanyRules, OrderInvariants           │
├─────────────────────────────────────────────────┤
│  Foundation Layer (لا يتغير أبداً)              │
│  Money, Result<T,E>, DomainEvent, AppError      │
│  TenantContextHolder, SecurityPipeline          │
├─────────────────────────────────────────────────┤
│  Infrastructure Layer                            │
│  Postgres + RLS, IndexedDB, ZATCA API Adapter   │
│  Repositories: PostgresCompanyRepository        │
└─────────────────────────────────────────────────┘

Dependency Rule: Domain لا يعرف Infrastructure. Infrastructure يطبق interfaces من Domain.
```

---

## 4. تصميم نظام الشركات - الاقتراح الأساسي (مطلوبك)

### 4.1 المشكلة الحالية
الكود الحالي يفترض `Tenant = Company = VAT واحد`. لا يمكن لمجموعة مطاعم أن تدير 3 علامات تجارية بسجلات ضريبية مختلفة بفاتورة SaaS واحدة.

### 4.2 النموذج المقترح: Multi-Company Holding

```
Organization (Tenant) = القابضة - تدفع اشتراك SaaS
  │
  ├── Company A (Legal Entity) - سجل تجاري + VAT مستقل
  │     ├── Branch A1, A2
  │     ├── Terminals
  │     ├── Chart of Accounts A
  │     └── ZATCA Config A (EGS serial)
  │
  ├── Company B (Legal Entity) - VAT مختلف
  │     └── Branch B1
  │
  └── Shared Services
        ├── Central Kitchen (يخدم A و B)
        ├── Procurement Center
        └── HR Pool
```

**القرارات:**
- `tenants` = Organization (مالك الاشتراك)
- `companies` = كيان قانوني (جديد) - يحمل VAT + CR + Currency + Logo
- `branches.company_id` + `branches.tenant_id`
- `chart_of_accounts.company_id` - كل شركة شجرة حسابات مستقلة لكن يمكن تجميعها Consolidated
- `zatca_invoices.company_id` - كل شركة EGS و PIH مستقل
- `users` ينتمي لأكثر من Company عبر `user_company_roles`

### 4.3 جدول الصلاحيات الجديد

**الحالي:** User له branchId واحد  
**المقترح:**

```sql
user_company_roles (
  user_id,
  company_id,      -- NULL = كل شركات الـ Tenant (لـ SUPER_ADMIN)
  branch_id,       -- NULL = كل فروع الشركة
  role,            -- COMPANY_ADMIN, BRANCH_MANAGER, CASHIER...
  permissions JSONB
)
```

**مثال واقعي:**
- أحمد (مالك المجموعة): SUPER_ADMIN على مستوى Organization (يشوف كل الشركات)
- سارة: COMPANY_ADMIN على Company A (البراند الأول) فقط
- خالد: BRANCH_MANAGER على Branch A1 فقط
- كاشير: CASHIER على Branch A1 + Terminal POS-01

### 4.4 اقتراحات عملية لنظام الشركات (5 اقتراحات)

#### اقتراح 1: SaaS Multi-Company Dashboard
- شاشة Super Admin:
  - إجمالي مبيعات كل Companies (Consolidated)
  - مقارنة أداء الشركات
  - فاتورة SaaS مجمعة (عدد الفروع الكلي، عدد فواتير ZATCA الكلي)
- API: `GET /api/v1/companies` + `GET /api/v1/organizations/:id/consolidated-sales`

#### اقتراح 2: Central Menu & Inventory Sharing
- **Shared Catalog:** منتج مشترك (مثلاً: بيبسي) موجود في Company A و B بنفس SKU
- **Central Kitchen:** مطبخ مركزي يخدم فروع شركتين مختلفتين
- **Inter-Company Stock Transfer:** نقل مخزون من مستودع Company A إلى Company B مع قيد محاسبي Inter-Company (Receivable/Payable)

#### اقتراح 3: Consolidated Accounting
- كل Company لها CoA مستقل
- لكن تقارير مجمعة:
  - Trial Balance مجمع
  - P&L مجمع
  - VAT Return لكل Company + مجمع

#### اقتراح 4: Franchise Model (للتوسع المستقبلي)
- Franchisor ينشئ `franchise_agreement`:
  - royalty 5%, marketing 2%, territory Riyadh
  - يوزع Menu Template مركزياً
  - النظام يحسب Royalties تلقائياً من مبيعات Franchisee
- كل Franchisee هو Tenant مستقل (عزل كامل) لكن مرتبط عبر `franchise_relationships`

#### اقتراح 5: White-Label per Company
- كل Company لها Branding مستقل:
  - Logo, Colors, Receipt Template
  - Domain: `brand-a.omnipos.com`
  - Email sender: `noreply@brand-a.com`

---

## 5. نموذج البيانات التأسيسي (Data Model)

### الجداول الثابتة الجديدة

```sql
companies (
  id, tenant_id, code UNIQUE per tenant,
  name_en, name_ar, legal_name_en, legal_name_ar,
  vat_number UNIQUE per tenant (15 digit, ^3[0-9]{13}3$),
  cr_number (10 digit),
  currency, country, logo_url,
  config JSONB {zatcaEnabled, defaultTaxRate...},
  is_active, created_at, updated_at
)

branches (
  id, tenant_id, company_id FK, code, name_en, name_ar, address JSONB
)

user_company_roles (
  tenant_id, user_id, company_id, branch_id NULL, role, permissions JSONB
)

idempotency_keys (
  tenant_id, company_id, key UNIQUE per tenant, method, path, response_status, response_body, expires_at 24h
)

audit_logs (
  tenant_id, company_id, branch_id, user_id, action, entity_type, entity_id,
  old_values JSONB, new_values JSONB,
  hash (SHA256 prev_hash+data), prev_hash (Blockchain-like, يمنع التلاعب)
)
```

### تعديل الجداول الحالية
- كل جدول تشغيلي (orders, order_items, inventory_items, shifts, outbox_events) يحصل على `company_id` + index
- Backfill: كل سجل موجود ينتمي لشركة افتراضية `comp_{tenant_id}`

### RLS
- كل جدول جديد له RLS: `tenant_id = current_setting('app.current_tenant_id')`
- عزل Company يكون في Application Layer (أسهل لـ SUPER_ADMIN ليرى كل الشركات)

---

## 6. الأمان الثابت (Zero Trust)

**5 طبقات:**
1.  Edge: CORS, Rate Limit, Security Headers
2.  Authentication: HMAC-SHA256 token (موجود وممتاز) - لا JWT library ثقيل
3.  Authorization: RBAC + ABAC + Company Scope Check
4.  Tenant Isolation: AsyncLocalStorage + RLS (Defense in Depth)
5.  Audit: Immutable logs + hash chain

**مثال Company Scope Check:**
```ts
function enforceCompanyAccess(req, res, next) {
  const { companyId } = req.params
  if (!req.user.companyRoles.some(r => r.companyId === companyId)) {
    return res.status(403).json({ error: { code: 'COMPANY_ACCESS_DENIED' } })
  }
  next()
}
```

---

## 7. عقود API الثابتة

**Base:** `/api/v1/...` (نبدأ v1 الآن)  
**Headers:**
```
Authorization: Bearer <HMAC>
X-Correlation-Id: req-abc (auto)
Idempotency-Key: uuid (required for POST/PUT/PATCH)
X-Company-Id: comp_123
X-Branch-Id: branch_456
```

**Money في API:** لا float أبداً
```json
{ "subtotal_minor": 10000, "currency": "SAR" }
// Frontend: Money.fromMinor(10000n, 'SAR').toFormattedString('ar')
```

**Error موحد:**
```json
{
  "error": {
    "code": "COMPANY_ACCESS_DENIED",
    "message": "...",
    "correlationId": "req-abc",
    "timestamp": "2026-09-04T..."
  }
}
```

**مثال إنشاء شركة:**
```http
POST /api/v1/companies
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000

{
  "code": "BRAND_COFFEE",
  "nameEn": "Premium Coffee Co.",
  "nameAr": "شركة القهوة الفاخرة",
  "vatNumber": "300000000000003",
  "crNumber": "1010000001",
  "currency": "SAR"
}
→ 201 { id: "comp_...", ... }
```

---

## 8. الواجهة الأمامية الثابتة (Frontend)

**المشكلة:** `src/components/` مسطح 50+ ملف  
**الحل:** Feature-Sliced Design

```
src/
├── app/ (App shell, router, TenantProvider)
├── foundation/ (Money, apiClient, auth, ui)
├── features/
│   ├── company/ (NEW - CompanyList, CompanyForm, useCompanies)
│   ├── pos/ (POSLayout, ProductGrid, Cart)
│   ├── branch/
│   └── ...
├── pages/ (POSPage, CompaniesPage)
└── shared/
```

**Company Context Provider (NEW - مهم):**
```tsx
const { currentCompanyId, companies, setCurrentCompany } = useTenant()
// المستخدم يختار Company من Dropdown في Header
// كل API call يرسل X-Company-Id تلقائياً
```

**State:**
- Server State: TanStack Query (caching, sync)
- Client State: Zustand (cart, selected company)
- Edge State: IndexedDB (offline)

---

## 9. المزامنة Offline-First

```
[POS Terminal - IndexedDB]
  write → outbox (local) + vector_clock { terminalId: version }
    ↓ (when online)
[Sync Service]
  POST /api/v1/sync/push (batch)
  GET /api/v1/sync/pull?since=&vector=
    ↓
[Postgres]
  outbox_events → relay worker → ZATCA, Webhooks
  CRDT: LWW + Vector Clock (Server Wins for Orders, manual for Inventory)
```

---

## 10. Tech Stack الثابت

| الطبقة | التقنية | السبب |
|---|---|---|
| Runtime | Node 22 + Express 4 + tsx | موجود، خفيف |
| DB | Postgres 16 + RLS + JSONB | عزل مستأجرين على مستوى DB |
| Edge | IndexedDB + fake-indexeddb | Offline |
| Frontend | React 19 + Vite + Tailwind 4 | موجود |
| Money | Custom Money VO + Decimal | لا float |
| Auth | HMAC-SHA256 signed token | بسيط، سريع، لا dependencies |
| Validation | Zod (مقترح) | Type-safe |

---

## 11. خارطة الطريق (8 أسابيع)

### أسبوع 1-2: Foundation Hardening
- [ ] جدول `companies` + migration 003
- [ ] `TenantContext` يشمل companyId
- [ ] `src/foundation/` (Money, Result, DomainEvent, Errors)
- [ ] `CompanyRepository` + `CompanyService`

### أسبوع 3-4: Multi-Company POS Core
- [ ] Order, Shift, Inventory يحمل companyId
- [ ] Frontend: TenantProvider + Company Selector
- [ ] شاشة CompaniesPage CRUD
- [ ] نقل pos إلى features/pos/

### أسبوع 5-6: Accounting & ZATCA Multi-Company
- [ ] CoA per company
- [ ] ZATCA config per company
- [ ] Consolidated reports

### أسبوع 7-8: Advanced
- [ ] Inter-company transfers
- [ ] Franchise module (optional)
- [ ] White-label per company
- [ ] Load test 1000 orders/min per company

---

## 12. ما تم إنجازه في هذا المستودع (Deliverables)

### وثائق (docs/)
- `00_OVERVIEW.md` - مبادئ غير قابلة للتفاوض
- `01_ARCHITECTURE_BLUEPRINT.md` - Blueprint + 3 نماذج شركات
- `02_FOUNDATION_DECISIONS.md` - 10 ADRs ثابتة
- `03_COMPANY_HIERARCHY_DESIGN.md` - تصميم نظام الشركات + 5 اقتراحات
- `04_DATA_MODEL_FOUNDATION.md` - نموذج البيانات + Migration
- `05_SECURITY_FOUNDATION.md` - Zero Trust 5 طبقات
- `06_API_CONTRACTS.md` - عقود API
- `07_FRONTEND_ARCHITECTURE.md` - Feature-Sliced
- `08_DEPLOYMENT_ROADMAP.md` - خارطة طريق + تسعير
- `adr/` - 5 ADRs منفصلة

### كود أساس ثابت (src/foundation/ + src/domain/company/)
- `foundation/core/result.ts` - Result<T,E> pattern
- `foundation/core/domainEvent.ts` - DomainEvent factory + contracts
- `foundation/core/errors.ts` - هرم أخطاء ثابت + CompanyAccessDeniedError
- `foundation/tenancy/tenantContext.ts` - ITenantContext + CompanyRole + AsyncLocalStorage
- `foundation/api/apiClient.ts` - ApiClient مع Idempotency + Offline Queue
- `domain/company/companyEntity.ts` - Company Entity + Rules + Factory
- `domain/company/companyRepository.ts` - ICompanyRepository + UseCase contracts
- `domain/company/companyService.ts` - CompanyService (list, create, update, consolidated sales)
- `server/db/migrations/003_companies_hierarchy.sql` - Migration SQL
- `server/db/schema.ts` - تمت إضافة migration 003
- `server/db/postgresCompanyRepository.ts` - Postgres adapter

### الخلاصة
هذا الأساس يسمح لك:
- تبيع لشركة واحدة أو لقابضة 10 براندات بنفس الكود
- تضيف فرنشايز لاحقاً بدون إعادة كتابة
- تحافظ على ZATCA لكل شركة على حدة
- تتوسع لـ 1000+ عميل بدون Microservices معقدة

**الخطوة التالية المباشرة:** نفذ migration 003 + ابنِ `features/company` في Frontend.

---

## 13. ملحق: مقتطفات كود توضيحية مختصرة (كما طلبت)

### Money VO (موجود، نؤكد عليه)
```ts
const subtotal = Money.fromMinor(10000n, 'SAR') // 100.00 SAR
const vat = subtotal.multiply(0.15) // 15.00
const total = subtotal.add(vat) // 115.00
// allocate penny-safe: 100 SAR / 3 = [33.34, 33.33, 33.33]
```

### TenantContext (محدث)
```ts
TenantContextHolder.run({
  tenantId: 'tenant_123',
  companyId: 'comp_abc', // NEW
  branchId: 'branch_xyz',
  userId: 'user_1',
  roles: ['BRANCH_MANAGER'],
  companyRoles: [{ companyId: 'comp_abc', role: 'BRANCH_MANAGER', permissions: ['pos:order:create'] }],
  permissions: ['pos:order:create'],
  correlationId: 'req-123'
}, () => {
  // كل الكود هنا يرى السياق بدون تمرير يدوي
  const order = await createOrderUseCase.execute({ companyId: 'comp_abc', ... })
})
```

### Company Creation UseCase
```ts
const result = await companyService.createCompany({
  tenantId: 'tenant_123',
  code: 'BRAND_COFFEE',
  nameEn: 'Premium Coffee',
  nameAr: 'قهوة فاخرة',
  vatNumber: '300000000000003',
  crNumber: '1010000001',
  correlationId: 'req-abc',
  idempotencyKey: 'idem-xyz'
})
if (isOk(result)) { /* company created */ } else { /* handle error */ }
```

---

**انتهى - هذا هو الأساس الثابت المرجعي. أي كود جديد يجب أن يحترم هذه الوثيقة.**
