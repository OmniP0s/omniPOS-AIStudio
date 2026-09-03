// Enterprise Database Schema Definitions & SQL Migration Constants
// Supports PostgreSQL schema definition, types, and automated migration runner.

export const INITIAL_SCHEMA_SQL = `
-- 1. Schema Migrations Ledger
CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(64) PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  description TEXT NOT NULL
);

-- 2. Tenants Table
CREATE TABLE IF NOT EXISTS tenants (
  id VARCHAR(64) PRIMARY KEY,
  code VARCHAR(32) NOT NULL UNIQUE,
  name_en VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255) NOT NULL,
  vat_number VARCHAR(32) NOT NULL,
  cr_number VARCHAR(32),
  tier VARCHAR(32) NOT NULL DEFAULT 'ENTERPRISE',
  status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Branches Table
CREATE TABLE IF NOT EXISTS branches (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code VARCHAR(32) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255) NOT NULL,
  vat_number VARCHAR(32),
  address TEXT,
  phone VARCHAR(32),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_tenant_branch_code UNIQUE (tenant_id, code)
);

-- 4. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  branch_id VARCHAR(64) NOT NULL,
  order_number VARCHAR(64) NOT NULL,
  order_type VARCHAR(32) NOT NULL,
  status VARCHAR(32) NOT NULL,
  subtotal_minor BIGINT NOT NULL DEFAULT 0,
  discount_minor BIGINT NOT NULL DEFAULT 0,
  vat_amount_minor BIGINT NOT NULL DEFAULT 0,
  total_minor BIGINT NOT NULL DEFAULT 0,
  payment_method VARCHAR(32),
  cashier_id VARCHAR(64) NOT NULL,
  cashier_name VARCHAR(255),
  table_id VARCHAR(64),
  customer_id VARCHAR(64),
  zatca_hash VARCHAR(128),
  zatca_qr_base64 TEXT,
  zatca_status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  vector_clock JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_tenant_branch ON orders(tenant_id, branch_id);
CREATE INDEX IF NOT EXISTS idx_orders_tenant_status ON orders(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_tenant_created ON orders(tenant_id, created_at DESC);

-- 5. Order Line Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id VARCHAR(64) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255) NOT NULL,
  unit_price_minor BIGINT NOT NULL,
  quantity NUMERIC(12, 3) NOT NULL,
  total_price_minor BIGINT NOT NULL,
  modifiers JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_order_items_tenant_order ON order_items(tenant_id, order_id);

-- 6. Inventory Items Table
CREATE TABLE IF NOT EXISTS inventory_items (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  sku VARCHAR(64) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255) NOT NULL,
  category_id VARCHAR(64),
  barcode VARCHAR(64),
  unit VARCHAR(32) NOT NULL DEFAULT 'UNIT',
  cost_price_minor BIGINT NOT NULL DEFAULT 0,
  selling_price_minor BIGINT NOT NULL DEFAULT 0,
  min_stock_level NUMERIC(12, 3) NOT NULL DEFAULT 0,
  current_stock JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_tenant_sku UNIQUE (tenant_id, sku)
);

CREATE INDEX IF NOT EXISTS idx_inventory_tenant_sku ON inventory_items(tenant_id, sku);

-- 7. Shifts Table
CREATE TABLE IF NOT EXISTS shifts (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  branch_id VARCHAR(64) NOT NULL,
  terminal_id VARCHAR(64) NOT NULL,
  cashier_id VARCHAR(64) NOT NULL,
  cashier_name VARCHAR(255),
  status VARCHAR(32) NOT NULL DEFAULT 'OPEN',
  opened_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  closed_at TIMESTAMPTZ,
  opening_balance_minor BIGINT NOT NULL DEFAULT 0,
  cash_sales_minor BIGINT NOT NULL DEFAULT 0,
  card_sales_minor BIGINT NOT NULL DEFAULT 0,
  closing_balance_minor BIGINT,
  discrepancy_minor BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shifts_tenant_active ON shifts(tenant_id, branch_id, terminal_id, status);

-- 8. Outbox Events Table
CREATE TABLE IF NOT EXISTS outbox_events (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  event_type VARCHAR(64) NOT NULL,
  aggregate_type VARCHAR(64) NOT NULL,
  aggregate_id VARCHAR(64) NOT NULL,
  payload JSONB NOT NULL,
  vector_clock JSONB NOT NULL DEFAULT '{}'::jsonb,
  idempotency_key VARCHAR(128) NOT NULL,
  correlation_id VARCHAR(128),
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  retry_count INT NOT NULL DEFAULT 0,
  max_retries INT NOT NULL DEFAULT 5,
  error_message TEXT,
  locked_by VARCHAR(128),
  locked_at TIMESTAMPTZ,
  lease_expires_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMPTZ,
  CONSTRAINT uq_tenant_idempotency UNIQUE (tenant_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_outbox_tenant_status ON outbox_events(tenant_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_outbox_lease ON outbox_events(tenant_id, status, next_retry_at, lease_expires_at);

-- 9. Consumer Idempotency Table (Ensures downstream consumers never apply duplicate events)
CREATE TABLE IF NOT EXISTS processed_consumer_events (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  consumer_id VARCHAR(128) NOT NULL,
  event_id VARCHAR(64) NOT NULL,
  idempotency_key VARCHAR(128),
  processed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  result_summary JSONB,
  CONSTRAINT uq_consumer_event UNIQUE (tenant_id, consumer_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_consumer_events_tenant ON processed_consumer_events(tenant_id, consumer_id, event_id);

-- 10. Row-Level Security (RLS) Enforcement Policies
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbox_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_consumer_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_branches ON branches;
CREATE POLICY tenant_isolation_branches ON branches
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''))
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''));

DROP POLICY IF EXISTS tenant_isolation_orders ON orders;
CREATE POLICY tenant_isolation_orders ON orders
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''))
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''));

DROP POLICY IF EXISTS tenant_isolation_order_items ON order_items;
CREATE POLICY tenant_isolation_order_items ON order_items
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''))
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''));

DROP POLICY IF EXISTS tenant_isolation_inventory ON inventory_items;
CREATE POLICY tenant_isolation_inventory ON inventory_items
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''))
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''));

DROP POLICY IF EXISTS tenant_isolation_shifts ON shifts;
CREATE POLICY tenant_isolation_shifts ON shifts
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''))
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''));

DROP POLICY IF EXISTS tenant_isolation_outbox ON outbox_events;
CREATE POLICY tenant_isolation_outbox ON outbox_events
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''))
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''));

DROP POLICY IF EXISTS tenant_isolation_consumer_events ON processed_consumer_events;
CREATE POLICY tenant_isolation_consumer_events ON processed_consumer_events
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''))
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''));
`;

