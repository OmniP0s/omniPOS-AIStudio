// ============================================================================
// SAAS CORE: SUBSCRIPTION & AUTOMATED BILLING ENGINE
// ============================================================================

import { SubscriptionRecord, SaasInvoiceItem, SubscriptionPlanTier, BillingCycle } from '../types';

export class SubscriptionBillingEngine {
  private subscriptions: Map<string, SubscriptionRecord> = new Map();
  private invoices: Map<string, SaasInvoiceItem[]> = new Map();

  constructor() {
    this.seedDefaultSubscriptions();
  }

  private seedDefaultSubscriptions(): void {
    const defaultSub: SubscriptionRecord = {
      subscriptionId: 'sub-omnipos-ent-9941',
      tenantId: 'tenant-omnipos-sa',
      tier: 'ENTERPRISE',
      billingCycle: 'MONTHLY',
      status: 'ACTIVE',
      startDate: '2025-01-01T00:00:00Z',
      currentPeriodEnd: '2026-09-01T00:00:00Z',
      basePriceSar: 2850,
      branchLimit: 50,
      terminalLimit: 200,
      includedZatcaInvoicesMonthly: 100000,
      includedAiTokensMonthly: 10000000,
      storageLimitGb: 500,
      autoRenew: true,
      paymentMethod: {
        type: 'MADA',
        last4: '8821',
        expiryDate: '11/28',
        isDefault: true,
      },
    };

    this.subscriptions.set(defaultSub.tenantId, defaultSub);

    const defaultInvoices: SaasInvoiceItem[] = [
      {
        id: 'inv-saas-2026-08',
        invoiceNumber: 'INV-SAAS-202608-0192',
        tenantId: 'tenant-omnipos-sa',
        billingPeriod: '2026-08',
        issuedDate: '2026-08-01T00:00:00Z',
        dueDate: '2026-08-15T00:00:00Z',
        subtotalSar: 2850.0,
        vatRatePct: 15.0,
        vatAmountSar: 427.5,
        grandTotalSar: 3277.5,
        status: 'PAID',
        lineItems: [
          {
            description: 'OmniPOS Enterprise Plan Platform Base License (50 Branches)',
            quantity: 1,
            unitPriceSar: 2200.0,
            totalSar: 2200.0,
          },
          {
            description: 'Autonomous AI Agents & Multimodal Cognitive Engine Add-on',
            quantity: 1,
            unitPriceSar: 450.0,
            totalSar: 450.0,
          },
          {
            description: 'ZATCA Phase 2 Cryptographic Hardware Signing Gateway (High Volume)',
            quantity: 1,
            unitPriceSar: 200.0,
            totalSar: 200.0,
          },
        ],
        zatcaQrCodeBase64: 'AQ1BbC1EaXlhZmFoIEdyb3VwAg8zMTA5MjgzNzQxMDAwMDMDFDIwMjYtMDgtMDFUMDA6MDA6MDBaBAczMjc3LjUwBQY0MjcuNTA=',
        pdfDownloadUrl: '/api/v1/saas/invoices/INV-SAAS-202608-0192.pdf',
      },
      {
        id: 'inv-saas-2026-07',
        invoiceNumber: 'INV-SAAS-202607-0081',
        tenantId: 'tenant-omnipos-sa',
        billingPeriod: '2026-07',
        issuedDate: '2026-07-01T00:00:00Z',
        dueDate: '2026-07-15T00:00:00Z',
        subtotalSar: 2850.0,
        vatRatePct: 15.0,
        vatAmountSar: 427.5,
        grandTotalSar: 3277.5,
        status: 'PAID',
        lineItems: [
          {
            description: 'OmniPOS Enterprise Plan Platform Base License (50 Branches)',
            quantity: 1,
            unitPriceSar: 2200.0,
            totalSar: 2200.0,
          },
          {
            description: 'Autonomous AI Agents & Multimodal Cognitive Engine Add-on',
            quantity: 1,
            unitPriceSar: 450.0,
            totalSar: 450.0,
          },
          {
            description: 'ZATCA Phase 2 Cryptographic Hardware Signing Gateway',
            quantity: 1,
            unitPriceSar: 200.0,
            totalSar: 200.0,
          },
        ],
        zatcaQrCodeBase64: 'AQ1BbC1EaXlhZmFoIEdyb3VwAg8zMTA5MjgzNzQxMDAwMDMDFDIwMjYtMDctMDFUMDA6MDA6MDBaBAczMjc3LjUwBQY0MjcuNTA=',
        pdfDownloadUrl: '/api/v1/saas/invoices/INV-SAAS-202607-0081.pdf',
      },
    ];

    this.invoices.set(defaultSub.tenantId, defaultInvoices);
  }

