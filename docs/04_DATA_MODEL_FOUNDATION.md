# نموذج البيانات التأسيسي الثابت

## 1. المبادئ

1.  **كل جدول له `id` كـ VARCHAR(64) ULID/UUID، ليس SERIAL.**
2.  **كل جدول تشغيلي له `tenant_id` + `company_id` + `branch_id` حيث ينطبق.**
3.  **الفلوس = BIGINT minor units، ليس NUMERIC أو FLOAT.**
4.  **التواريخ = TIMESTAMPTZ، وليس TIMESTAMP.**
5.  **الحذف = Soft Delete عبر `is_active` أو `status`، لا DELETE فعلي إلا للـ Outbox بعد المعالجة.**
6.  **التدقيق = `created_at`, `updated_at`, `created_by` في كل جدول.**

## 2. الجداول الأساسية الثابتة (Foundation Tables)

### tenants (Organization)
```sql
CREATE TABLE tenants (
  id VARCHAR(64) PRIMARY KEY,
  code VARCHAR(32) UNIQUE NOT NULL, -- org code
  name_en VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255) NOT NULL,
  tier VARCHAR(32) DEFAULT 'ENTERPRISE',
  status VARCHAR(32) DEFAULT 'ACTIVE',
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### companies (NEW - Legal Entity)
```sql
CREATE TABLE companies (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code VARCHAR(32) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255) NOT NULL,
  legal_name_en VARCHAR(255),
  legal_name_ar VARCHAR(255),
  vat_number VARCHAR(32) NOT NULL, -- 15 digit ZATCA
  cr_number VARCHAR(32) NOT NULL,  -- 10 digit
  currency VARCHAR(8) NOT NULL DEFAULT 'SAR',
  country VARCHAR(2) DEFAULT 'SA',
  logo_url TEXT,
  config JSONB DEFAULT '{}', -- zatca, tax, etc
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, code),
  UNIQUE(tenant_id, vat_number)
);
```

### branches
```sql
CREATE TABLE branches (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  company_id VARCHAR(64) NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  code VARCHAR(32) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255) NOT NULL,
  address JSONB, -- { street, district, city, postalCode, lat, lng }
  phone VARCHAR(32),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, company_id, code)
);
```

### terminals
```sql
CREATE TABLE terminals (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  company_id VARCHAR(64) NOT NULL,
  branch_id VARCHAR(64) NOT NULL REFERENCES branches(id),
  code VARCHAR(32) NOT NULL,
  type VARCHAR(32) NOT NULL, -- POS_MAIN, KDS, WAITER_TABLET
  egs_serial VARCHAR(64), -- ZATCA EGS
  status VARCHAR(32) DEFAULT 'OFFLINE',
  last_heartbeat TIMESTAMPTZ,
  config JSONB DEFAULT '{}',
  UNIQUE(tenant_id, branch_id, code)
);
```

### users + user_company_roles (NEW)
```sql
CREATE TABLE users (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id),
  email VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  password_hash TEXT, -- أو pin_hash
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, email)
);

