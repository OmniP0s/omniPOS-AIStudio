/**
 * OmniPOS Enterprise Model Registry
 * Master Catalog of AI Foundation Models & Capability Metadata
 */

import { RegisteredAiModel, ModelStatus, HealthStatus } from '../types';

export class EnterpriseModelRegistry {
  private models: Map<string, RegisteredAiModel> = new Map();
  private defaultModelId: string = 'gemini-3.7-flash';

  constructor() {
    this.seedDefaultEnterpriseModels();
  }

  private seedDefaultEnterpriseModels() {
    const defaultModels: RegisteredAiModel[] = [
      {
        id: 'gemini-3.7-flash',
        provider: 'GOOGLE_GEMINI',
        modelName: 'gemini-3.7-flash',
        displayName: 'Google Gemini 3.7 Flash',
        version: 'v3.7.0',
        aliases: ['gemini-flash-latest', 'default-pos-fast', 'production-default'],
        status: 'ACTIVE',
        capabilities: {
          maxContextTokens: 1048576, // 1M tokens context window
          maxOutputTokens: 65536,
          supportedModalities: ['TEXT', 'IMAGE', 'AUDIO', 'VIDEO'],
          supportsToolCalling: true,
          supportsStructuredJson: true,
          supportsStreaming: true,
          supportsThinkingReasoning: true,
          supportsVision: true,
          supportsAudioInput: true,
        },
        pricing: {
          inputCostPer1kTokensUsd: 0.0001,
          outputCostPer1kTokensUsd: 0.0004,
          thinkingCostPer1kTokensUsd: 0.0004,
          currencyExchangeRateSar: 3.75,
        },
        health: {
          status: 'HEALTHY',
          latencyP50Ms: 24,
          latencyP95Ms: 48,
          latencyP99Ms: 78,
          successRateLastHour: 99.98,
          lastHeartbeatAt: new Date().toISOString(),
          consecutiveFailures: 0,
        },
        descriptionEn: 'High-speed multimodal flagship for sub-50ms POS transactions, live voice orders, and real-time vision analytics.',
        descriptionAr: 'النموذج الرائد فائق السرعة لعمليات نقاط البيع والطلب الصوتي المباشر وتحليل الصور والفيديو في أقل من 50 مللي ثانية.',
      },
      {
        id: 'gemini-3.1-pro-preview',
        provider: 'GOOGLE_GEMINI',
        modelName: 'gemini-3.1-pro-preview',
        displayName: 'Google Gemini 3.1 Pro (Deep Reasoning)',
        version: 'v3.1.0-preview',
        aliases: ['gemini-pro', 'deep-financial-reasoning'],
        status: 'ACTIVE',
        capabilities: {
          maxContextTokens: 2097152, // 2M tokens
          maxOutputTokens: 65536,
          supportedModalities: ['TEXT', 'IMAGE', 'AUDIO', 'VIDEO'],
          supportsToolCalling: true,
          supportsStructuredJson: true,
          supportsStreaming: true,
          supportsThinkingReasoning: true,
          supportsVision: true,
          supportsAudioInput: true,
        },
        pricing: {
          inputCostPer1kTokensUsd: 0.00125,
          outputCostPer1kTokensUsd: 0.005,
          thinkingCostPer1kTokensUsd: 0.005,
          currencyExchangeRateSar: 3.75,
        },
        health: {
          status: 'HEALTHY',
          latencyP50Ms: 140,
          latencyP95Ms: 320,
          latencyP99Ms: 510,
          successRateLastHour: 99.95,
          lastHeartbeatAt: new Date().toISOString(),
          consecutiveFailures: 0,
        },
        descriptionEn: 'Advanced architectural reasoning engine for double-entry GL audit, franchise tax optimization, and complex procurement forecasting.',
        descriptionAr: 'محرك استدلال عميق للمحاسبة المزدوجة وتدقيق القيود، وضرائب الامتياز التجاري، والتنبؤ المعقد بالمشتريات.',
      },
      {
        id: 'gemini-3.1-flash-lite',
        provider: 'GOOGLE_GEMINI',
        modelName: 'gemini-3.1-flash-lite',
        displayName: 'Google Gemini 3.1 Flash Lite',
        version: 'v3.1.0-lite',
        aliases: ['flash-lite', 'micro-service-classifier'],
        status: 'ACTIVE',
        capabilities: {
          maxContextTokens: 1048576,
          maxOutputTokens: 8192,
          supportedModalities: ['TEXT', 'IMAGE'],
          supportsToolCalling: true,
          supportsStructuredJson: true,
          supportsStreaming: true,
          supportsThinkingReasoning: false,
          supportsVision: true,
          supportsAudioInput: false,
        },
        pricing: {
          inputCostPer1kTokensUsd: 0.000075,
          outputCostPer1kTokensUsd: 0.0003,
          currencyExchangeRateSar: 3.75,
        },
        health: {
          status: 'HEALTHY',
          latencyP50Ms: 18,
          latencyP95Ms: 35,
          latencyP99Ms: 55,
          successRateLastHour: 100,
          lastHeartbeatAt: new Date().toISOString(),
          consecutiveFailures: 0,
        },
        descriptionEn: 'Ultralight, high-throughput micro-classifier for menu tagging, receipt categorization, and zero-latency intent parsing.',
        descriptionAr: 'نموذج فائق الخفة لتصنيف المنتجات والفواتير وتحديد نوايا العملاء في أجزاء من الثانية بأقل تكلفة.',
      },
      {
        id: 'claude-3-7-sonnet',
        provider: 'ANTHROPIC_CLAUDE',
        modelName: 'claude-3-7-sonnet-20250219',
        displayName: 'Anthropic Claude 3.7 Sonnet',
        version: 'v3.7.0',
        aliases: ['claude-sonnet', 'secondary-reasoning-fallback'],
        status: 'ACTIVE',
        capabilities: {
          maxContextTokens: 200000,
          maxOutputTokens: 8192,
          supportedModalities: ['TEXT', 'IMAGE'],
          supportsToolCalling: true,
          supportsStructuredJson: true,
          supportsStreaming: true,
          supportsThinkingReasoning: true,
          supportsVision: true,
          supportsAudioInput: false,
        },
        pricing: {
          inputCostPer1kTokensUsd: 0.003,
          outputCostPer1kTokensUsd: 0.015,
          currencyExchangeRateSar: 3.75,
        },
        health: {
          status: 'HEALTHY',
          latencyP50Ms: 165,
          latencyP95Ms: 380,
          latencyP99Ms: 590,
          successRateLastHour: 99.91,
          lastHeartbeatAt: new Date().toISOString(),
          consecutiveFailures: 0,
        },
        descriptionEn: 'Enterprise hybrid reasoning model for policy adherence and complex conversational support.',
        descriptionAr: 'نموذج استدلال هجين للامتثال للسياسات والدعم الحواري المتقدم وإدارة الأزمات.',
      },
      {
        id: 'gpt-4o',
        provider: 'OPENAI',
        modelName: 'gpt-4o',
        displayName: 'OpenAI GPT-4o Enterprise',
        version: '2024-11-20',
        aliases: ['gpt4o', 'external-aggregator-sync'],
        status: 'ACTIVE',
        capabilities: {
          maxContextTokens: 128000,
          maxOutputTokens: 16384,
          supportedModalities: ['TEXT', 'IMAGE', 'AUDIO'],
          supportsToolCalling: true,
          supportsStructuredJson: true,
          supportsStreaming: true,
          supportsThinkingReasoning: false,
          supportsVision: true,
          supportsAudioInput: true,
        },
        pricing: {
          inputCostPer1kTokensUsd: 0.0025,
          outputCostPer1kTokensUsd: 0.01,
          currencyExchangeRateSar: 3.75,
        },
        health: {
          status: 'HEALTHY',
          latencyP50Ms: 110,
          latencyP95Ms: 250,
          latencyP99Ms: 420,
          successRateLastHour: 99.88,
          lastHeartbeatAt: new Date().toISOString(),
          consecutiveFailures: 0,
        },
        descriptionEn: 'Multimodal omni model for delivery aggregator syncing and third-party food platform translation.',
        descriptionAr: 'نموذج متعدد الوسائط لربط منصات التوصيل وتوحيد بيانات الوجبات الخارجية.',
      },
      {
        id: 'deepseek-r1',
        provider: 'DEEPSEEK',
        modelName: 'deepseek-reasoner-r1',
        displayName: 'DeepSeek R1 Open Reasoning',
        version: 'v1.0.0',
        aliases: ['deepseek-r1', 'open-source-math-cogs'],
        status: 'ACTIVE',
        capabilities: {
          maxContextTokens: 64000,
          maxOutputTokens: 8192,
          supportedModalities: ['TEXT'],
          supportsToolCalling: true,
          supportsStructuredJson: true,
          supportsStreaming: true,
          supportsThinkingReasoning: true,
          supportsVision: false,
          supportsAudioInput: false,
        },
        pricing: {
          inputCostPer1kTokensUsd: 0.00055,
          outputCostPer1kTokensUsd: 0.00219,
          currencyExchangeRateSar: 3.75,
        },
        health: {
          status: 'HEALTHY',
          latencyP50Ms: 180,
          latencyP95Ms: 410,
          latencyP99Ms: 650,
          successRateLastHour: 99.75,
          lastHeartbeatAt: new Date().toISOString(),
          consecutiveFailures: 0,
        },
        descriptionEn: 'Chain-of-thought mathematical optimizer for BOM yield maximization and dynamic supplier contract re-pricing.',
        descriptionAr: 'محرك التحسين الرياضي لحساب نسب هدر المواد وتفاوض أسعار عقود الموردين ديناميكياً.',
      },
      {
        id: 'local-edge-onnx',
        provider: 'LOCAL_EDGE_ONNX',
        modelName: 'llama-3.2-3b-edge-int4',
        displayName: 'OmniPOS Edge Local Model (Offline Resilient)',
        version: 'v3.2-int4',
        aliases: ['offline-pos-local', 'local-llm', 'branch-edge-ai'],
        status: 'ACTIVE',
        capabilities: {
          maxContextTokens: 8192,
          maxOutputTokens: 2048,
          supportedModalities: ['TEXT'],
          supportsToolCalling: true,
          supportsStructuredJson: true,
          supportsStreaming: true,
          supportsThinkingReasoning: false,
          supportsVision: false,
          supportsAudioInput: false,
        },
        pricing: {
          inputCostPer1kTokensUsd: 0.0, // Zero marginal cost for local edge execution
          outputCostPer1kTokensUsd: 0.0,
          currencyExchangeRateSar: 3.75,
        },
        health: {
          status: 'HEALTHY',
          latencyP50Ms: 12,
          latencyP95Ms: 22,
          latencyP99Ms: 38,
          successRateLastHour: 100.0,
          lastHeartbeatAt: new Date().toISOString(),
          consecutiveFailures: 0,
        },
        descriptionEn: 'Zero-latency local neural network running directly inside branch POS terminals for 100% offline operational continuity.',
        descriptionAr: 'نموذج محلي خفيف يعمل مباشرة على أجهزة الفروع لضمان استمرار الذكاء الاصطناعي بنسبة 100% عند انقطاع الإنترنت.',
      },
    ];

    defaultModels.forEach(m => this.models.set(m.id, m));
  }

