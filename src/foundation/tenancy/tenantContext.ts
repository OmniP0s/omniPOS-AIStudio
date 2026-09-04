/**
 * TenantContext - الأساس الثابت للـ Multi-Tenancy + Multi-Company
 * يحمل السياق عبر AsyncLocalStorage بدون تمرير يدوي
 */

import { AsyncLocalStorage } from 'async_hooks'

export interface CompanyRole {
  companyId: string
  branchId?: string // null = كل الفروع
  role: string
  permissions: string[]
}

export interface ITenantContext {
  tenantId: string // OrganizationId
  companyId?: string // Current Company - NEW
  branchId?: string
  terminalId?: string
  userId: string
  roles: string[] // Global roles
  companyRoles: CompanyRole[] // Per-company roles - NEW
  permissions: string[]
  correlationId: string
  isSuperAdmin?: boolean
}

export class TenantContextHolder {
  private static storage = new AsyncLocalStorage<ITenantContext>()

  static run<T>(ctx: ITenantContext, fn: () => T): T {
    return this.storage.run(ctx, fn)
  }

  static get(): ITenantContext | undefined {
    return this.storage.getStore()
  }

  static require(): ITenantContext {
    const ctx = this.get()
    if (!ctx) throw new Error('TenantContext not found - SecurityPipeline middleware missing?')
    return ctx
  }

  static getTenantId(): string {
    return this.require().tenantId
  }

  static getCompanyId(): string | undefined {
    return this.require().companyId
  }

  static hasCompanyAccess(companyId: string): boolean {
    const ctx = this.require()
    if (ctx.isSuperAdmin || ctx.roles.includes('SUPER_ADMIN') || ctx.roles.includes('admin')) return true
    return ctx.companyRoles.some(r => r.companyId === companyId)
  }

  static hasPermission(permission: string, companyId?: string): boolean {
    const ctx = this.require()
    if (ctx.permissions.includes('*')) return true
    if (ctx.permissions.includes(permission)) return true
    if (companyId) {
      return ctx.companyRoles
        .filter(r => r.companyId === companyId)
        .some(r => r.permissions.includes(permission) || r.permissions.includes('*'))
    }
    return false
  }
}

// Helper to create context from TokenClaims (used in SecurityPipeline)
export function createTenantContextFromClaims(claims: {
  sub: string
  tenantId: string
  companyId?: string
  branchId?: string
  roles: string[]
  permissions?: string[]
  companyRoles?: CompanyRole[]
  correlationId: string
}): ITenantContext {
  return {
    tenantId: claims.tenantId,
    companyId: claims.companyId,
    branchId: claims.branchId,
    userId: claims.sub,
    roles: claims.roles,
    companyRoles: claims.companyRoles || [],
    permissions: claims.permissions || [],
    correlationId: claims.correlationId,
    isSuperAdmin: claims.roles.includes('SUPER_ADMIN') || claims.roles.includes('admin'),
  }
}
