/**
 * OmniPOS Enterprise AI Applications Facade (Sprint 3.1)
 * Single unified access layer for all 10 Enterprise AI applications.
 */

import { executiveCopilot, ExecutiveCopilotEngine } from './executive/executiveCopilotEngine';
import { operationsCopilot, OperationsCopilotEngine } from './operations/operationsCopilotEngine';
import { cashierAiAssistant, CashierAiAssistantEngine } from './cashier/cashierAiAssistantEngine';
import { inventoryIntelligence, InventoryIntelligenceEngine } from './inventory/inventoryIntelligenceEngine';
import { financeAi, FinanceAiEngine } from './finance/financeAiEngine';
import { hrAi, HrAiEngine } from './hr/hrAiEngine';
import { customerIntelligence, CustomerIntelligenceEngine } from './customer/customerIntelligenceEngine';
import { aiDocumentAssistant, AiDocumentAssistantEngine } from './documents/aiDocumentAssistantEngine';
import { agentOrchestrator, AgentOrchestratorEngine } from './orchestrator/agentOrchestratorEngine';
import { aiVerification, AiVerificationEngine } from './verification/aiVerificationEngine';

export class AiAppsFacade {
  public readonly executive: ExecutiveCopilotEngine = executiveCopilot;
  public readonly operations: OperationsCopilotEngine = operationsCopilot;
  public readonly cashier: CashierAiAssistantEngine = cashierAiAssistant;
  public readonly inventory: InventoryIntelligenceEngine = inventoryIntelligence;
  public readonly finance: FinanceAiEngine = financeAi;
  public readonly hr: HrAiEngine = hrAi;
  public readonly customer: CustomerIntelligenceEngine = customerIntelligence;
  public readonly documents: AiDocumentAssistantEngine = aiDocumentAssistant;
  public readonly orchestrator: AgentOrchestratorEngine = agentOrchestrator;
  public readonly verification: AiVerificationEngine = aiVerification;
}

export const aiApps = new AiAppsFacade();
