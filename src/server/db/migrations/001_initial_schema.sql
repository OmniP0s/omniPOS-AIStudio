-- ==============================================================================
-- Enterprise Multi-Tenant PostgreSQL Schema with Row-Level Security (RLS)
-- Migration: 001_initial_schema.sql
-- ==============================================================================

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
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  retry_count INT NOT NULL DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMPTZ,
  CONSTRAINT uq_tenant_idempotency UNIQUE (tenant_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_outbox_tenant_status ON outbox_events(tenant_id, status, created_at);

-- ==============================================================================
-- 9. Row-Level Security (RLS) Enforcement Policies
-- ==============================================================================

-- Enable RLS on all tenant-isolated tables
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbox_events ENABLE ROW LEVEL SECURITY;

-- Branches Policy
DROP POLICY IF EXISTS tenant_isolation_branches ON branches;
CREATE POLICY tenant_isolation_branches ON branches
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''))
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''));

-- Orders Policy
DROP POLICY IF EXISTS tenant_isolation_orders ON orders;
CREATE POLICY tenant_isolation_orders ON orders
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''))
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''));

-- Order Items Policy
DROP POLICY IF EXISTS tenant_isolation_order_items ON order_items;
CREATE POLICY tenant_isolation_order_items ON order_items
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''))
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''));

-- Inventory Items Policy
DROP POLICY IF EXISTS tenant_isolation_inventory ON inventory_items;
CREATE POLICY tenant_isolation_inventory ON inventory_items
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''))
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''));

-- Shifts Policy
DROP POLICY IF EXISTS tenant_isolation_shifts ON shifts;
CREATE POLICY tenant_isolation_shifts ON shifts
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''))
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''));

-- Outbox Events Policy
DROP POLICY IF EXISTS tenant_isolation_outbox ON outbox_events;
CREATE POLICY tenant_isolation_outbox ON outbox_events
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''))
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''));