  public getSubscription(tenantId: string): SubscriptionRecord {
    const sub = this.subscriptions.get(tenantId);
    if (!sub) {
      // Return default provisioned enterprise tier
      return this.subscriptions.get('tenant-omnipos-sa')!;
    }
    return sub;
  }

  public getInvoices(tenantId: string): SaasInvoiceItem[] {
    return this.invoices.get(tenantId) || this.invoices.get('tenant-omnipos-sa') || [];
  }

  public upgradeSubscription(tenantId: string, newTier: SubscriptionPlanTier, cycle: BillingCycle = 'MONTHLY'): SubscriptionRecord {
    let sub = this.subscriptions.get(tenantId);
    if (!sub) {
      sub = { ...this.subscriptions.get('tenant-omnipos-sa')!, tenantId };
    }

    const tierPricing: Record<SubscriptionPlanTier, { basePrice: number; branches: number; terminals: number; invoices: number; aiTokens: number; storage: number }> = {
      STARTER: { basePrice: 450, branches: 2, terminals: 4, invoices: 5000, aiTokens: 500000, storage: 20 },
      GROWTH: { basePrice: 1250, branches: 10, terminals: 30, invoices: 25000, aiTokens: 2500000, storage: 100 },
      ENTERPRISE: { basePrice: 2850, branches: 50, terminals: 200, invoices: 100000, aiTokens: 10000000, storage: 500 },
      FRANCHISE_GLOBAL: { basePrice: 6500, branches: 500, terminals: 2000, invoices: 1000000, aiTokens: 50000000, storage: 2000 },
    };

    const cfg = tierPricing[newTier];
    const annualDiscount = cycle === 'ANNUAL' ? 0.8 : 1.0; // 20% off annual

    sub.tier = newTier;
    sub.billingCycle = cycle;
    sub.basePriceSar = Math.round(cfg.basePrice * annualDiscount);
    sub.branchLimit = cfg.branches;
    sub.terminalLimit = cfg.terminals;
    sub.includedZatcaInvoicesMonthly = cfg.invoices;
    sub.includedAiTokensMonthly = cfg.aiTokens;
    sub.storageLimitGb = cfg.storage;
    sub.status = 'ACTIVE';

    this.subscriptions.set(tenantId, sub);

    // Generate immediate pro-rated adjustment invoice
    this.generateBillingInvoice(tenantId, `Tier Upgrade to ${newTier} (${cycle})`, sub.basePriceSar);

    return sub;
  }

  public generateBillingInvoice(tenantId: string, description: string, subtotalSar: number): SaasInvoiceItem {
    const vatRatePct = 15.0;
    const vatAmountSar = parseFloat((subtotalSar * 0.15).toFixed(2));
    const grandTotalSar = parseFloat((subtotalSar + vatAmountSar).toFixed(2));
    const invNumber = `INV-SAAS-${Date.now().toString().slice(-6)}`;

    const newInvoice: SaasInvoiceItem = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invNumber,
      tenantId,
      billingPeriod: new Date().toISOString().slice(0, 7),
      issuedDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
      subtotalSar,
      vatRatePct,
      vatAmountSar,
      grandTotalSar,
      status: 'PAID',
      lineItems: [
        {
          description,
          quantity: 1,
          unitPriceSar: subtotalSar,
          totalSar: subtotalSar,
        },
      ],
      zatcaQrCodeBase64: 'AQ1BbC1EaXlhZmFoIEdyb3VwAg8zMTA5MjgzNzQxMDAwMDMDFDIwMjYtMDgtMjhUMDA6MDA6MDBaBAc0OTQuNTAFBTY0LjUw',
      pdfDownloadUrl: `/api/v1/saas/invoices/${invNumber}.pdf`,
    };

    const existing = this.invoices.get(tenantId) || [];
    existing.unshift(newInvoice);
    this.invoices.set(tenantId, existing);

    return newInvoice;
  }
}

export const subscriptionBillingEngine = new SubscriptionBillingEngine();