CREATE TABLE user_company_roles (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id VARCHAR(64) NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id VARCHAR(64) REFERENCES branches(id) ON DELETE CASCADE,
  role VARCHAR(32) NOT NULL,
  permissions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, user_id, company_id, branch_id, role)
);
```

## 3. جداول POS الأساسية (مع company_id)

### orders
```sql
CREATE TABLE orders (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  company_id VARCHAR(64) NOT NULL REFERENCES companies(id),
  branch_id VARCHAR(64) NOT NULL,
  terminal_id VARCHAR(64),
  order_number VARCHAR(64) NOT NULL,
  daily_sequence INT NOT NULL,
  order_type VARCHAR(32) NOT NULL,
  status VARCHAR(32) NOT NULL,
  -- Money fields as BIGINT minor units
  subtotal_minor BIGINT NOT NULL DEFAULT 0,
  discount_minor BIGINT NOT NULL DEFAULT 0,
  vat_amount_minor BIGINT NOT NULL DEFAULT 0,
  total_minor BIGINT NOT NULL DEFAULT 0,
  currency VARCHAR(8) NOT NULL DEFAULT 'SAR',
  -- Relations
  customer_id VARCHAR(64),
  table_id VARCHAR(64),
  shift_id VARCHAR(64),
  cashier_id VARCHAR(64) NOT NULL,
  -- ZATCA
  zatca_status VARCHAR(32) DEFAULT 'PENDING',
  invoice_uuid VARCHAR(64),
  -- Sync
  vector_clock JSONB DEFAULT '{}',
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_orders_company_branch ON orders(company_id, branch_id, created_at DESC);
```

### order_items, payments, shifts, inventory_items
- كلها تحمل `company_id` + `tenant_id`
- `inventory_items` يحمل `company_id` لأن SKU قد يتكرر بين شركات مختلفة

## 4. جداول المحاسبة والـ ZATCA

### chart_of_accounts
```sql
CREATE TABLE chart_of_accounts (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  company_id VARCHAR(64) NOT NULL REFERENCES companies(id),
  code VARCHAR(32) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255) NOT NULL,
  category VARCHAR(32) NOT NULL, -- ASSET, LIABILITY...
  normal_balance VARCHAR(16) DEFAULT 'DEBIT',
  balance_minor BIGINT DEFAULT 0,
  currency VARCHAR(8) DEFAULT 'SAR',
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(tenant_id, company_id, code)
);
```

### journal_entries + journal_lines
- `company_id` موجود
- `idempotency_key` يمنع تكرار القيد من نفس المصدر (order_id مثلاً)

### zatca_invoices
- `company_id` + `branch_id` + `order_id`
- `pih` (Previous Invoice Hash) محسوب per company EGS، ليس global

## 5. Outbox & Sync

### outbox_events
```sql
-- موجود حالياً، نضيف company_id
ALTER TABLE outbox_events ADD COLUMN company_id VARCHAR(64) REFERENCES companies(id);
CREATE INDEX idx_outbox_company_status ON outbox_events(company_id, status, created_at);
```

## 6. RLS Policies المحدثة (الثابت الأمني)

```sql
-- لكل جدول تشغيلي
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_companies ON companies
  FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''))
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''));

-- نفس النمط لـ branches, orders, etc
-- + Policy إضافية لـ company isolation على مستوى التطبيق (Application Layer)
-- RLS على tenant فقط كافي لـ DB، لكن company يُفحص في Service Layer
```

**لماذا RLS على tenant فقط وليس company؟**
- RLS معقد إذا وضعنا company أيضاً (سيحتاج SET متعدد)
- نستخدم RLS لـ tenant (عزل SaaS) و Application Layer لـ company (عزل قانوني)
- هذا يسمح لـ SUPER_ADMIN برؤية كل الشركات داخل نفس Tenant بدون تغيير SET

## 7. قواعد تسمية ثابتة

- Tables: snake_case plural? الحالي singular مع _items. نثبت: singular_snake (orders, order_items) - الحالي جيد
- Columns: snake_case
- IDs: VARCHAR(64) ULID (lexicographically sortable)
- Money: *_minor BIGINT
- JSONB: للـ flexible data لكن لا نضع فيه حقول نبحث عنها كثيراً (نضعها كـ columns)
- Indexes: `idx_{table}_{columns}`

## 8. Migration Strategy

- `MigrationRunner` موجود - نحافظ عليه
- كل Migration ملف SQL + version
- لا نعدل Migration قديم، نضيف جديد فقط
- مثال: `20260904_003_companies_hierarchy.sql`

```sql
-- 003_companies_hierarchy.sql
CREATE TABLE companies (...);
ALTER TABLE branches ADD COLUMN company_id VARCHAR(64);
-- Backfill: كل branch موجود ينتمي لشركة افتراضية من tenant
INSERT INTO companies (id, tenant_id, code, name_en, name_ar, vat_number, cr_number)
SELECT 'comp_' || t.id, t.id, 'DEFAULT', t.name_en, t.name_ar, t.vat_number, COALESCE(t.cr_number, '0000000000')
FROM tenants t
ON CONFLICT DO NOTHING;

UPDATE branches b SET company_id = 'comp_' || b.tenant_id WHERE company_id IS NULL;
ALTER TABLE branches ALTER COLUMN company_id SET NOT NULL;
```
