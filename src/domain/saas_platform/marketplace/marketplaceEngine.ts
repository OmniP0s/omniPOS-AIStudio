// ============================================================================
// MARKETPLACE PLATFORM & EXTENSION SDK ENGINE
// ============================================================================

import { MarketplacePlugin, TenantInstalledPlugin } from '../types';

export class MarketplaceEngine {
  private plugins: Map<string, MarketplacePlugin> = new Map();
  private installations: Map<string, TenantInstalledPlugin[]> = new Map();

  constructor() {
    this.seedMarketplaceCatalog();
  }

  private seedMarketplaceCatalog(): void {
    const catalog: MarketplacePlugin[] = [
      {
        id: 'plug-hungerstation-direct',
        code: 'HUNGERSTATION_DIRECT',
        nameEn: 'HungerStation Direct Orders & Dispatch',
        nameAr: 'تكامل طلبات هنقرستيشن المباشر والمناديب',
        developerName: 'HungerStation Partner API Team',
        category: 'DELIVERY_AGGREGATOR',
        version: 'v3.4.2',
        ratingScore: 4.9,
        reviewsCount: 142,
        monthlyPriceSar: 250,
        isVerified: true,
        requiredPermissions: ['orders.read', 'orders.write', 'menu.sync', 'driver.telemetry'],
        shortDescriptionEn: 'Seamless bi-directional menu synchronization and automated kitchen ticket dispatch for HungerStation orders.',
        shortDescriptionAr: 'مزامنة تلقائية لقوائم الطعام وتوجيه فوري لطلبات هنقرستيشن إلى شاشات المطبخ KDS.',
        iconName: 'Truck',
        installedTenantsCount: 389,
        lifecycleStatus: 'GA',
        sdkHooksSupported: ['onOrderReceived', 'onKitchenStatusChanged', 'onMenuPriceUpdated'],
      },
      {
        id: 'plug-jahez-cloud-bridge',
        code: 'JAHEZ_BRIDGE',
        nameEn: 'Jahez Cloud Menu & Logistics Bridge',
        nameAr: 'جسر جاهز السحابي للقوائم واللوجستيات',
        developerName: 'Jahez Platform Logistics Ltd.',
        category: 'DELIVERY_AGGREGATOR',
        version: 'v4.1.0',
        ratingScore: 4.85,
        reviewsCount: 210,
        monthlyPriceSar: 250,
        isVerified: true,
        requiredPermissions: ['orders.read', 'orders.write', 'menu.sync', 'stock.read'],
        shortDescriptionEn: 'Real-time stock 86-ing synchronization and automated driver dispatch with Jahez delivery network.',
        shortDescriptionAr: 'إيقاف الأصناف المنتهية فورياً وتعيين المناديب آلياً مع شبكة توصيل جاهز.',
        iconName: 'Truck',
        installedTenantsCount: 420,
        lifecycleStatus: 'GA',
        sdkHooksSupported: ['onOrderReceived', 'onItemOutOfStock', 'onRefundIssued'],
      },
      {
        id: 'plug-oracle-netsuite-erp',
        code: 'NETSUITE_ERP_SYNC',
        nameEn: 'Oracle NetSuite Enterprise ERP Sync',
        nameAr: 'ربط أوراكل نت سويت المحاسبي للمؤسسات',
        developerName: 'OmniPOS Enterprise Integration Labs',
        category: 'ACCOUNTING_ERP',
        version: 'v2.8.0',
        ratingScore: 4.95,
        reviewsCount: 64,
        monthlyPriceSar: 800,
        isVerified: true,
        requiredPermissions: ['accounting.ledger.read', 'accounting.journal.write', 'inventory.valuation.read'],
        shortDescriptionEn: 'Automated daily sales journal entries, inventory COGS posting, and multi-currency tax reconciliation.',
        shortDescriptionAr: 'ترحيل قيود اليومية آلياً وتسوية تكلفة البضاعة المباعة وضريبة القيمة المضافة مع نت سويت.',
        iconName: 'BookOpen',
        installedTenantsCount: 88,
        lifecycleStatus: 'GA',
        sdkHooksSupported: ['onDayClosed', 'onStockAdjusted', 'onVatReportGenerated'],
      },
      {
        id: 'plug-sap-s4hana-connector',
        code: 'SAP_S4HANA_CONNECTOR',
        nameEn: 'SAP S/4HANA Food Service Connector',
        nameAr: 'موصل ساب إس فور هانا لقطاع الأغذية',
        developerName: 'OmniPOS Enterprise Integration Labs',
        category: 'ACCOUNTING_ERP',
        version: 'v2.5.1',
        ratingScore: 4.92,
        reviewsCount: 47,
        monthlyPriceSar: 1200,
        isVerified: true,
        requiredPermissions: ['erp.general_ledger.write', 'procurement.po.sync', 'zatca.tax.export'],
        shortDescriptionEn: 'Native SAP IDoc and RFC integration for franchise supply chain, purchase orders, and consolidated P&L.',
        shortDescriptionAr: 'ربط مباشر عبر بروتوكول SAP RFC لربط المشتريات ومراكز التكلفة والمحاسبة المركزية.',
        iconName: 'Building',
        installedTenantsCount: 52,
        lifecycleStatus: 'GA',
        sdkHooksSupported: ['onPoReceived', 'onDayClosed'],
      },
      {
        id: 'plug-mada-applepay-gateway',
        code: 'MADA_APPLEPAY_VAULT',
        nameEn: 'Mada & Apple Pay Smart Gateway Vault',
        nameAr: 'بوابة مدى وآبل باي مع التوكن الرقمي الموحد',
        developerName: 'Saudi Payments Authorized Gateway',
        category: 'PAYMENT_GATEWAY',
        version: 'v5.0.0',
        ratingScore: 5.0,
        reviewsCount: 312,
        monthlyPriceSar: 150,
        isVerified: true,
        requiredPermissions: ['payment.tokenize', 'payment.charge', 'payment.refund'],
        shortDescriptionEn: 'PCI-DSS Level 1 tokenized contactless payment engine with 0.8% domestic Mada interchange rate.',
        shortDescriptionAr: 'محرك مدفوعات متوافق مع أعلى معايير أمان بطاقات الدفع PCI-DSS ورسوم مدى التفضيلية.',
        iconName: 'CreditCard',
        installedTenantsCount: 650,
        lifecycleStatus: 'GA',
        sdkHooksSupported: ['onPaymentTokenized', 'onRefundProcessed'],
      },
      {
        id: 'plug-whatsapp-ai-concierge',
        code: 'WHATSAPP_AI_MARKETING',
        nameEn: 'WhatsApp AI Concierge & Loyalty Suite',
        nameAr: 'مساعد واتساب الذكي وبرنامج الولاء التفاعلي',
        developerName: 'OmniPOS Conversational AI',
        category: 'LOYALTY_MARKETING',
        version: 'v2.1.0',
        ratingScore: 4.88,
        reviewsCount: 95,
        monthlyPriceSar: 350,
        isVerified: true,
        requiredPermissions: ['crm.customer.read', 'loyalty.points.write', 'whatsapp.messaging.send'],
        shortDescriptionEn: 'Bilingual conversational bot for reservation confirmations, feedback collection, and VIP tier reward notifications.',
        shortDescriptionAr: 'روبوت محادثة ذكي لإرسال تأكيدات الحجوزات، جمع تقييمات العملاء، ونقاط الولاء.',
        iconName: 'Users',
        installedTenantsCount: 230,
        lifecycleStatus: 'GA',
        sdkHooksSupported: ['onOrderCompleted', 'onReservationCreated', 'onCustomerVipUpgraded'],
      },
    ];

    catalog.forEach((p) => this.plugins.set(p.id, p));

    const defaultInstalls: TenantInstalledPlugin[] = [
      {
        installationId: 'inst-hungerstation-01',
        tenantId: 'tenant-omnipos-sa',
        pluginId: 'plug-hungerstation-direct',
        installedVersion: 'v3.4.2',
        installedAt: '2026-02-10T12:00:00Z',
        enabled: true,
        apiKeyMasked: 'hs_live_sec_****9912a',
        webhookUrl: 'https://api.omnipos.sa/v1/webhooks/hungerstation/tenant-omnipos-sa',
        configuration: {
          autoAcceptOrders: true,
          defaultKitchenStation: 'DELIVERY_PACKING',
          busyModeThresholdMinutes: 30,
        },
        lastHealthCheckStatus: 'HEALTHY',
        lastHealthCheckTime: new Date().toISOString(),
      },
      {
        installationId: 'inst-mada-01',
        tenantId: 'tenant-omnipos-sa',
        pluginId: 'plug-mada-applepay-gateway',
        installedVersion: 'v5.0.0',
        installedAt: '2026-01-05T08:00:00Z',
        enabled: true,
        apiKeyMasked: 'mada_tok_live_****3310',
        configuration: {
          enableApplePayOnTerminal: true,
          requirePinAboveSar: 300,
        },
        lastHealthCheckStatus: 'HEALTHY',
        lastHealthCheckTime: new Date().toISOString(),
      },
    ];

    this.installations.set('tenant-omnipos-sa', defaultInstalls);
  }

