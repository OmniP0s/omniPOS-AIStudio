# ADR-005: Company as Legal Entity under Tenant

- Status: Proposed (Foundation for Company System)
- Date: 2026-09-04

## Context
Current model: Tenant = Company = 1 VAT. Cannot serve holding groups with multiple brands each having different VAT/CR.

## Decision
- `tenants` = Organization / Holding (SaaS billing owner)
- `companies` = Legal Entity (CR + VAT + CoA independent)
- `branches.company_id` + `branches.tenant_id`
- `chart_of_accounts.company_id`
- `zatca_invoices.company_id`
- `users` can belong to multiple companies via `user_company_roles`

## Schema
See docs/04_DATA_MODEL_FOUNDATION.md

## Consequences
- Positive: Supports 80% Saudi market (multi-brand groups), single SaaS invoice, paves way for franchise
- Negative: Requires migration 003, all queries need company filter, frontend needs company selector
- Mitigation: Make company_id optional first, backfill, then NOT NULL

## Alternatives Considered
- Tenant per Company: simpler isolation but complex billing, cannot share central kitchen
- Schema per Company: heavy, not scalable
- Chosen: Row-level company_id under same tenant (best balance)
