/**
 * OmniPOS Enterprise AI Configuration Center
 * Dynamic Runtime Switching, Safety Profiles, Spend Quotas & Global Routing Policies
 */

import {
  AiRuntimeConfig,
  SafetyProfileType,
  LoadBalancingStrategy,
} from '../types';
import { aiGateway } from '../gateway/aiGateway';
import { modelRegistry } from '../registry/modelRegistry';

export class EnterpriseAiConfigCenter {
  private config: AiRuntimeConfig = {
    activeProfile: 'BALANCED_OPERATIONS',
    defaultModelId: 'gemini-3.7-flash',
    fallbackModelId: 'local-edge-onnx',
    loadBalancingStrategy: 'PRIMARY_FAILOVER',
    maxMonthlySpendUsd: 250.0,
    currentMonthlySpendUsd: 42.15,
    rateLimitRequestsPerMin: 1200,
    enforceZeroTrustSecurity: true,
    enableHybridRagSearch: true,
    cacheTtlSeconds: 60,
    circuitBreaker: {
      failureThreshold: 3,
      cooldownPeriodMs: 30000,
      halfOpenSuccessThreshold: 2,
    },
  };

  public getConfig(): AiRuntimeConfig {
    return { ...this.config };
  }

  public updateConfig(partial: Partial<AiRuntimeConfig>): AiRuntimeConfig {
    this.config = { ...this.config, ...partial };

    if (partial.loadBalancingStrategy) {
      aiGateway.setLoadBalancingStrategy(partial.loadBalancingStrategy);
    }
    if (partial.defaultModelId) {
      modelRegistry.setDefaultModelId(partial.defaultModelId);
    }

    return this.getConfig();
  }

  public setSafetyProfile(profile: SafetyProfileType): void {
    this.config.activeProfile = profile;
    if (profile === 'STRICT_REGULATORY') {
      this.config.enforceZeroTrustSecurity = true;
      this.config.defaultModelId = 'gemini-3.1-pro-preview';
    } else if (profile === 'BALANCED_OPERATIONS') {
      this.config.defaultModelId = 'gemini-3.7-flash';
    } else if (profile === 'CREATIVE_MARKETING') {
      this.config.defaultModelId = 'gemini-3.7-flash';
    }
  }

  public checkBudgetQuotaAvailable(): boolean {
    return this.config.currentMonthlySpendUsd < this.config.maxMonthlySpendUsd;
  }
}

export const aiConfigCenter = new EnterpriseAiConfigCenter();
