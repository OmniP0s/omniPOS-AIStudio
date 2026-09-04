# الأساس الأمني الثابت - Zero Trust

## 1. الطبقات الأمنية (5 Layers)

```
Layer 1: Edge (CORS, Rate Limit, Security Headers)
Layer 2: Authentication (HMAC Token Verification)
Layer 3: Authorization (RBAC/ABAC + Company Roles)
Layer 4: Tenant Isolation (AsyncLocalStorage + RLS)
Layer 5: Audit & Immutability (Ledger + Audit Log)
```

## 2. المصادقة الحالية (موجودة وممتازة)

- `SecurityPipeline.generateToken` = HMAC-SHA256
- Payload = base64url(JSON claims)
- Signature = HMAC(payload, secret)
- لا JWT library، لا dependencies إضافية
- `timingSafeEqual` يمنع timing attacks

**Claims:**
```ts
{
  sub: userId,
  tenantId,
  companyId?, // NEW
  branchId?,
  roles: ['BRANCH_MANAGER'],
  permissions: ['pos:order:create', ...],
  exp, iat, iss, aud
}
```

**نحتفظ بهذا النمط لأنه:**
- بسيط، سريع، لا يحتاج JWKS
- مناسب لـ POS terminals (لا refresh token معقد)
- يمكن تطويره لاحقاً لـ RS256 إذا احتجنا SSO

## 3. التفويض الجديد (RBAC + ABAC + Company)

### RBAC (Role Based)
```ts
const ROLE_PERMISSIONS = {
  SUPER_ADMIN: ['*'], // كل شيء داخل Organization
  COMPANY_ADMIN: ['company:*:read', 'company:*:write', 'branch:*:read', ...],
  BRANCH_MANAGER: ['pos:order:*', 'inventory:read', 'shift:close', ...],
  CASHIER: ['pos:order:create', 'pos:order:read', 'shift:open'],
  ...
}
```

### ABAC (Attribute Based) - جديد
```ts
// مثال: لا يمكن للكاشير عمل خصم > 20% إلا بموافقة مدير
function canApplyDiscount(user: UserPrincipal, order: Order, discountPercent: number): boolean {
  if (discountPercent <= 10) return hasPermission(user, 'pos:order:discount')
  if (discountPercent <= 20) return hasRole(user, 'BRANCH_MANAGER')
  return hasRole(user, 'COMPANY_ADMIN') // >20% يحتاج Company Admin
}
```

### Company Scope Check
```ts
// Middleware جديد
function enforceCompanyAccess(req, res, next) {
  const { companyId } = req.params // أو من body
  const user = req.user // من SecurityPipeline
  if (!companyId) return next() // لا يوجد company في الطلب
  if (!user.companyRoles.some(r => r.companyId === companyId)) {
    return res.status(403).json({ error: { code: 'COMPANY_ACCESS_DENIED' } })
  }
  next()
}
```

## 4. عزل المستأجرين (Tenant Isolation)

### AsyncLocalStorage (موجود)
```ts
// TenantContextHolder
import { AsyncLocalStorage } from 'async_hooks'
class TenantContextHolder {
  static storage = new AsyncLocalStorage<ITenantContext>()
  static run(ctx, fn) { return this.storage.run(ctx, fn) }
  static get() { return this.storage.getStore() }
}
```

### RLS في Postgres (موجود)
```sql
SET LOCAL app.current_tenant_id = 'tenant_123';
-- الآن أي SELECT على orders سيرى فقط tenant_123
```

### Defense in Depth
- حتى لو نسي المطور WHERE tenant_id، RLS يحمي
- حتى لو RLS معطل، Application Layer يفحص
- حتى لو Application Layer نسي، `enforceTenantIsolation` middleware يفحص

## 5. الأمان للـ Offline

- IndexedDB لا يحتوي token طويل الأمد، فقط short-lived (1h)
- كل عملية offline تحمل `deviceId` + `userId` + `vectorClock`
- عند Sync، Server يتحقق من صلاحية المستخدم وقت العملية (ليس وقت Sync)

## 6. Audit Log غير قابل للتعديل

```sql
CREATE TABLE audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  company_id VARCHAR(64),
  user_id VARCHAR(64) NOT NULL,
  action VARCHAR(64) NOT NULL, -- ORDER_CREATED, DISCOUNT_APPLIED...
  entity_type VARCHAR(64),
  entity_id VARCHAR(64),
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(64),
  user_agent TEXT,
  hash VARCHAR(128) NOT NULL, -- SHA256(prev_hash + current_data)
  prev_hash VARCHAR(128),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

- كل سجل يحمل hash من السابق (Blockchain-like) لمنع التلاعب
- لا UPDATE ولا DELETE مسموح (REVOKE)

## 7. حماية ZATCA Keys

- Private Keys لا تحفظ في DB كنص، بل في `secretsGovernanceEngine` (موجود)
- CSID و Private Key مشفرة بـ AES-256-GCM بمفتاح من ENV
- لا تظهر في Logs أبداً

## 8. Rate Limiting & Security Headers (موجود)

- `rateLimitApiRequests` موجود
- `applySecurityHeaders` يضيف HSTS, CSP, etc
- نقترح إضافة `helmet` لكن الحالي جيد

## 9. Checklist أمان ثابت

- [ ] كل endpoint جديد يحتاج `policy` في `ROUTE_AUTHORIZATION_POLICIES`
- [ ] كل جدول جديد يحتاج RLS
- [ ] كل Money field يحتاج Money VO
- [ ] لا `console.log` يحتوي PII أو secrets (استخدم logger)
- [ ] كل API كتابة يحتاج Idempotency-Key