  public getAllModels(): RegisteredAiModel[] {
    return Array.from(this.models.values());
  }

  public getModel(idOrAlias: string): RegisteredAiModel | undefined {
    if (this.models.has(idOrAlias)) {
      return this.models.get(idOrAlias);
    }
    // Search aliases
    for (const model of this.models.values()) {
      if (model.aliases.includes(idOrAlias)) {
        return model;
      }
    }
    return undefined;
  }

  public registerModel(model: RegisteredAiModel): void {
    this.models.set(model.id, model);
  }

  public updateModelStatus(modelId: string, status: ModelStatus): boolean {
    const model = this.models.get(modelId);
    if (!model) return false;
    model.status = status;
    return true;
  }

  public recordModelHeartbeat(modelId: string, latencyMs: number, success: boolean): void {
    const model = this.models.get(modelId);
    if (!model) return;

    model.health.lastHeartbeatAt = new Date().toISOString();
    if (success) {
      model.health.consecutiveFailures = 0;
      model.health.status = 'HEALTHY';
      // Exponential moving average for latencies
      model.health.latencyP50Ms = Math.round(model.health.latencyP50Ms * 0.9 + latencyMs * 0.1);
    } else {
      model.health.consecutiveFailures += 1;
      if (model.health.consecutiveFailures >= 3) {
        model.health.status = 'DEGRADED';
      }
      if (model.health.consecutiveFailures >= 5) {
        model.health.status = 'UNAVAILABLE';
      }
    }
  }

  public getDefaultModelId(): string {
    return this.defaultModelId;
  }

  public setDefaultModelId(id: string): void {
    if (this.models.has(id)) {
      this.defaultModelId = id;
    }
  }
}

export const modelRegistry = new EnterpriseModelRegistry();
