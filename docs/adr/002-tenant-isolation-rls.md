# ADR-002: Tenant Isolation via RLS + AsyncLocalStorage

- Status: Accepted
- Date: 2026-09-04

## Decision
- Every operational table has `tenant_id`
- Postgres RLS: `tenant_id = current_setting('app.current_tenant_id')`
- AsyncLocalStorage `TenantContextHolder` carries context through call stack
- Middleware `enforceTenantIsolation` prevents client spoofing

## Rationale
Defense in depth: even if app forgets WHERE tenant_id, RLS protects. Even if RLS disabled, app layer checks.
