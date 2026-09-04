-- Migration 003: Companies Hierarchy (Foundation for Multi-Company System)
-- Version: 20260904_003_companies_hierarchy
-- Description: Introduce companies as legal entities under tenants, add company_id to all operational tables

-- 1. Companies Table (Legal Entity)
CREATE TABLE IF NOT EXISTS companies (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code VARCHAR(32) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255) NOT NULL,
  legal_name_en VARCHAR(255),
  legal_name_ar VARCHAR(255),
  vat_number VARCHAR(32) NOT NULL,
  cr_number VARCHAR(32) NOT NULL,
  currency VARCHAR(8) NOT NULL DEFAULT 'SAR',
  country VARCHAR(2) NOT NULL DEFAULT 'SA',
  logo_url TEXT,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_tenant_company_code UNIQUE (tenant_id, code),
  CONSTRAINT uq_tenant_company_vat UNIQUE (tenant_id, vat_number),
  CONSTRAINT chk_vat_format CHECK (vat_number ~ '^3[0-9]{13}3$'),
  CONSTRAINT chk_cr_format CHECK (cr_number ~ '^[0-9]{10}$')
);

CREATE INDEX IF NOT EXISTS idx_companies_tenant ON companies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_companies_tenant_active ON companies(tenant_id, is_active);

-- 2. Backfill: Create default company for each existing tenant
INSERT INTO companies (id, tenant_id, code, name_en, name_ar, vat_number, cr_number, currency, country, config)
SELECT 
  'comp_' || t.id,
  t.id,
  'DEFAULT',
  t.name_en,
  t.name_ar,
  t.vat_number,
  COALESCE(t.cr_number, '1000000000'),
  'SAR',
  'SA',
  jsonb_build_object(
    'zatcaEnabled', true,
    'zatcaEnv', 'simulation',
    'defaultTaxRate', 0.15,
    'currency', 'SAR',
    'allowNegativeStock', false
  )
FROM tenants t
WHERE NOT EXISTS (SELECT 1 FROM companies c WHERE c.tenant_id = t.id)
ON CONFLICT (tenant_id, code) DO NOTHING;

-- 3. Add company_id to branches
ALTER TABLE branches ADD COLUMN IF NOT EXISTS company_id VARCHAR(64) REFERENCES companies(id) ON DELETE CASCADE;
UPDATE branches SET company_id = 'comp_' || tenant_id WHERE company_id IS NULL;
-- Note: SET NOT NULL in next migration after verification
-- ALTER TABLE branches ALTER COLUMN company_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_branches_company ON branches(company_id);
CREATE INDEX IF NOT EXISTS idx_branches_tenant_company ON branches(tenant_id, company_id);

-- 4. Add company_id to operational tables
ALTER TABLE orders ADD COLUMN IF NOT EXISTS company_id VARCHAR(64) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS company_id VARCHAR(64) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS company_id VARCHAR(64) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS company_id VARCHAR(64) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE outbox_events ADD COLUMN IF NOT EXISTS company_id VARCHAR(64) REFERENCES companies(id) ON DELETE CASCADE;

-- Backfill operational tables
UPDATE orders SET company_id = 'comp_' || tenant_id WHERE company_id IS NULL;
UPDATE order_items SET company_id = 'comp_' || tenant_id WHERE company_id IS NULL;
UPDATE inventory_items SET company_id = 'comp_' || tenant_id WHERE company_id IS NULL;
UPDATE shifts SET company_id = 'comp_' || tenant_id WHERE company_id IS NULL;
UPDATE outbox_events SET company_id = 'comp_' || tenant_id WHERE company_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_orders_company ON orders(company_id);
CREATE INDEX IF NOT EXISTS idx_orders_tenant_company_branch ON orders(tenant_id, company_id, branch_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shifts_company ON shifts(company_id);

-- 5. User Company Roles (Multi-Company Access)
CREATE TABLE IF NOT EXISTS user_company_roles (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id VARCHAR(64) NOT NULL,
  company_id VARCHAR(64) NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id VARCHAR(64) REFERENCES branches(id) ON DELETE CASCADE,
  role VARCHAR(32) NOT NULL,
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_user_company_role UNIQUE (tenant_id, user_id, company_id, branch_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_company_roles_tenant_user ON user_company_roles(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_user_company_roles_company ON user_company_roles(company_id);

-- 6. Idempotency Keys Table (Foundation for Idempotent APIs)
CREATE TABLE IF NOT EXISTS idempotency_keys (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  company_id VARCHAR(64) REFERENCES companies(id) ON DELETE CASCADE,
  key VARCHAR(128) NOT NULL,
  method VARCHAR(16) NOT NULL,
  path TEXT NOT NULL,
  request_hash VARCHAR(128),
  response_status INT,
  response_body JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP + INTERVAL '24 hours',
  CONSTRAINT uq_tenant_idempotency_key UNIQUE (tenant_id, key)
);

CREATE INDEX IF NOT EXISTS idx_idempotency_tenant_key ON idempotency_keys(tenant_id, key);
CREATE INDEX IF NOT EXISTS idx_idempotency_expires ON idempotency_keys(expires_at);

-- 7. Audit Logs (Immutable)
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  company_id VARCHAR(64) REFERENCES companies(id) ON DELETE CASCADE,
  branch_id VARCHAR(64) REFERENCES branches(id) ON DELETE SET NULL,
  user_id VARCHAR(64) NOT NULL,
  action VARCHAR(64) NOT NULL,
  entity_type VARCHAR(64) NOT NULL,
  entity_id VARCHAR(64) NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(64),
  user_agent TEXT,
  correlation_id VARCHAR(128),
  hash VARCHAR(128) NOT NULL,
  prev_hash VARCHAR(128),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_tenant_company ON audit_logs(tenant_id, company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);

-- 8. RLS for new tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_company_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE idempotency_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_companies ON companies;
CREATE POLICY tenant_isolation_companies ON companies
  FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''))
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''));

DROP POLICY IF EXISTS tenant_isolation_user_company_roles ON user_company_roles;
CREATE POLICY tenant_isolation_user_company_roles ON user_company_roles
  FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''))
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''));

DROP POLICY IF EXISTS tenant_isolation_idempotency_keys ON idempotency_keys;
CREATE POLICY tenant_isolation_idempotency_keys ON idempotency_keys
  FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''))
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''));

DROP POLICY IF EXISTS tenant_isolation_audit_logs ON audit_logs;
CREATE POLICY tenant_isolation_audit_logs ON audit_logs
  FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''))
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''));

-- 9. Update existing RLS policies to also consider company_id where applicable (optional, for defense)
-- We keep RLS on tenant_id only for simplicity, company check is in application layer
