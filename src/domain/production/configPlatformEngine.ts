import { DynamicConfigItem } from '../../types/production';

export class ConfigPlatformEngine {
  private configs: DynamicConfigItem[] = [
    {
      id: 'CFG-001',
      key: 'zatca.enforce_cryptographic_stamp',
      scope: 'GLOBAL',
      scopeTarget: 'ALL',
      type: 'BOOLEAN',
      value: true,
      defaultValue: true,
      version: 4,
      environment: 'PRODUCTION',
      updatedBy: 'system.security_admin',
      updatedAt: new Date(Date.now() - 7200000).toISOString(),
      history: [
        { version: 1, value: false, changedBy: 'dev.init', changedAt: '2026-01-10T10:00:00Z', reason: 'Initial bootstrap' },
        { version: 2, value: true, changedBy: 'zatca.admin', changedAt: '2026-02-15T14:30:00Z', reason: 'Phase 2 compliance mandate' },
        { version: 3, value: true, changedBy: 'sec.ops', changedAt: '2026-05-01T09:00:00Z', reason: 'Annual key renewal' },
        { version: 4, value: true, changedBy: 'system.security_admin', changedAt: new Date(Date.now() - 7200000).toISOString(), reason: 'Verified with ZATCA Fatoora API v2.8' },
      ],
    },
    {
      id: 'CFG-002',
      key: 'pos.offline_local_storage_limit_mb',
      scope: 'DEVICE',
      scopeTarget: 'POS_MAIN',
      type: 'NUMBER',
      value: 1024,
      defaultValue: 512,
      version: 2,
      environment: 'PRODUCTION',
      updatedBy: 'platform.architect',
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      history: [
        { version: 1, value: 512, changedBy: 'init', changedAt: '2026-01-10T10:00:00Z', reason: 'Default quota' },
        { version: 2, value: 1024, changedBy: 'platform.architect', changedAt: new Date(Date.now() - 86400000).toISOString(), reason: 'Expanded IndexedDB for 72-hour offline buffer' },
      ],
    },
    {
      id: 'CFG-003',
      key: 'tax.regional_vat_rates',
      scope: 'REGION',
      scopeTarget: 'KSA',
      type: 'JSON',
      value: { standardVatRate: 0.15, zeroRatedExcise: 0.0, tobaccoMunicipalTaxRate: 1.0 },
      defaultValue: { standardVatRate: 0.15 },
      version: 3,
      environment: 'PRODUCTION',
      updatedBy: 'finance.controller',
      updatedAt: new Date(Date.now() - 172800000).toISOString(),
      history: [
        { version: 1, value: { standardVatRate: 0.05 }, changedBy: 'finance.legacy', changedAt: '2020-06-01T00:00:00Z', reason: 'Pre-2020 VAT rate' },
        { version: 2, value: { standardVatRate: 0.15 }, changedBy: 'finance.controller', changedAt: '2020-07-01T00:00:00Z', reason: 'KSA 15% Royal Decree' },
        { version: 3, value: { standardVatRate: 0.15, zeroRatedExcise: 0.0, tobaccoMunicipalTaxRate: 1.0 }, changedBy: 'finance.controller', changedAt: new Date(Date.now() - 172800000).toISOString(), reason: 'Added Municipal Tobacco & Shisha Surcharge' },
      ],
    },
    {
      id: 'CFG-004',
      key: 'kds.order_auto_bump_sla_seconds',
      scope: 'BRANCH',
      scopeTarget: 'BRANCH-001',
      type: 'NUMBER',
      value: 600,
      defaultValue: 900,
      version: 1,
      environment: 'PRODUCTION',
      updatedBy: 'ops.branch_mgr',
      updatedAt: new Date(Date.now() - 259200000).toISOString(),
      history: [
        { version: 1, value: 600, changedBy: 'ops.branch_mgr', changedAt: new Date(Date.now() - 259200000).toISOString(), reason: 'Fast-casual peak rush configuration' },
      ],
    },
    {
      id: 'CFG-005',
      key: 'features.ai_predictive_inventory_reorder',
      scope: 'FEATURE',
      scopeTarget: 'ALL',
      type: 'BOOLEAN',
      value: true,
      defaultValue: false,
      version: 2,
      environment: 'PRODUCTION',
      updatedBy: 'product.lead',
      updatedAt: new Date(Date.now() - 345600000).toISOString(),
      history: [
        { version: 1, value: false, changedBy: 'dev.init', changedAt: '2026-02-01T00:00:00Z', reason: 'Beta trial' },
        { version: 2, value: true, changedBy: 'product.lead', changedAt: new Date(Date.now() - 345600000).toISOString(), reason: 'Promoted to GA enterprise feature' },
      ],
    }
  ];

  public getConfigs(filterEnv?: string, filterScope?: string): DynamicConfigItem[] {
    return this.configs.filter(c => {
      if (filterEnv && c.environment !== filterEnv) return false;
      if (filterScope && c.scope !== filterScope) return false;
      return true;
    });
  }

  public updateConfig(id: string, newValue: any, updatedBy: string, reason: string): DynamicConfigItem {
    const config = this.configs.find(c => c.id === id);
    if (!config) throw new Error(`Config ${id} not found`);

    const newVersion = config.version + 1;
    config.history.unshift({
      version: newVersion,
      value: newValue,
      changedBy: updatedBy,
      changedAt: new Date().toISOString(),
      reason,
    });
    config.value = newValue;
    config.version = newVersion;
    config.updatedBy = updatedBy;
    config.updatedAt = new Date().toISOString();

    return config;
  }

  public rollbackConfig(id: string, targetVersion: number, user: string): DynamicConfigItem {
    const config = this.configs.find(c => c.id === id);
    if (!config) throw new Error(`Config ${id} not found`);

    const hist = config.history.find(h => h.version === targetVersion);
    if (!hist) throw new Error(`Version ${targetVersion} not found in history`);

    return this.updateConfig(id, hist.value, user, `Rolled back to version ${targetVersion}`);
  }

  public createConfig(item: Omit<DynamicConfigItem, 'id' | 'version' | 'history' | 'updatedAt'>): DynamicConfigItem {
    const newConfig: DynamicConfigItem = {
      ...item,
      id: `CFG-${Date.now().toString().slice(-4)}`,
      version: 1,
      updatedAt: new Date().toISOString(),
      history: [
        {
          version: 1,
          value: item.value,
          changedBy: item.updatedBy,
          changedAt: new Date().toISOString(),
          reason: 'Initial creation',
        }
      ]
    };
    this.configs.unshift(newConfig);
    return newConfig;
  }
}

export const configPlatformEngine = new ConfigPlatformEngine();