  public getMarketplaceCatalog(): MarketplacePlugin[] {
    return Array.from(this.plugins.values());
  }

  public getInstalledPlugins(tenantId: string): TenantInstalledPlugin[] {
    return this.installations.get(tenantId) || this.installations.get('tenant-omnipos-sa') || [];
  }

  public installPlugin(tenantId: string, pluginId: string): TenantInstalledPlugin {
    const plug = this.plugins.get(pluginId);
    if (!plug) throw new Error(`Plugin ${pluginId} not found`);

    const existingList = this.installations.get(tenantId) || [];
    const alreadyInstalled = existingList.find((i) => i.pluginId === pluginId);
    if (alreadyInstalled) {
      alreadyInstalled.enabled = true;
      return alreadyInstalled;
    }

    const newInst: TenantInstalledPlugin = {
      installationId: `inst-${Date.now()}`,
      tenantId,
      pluginId,
      installedVersion: plug.version,
      installedAt: new Date().toISOString(),
      enabled: true,
      apiKeyMasked: `key_sec_****${Math.random().toString(36).substring(2, 6)}`,
      configuration: {
        sandboxMode: false,
        autoSyncIntervalMinutes: 5,
      },
      lastHealthCheckStatus: 'HEALTHY',
      lastHealthCheckTime: new Date().toISOString(),
    };

    existingList.push(newInst);
    this.installations.set(tenantId, existingList);
    plug.installedTenantsCount += 1;
    return newInst;
  }

  public togglePlugin(tenantId: string, installationId: string, enabled: boolean): void {
    const list = this.installations.get(tenantId) || [];
    const item = list.find((i) => i.installationId === installationId);
    if (item) {
      item.enabled = enabled;
    }
  }

  public executePluginHook(event: string, payload: any): { executedCount: number; dispatchedPlugins: string[] } {
    const dispatchedPlugins: string[] = [];
    this.plugins.forEach((plug) => {
      if (plug.sdkHooksSupported.includes(event)) {
        dispatchedPlugins.push(plug.nameEn);
      }
    });

    return {
      executedCount: dispatchedPlugins.length,
      dispatchedPlugins,
    };
  }
}

export const marketplaceEngine = new MarketplaceEngine();
