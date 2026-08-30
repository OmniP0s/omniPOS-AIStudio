// Enterprise Multi-Tenant Context & Resolution Contracts

export interface TenantIdentity {
  tenantId: string;
  organizationId: string;
  branchId: string;
  terminalId?: string;
  legalVatNumber: string;
  currency: string;
  isSandboxed?: boolean;
}

export interface UserPrincipal {
  userId: string;
  tenantId: string;
  branchId: string;
  roles: string[];
  permissions: string[];
  email: string;
  displayName: string;
  sessionId: string;
}

export interface ITenantContextResolver {
  resolveTenantContext(authorizationHeader?: string, apiKey?: string): Promise<UserPrincipal>;
  assertTenantAccess(principal: UserPrincipal, requiredTenantId: string): void;
  assertBranchAccess(principal: UserPrincipal, requiredBranchId: string): void;
}

export interface ITenantConfigurationProvider {
  getTenantConfig(tenantId: string): Promise<TenantIdentity>;
  getBranchConfig(tenantId: string, branchId: string): Promise<Record<string, any>>;
}
