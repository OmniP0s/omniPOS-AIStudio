# القرارات التأسيسية الثابتة (ADRs) - OmniPOS

> هذه القرارات لا تتغير إلا بـ ADR جديد يوضح السبب. هي دستور المشروع.

---

## ADR-001: Modular Monolith أولاً، Microservices لاحقاً

**التاريخ:** 2026-09-04
**الحالة:** مقبول

**السياق:** هل نبني microservices من البداية؟
**القرار:** نبني Modular Monolith مع حدود واضحة. كل Module له folder مستقل ولا يستورد من Module آخر إلا عبر Public API (index.ts).

**العواقب:**
- إيجابي: Transaction واحدة عبر Modules، نشر بسيط، Debugging سهل.
- سلبي: يجب فرض الحدود بـ lint rules (no cross-import).

**كود توضيحي للحدود:**
```ts
// ✅ مسموح
import { Money } from '@/foundation/core/money'
import { IOrderRepository } from '@/domain/pos/contracts'

// ❌ ممنوع
import { InventoryItem } from '@/domain/inventory/entities' // من داخل pos domain
// يجب المرور عبر Application Layer أو Domain Event
```

---

## ADR-002: Multi-Tenancy = Row Level Security + AsyncLocalStorage

**الحالة:** مقبول (موجود حالياً)

**القرار:**
- كل جدول يحتوي `tenant_id` + `company_id` (جديد)
- RLS Policy: `tenant_id = current_setting('app.current_tenant_id')`
- `TenantContextHolder` باستخدام `AsyncLocalStorage` يحمل السياق عبر الـ call stack بدون تمرير يدوي.
- `enforceTenantIsolation` middleware يتحقق من عدم تزوير tenantId من Client.

**مقتطف ثابت:**
```ts
// في كل Repository
async findById(tenantId: string, id: string) {
  // لا نحتاج WHERE tenant_id يدوياً لأن RLS يفرضه، لكن نضعه دفاعاً إضافياً
  const result = await db.query(
    `SELECT * FROM orders WHERE id = $1 AND tenant_id = $2`,
    [id, tenantId]
  )
}
```

---

## ADR-003: Money Value Object هو المصدر الوحيد للفلوس

**الحالة:** مقبول

**القرار:**
- لا يوجد `number` يمثل مبلغ مالي في Domain أو DB (DB يحفظ BIGINT minor units).
- كل العمليات: `add, subtract, multiply, allocate` عبر Money VO.
- `allocate` يوزع الهللات بدون فقدان (penny-safe).

**مثال:**
```ts
// ❌ ممنوع
const total = subtotal + vat

// ✅ صحيح
const subtotal = Money.fromMinor(10000n, 'SAR') // 100.00
const vat = subtotal.multiply(0.15)
const total = subtotal.add(vat) // 115.00
```

---

## ADR-004: Outbox Pattern لكل Side Effects

**الحالة:** مقبول

**القرار:**
- أي كتابة تغير حالة + تحتاج إرسال خارجي (ZATCA, Webhook, Analytics) يجب أن تكتب في `outbox_events` داخل نفس الـ Transaction.
- Worker منفصل (Outbox Relay) يقرأ PENDING events بـ `FOR UPDATE SKIP LOCKED` ويرسلها.
- جدول `processed_consumer_events` يضمن Idempotency للمستهلكين.

**لماذا؟** يمنع حالة "تم حفظ الطلب لكن فشل إرسال ZATCA" بدون أثر.

---

## ADR-005: Company كـ Legal Entity مستقلة تحت Tenant

**الحالة:** مقترح جديد (الأساس لنظام الشركات)

**القرار:**
- `tenants` = Organization (مالك SaaS subscription)
- `companies` = كيان قانوني (سجل تجاري + رقم ضريبي)
- `branches` تنتمي لـ Company
- `users` يمكن أن ينتمي لأكثر من Company (via `user_company_roles`)

**Schema مقترح:**
```sql
CREATE TABLE companies (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code VARCHAR(32) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255) NOT NULL,
  vat_number VARCHAR(32) NOT NULL, -- 15 digit
  cr_number VARCHAR(32) NOT NULL,  -- 10 digit
  currency VARCHAR(8) NOT NULL DEFAULT 'SAR',
  is_active BOOLEAN DEFAULT TRUE,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, code),
  UNIQUE(tenant_id, vat_number)
);

ALTER TABLE branches ADD COLUMN company_id VARCHAR(64) REFERENCES companies(id);
ALTER TABLE chart_of_accounts ADD COLUMN company_id VARCHAR(64) REFERENCES companies(id);
ALTER TABLE zatca_invoices ADD COLUMN company_id VARCHAR(64) REFERENCES companies(id);
```

---

## ADR-006: API Design - Versioned, Idempotent, Correlation Tracked

**القرار:**
- Base path: `/api/v1/...` (نبدأ v1 الآن، حتى لو الكود الحالي /api)
- كل POST/PUT/PATCH يدعم `Idempotency-Key` header
- كل Response يحتوي `X-Correlation-Id`
- Errors موحدة:
```json
{
  "error": {
    "code": "ORDER_ALREADY_PAID",
    "message": "Cannot pay a completed order",
    "correlationId": "req-abc123",
    "details": { "orderId": "..." }
  }
}
```

---

## ADR-007: Frontend - Feature-Sliced + RBAC Guards

**القرار:**
- `src/components/` الحالي مسطح جداً (40+ component). نعيد تنظيمه لـ `src/features/{pos, inventory, company}/...`
- كل Feature له: `components/`, `hooks/`, `api/`, `model/` (types + permissions)
- `canAccessNav` + `ROLE_PERMISSIONS` هو الأساس، لكن نضيف `canAccessCompany(user, companyId, action)`

---

## ADR-008: No Direct DB Access from Presentation

**القرار:**
- Controllers لا تستدعي `db.query` مباشرة.
- فقط عبر `Application UseCase` -> `Repository Interface`.
- هذا يسمح بتبديل Postgres بـ mock للاختبار، وبـ Edge DB للـ offline.

---

## ADR-009: ZATCA كـ Bounded Context مستقل

**القرار:**
- ZATCA لا يعيش داخل Order. Order يصدر event `OrderCompleted`.
- ZATCA listener يلتقط الحدث ويولد UBL + توقيع + إرسال.
- هذا يمنع ربط POS بـ ZATCA مباشرة (لو ZATCA سقط، POS يستمر).

---

## ADR-010: Testing Pyramid ثابت

**القرار:**
- Unit: Money, Domain Rules (90% coverage)
- Integration: Repository + RLS + Outbox (موجود في src/test)
- E2E: ZATCA flow, Offline sync (مقترح Playwright)
- لا يمكن Merge بدون `npm test` أخضر.

