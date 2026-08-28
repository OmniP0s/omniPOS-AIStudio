export type PluginCategory = 'DELIVERY_AGGREGATOR' | 'ACCOUNTING_ERP' | 'MARKETING_CRM' | 'PAYMENT_GATEWAY' | 'HARDWARE_IOT' | 'AI_EXTENSIONS';

export interface MarketplacePlugin {
  id: string;
  nameEn: string;
  nameAr: string;
  category: PluginCategory;
  vendor: string;
  iconName: string;
  version: string;
  rating: number;
  installCount: number;
  priceMonthlySar: number;
  isInstalled: boolean;
  status: 'CERTIFIED' | 'BETA' | 'COMMUNITY';
  descriptionEn: string;
  descriptionAr: string;
  webhookEvents: string[];
  oauthScopes: string[];
  documentationUrl: string;
}

export interface WebhookEndpoint {
  id: string;
  name: string;
  targetUrl: string;
  eventsSubscribed: string[];
  secretKey: string;
  status: 'HEALTHY' | 'FAILING' | 'DISABLED';
  successRatePercent: number;
  lastDeliveredAt: string;
}

export interface ApiMarketplaceDoc {
  id: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  summaryEn: string;
  summaryAr: string;
  rateLimitPerMin: number;
  requiredScope: string;
}
