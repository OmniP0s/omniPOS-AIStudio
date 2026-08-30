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
];