export const ZATCA_ACCOUNTING_SCHEMA_SQL = `
-- 11. ZATCA Phase 2 Invoices Table
CREATE TABLE IF NOT EXISTS zatca_invoices (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  branch_id VARCHAR(64) NOT NULL,
  order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  uuid VARCHAR(64) NOT NULL UNIQUE,
  invoice_number VARCHAR(64) NOT NULL,
  invoice_type VARCHAR(32) NOT NULL DEFAULT '0200000',
  transaction_type VARCHAR(32) NOT NULL DEFAULT '388',
  icv INT NOT NULL,
  pih VARCHAR(128) NOT NULL,
  invoice_hash VARCHAR(128) NOT NULL,
  qr_code_base64 TEXT NOT NULL,
  signed_xml TEXT NOT NULL,
  clearance_status VARCHAR(32) NOT NULL DEFAULT 'NOT_APPLICABLE',
  reporting_status VARCHAR(32) NOT NULL DEFAULT 'REPORTED',
  zatca_status VARCHAR(32) NOT NULL DEFAULT 'REPORTED',
  validation_errors JSONB NOT NULL DEFAULT '[]'::jsonb,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_zatca_invoices_tenant_order ON zatca_invoices(tenant_id, order_id);
CREATE INDEX IF NOT EXISTS idx_zatca_invoices_tenant_uuid ON zatca_invoices(tenant_id, uuid);

-- 12. General Ledger Chart of Accounts Table
CREATE TABLE IF NOT EXISTS chart_of_accounts (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code VARCHAR(32) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255) NOT NULL,
  category VARCHAR(32) NOT NULL,
  sub_category VARCHAR(64) NOT NULL,
  normal_balance VARCHAR(16) NOT NULL DEFAULT 'DEBIT',
  balance_minor BIGINT NOT NULL DEFAULT 0,
  currency VARCHAR(16) NOT NULL DEFAULT 'SAR',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_reconciled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_tenant_coa_code UNIQUE (tenant_id, code)
);

CREATE INDEX IF NOT EXISTS idx_coa_tenant_code ON chart_of_accounts(tenant_id, code);

-- 13. General Ledger Journal Entries Table
CREATE TABLE IF NOT EXISTS journal_entries (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  branch_id VARCHAR(64) NOT NULL,
  entry_number VARCHAR(64) NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reference VARCHAR(128) NOT NULL,
  source_type VARCHAR(64) NOT NULL,
  source_id VARCHAR(64) NOT NULL,
  idempotency_key VARCHAR(128) NOT NULL,
  memo TEXT NOT NULL,
  posted_by VARCHAR(255) NOT NULL,
  posted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_posted BOOLEAN NOT NULL DEFAULT TRUE,
  is_reversed BOOLEAN NOT NULL DEFAULT FALSE,
  reversal_entry_id VARCHAR(64),
  reverses_entry_id VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_tenant_je_idempotency UNIQUE (tenant_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_je_tenant_date ON journal_entries(tenant_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_je_tenant_source ON journal_entries(tenant_id, source_type, source_id);

-- 14. General Ledger Journal Lines Table
CREATE TABLE IF NOT EXISTS journal_lines (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  journal_entry_id VARCHAR(64) NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id VARCHAR(64) NOT NULL,
  account_code VARCHAR(32) NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  debit_minor BIGINT NOT NULL DEFAULT 0,
  credit_minor BIGINT NOT NULL DEFAULT 0,
  memo TEXT,
  cost_center VARCHAR(64),
  branch_id VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_jl_tenant_entry ON journal_lines(tenant_id, journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_jl_tenant_account ON journal_lines(tenant_id, account_code);

-- 15. RLS Policies for ZATCA & Accounting
ALTER TABLE zatca_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_lines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_zatca ON zatca_invoices;
CREATE POLICY tenant_isolation_zatca ON zatca_invoices
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''))
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''));

DROP POLICY IF EXISTS tenant_isolation_coa ON chart_of_accounts;
CREATE POLICY tenant_isolation_coa ON chart_of_accounts
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''))
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''));

DROP POLICY IF EXISTS tenant_isolation_je ON journal_entries;
CREATE POLICY tenant_isolation_je ON journal_entries
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''))
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''));

DROP POLICY IF EXISTS tenant_isolation_jl ON journal_lines;
CREATE POLICY tenant_isolation_jl ON journal_lines
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''))
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''));
`;

