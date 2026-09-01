import { AccountingPostingsService } from './accountingPostings';
import { DoubleEntryEngine } from './doubleEntryEngine';
import { FinancialReportingService } from './financialReporting';

export interface TenantAccountingServices {
  engine: DoubleEntryEngine;
  postings: AccountingPostingsService;
  reporting: FinancialReportingService;
}

const accountingServicesByTenant = new Map<string, TenantAccountingServices>();

export function getAccountingServices(tenantId: string): TenantAccountingServices {
  if (!tenantId.trim()) {
    throw new Error('TENANT_CONTEXT_REQUIRED');
  }

  let services = accountingServicesByTenant.get(tenantId);
  if (!services) {
    const engine = new DoubleEntryEngine(tenantId);
    services = {
      engine,
      postings: new AccountingPostingsService(engine),
      reporting: new FinancialReportingService(engine),
    };
    accountingServicesByTenant.set(tenantId, services);
  }

  return services;
}
