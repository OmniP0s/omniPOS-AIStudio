// SaaS Billing & Multi-Tenant Metering Engine - OmniPOS Enterprise
import { TenantBillingPlan } from '../../types';

export class SaaSBillingEngine {
  private billingPlan: TenantBillingPlan = {
    tenantId: 'tenant-omnipos-sa',
    planTier: 'ENTERPRISE',
    billingCycle: 'MONTHLY',
    monthlyBasePriceSar: 1200,
    activeBranchesCount: 2,
    branchPriceSar: 350,
    activeTerminalsCount: 6,
    terminalPriceSar: 150,
    zatcaInvoicesMonthlyLimit: 50000,
    zatcaInvoicesUsedThisMonth: 12480,
    storageMbUsed: 1420,
    storageMbLimit: 10000,
    currentInvoiceDueSar: 2800,
    nextRenewalDate: '2026-09-01',
    paymentMethodMasked: 'Mada Debit (**** 8821)',
    autoDebitEnabled: true,
  };

  public getBillingPlan(): TenantBillingPlan {
    return this.billingPlan;
  }

  public updateTier(tier: TenantBillingPlan['planTier']): void {
    this.billingPlan.planTier = tier;
  }
}

export const globalSaaSBilling = new SaaSBillingEngine();
