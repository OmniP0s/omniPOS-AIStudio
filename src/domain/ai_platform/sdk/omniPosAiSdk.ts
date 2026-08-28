/**
 * OmniPOS Enterprise AI SDK (@omnipos/ai-sdk)
 * Unified TypeScript and Python SDK Interface for AI Foundation Services
 */

import {
  AiRequestOptions,
  AiCompletionResponse,
  AiChatMessage,
  PromptVariableSchema,
  RagSearchResult,
  RagCitation,
  AiToolExecutionResult,
} from '../types';
import { aiGateway } from '../gateway/aiGateway';
import { promptPlatform } from '../prompts/promptPlatform';
import { ragEngine } from '../rag/ragEngine';
import { aiSecurityLayer } from '../security/aiSecurityLayer';
import { aiAuditEngine } from '../audit/aiAuditEngine';
import { aiMemoryFramework } from '../memory/aiMemoryFramework';
import { toolCallingFramework } from '../tools/toolCallingFramework';
import { aiObservabilityEngine } from '../observability/aiObservabilityEngine';

export interface SdkConfig {
  tenantId: string;
  apiKey?: string;
  branchId?: string;
  userId?: string;
  userRole?: string;
  endpointUrl?: string;
}

export class OmniPosAiClient {
  private config: SdkConfig;

  constructor(config: SdkConfig) {
    this.config = {
      userId: 'system-agent',
      userRole: 'ADMIN',
      endpointUrl: '/api/ai',
      ...config,
    };
  }

  /**
   * Unified Generation Method (Security Scanning, Gateway Routing, Token Counting & Audit Logging)
   */
  public async generateText(prompt: string, options: Partial<AiRequestOptions> = {}): Promise<AiCompletionResponse> {
    const fullOptions: AiRequestOptions = {
      tenantId: this.config.tenantId,
      branchId: this.config.branchId,
      userId: this.config.userId || 'sdk-user',
      userRole: this.config.userRole || 'USER',
      ...options,
    };

    // 1. Security Scan (Prompt injection, jailbreak, PII masking, secret stripping)
    const securityResult = aiSecurityLayer.scanInputPrompt(prompt);
    if (!securityResult.isSafe) {
      throw new Error(`Security Violation: Prompt blocked due to ${securityResult.blockedReasons.join(', ')}`);
    }

    // 2. Gateway Multi-Provider Execution
    const messages: AiChatMessage[] = [
      {
        role: 'user',
        parts: [{ text: securityResult.cleanedPrompt }],
      },
    ];

    const response = await aiGateway.complete(messages, fullOptions);

    // 3. Record Audit & Governance Entry
    aiAuditEngine.recordAuditEntry(
      {
        tenantId: fullOptions.tenantId,
        branchId: fullOptions.branchId,
        userId: fullOptions.userId,
        userRole: fullOptions.userRole,
      },
      prompt,
      response,
      securityResult
    );

    // 4. Record Observability Metrics
    aiObservabilityEngine.recordRequestMetrics(response, true);

    return response;
  }

  /**
   * Execute Templated Prompt by Slug/ID with variable interpolation
   */
  public async executePromptTemplate(
    templateIdOrSlug: string,
    variables: Record<string, any>,
    options: Partial<AiRequestOptions> = {}
  ): Promise<AiCompletionResponse> {
    const rendered = promptPlatform.renderPrompt(templateIdOrSlug, variables);
    return this.generateText(rendered.renderedText, {
      temperature: rendered.temperature,
      ...options,
    });
  }

  /**
   * Knowledge Base RAG Hybrid Query
   */
  public queryKnowledgeBase(query: string, topK: number = 4): { results: RagSearchResult[]; citations: RagCitation[] } {
    return ragEngine.hybridSearch(this.config.tenantId, query, topK);
  }

  /**
   * Execute Tool Function with Zero-Trust RBAC
   */
  public async callTool(
    toolName: string,
    args: Record<string, any>,
    permissions: string[] = ['*']
  ): Promise<AiToolExecutionResult> {
    return toolCallingFramework.executeTool(toolName, args, permissions, {
      tenantId: this.config.tenantId,
      userId: this.config.userId || 'sdk-user',
      branchId: this.config.branchId,
    });
  }

  /**
   * Save Memory
   */
  public saveMemory(
    scope: 'SESSION' | 'BRANCH' | 'CUSTOMER' | 'ENTERPRISE_LONG_TERM',
    scopeId: string,
    key: string,
    value: string,
    importanceScore: number = 5
  ) {
    return aiMemoryFramework.saveMemory(scope, this.config.tenantId, scopeId, key, value, importanceScore);
  }
}

/**
 * Code Sample Generator for Developer Documentation & SDK Downloads
 */
export function generateSdkDocumentationCode(): { typescriptSample: string; pythonSample: string; curlSample: string } {
  const typescriptSample = `// OmniPOS AI Enterprise SDK (TypeScript)
import { OmniPosAiClient } from '@omnipos/ai-sdk';

const ai = new OmniPosAiClient({
  tenantId: 'TENANT-DEFAULT-01',
  branchId: 'BR-OLAYA-01',
  userId: 'cashier-saad',
  userRole: 'CASHIER'
});

// 1. Live Zero-Trust AI Generation
const response = await ai.generateText('Recommend dynamic pairings for Wagyu Burger');
console.log(response.content, response.metadata.tokenUsage);

// 2. Execute Approved Prompt Template
const upsellResult = await ai.executePromptTemplate('pos-smart-upsell-v1', {
  restaurantName: 'OmniSteakhouse',
  city: 'Riyadh',
  cartItemsJson: [{ name: 'Truffle Burger', price: 65 }],
  cartTotalSar: 65,
  loyaltyTier: 'VIP'
});

// 3. Query RAG SOP Knowledge Base
const { citations } = ai.queryKnowledgeBase('What is the minimum chicken internal holding temperature?');
console.log('Citations:', citations);`;

  const pythonSample = `# OmniPOS AI Enterprise SDK (Python 3.11+)
from omnipos_ai import OmniPosAiClient

client = OmniPosAiClient(
    tenant_id="TENANT-DEFAULT-01",
    branch_id="BR-OLAYA-01",
    api_key="omni_sec_live_..."
)

# Zero-Trust Prompt Execution
response = client.generate_text(
    prompt="Audit ZATCA Phase 2 cryptographic invoice XML",
    model_id="gemini-3.7-flash"
)
print(f"Content: {response.content}")
print(f"Cost SAR: {response.metadata.token_usage.estimated_cost_sar}")`;

  const curlSample = `# OmniPOS AI Gateway REST API
curl -X POST https://pos.omnipos.sa/api/ai/gateway/complete \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer omni_sec_live_..." \\
  -d '{
    "tenantId": "TENANT-DEFAULT-01",
    "branchId": "BR-OLAYA-01",
    "userId": "cashier-saad",
    "modelId": "gemini-3.7-flash",
    "messages": [
      { "role": "user", "parts": [{ "text": "Analyze daily shift sales report" }] }
    ]
  }'`;

  return { typescriptSample, pythonSample, curlSample };
}
