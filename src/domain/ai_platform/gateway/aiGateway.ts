/**
 * OmniPOS Enterprise AI Gateway
 * Master AI Abstraction Layer: Multi-Provider Routing, Failover, Circuit Breaking, and Cost Optimization
 */

import {
  AiProviderId,
  RegisteredAiModel,
  AiChatMessage,
  AiRequestOptions,
  AiCompletionResponse,
  CircuitBreakerState,
  CircuitBreakerStatus,
  CircuitBreakerConfig,
  LoadBalancingStrategy,
} from '../types';
import { modelRegistry } from '../registry/modelRegistry';
import {
  IProviderAdapter,
  GeminiProviderAdapter,
  ClaudeProviderAdapter,
  OpenAiProviderAdapter,
  DeepSeekProviderAdapter,
  LocalEdgeProviderAdapter,
} from './providerAdapters';

export class EnterpriseAiGateway {
  private adapters: Map<AiProviderId, IProviderAdapter> = new Map();
  private circuitBreakers: Map<string, CircuitBreakerStatus> = new Map();
  private circuitConfig: CircuitBreakerConfig = {
    failureThreshold: 3,
    cooldownPeriodMs: 30000, // 30 seconds cooldown
    halfOpenSuccessThreshold: 2,
  };
  private loadBalancingStrategy: LoadBalancingStrategy = 'PRIMARY_FAILOVER';
  private roundRobinIndex: number = 0;
  private responseCache: Map<string, { response: AiCompletionResponse; cachedAt: number }> = new Map();
  private cacheTtlMs: number = 60000; // 1 minute cache for identical deterministic requests

  constructor() {
    this.registerDefaultAdapters();
  }

  private registerDefaultAdapters() {
    this.adapters.set('GOOGLE_GEMINI', new GeminiProviderAdapter());
    this.adapters.set('ANTHROPIC_CLAUDE', new ClaudeProviderAdapter());
    this.adapters.set('OPENAI', new OpenAiProviderAdapter());
    this.adapters.set('DEEPSEEK', new DeepSeekProviderAdapter());
    this.adapters.set('LOCAL_EDGE_ONNX', new LocalEdgeProviderAdapter());
  }

  public setLoadBalancingStrategy(strategy: LoadBalancingStrategy) {
    this.loadBalancingStrategy = strategy;
  }

  public getLoadBalancingStrategy(): LoadBalancingStrategy {
    return this.loadBalancingStrategy;
  }

  public getCircuitBreakerStatuses(): CircuitBreakerStatus[] {
    return Array.from(this.circuitBreakers.values());
  }

  public async complete(
    messages: AiChatMessage[],
    options: AiRequestOptions
  ): Promise<AiCompletionResponse> {
    // 1. Check response cache if applicable
    const cacheKey = this.computeCacheKey(messages, options);
    if (!options.bypassCache && this.responseCache.has(cacheKey)) {
      const cached = this.responseCache.get(cacheKey)!;
      if (Date.now() - cached.cachedAt < this.cacheTtlMs) {
        return {
          ...cached.response,
          metadata: {
            ...cached.response.metadata,
            wasCached: true,
            latencyMs: 1,
            ttftMs: 1,
          },
        };
      }
    }

    // 2. Resolve Candidate Model Chain (with load balancing & failover fallback order)
    const candidateModels = this.resolveCandidateModels(options);
    if (candidateModels.length === 0) {
      throw new Error('No healthy AI models available matching request constraints.');
    }

    let lastError: Error | null = null;

    // 3. Attempt Execution through Candidate Chain
    for (let i = 0; i < candidateModels.length; i++) {
      const model = candidateModels[i];
      const isFallback = i > 0;

      // Check Circuit Breaker
      if (!this.canAttemptExecution(model.id)) {
        console.warn(`[AI GATEWAY] Skipping model ${model.id}: Circuit breaker is OPEN`);
        continue;
      }

      const adapter = this.adapters.get(model.provider);
      if (!adapter) {
        console.warn(`[AI GATEWAY] No adapter registered for provider ${model.provider}`);
        continue;
      }

      try {
        const response = await adapter.executeCompletion(model, messages, options);

        // Record Success
        this.recordSuccess(model.id, response.metadata.latencyMs);
        modelRegistry.recordModelHeartbeat(model.id, response.metadata.latencyMs, true);

        if (isFallback) {
          response.metadata.fallbackTriggered = true;
        }

        // Cache response for idempotent queries
        this.responseCache.set(cacheKey, { response, cachedAt: Date.now() });

        return response;
      } catch (err: any) {
        lastError = err;
        console.error(`[AI GATEWAY] Error on model ${model.id}:`, err.message);
        this.recordFailure(model.id);
        modelRegistry.recordModelHeartbeat(model.id, 0, false);
      }
    }

    // If all fail, execute emergency offline edge fallback
    const edgeModel = modelRegistry.getModel('local-edge-onnx');
    if (edgeModel) {
      const edgeAdapter = this.adapters.get('LOCAL_EDGE_ONNX');
      if (edgeAdapter) {
        const fallbackRes = await edgeAdapter.executeCompletion(edgeModel, messages, options);
        fallbackRes.metadata.fallbackTriggered = true;
        return fallbackRes;
      }
    }

    throw new Error(`AI Gateway execution failed across all providers: ${lastError?.message || 'Unknown error'}`);
  }