export const AUTH_IDENTITY_SCHEMA_SQL = `
-- 16. Auth Identity: Tenant-Scoped Users Table
-- Credential columns (password_hash / pin_hash) and the operational lockout/audit
-- columns are deliberately separated so that section 19 can grant the login role
-- column-level SELECT on the authentication subset only.
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  password_hash TEXT,
  pin_hash TEXT,
  roles TEXT[] NOT NULL,
  branch_id VARCHAR(64) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  failed_login_attempts INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  password_updated_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_tenant_user_email UNIQUE (tenant_id, email),
  CONSTRAINT ck_users_has_credential CHECK (password_hash IS NOT NULL OR pin_hash IS NOT NULL),
  CONSTRAINT ck_users_has_role CHECK (cardinality(roles) > 0)
);

CREATE INDEX IF NOT EXISTS idx_users_tenant_email ON users(tenant_id, email);
CREATE INDEX IF NOT EXISTS idx_users_tenant_pin_active ON users(tenant_id, is_active) WHERE pin_hash IS NOT NULL;

-- 17. Case-Insensitive Per-Tenant Email Uniqueness Guard
-- Application code normalizes with trim().toLowerCase(); this index enforces the same
-- invariant at the database level so no other write path can bypass it.
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_tenant_email_lower ON users(tenant_id, lower(email));

-- 18. Row-Level Security Enforcement for Users
-- FORCE is applied to this table only (tables from migrations 001/002 keep their existing
-- ENABLE-only behaviour). With FORCE, RLS constrains even the table owner, so no connection
-- can bypass tenant isolation on the credential table. Any write path against users must
-- therefore set app.current_tenant_id first.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_users ON users;
CREATE POLICY tenant_isolation_users ON users
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''))
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''));

-- 19. Least-Privilege Login Role (NOLOGIN group role, reached only via SET LOCAL ROLE)
-- CREATE ROLE has no IF NOT EXISTS form, so existence is guarded explicitly.
-- A missing CREATEROLE privilege is common on managed PostgreSQL (RDS / Cloud SQL / Azure),
-- so the failure is re-raised with an actionable message instead of a bare PostgreSQL error.
DO $$
DECLARE
  v_pg_error TEXT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_login') THEN
    BEGIN
      EXECUTE 'CREATE ROLE app_login NOLOGIN';
    EXCEPTION
      WHEN insufficient_privilege THEN
        v_pg_error := SQLERRM;
        RAISE EXCEPTION
          'omniPOS migration 20260830_003_auth_identity_schema failed while creating the "app_login" role: the migration role "%" does not have the CREATEROLE privilege that CREATE ROLE requires. PostgreSQL reported: %. Remediation: grant it once with ALTER ROLE % CREATEROLE; then re-run the migration.',
          CURRENT_USER, v_pg_error, CURRENT_USER
          USING ERRCODE = 'insufficient_privilege';
    END;
  END IF;
END
$$;

-- 20. Role Membership Grant (required before any SET LOCAL ROLE app_login can succeed)
DO $$
DECLARE
  v_pg_error TEXT;
BEGIN
  BEGIN
    EXECUTE format('GRANT app_login TO %I', CURRENT_USER);
  EXCEPTION
    WHEN insufficient_privilege THEN
      v_pg_error := SQLERRM;
      RAISE EXCEPTION
        'omniPOS migration 20260830_003_auth_identity_schema failed while granting the "app_login" role to "%": this requires CREATEROLE together with ADMIN OPTION on "app_login". PostgreSQL reported: %. Remediation: run the migration as the role that created "app_login", or grant ADMIN OPTION explicitly, then re-run the migration.',
        CURRENT_USER, v_pg_error
        USING ERRCODE = 'insufficient_privilege';
  END;
END
$$;

-- 21. Least-Privilege Column Grants for the Login Role
-- app_login receives SELECT on the authentication subset only. It has no visibility into
-- failed_login_attempts, locked_until, password_updated_at or last_login_at, and holds no
-- INSERT / UPDATE / DELETE privilege, so a compromised login path cannot mutate credentials.
REVOKE ALL ON users FROM PUBLIC;
REVOKE ALL ON users FROM app_login;
GRANT USAGE ON SCHEMA public TO app_login;
GRANT SELECT (id, tenant_id, email, password_hash, pin_hash, roles, branch_id, is_active) ON users TO app_login;
`;

export interface MigrationStep {
  version: string;
  description: string;
  sql: string;
}

export const MIGRATIONS: MigrationStep[] = [
  {
    version: '20260830_001_initial_schema',
    description: 'Create multi-tenant tables, foreign keys, indexes, and PostgreSQL RLS policies',
    sql: INITIAL_SCHEMA_SQL,
  },
  {
    version: '20260830_002_zatca_accounting_schema',
    description: 'Create ZATCA Phase 2 invoices, Chart of Accounts, and immutable Double-Entry General Ledger tables with RLS',
    sql: ZATCA_ACCOUNTING_SCHEMA_SQL,
  },
  {
    version: '20260830_003_auth_identity_schema',
    description: 'Create tenant-scoped users table with per-tenant email uniqueness, forced RLS isolation, and least-privilege app_login role',
    sql: AUTH_IDENTITY_SCHEMA_SQL,
  },
];

