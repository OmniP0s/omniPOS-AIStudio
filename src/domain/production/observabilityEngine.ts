import { DistributedTraceSpan } from '../../types/production';

export interface ObservabilityMetric {
  name: string;
  category: 'SYSTEM' | 'BUSINESS' | 'NETWORK' | 'DATABASE';
  currentValue: number;
  unit: string;
  p50: number;
  p95: number;
  p99: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
}

export interface StructuredLogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  traceId: string;
  spanId: string;
  service: string;
  message: string;
  context: Record<string, any>;
}

export class EnterpriseObservabilityEngine {
  private traces: DistributedTraceSpan[] = [
    {
      traceId: 'trc-984a1e-84b2-48f1',
      spanId: 'spn-root-01',
      serviceName: 'pos-api-gateway',
      operationName: 'POST /api/v1/orders/checkout',
      startTime: 0,
      durationMs: 14.8,
      statusCode: 'OK',
      httpMethod: 'POST',
      httpRoute: '/api/v1/orders/checkout',
      tags: { 'tenant.id': 'TNT-001', 'branch.id': 'BR-01', 'cashier.id': 'USR-109', 'pos.device': 'POS-TERMINAL-01' },
    },
    {
      traceId: 'trc-984a1e-84b2-48f1',
      spanId: 'spn-crdt-02',
      parentSpanId: 'spn-root-01',
      serviceName: 'crdt-sync-engine',
      operationName: 'applyVectorClockMutation',
      startTime: 1.2,
      durationMs: 2.4,
      statusCode: 'OK',
      tags: { 'crdt.vectorClock': 'v:1492,node:pos-01' },
    },
    {
      traceId: 'trc-984a1e-84b2-48f1',
      spanId: 'spn-db-03',
      parentSpanId: 'spn-root-01',
      serviceName: 'postgresql-primary',
      operationName: 'INSERT INTO orders_journal',
      startTime: 3.8,
      durationMs: 4.1,
      statusCode: 'OK',
      dbStatement: 'INSERT INTO orders (id, grand_total, vat_amount, icv) VALUES ($1, $2, $3, $4)',
      tags: { 'db.system': 'postgresql', 'db.pool_wait_ms': '0.2' },
    },
    {
      traceId: 'trc-984a1e-84b2-48f1',
      spanId: 'spn-zatca-04',
      parentSpanId: 'spn-root-01',
      serviceName: 'zatca-signing-service',
      operationName: 'generateEcdsaSignatureAndQr',
      startTime: 8.1,
      durationMs: 3.2,
      statusCode: 'OK',
      tags: { 'zatca.standard': 'Phase2_EGS', 'zatca.invoiceType': '388_TAX_INVOICE' },
    },
    {
      traceId: 'trc-984a1e-84b2-48f1',
      spanId: 'spn-kds-05',
      parentSpanId: 'spn-root-01',
      serviceName: 'kds-event-broadcaster',
      operationName: 'publishKafkaKitchenEvent',
      startTime: 11.5,
      durationMs: 2.1,
      statusCode: 'OK',
      tags: { 'kafka.topic': 'kitchen.orders.v1', 'partition': '2' },
    },
  ];

  private metrics: ObservabilityMetric[] = [
    {
      name: 'POS Checkout End-to-End Latency',
      category: 'SYSTEM',
      currentValue: 14.8,
      unit: 'ms',
      p50: 8.2,
      p95: 12.4,
      p99: 14.8,
      trend: 'STABLE',
      status: 'HEALTHY',
    },
    {
      name: 'System Uptime & SLA Availability',
      category: 'SYSTEM',
      currentValue: 99.999,
      unit: '%',
      p50: 99.999,
      p95: 99.999,
      p99: 99.999,
      trend: 'STABLE',
      status: 'HEALTHY',
    },
    {
      name: 'Database Active Connections',
      category: 'DATABASE',
      currentValue: 42,
      unit: 'conns',
      p50: 38,
      p95: 64,
      p99: 82,
      trend: 'STABLE',
      status: 'HEALTHY',
    },
    {
      name: 'Redis Cache Hit Ratio',
      category: 'SYSTEM',
      currentValue: 98.6,
      unit: '%',
      p50: 98.2,
      p95: 98.8,
      p99: 99.1,
      trend: 'UP',
      status: 'HEALTHY',
    },
    {
      name: 'Live GMV Processed Today',
      category: 'BUSINESS',
      currentValue: 148920,
      unit: 'SAR',
      p50: 120000,
      p95: 180000,
      p99: 220000,
      trend: 'UP',
      status: 'HEALTHY',
    },
    {
      name: 'ZATCA Compliance Acceptance Rate',
      category: 'BUSINESS',
      currentValue: 100.0,
      unit: '%',
      p50: 100.0,
      p95: 100.0,
      p99: 100.0,
      trend: 'STABLE',
      status: 'HEALTHY',
    }
  ];

  private logs: StructuredLogEntry[] = [
    {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      traceId: 'trc-984a1e-84b2-48f1',
      spanId: 'spn-root-01',
      service: 'pos-api-gateway',
      message: 'POS checkout completed successfully with ZATCA Phase 2 signature attached',
      context: { orderId: 'ORD-9021', totalSar: 184.50, vatSar: 24.07, paymentMethod: 'MADA_NFC' },
    },
    {
      timestamp: new Date(Date.now() - 5000).toISOString(),
      level: 'INFO',
      traceId: 'trc-119c3b-77a1-33e2',
      spanId: 'spn-kds-88',
      service: 'kds-engine',
      message: 'KDS order bumped by Chef Ahmed (Prep Time: 6m 14s - Under SLA target 10m)',
      context: { tableNumber: 'T-04', kitchenStation: 'GRILL_01' },
    },
    {
      timestamp: new Date(Date.now() - 15000).toISOString(),
      level: 'INFO',
      traceId: 'trc-448d2a-99b1-55c4',
      spanId: 'spn-sync-12',
      service: 'crdt-mesh-reconciler',
      message: 'CRDT background outbox synced: 14 offline invoices successfully posted to central ledger',
      context: { branchId: 'BR-01', latencyMs: 3.4 },
    }
  ];

  public getTraceSpans(): DistributedTraceSpan[] {
    return this.traces;
  }

  public getMetrics(): ObservabilityMetric[] {
    return this.metrics;
  }

  public getLogs(): StructuredLogEntry[] {
    return this.logs;
  }
}

export const observabilityEngine = new EnterpriseObservabilityEngine();