  private resolveCandidateModels(options: AiRequestOptions): RegisteredAiModel[] {
    const allModels = modelRegistry.getAllModels().filter(m => m.status === 'ACTIVE');

    if (options.modelId) {
      const target = modelRegistry.getModel(options.modelId);
      if (target) {
        // Put requested model first, then standard fallbacks
        const fallbacks = allModels.filter(m => m.id !== target.id);
        return [target, ...fallbacks];
      }
    }

    if (this.loadBalancingStrategy === 'COST_AWARE') {
      // Sort by input price ascending
      return [...allModels].sort((a, b) => a.pricing.inputCostPer1kTokensUsd - b.pricing.inputCostPer1kTokensUsd);
    }

    if (this.loadBalancingStrategy === 'LEAST_LATENCY') {
      // Sort by P50 latency ascending
      return [...allModels].sort((a, b) => a.health.latencyP50Ms - b.health.latencyP50Ms);
    }

    if (this.loadBalancingStrategy === 'ROUND_ROBIN') {
      this.roundRobinIndex = (this.roundRobinIndex + 1) % allModels.length;
      const rotated = [...allModels.slice(this.roundRobinIndex), ...allModels.slice(0, this.roundRobinIndex)];
      return rotated;
    }

    // Default: PRIMARY_FAILOVER (Gemini 3.7 Flash -> Gemini 3.1 Pro -> Claude -> Local Edge)
    const primary = modelRegistry.getModel('gemini-3.7-flash') || allModels[0];
    const rest = allModels.filter(m => m.id !== primary.id);
    return [primary, ...rest];
  }

  private canAttemptExecution(modelId: string): boolean {
    const cb = this.circuitBreakers.get(modelId);
    if (!cb || cb.state === 'CLOSED') return true;

    if (cb.state === 'OPEN') {
      const lastChange = new Date(cb.lastStateChange).getTime();
      if (Date.now() - lastChange > this.circuitConfig.cooldownPeriodMs) {
        // Transition to HALF_OPEN probe state
        cb.state = 'HALF_OPEN';
        cb.lastStateChange = new Date().toISOString();
        return true;
      }
      return false;
    }

    // HALF_OPEN allows single probe attempt
    return true;
  }

  private recordSuccess(modelId: string, _latencyMs: number): void {
    let cb = this.circuitBreakers.get(modelId);
    if (!cb) {
      cb = {
        modelId,
        state: 'CLOSED',
        consecutiveFailures: 0,
        lastStateChange: new Date().toISOString(),
      };
      this.circuitBreakers.set(modelId, cb);
      return;
    }

    if (cb.state === 'HALF_OPEN') {
      cb.state = 'CLOSED';
      cb.consecutiveFailures = 0;
      cb.lastStateChange = new Date().toISOString();
    } else {
      cb.consecutiveFailures = 0;
    }
  }

  private recordFailure(modelId: string): void {
    let cb = this.circuitBreakers.get(modelId);
    if (!cb) {
      cb = {
        modelId,
        state: 'CLOSED',
        consecutiveFailures: 1,
        lastStateChange: new Date().toISOString(),
      };
      this.circuitBreakers.set(modelId, cb);
      return;
    }

    cb.consecutiveFailures += 1;
    if (cb.consecutiveFailures >= this.circuitConfig.failureThreshold) {
      cb.state = 'OPEN';
      cb.lastStateChange = new Date().toISOString();
      cb.nextAttemptAllowedAt = new Date(Date.now() + this.circuitConfig.cooldownPeriodMs).toISOString();
    }
  }

  private computeCacheKey(messages: AiChatMessage[], options: AiRequestOptions): string {
    const msgStr = messages.map(m => `${m.role}:${m.parts.map(p => p.text).join('')}`).join('|');
    return `${options.tenantId}:${options.modelId || 'default'}:${options.responseMimeType || 'text'}:${msgStr}`;
  }
}

export const aiGateway = new EnterpriseAiGateway();
