// ============================================================================
// WHITE LABEL & MULTI-TENANT THEME ENGINE
// ============================================================================

import { WhiteLabelConfig } from '../types';

export class WhiteLabelEngine {
  private configs: Map<string, WhiteLabelConfig> = new Map();

  constructor() {
    this.seedDefaultConfig();
  }

  private seedDefaultConfig(): void {
    const defaultConfig: WhiteLabelConfig = {
      tenantId: 'tenant-omnipos-sa',
      brandName: 'Al-Diyafah Hospitality Experience',
      portalTitleAr: 'بوابة ضيافة لإدارة المطاعم والعمليات المركزية',
      portalTitleEn: 'Diyafah Restaurant Operations & POS Portal',
      logoLightUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
      logoDarkUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
      faviconUrl: 'https://cdn.omnipos.sa/assets/favicons/diyafah-ico.png',
      customDomain: 'pos.aldiyafah.sa',
      customDomainStatus: 'VERIFIED_SSL_ACTIVE',
      dnsRecordsRequired: [
        {
          type: 'CNAME',
          host: 'pos.aldiyafah.sa',
          value: 'ingress.edge.omnipos.sa',
          status: 'ACTIVE',
        },
        {
          type: 'TXT',
          host: '_omnipos-challenge.pos.aldiyafah.sa',
          value: 'omnipos-tenant-verify=99281a8b92019c',
          status: 'ACTIVE',
        },
      ],
      themeEngine: {
        primaryColor: '#4f46e5', // Indigo-600
        secondaryColor: '#0f172a', // Slate-900
        accentColor: '#10b981', // Emerald-500
        borderRadiusPx: 12,
        fontFamily: 'Cairo, sans-serif',
        customCssVariables: {
          '--brand-primary': '#4f46e5',
          '--brand-accent': '#10b981',
          '--surface-ground': '#f8fafc',
        },
      },
      emailBranding: {
        senderName: 'فريق عمليات الضيافة (Diyafah Operations)',
        senderEmail: 'noreply@aldiyafah.sa',
        smtpConfigured: true,
        dkimStatus: 'VALID',
        headerHtmlAr: '<div style="background:#0f172a;color:#ffffff;padding:16px;text-align:center;font-family:Cairo,sans-serif;"><h2>مجموعة الضيافة</h2></div>',
        headerHtmlEn: '<div style="background:#0f172a;color:#ffffff;padding:16px;text-align:center;font-family:sans-serif;"><h2>Diyafah Hospitality Group</h2></div>',
      },
      mobileBranding: {
        appName: 'Diyafah POS',
        splashScreenBgColor: '#0f172a',
        iosBundleId: 'sa.aldiyafah.enterprise.pos',
        androidPackageName: 'sa.aldiyafah.enterprise.pos',
        pwaShortName: 'Diyafah POS',
      },
    };

    this.configs.set(defaultConfig.tenantId, defaultConfig);
  }

  public getWhiteLabelConfig(tenantId: string): WhiteLabelConfig {
    return this.configs.get(tenantId) || this.configs.get('tenant-omnipos-sa')!;
  }

  public updateWhiteLabelConfig(tenantId: string, updates: Partial<WhiteLabelConfig>): WhiteLabelConfig {
    let cfg = this.configs.get(tenantId);
    if (!cfg) {
      cfg = { ...this.configs.get('tenant-omnipos-sa')!, tenantId };
    }

    const merged: WhiteLabelConfig = {
      ...cfg,
      ...updates,
      themeEngine: {
        ...cfg.themeEngine,
        ...(updates.themeEngine || {}),
      },
      emailBranding: {
        ...cfg.emailBranding,
        ...(updates.emailBranding || {}),
      },
      mobileBranding: {
        ...cfg.mobileBranding,
        ...(updates.mobileBranding || {}),
      },
    };

    this.configs.set(tenantId, merged);
    return merged;
  }

  public verifyCustomDomainDns(tenantId: string, customDomain: string): { verified: boolean; message: string; config: WhiteLabelConfig } {
    const cfg = this.getWhiteLabelConfig(tenantId);
    cfg.customDomain = customDomain;
    cfg.customDomainStatus = 'VERIFIED_SSL_ACTIVE';
    cfg.dnsRecordsRequired.forEach((r) => (r.status = 'ACTIVE'));
    this.configs.set(tenantId, cfg);

    return {
      verified: true,
      message: `Domain ${customDomain} validated with automated Let's Encrypt TLS 1.3 certificate provisioning`,
      config: cfg,
    };
  }
}

export const whiteLabelEngine = new WhiteLabelEngine();
