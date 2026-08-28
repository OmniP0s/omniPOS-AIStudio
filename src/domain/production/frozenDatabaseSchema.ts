/**
 * Sprint 2 Closeout - Frozen Production Database Schema & ERD
 * Release: v1.0.0-GA
 * RDBMS Target: PostgreSQL 16 (Multi-Tenant Row-Level Security RLS + TimeScaleDB)
 */

export interface SchemaTableDefinition {
  tableName: string;
  category: 'CORE_TENANCY' | 'TRANSACTIONS' | 'INVENTORY' | 'PROCUREMENT' | 'FINANCE' | 'HRMS' | 'COMPLIANCE';
  primaryKey: string;
  columns: { name: string; type: string; constraints: string; description: string }[];
  indexes: string[];
  foreignKeys: { column: string; referencesTable: string; referencesColumn: string }[];
}

export const FROZEN_PRODUCTION_SCHEMA: SchemaTableDefinition[] = [
  {
    tableName: 'tenants',
    category: 'CORE_TENANCY',
    primaryKey: 'id',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY DEFAULT gen_random_uuid()', description: 'Unique Tenant Org ID' },
      { name: 'name', type: 'VARCHAR(255)', constraints: 'NOT NULL', description: 'Brand / Corporate Name' },
      { name: 'vat_tin_number', type: 'VARCHAR(15)', constraints: 'NOT NULL UNIQUE', description: '15-digit ZATCA Tax Identification Number' },
      { name: 'currency', type: 'VARCHAR(3)', constraints: 'DEFAULT \'SAR\'', description: 'Base Accounting Currency' },
      { name: 'plan_tier', type: 'VARCHAR(50)', constraints: 'NOT NULL', description: 'ENTERPRISE / FRANCHISE / STANDARD' },
      { name: 'created_at', type: 'TIMESTAMPTZ', constraints: 'DEFAULT clock_timestamp()', description: 'Tenant Onboarding Timestamp' },
    ],
    indexes: ['CREATE UNIQUE INDEX idx_tenants_vat ON tenants(vat_tin_number);'],
    foreignKeys: []
  },
  {
    tableName: 'branches',
    category: 'CORE_TENANCY',
    primaryKey: 'id',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY DEFAULT gen_random_uuid()', description: 'Branch Identifier' },
      { name: 'tenant_id', type: 'UUID', constraints: 'NOT NULL REFERENCES tenants(id)', description: 'Parent Tenant FK' },
      { name: 'code', type: 'VARCHAR(30)', constraints: 'NOT NULL', description: 'Branch Code (e.g. RUH-001)' },
      { name: 'name_en', type: 'VARCHAR(255)', constraints: 'NOT NULL', description: 'English Branch Name' },
      { name: 'name_ar', type: 'VARCHAR(255)', constraints: 'NOT NULL', description: 'Arabic Branch Name' },
      { name: 'city', type: 'VARCHAR(100)', constraints: 'NOT NULL', description: 'City Location' },
      { name: 'cost_center_code', type: 'VARCHAR(50)', constraints: 'NOT NULL', description: 'General Ledger Cost Center' },
      { name: 'is_active', type: 'BOOLEAN', constraints: 'DEFAULT true', description: 'Branch Operational Status' },
    ],
    indexes: [
      'CREATE INDEX idx_branches_tenant ON branches(tenant_id);',
      'CREATE UNIQUE INDEX idx_branches_code ON branches(tenant_id, code);'
    ],
    foreignKeys: [{ column: 'tenant_id', referencesTable: 'tenants', referencesColumn: 'id' }]
  },
  {
    tableName: 'orders',
    category: 'TRANSACTIONS',
    primaryKey: 'id',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY DEFAULT gen_random_uuid()', description: 'Order Transaction UUID' },
      { name: 'tenant_id', type: 'UUID', constraints: 'NOT NULL REFERENCES tenants(id)', description: 'Tenant FK (RLS Partition)' },
      { name: 'branch_id', type: 'UUID', constraints: 'NOT NULL REFERENCES branches(id)', description: 'Branch FK' },
      { name: 'order_number', type: 'VARCHAR(50)', constraints: 'NOT NULL', description: 'Human-Readable Daily Order Sequence' },
      { name: 'subtotal_sar', type: 'NUMERIC(12,2)', constraints: 'NOT NULL', description: 'Net Subtotal before VAT' },
      { name: 'vat_amount_sar', type: 'NUMERIC(12,2)', constraints: 'NOT NULL', description: 'Statutory 15% VAT' },
      { name: 'grand_total_sar', type: 'NUMERIC(12,2)', constraints: 'NOT NULL', description: 'Final Invoice Amount' },
      { name: 'order_type', type: 'VARCHAR(30)', constraints: 'NOT NULL', description: 'DINE_IN / TAKEAWAY / DRIVE_THRU / DELIVERY' },
      { name: 'status', type: 'VARCHAR(30)', constraints: 'NOT NULL', description: 'OPEN / PREPARING / COMPLETED / CANCELLED' },
      { name: 'zatca_invoice_uuid', type: 'UUID', constraints: 'UNIQUE', description: 'ZATCA Compliance Document UUID' },
      { name: 'zatca_icv_counter', type: 'BIGINT', constraints: 'NOT NULL', description: 'Sequential Invoice Counter (Tamper-Proof)' },
      { name: 'zatca_hash_sha256', type: 'VARCHAR(64)', constraints: 'NOT NULL', description: 'Cryptographic Previous-Invoice Hash Chain' },
      { name: 'zatca_qr_tlv_base64', type: 'TEXT', constraints: 'NOT NULL', description: 'ZATCA Tag 1-9 Cryptographic QR' },
      { name: 'created_at', type: 'TIMESTAMPTZ', constraints: 'DEFAULT clock_timestamp()', description: 'Creation Timestamp' },
    ],
    indexes: [
      'CREATE INDEX idx_orders_tenant_created ON orders(tenant_id, created_at DESC);',
      'CREATE INDEX idx_orders_branch_status ON orders(branch_id, status);',
      'CREATE UNIQUE INDEX idx_orders_icv ON orders(tenant_id, branch_id, zatca_icv_counter);'
    ],
    foreignKeys: [
      { column: 'tenant_id', referencesTable: 'tenants', referencesColumn: 'id' },
      { column: 'branch_id', referencesTable: 'branches', referencesColumn: 'id' }
    ]
  },
  {
    tableName: 'order_items',
    category: 'TRANSACTIONS',
    primaryKey: 'id',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY DEFAULT gen_random_uuid()', description: 'Line Item UUID' },
      { name: 'order_id', type: 'UUID', constraints: 'NOT NULL REFERENCES orders(id) ON DELETE CASCADE', description: 'Parent Order FK' },
      { name: 'menu_item_id', type: 'VARCHAR(100)', constraints: 'NOT NULL', description: 'Menu Item SKU / Code' },
      { name: 'name_en', type: 'VARCHAR(255)', constraints: 'NOT NULL', description: 'Item English Description' },
      { name: 'name_ar', type: 'VARCHAR(255)', constraints: 'NOT NULL', description: 'Item Arabic Description' },
      { name: 'quantity', type: 'INTEGER', constraints: 'NOT NULL CHECK (quantity > 0)', description: 'Units Ordered' },
      { name: 'unit_price_sar', type: 'NUMERIC(10,2)', constraints: 'NOT NULL', description: 'Gross Unit Price' },
      { name: 'total_price_sar', type: 'NUMERIC(10,2)', constraints: 'NOT NULL', description: 'Line Total Amount' },
      { name: 'kitchen_status', type: 'VARCHAR(30)', constraints: 'DEFAULT \'QUEUED\'', description: 'QUEUED / PREPARING / READY / SERVED' },
    ],
    indexes: [
      'CREATE INDEX idx_order_items_order ON order_items(order_id);'
    ],
    foreignKeys: [{ column: 'order_id', referencesTable: 'orders', referencesColumn: 'id' }]
  },
  {
    tableName: 'inventory_items',
    category: 'INVENTORY',
    primaryKey: 'id',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY DEFAULT gen_random_uuid()', description: 'Inventory SKU UUID' },
      { name: 'tenant_id', type: 'UUID', constraints: 'NOT NULL REFERENCES tenants(id)', description: 'Tenant FK' },
      { name: 'sku_code', type: 'VARCHAR(50)', constraints: 'NOT NULL', description: 'Internal SKU Identifier' },
      { name: 'name', type: 'VARCHAR(255)', constraints: 'NOT NULL', description: 'Raw Material Name' },
      { name: 'unit_of_measure', type: 'VARCHAR(20)', constraints: 'NOT NULL', description: 'KG / LITER / PCS / BOX' },
      { name: 'current_stock_level', type: 'NUMERIC(12,3)', constraints: 'NOT NULL DEFAULT 0.000', description: 'On-Hand Physical Stock' },
      { name: 'reorder_point', type: 'NUMERIC(12,3)', constraints: 'NOT NULL', description: 'Minimum Safe Stock Level' },
      { name: 'unit_cost_sar', type: 'NUMERIC(10,2)', constraints: 'NOT NULL', description: 'Weighted Average Cost (WAC)' },
    ],
    indexes: [
      'CREATE UNIQUE INDEX idx_inv_tenant_sku ON inventory_items(tenant_id, sku_code);'
    ],
    foreignKeys: [{ column: 'tenant_id', referencesTable: 'tenants', referencesColumn: 'id' }]
  },
  {
    tableName: 'general_ledger_entries',
    category: 'FINANCE',
    primaryKey: 'id',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY DEFAULT gen_random_uuid()', description: 'GL Entry UUID' },
      { name: 'tenant_id', type: 'UUID', constraints: 'NOT NULL REFERENCES tenants(id)', description: 'Tenant FK' },
      { name: 'journal_number', type: 'VARCHAR(50)', constraints: 'NOT NULL', description: 'Sequential Journal Batch ID' },
      { name: 'account_code', type: 'VARCHAR(30)', constraints: 'NOT NULL', description: 'Chart of Accounts Code' },
      { name: 'cost_center_id', type: 'UUID', constraints: 'REFERENCES branches(id)', description: 'Branch Cost Center' },
      { name: 'debit_amount_sar', type: 'NUMERIC(14,2)', constraints: 'DEFAULT 0.00', description: 'Debit Amount' },
      { name: 'credit_amount_sar', type: 'NUMERIC(14,2)', constraints: 'DEFAULT 0.00', description: 'Credit Amount' },
      { name: 'posting_date', type: 'DATE', constraints: 'NOT NULL', description: 'Fiscal Accounting Date' },
      { name: 'is_posted', type: 'BOOLEAN', constraints: 'DEFAULT true', description: 'GL Final State Flag' },
    ],
    indexes: [
      'CREATE INDEX idx_gl_tenant_date ON general_ledger_entries(tenant_id, posting_date);',
      'CREATE INDEX idx_gl_account ON general_ledger_entries(tenant_id, account_code);'
    ],
    foreignKeys: [
      { column: 'tenant_id', referencesTable: 'tenants', referencesColumn: 'id' },
      { column: 'cost_center_id', referencesTable: 'branches', referencesColumn: 'id' }
    ]
  },
  {
    tableName: 'employees_hrms',
    category: 'HRMS',
    primaryKey: 'id',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY DEFAULT gen_random_uuid()', description: 'Employee Master UUID' },
      { name: 'tenant_id', type: 'UUID', constraints: 'NOT NULL REFERENCES tenants(id)', description: 'Tenant FK' },
      { name: 'national_id_iqama', type: 'VARCHAR(10)', constraints: 'NOT NULL UNIQUE', description: 'Saudi National ID or Iqama' },
      { name: 'full_name', type: 'VARCHAR(255)', constraints: 'NOT NULL', description: 'Full Legal Name' },
      { name: 'is_saudi_national', type: 'BOOLEAN', constraints: 'NOT NULL', description: 'Saudization (Nitaqat) Flag' },
      { name: 'basic_salary_sar', type: 'NUMERIC(10,2)', constraints: 'NOT NULL', description: 'Contractual Basic Wage' },
      { name: 'housing_allowance_sar', type: 'NUMERIC(10,2)', constraints: 'NOT NULL DEFAULT 0.00', description: 'Contractual Housing Allowance' },
      { name: 'service_start_date', type: 'DATE', constraints: 'NOT NULL', description: 'Hire Date for EOSG Article 84/85' },
      { name: 'gosi_number', type: 'VARCHAR(30)', constraints: 'NOT NULL', description: 'General Organization for Social Insurance ID' },
    ],
    indexes: [
      'CREATE INDEX idx_emp_tenant ON employees_hrms(tenant_id);',
      'CREATE UNIQUE INDEX idx_emp_national_id ON employees_hrms(national_id_iqama);'
    ],
    foreignKeys: [{ column: 'tenant_id', referencesTable: 'tenants', referencesColumn: 'id' }]
  }
];

