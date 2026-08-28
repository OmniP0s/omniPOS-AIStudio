// ============================================================================
// SAAS CORE: REAL-TIME USAGE METERING & TELEMETRY ENGINE
// ============================================================================

import { UsageMetricRecord } from '../types';

export class UsageMeteringEngine {
  private metrics: Map<string, UsageMetricRecord> = new Map();

  constructor() {
    this.seedDefaultMetrics();
  }

  private seedDefaultMetrics(): void {
    const defaultMetric: UsageMetricRecord = {
      tenantId: 'tenant-omnipos-sa',
      period: '2026-08',
      activeBranches: 4,
      activeTerminals: 18,
      zatcaInvoicesSigned: 42890,
      aiTokensConsumed: 3840290,
      ordersProcessed: 39120,
      storageMbUsed: 18450,
      apiRequestsCount: 948120,
      calculatedOverageSar: 0,
      lastUpdated: new Date().toISOString(),
    };

    this.metrics.set(defaultMetric.tenantId, defaultMetric);
  }

  public getUsageMetrics(tenantId: string): UsageMetricRecord {
    let metric = this.metrics.get(tenantId);
    if (!metric) {
      metric = {
        tenantId,
        period: new Date().toISOString().slice(0, 7),
        activeBranches: 1,
        activeTerminals: 2,
        zatcaInvoicesSigned: 0,
        aiTokensConsumed: 0,
        ordersProcessed: 0,
        storageMbUsed: 120,
        apiRequestsCount: 0,
        calculatedOverageSar: 0,
        lastUpdated: new Date().toISOString(),
      };
      this.metrics.set(tenantId, metric);
    }
    return metric;
  }

  public recordUsageEvent(
    tenantId: string,
    event: {
      type: 'ZATCA_INVOICE' | 'AI_TOKEN' | 'ORDER_PROCESSED' | 'API_REQUEST' | 'STORAGE_INCREMENT';
      quantity: number;
    }
  ): UsageMetricRecord {
    const metric = this.getUsageMetrics(tenantId);

    switch (event.type) {
      case 'ZATCA_INVOICE':
        metric.zatcaInvoicesSigned += event.quantity;
        break;
      case 'AI_TOKEN':
        metric.aiTokensConsumed += event.quantity;
        break;
      case 'ORDER_PROCESSED':
        metric.ordersProcessed += event.quantity;
        break;
      case 'API_REQUEST':
        metric.apiRequestsCount += event.quantity;
        break;
      case 'STORAGE_INCREMENT':
        metric.storageMbUsed += event.quantity;
        break;
    }

    metric.lastUpdated = new Date().toISOString();
    this.metrics.set(tenantId, metric);
    return metric;
  }
}

export const usageMeteringEngine = new UsageMeteringEngine();
