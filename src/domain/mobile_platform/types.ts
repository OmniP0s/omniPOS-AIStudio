export type MobileAppRole =
  | 'OWNER_APP'
  | 'MANAGER_APP'
  | 'KITCHEN_APP'
  | 'CASHIER_APP'
  | 'WAITER_APP'
  | 'DRIVER_APP'
  | 'INVENTORY_APP'
  | 'SUPPLIER_APP'
  | 'CUSTOMER_APP';

export interface MobileAppDefinition {
  id: MobileAppRole;
  appNameEn: string;
  appNameAr: string;
  targetUserEn: string;
  targetUserAr: string;
  appIcon: string;
  version: string;
  bundleId: string;
  offlineCapable: boolean;
  biometricSupported: boolean;
  features: {
    titleEn: string;
    titleAr: string;
    descriptionEn: string;
    descriptionAr: string;
  }[];
  activeInstalls: number;
  crashFreeRatePercent: number;
  syncLatencyMs: number;
  quickActions: string[];
}

export interface PushNotificationRecord {
  id: string;
  targetApp: MobileAppRole;
  titleEn: string;
  titleAr: string;
  bodyEn: string;
  bodyAr: string;
  deepLink: string;
  sentAt: string;
  deliveryStatus: 'DELIVERED' | 'READ' | 'QUEUED';
}
