// Enterprise Integration Platform Engine - OmniPOS Enterprise
import { IntegrationConnector, WebhookSubscription, ApiKeyRecord } from '../../types';

export class IntegrationPlatformEngine {
  private connectors: IntegrationConnector[] = [
    {
      id: 'conn-hungerstation',
      name: 'HungerStation Aggregator Bridge',
      category: 'FOOD_DELIVERY',
      icon: '🍔',
      descriptionEn: 'Direct order ingestion, menu sync, and real-time status updates',
      descriptionAr: 'استقبال طلبات هنقرستيشن آلياً ومزامنة قوائم الطعام والحالة الفورية',
      status: 'CONNECTED',
      eventsProcessedToday: 184,
      lastSyncTimestamp: '2 mins ago',
      configFields: [
        { key: 'api_key', label: 'HungerStation API Key', type: 'password', value: 'hs_live_9921498172' },
        { key: 'branch_id', label: 'Store Outlet ID', type: 'text', value: 'RYD-OLAYA-01' },
      ],
    },
    {
      id: 'conn-jahez',
      name: 'Jahez Direct Delivery API',
      category: 'FOOD_DELIVERY',
      icon: '🛵',
      descriptionEn: 'Jahez automated kitchen ticket routing and dispatch sync',
      descriptionAr: 'توجيه طلبات جاهز مباشرة للمطبخ KDS ومزامنة استلام السائقين',
      status: 'CONNECTED',
      eventsProcessedToday: 242,
      lastSyncTimestamp: 'Just now',
      configFields: [
        { key: 'token', label: 'Jahez Partner Token', type: 'password', value: 'jhz_sec_77182910' },
      ],
    },
    {
      id: 'conn-sap',
      name: 'SAP S/4HANA ERP Connector',
      category: 'ERP',
      icon: '🏢',
      descriptionEn: 'End-of-day general ledger journal sync and procurement matching',
      descriptionAr: 'مزامنة قيود اليومية العامة وفواتير المشتريات مع نظام ساب المركزي',
      status: 'CONNECTED',
      eventsProcessedToday: 12,
      lastSyncTimestamp: 'Today 04:00 AM',
      configFields: [
        { key: 'endpoint', label: 'SAP OData Endpoint', type: 'text', value: 'https://erp.enterprise.sa/sap/opu/odata/pos' },
      ],
    },
    {
      id: 'conn-netsuite',
      name: 'Oracle NetSuite Financials',
      category: 'ACCOUNTING',
      icon: '📊',
      descriptionEn: 'Consolidated trial balance & inventory asset valuation bridge',
      descriptionAr: 'ترحيل ميزان المراجعة وتقييم أصول المخزون إلى أوراكل نت سويت',
      status: 'DISCONNECTED',
      eventsProcessedToday: 0,
      lastSyncTimestamp: 'Never',
      configFields: [
        { key: 'account_id', label: 'NetSuite Account ID', type: 'text', value: '' },
      ],
    },
  ];

  private webhooks: WebhookSubscription[] = [
    {
      id: 'wh-01',
      url: 'https://api.thirdparty-hub.com/webhooks/pos-events',
      eventTypes: ['ORDER_CREATED', 'PAYMENT_APPROVED', 'ZATCA_INVOICE_REPORTED'],
      secret: 'whsec_9918273645',
      status: 'ACTIVE',
      successCount: 1420,
      failureCount: 2,
      lastDeliveredAt: '1 minute ago',
    },
  ];

  public getConnectors(): IntegrationConnector[] {
    return this.connectors;
  }

  public getWebhooks(): WebhookSubscription[] {
    return this.webhooks;
  }

  public toggleConnector(id: string): void {
    const conn = this.connectors.find(c => c.id === id);
    if (conn) {
      conn.status = conn.status === 'CONNECTED' ? 'DISCONNECTED' : 'CONNECTED';
      if (conn.status === 'CONNECTED') {
        conn.lastSyncTimestamp = 'Just now';
      }
    }
  }
}

export const globalIntegrations = new IntegrationPlatformEngine();
