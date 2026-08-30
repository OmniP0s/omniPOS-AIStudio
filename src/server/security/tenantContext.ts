// Zero-Trust AsyncLocalStorage Multi-Tenant Context Propagation
// Prevents cross-tenant state pollution in concurrent async executions

import { AsyncLocalStorage } from 'async_hooks';

export interface ITenantContext {
  tenantId: string;
  branchId?: string;
  userId: string;
  roles: string[];
  permissions: string[];
  correlationId: string;
  isSystem?: boolean;
}

export class TenantContextHolder {
  private static readonly storage = new AsyncLocalStorage<ITenantContext>();

  public static run<R>(context: ITenantContext, callback: () => R): R {
    return this.storage.run(context, callback);
  }

  public static setTenantId(tenantId: string): void {
    const current = this.getRequired();
    if (current.tenantId !== tenantId) {
      throw new Error(
        `Security Violation: Tenant context cannot be changed (active: ${current.tenantId}, requested: ${tenantId})`
      );
    }
  }

  public static get(): ITenantContext | undefined {
    return this.storage.getStore();
  }

  public static getRequired(): ITenantContext {
    const ctx = this.get();
    if (!ctx || !ctx.tenantId) {
      throw new Error('Security Violation: Multi-tenant context is required but was not established');
    }
    return ctx;
  }

  public static getTenantId(): string {
    return this.getRequired().tenantId;
  }

  public static getBranchId(): string | undefined {
    return this.get()?.branchId;
  }

  public static getUserId(): string {
    return this.getRequired().userId;
  }

  public static getCorrelationId(): string {
    return this.get()?.correlationId || 'corr-system-init';
  }
}