export const FROZEN_ERD_PLANTUML = `@startuml
!define Table(name,desc) class name as "desc" << (T,#FFAAAA) >>
!define primary_key(x) <b>PK: x</b>
!define foreign_key(x) <i>FK: x</i>

hide methods
hide stereotypes

Table(tenants, "tenants\\n(Multi-Tenant Root)") {
  primary_key(id): UUID
  name: VARCHAR(255)
  vat_tin_number: VARCHAR(15) [UNIQUE]
  currency: VARCHAR(3)
  plan_tier: VARCHAR(50)
  created_at: TIMESTAMPTZ
}

Table(branches, "branches\\n(Store Locations)") {
  primary_key(id): UUID
  foreign_key(tenant_id): UUID
  code: VARCHAR(30)
  name_en: VARCHAR(255)
  name_ar: VARCHAR(255)
  cost_center_code: VARCHAR(50)
  is_active: BOOLEAN
}

Table(orders, "orders\\n(POS Financial Transactions)") {
  primary_key(id): UUID
  foreign_key(tenant_id): UUID
  foreign_key(branch_id): UUID
  order_number: VARCHAR(50)
  subtotal_sar: NUMERIC(12,2)
  vat_amount_sar: NUMERIC(12,2)
  grand_total_sar: NUMERIC(12,2)
  zatca_invoice_uuid: UUID
  zatca_icv_counter: BIGINT
  zatca_hash_sha256: VARCHAR(64)
  zatca_qr_tlv_base64: TEXT
  created_at: TIMESTAMPTZ
}

Table(order_items, "order_items\\n(Order Line Items)") {
  primary_key(id): UUID
  foreign_key(order_id): UUID
  menu_item_id: VARCHAR(100)
  name_en: VARCHAR(255)
  quantity: INT
  unit_price_sar: NUMERIC(10,2)
  total_price_sar: NUMERIC(10,2)
  kitchen_status: VARCHAR(30)
}

Table(inventory_items, "inventory_items\\n(WAC Raw Materials)") {
  primary_key(id): UUID
  foreign_key(tenant_id): UUID
  sku_code: VARCHAR(50)
  name: VARCHAR(255)
  unit_of_measure: VARCHAR(20)
  current_stock_level: NUMERIC(12,3)
  reorder_point: NUMERIC(12,3)
  unit_cost_sar: NUMERIC(10,2)
}

Table(general_ledger_entries, "general_ledger_entries\\n(Double-Entry ERP)") {
  primary_key(id): UUID
  foreign_key(tenant_id): UUID
  foreign_key(cost_center_id): UUID
  journal_number: VARCHAR(50)
  account_code: VARCHAR(30)
  debit_amount_sar: NUMERIC(14,2)
  credit_amount_sar: NUMERIC(14,2)
  posting_date: DATE
}

Table(employees_hrms, "employees_hrms\\n(Saudi Labor Law EOSG/WPS)") {
  primary_key(id): UUID
  foreign_key(tenant_id): UUID
  national_id_iqama: VARCHAR(10) [UNIQUE]
  full_name: VARCHAR(255)
  is_saudi_national: BOOLEAN
  basic_salary_sar: NUMERIC(10,2)
  service_start_date: DATE
}

tenants "1" -- "many" branches : manages
tenants "1" -- "many" orders : owns (RLS)
branches "1" -- "many" orders : issues
orders "1" -- "many" order_items : contains
tenants "1" -- "many" inventory_items : controls
tenants "1" -- "many" general_ledger_entries : audits
branches "1" -- "many" general_ledger_entries : cost center
tenants "1" -- "many" employees_hrms : employs
@enduml`;
