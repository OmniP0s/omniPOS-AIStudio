/**
 * OmniPOS Enterprise AI Foundation Facade
 * Master Single-Point Access for all 12 AI Foundation Pillars
 */

import { aiGateway, EnterpriseAiGateway } from './gateway/aiGateway';
import { modelRegistry, EnterpriseModelRegistry } from './registry/modelRegistry';
import { promptPlatform, EnterprisePromptPlatform } from './prompts/promptPlatform';
import { vectorStore, EnterpriseVectorStore } from './vector_db/vectorStore';
import { ragEngine, EnterpriseRagEngine } from './rag/ragEngine';
import { aiSecurityLayer, EnterpriseAiSecurityLayer } from './security/aiSecurityLayer';
import { aiAuditEngine, EnterpriseAiAuditEngine } from './audit/aiAuditEngine';
import { aiMemoryFramework, EnterpriseAiMemoryFramework } from './memory/aiMemoryFramework';
import { toolCallingFramework, EnterpriseToolCallingFramework } from './tools/toolCallingFramework';
import { aiObservabilityEngine, EnterpriseAiObservabilityEngine } from './observability/aiObservabilityEngine';
import { aiConfigCenter, EnterpriseAiConfigCenter } from './config/aiConfigCenter';
import { OmniPosAiClient } from './sdk/omniPosAiSdk';

export class AiFoundationFacade {
  public readonly gateway: EnterpriseAiGateway = aiGateway;
  public readonly registry: EnterpriseModelRegistry = modelRegistry;
  public readonly prompts: EnterprisePromptPlatform = promptPlatform;
  public readonly vectorDb: EnterpriseVectorStore = vectorStore;
  public readonly rag: EnterpriseRagEngine = ragEngine;
  public readonly security: EnterpriseAiSecurityLayer = aiSecurityLayer;
  public readonly audit: EnterpriseAiAuditEngine = aiAuditEngine;
  public readonly memory: EnterpriseAiMemoryFramework = aiMemoryFramework;
  public readonly tools: EnterpriseToolCallingFramework = toolCallingFramework;
  public readonly observability: EnterpriseAiObservabilityEngine = aiObservabilityEngine;
  public readonly config: EnterpriseAiConfigCenter = aiConfigCenter;

  public createClient(tenantId: string, branchId?: string, userId?: string, userRole?: string): OmniPosAiClient {
    return new OmniPosAiClient({
      tenantId,
      branchId,
      userId,
      userRole,
    });
  }
}

export const aiFoundation = new AiFoundationFacade();
