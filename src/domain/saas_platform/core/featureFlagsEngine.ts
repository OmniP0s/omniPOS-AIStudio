// ============================================================================
// SAAS CORE: DYNAMIC FEATURE FLAGS & TARGETED ROLLOUT ENGINE
// ============================================================================

import { FeatureFlagRule, SubscriptionPlanTier } from '../types';

export class FeatureFlagsEngine {
  private flags: Map<string, FeatureFlagRule> = new Map();

  constructor() {
    this.seedDefaultFlags();
  }

  private seedDefaultFlags(): void {
    const defaultFlags: FeatureFlagRule[] = [
      {
        key: 'FEATURE_ZATCA_PHASE_2_DIRECT_SYNC',
        name: 'ZATCA Phase 2 E-Invoicing Live Hardware Signer',
        description: 'Direct ECDSA secp256k1 cryptographic signing & real-time clearance with ZATCA FATOORA gateway',
        enabledGlobally: true,
        rolloutPercentage: 100,
        allowedTiers: ['STARTER', 'GROWTH', 'ENTERPRISE', 'FRANCHISE_GLOBAL'],
        targetedTenantIds: [],
        moduleGroup: 'COMPLIANCE',
        updatedAt: '2026-08-01T00:00:00Z',
      },
      {
        key: 'FEATURE_AUTONOMOUS_VOICE_DRIVE_THRU',
        name: 'Autonomous Drive-Thru Voice AI Agent (Najdi / Hijazi Arabic)',
        description: 'Multi-turn voice recognition & automated cart mutation with acoustic noise suppression',
        enabledGlobally: true,
        rolloutPercentage: 100,
        allowedTiers: ['ENTERPRISE', 'FRANCHISE_GLOBAL'],
        targetedTenantIds: ['tenant-omnipos-sa'],
        moduleGroup: 'AI_COGNITIVE',
        updatedAt: '2026-08-15T00:00:00Z',
      },
      {
        key: 'FEATURE_KITCHEN_CV_HYGIENE_MONITOR',
        name: 'Computer Vision Kitchen Plating & Hygiene Scanner',
        description: 'Edge CCTV streaming for chef hat/glove compliance and doneness grading',
        enabledGlobally: true,
        rolloutPercentage: 100,
        allowedTiers: ['ENTERPRISE', 'FRANCHISE_GLOBAL'],
        targetedTenantIds: [],
        moduleGroup: 'AI_VISION',
        updatedAt: '2026-08-20T00:00:00Z',
      },
      {
        key: 'FEATURE_MULTI_REGION_ACTIVE_ACTIVE',
        name: 'Multi-Region Active-Active Geo Failover & Anycast Routing',
        description: 'Sub-second RPO/RTO replication across Riyadh, Bahrain, and Europe regions',
        enabledGlobally: true,
        rolloutPercentage: 100,
        allowedTiers: ['ENTERPRISE', 'FRANCHISE_GLOBAL'],
        targetedTenantIds: [],
        moduleGroup: 'INFRASTRUCTURE',
        updatedAt: '2026-08-25T00:00:00Z',
      },
      {
        key: 'FEATURE_REINFORCEMENT_LEARNING_DYNAMIC_PRICING',
        name: 'Reinforcement Learning Dynamic Menu Margin Optimizer',
        description: 'Automated menu price elasticity tuning based on kitchen load and ingredient shelf life',
        enabledGlobally: false,
        rolloutPercentage: 25,
        allowedTiers: ['FRANCHISE_GLOBAL'],
        targetedTenantIds: ['tenant-omnipos-sa'],
        moduleGroup: 'AI_SIMULATION',
        updatedAt: '2026-08-27T00:00:00Z',
      },
    ];

    defaultFlags.forEach((f) => this.flags.set(f.key, f));
  }

  public getAllFlags(): FeatureFlagRule[] {
    return Array.from(this.flags.values());
  }

  public isFeatureEnabled(flagKey: string, tenantId: string, tier: SubscriptionPlanTier): boolean {
    const flag = this.flags.get(flagKey);
    if (!flag) return false;

    if (!flag.enabledGlobally) {
      if (flag.targetedTenantIds.includes(tenantId)) {
        return true;
      }
      return false;
    }

    if (!flag.allowedTiers.includes(tier)) {
      return false;
    }

    return true;
  }

  public toggleFlag(flagKey: string, enabled: boolean): FeatureFlagRule {
    const flag = this.flags.get(flagKey);
    if (!flag) throw new Error(`Flag ${flagKey} not found`);

    flag.enabledGlobally = enabled;
    flag.updatedAt = new Date().toISOString();
    this.flags.set(flagKey, flag);
    return flag;
  }

  public updateRollout(flagKey: string, percentage: number): FeatureFlagRule {
    const flag = this.flags.get(flagKey);
    if (!flag) throw new Error(`Flag ${flagKey} not found`);

    flag.rolloutPercentage = Math.min(100, Math.max(0, percentage));
    flag.updatedAt = new Date().toISOString();
    this.flags.set(flagKey, flag);
    return flag;
  }
}

export const featureFlagsEngine = new FeatureFlagsEngine();
