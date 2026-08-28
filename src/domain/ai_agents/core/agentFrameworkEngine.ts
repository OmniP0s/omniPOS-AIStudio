/**
 * OmniPOS Multi-Agent Framework & Communication Protocol
 * Sprint 3.2
 */

import {
  AgentRole,
  AgentDefinition,
  AgentMessageEnvelope,
  MessageIntent
} from '../types';

export class AgentFrameworkEngine {
  private agents: Map<AgentRole, AgentDefinition> = new Map();
  private messageLog: AgentMessageEnvelope[] = [];

  constructor() {
    this.initializeFleet();
  }

  private initializeFleet() {
    const defaultAgents: AgentDefinition[] = [
      {
        id: 'agent-planner-01',
        name: 'Strategic DAG Planner',
        nameAr: 'وكيل التخطيط الاستراتيجي',
        role: 'PLANNER',
        description: 'Decomposes unstructured business goals into optimized Directed Acyclic Graphs (DAG), detects task dependencies, and sets critical path execution plans.',
        capabilities: ['DAG Generation', 'Critical Path Analysis', 'Dependency Resolution', 'Cost Estimation'],
        systemPrompt: 'You are the Lead Strategic Planner. You synthesize objectives into deterministic steps with strict dependency constraints.',
        maxConcurrency: 10,
        temperature: 0.1,
        status: 'IDLE',
        tasksCompleted: 1420,
        avgLatencyMs: 140,
        accuracyScore: 99.4,
      },
      {
        id: 'agent-executor-02',
        name: 'Tool Execution Specialist',
        nameAr: 'وكيل التنفيذ الآلي',
        role: 'EXECUTOR',
        description: 'Performs precision execution against enterprise tools, ERP connectors, inventory mutations, and POS telemetry.',
        capabilities: ['Tool Invocation', 'ERP Integration', 'REST/GraphQL Calling', 'Payload Transformation'],
        systemPrompt: 'You are the Tool Executor. You execute mutations within zero-trust boundaries and format standardized outputs.',
        maxConcurrency: 25,
        temperature: 0.0,
        status: 'IDLE',
        tasksCompleted: 5890,
        avgLatencyMs: 85,
        accuracyScore: 99.8,
      },
      {
        id: 'agent-reviewer-03',
        name: 'Business Logic Reviewer',
        nameAr: 'وكيل مراجعة منطق الأعمال',
        role: 'REVIEWER',
        description: 'Audits task payloads against company SOPs, restaurant operational guidelines, and domain consistency rules.',
        capabilities: ['SOP Verification', 'Contextual Consistency', 'Discrepancy Flagging', 'Anomaly Detection'],
        systemPrompt: 'You are the Business Logic Reviewer. You cross-check all execution outputs against company operating standards.',
        maxConcurrency: 15,
        temperature: 0.2,
        status: 'IDLE',
        tasksCompleted: 3120,
        avgLatencyMs: 110,
        accuracyScore: 99.2,
      },
      {
        id: 'agent-validator-04',
        name: 'Statutory & ZATCA Validator',
        nameAr: 'وكيل التحقق النظامي والضريبي',
        role: 'VALIDATOR',
        description: 'Performs formal mathematical checks, Saudi ZATCA Phase 2 e-invoice XML schema validation, and Saudi Labor Law rule auditing.',
        capabilities: ['ZATCA Phase 2 XML Checks', 'Labor Law Articles 84/85', 'VAT 15% Strict Math', 'JSON Schema Validation'],
        systemPrompt: 'You are the Regulatory and Mathematical Validator. No output passes without 100% compliance with Kingdom of Saudi Arabia statutory laws.',
        maxConcurrency: 20,
        temperature: 0.0,
        status: 'IDLE',
        tasksCompleted: 4750,
        avgLatencyMs: 65,
        accuracyScore: 100.0,
      },
      {
        id: 'agent-critic-05',
        name: 'Adversarial Edge Critic',
        nameAr: 'وكيل النقد واختبار الحالات الحرجة',
        role: 'CRITIC',
        description: 'Acts as red-team critic, evaluating potential edge-case failures, unintended side-effects, margin loss risks, and customer experience impacts.',
        capabilities: ['Red Teaming', 'Counter-Factual Analysis', 'Margin Stress-Testing', 'PR Risk Assessment'],
        systemPrompt: 'You are the Adversarial Critic. You look for reasons why a proposed plan could fail in high-volume production operations.',
        maxConcurrency: 10,
        temperature: 0.4,
        status: 'IDLE',
        tasksCompleted: 2190,
        avgLatencyMs: 160,
        accuracyScore: 98.7,
      },
      {
        id: 'agent-supervisor-06',
        name: 'Autonomous Fleet Supervisor',
        nameAr: 'المشرف العام على الأسطول الذكي',
        role: 'SUPERVISOR',
        description: 'Monitors overall fleet SLA, dynamically manages retries, routes high-risk operations to Human Approval Gates (HITL), and ensures zero deadlocks.',
        capabilities: ['HITL Gate Routing', 'SLA Monitoring', 'Deadlock Resolution', 'Circuit Breaking'],
        systemPrompt: 'You are the Fleet Supervisor. You oversee end-to-end task completion and enforce enterprise governance policies.',
        maxConcurrency: 50,
        temperature: 0.1,
        status: 'IDLE',
        tasksCompleted: 8340,
        avgLatencyMs: 45,
        accuracyScore: 99.9,
      },
    ];

    defaultAgents.forEach(agent => this.agents.set(agent.role, agent));
  }

  public getAgentFleet(): AgentDefinition[] {
    return Array.from(this.agents.values());
  }

  public getAgentByRole(role: AgentRole): AgentDefinition | undefined {
    return this.agents.get(role);
  }

  public updateAgentStatus(role: AgentRole, status: 'IDLE' | 'BUSY' | 'PAUSED' | 'ERROR'): void {
    const agent = this.agents.get(role);
    if (agent) {
      agent.status = status;
      this.agents.set(role, agent);
    }
  }

  public recordTaskCompletion(role: AgentRole, latencyMs: number, passed: boolean): void {
    const agent = this.agents.get(role);
    if (agent) {
      agent.tasksCompleted += 1;
      agent.avgLatencyMs = Math.round((agent.avgLatencyMs * 0.9) + (latencyMs * 0.1));
      if (!passed) {
        agent.accuracyScore = Math.max(90, Number((agent.accuracyScore - 0.1).toFixed(1)));
      }
      this.agents.set(role, agent);
    }
  }

  /**
   * Dispatches a structured Agent-to-Agent message envelope
   */
  public dispatchMessage(
    senderRole: AgentRole,
    recipientRole: AgentRole,
    intent: MessageIntent,
    payload: Record<string, any>,
    options?: {
      correlationId?: string;
      tenantId?: string;
      priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
    }
  ): AgentMessageEnvelope {
    const sender = this.agents.get(senderRole);
    const recipient = this.agents.get(recipientRole);

    const envelope: AgentMessageEnvelope = {
      messageId: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      correlationId: options?.correlationId || `corr-${Date.now()}`,
      traceId: `trace-${Math.random().toString(36).substring(2, 9)}`,
      senderAgentId: sender?.id || `agent-${senderRole.toLowerCase()}`,
      senderRole,
      recipientAgentId: recipient?.id || `agent-${recipientRole.toLowerCase()}`,
      recipientRole,
      intent,
      timestamp: new Date().toISOString(),
      payload,
      metadata: {
        tenantId: options?.tenantId || 'TENANT_DEFAULT_KSA',
        priority: options?.priority || 'NORMAL',
        requiresAck: true,
        ttlMs: 30000,
        securityClassification: 'CONFIDENTIAL',
      },
      signature: `SIG_${Math.random().toString(36).substring(2, 12).toUpperCase()}`
    };

    this.messageLog.unshift(envelope);
    if (this.messageLog.length > 200) {
      this.messageLog.pop();
    }

    return envelope;
  }

  public getRecentMessages(limit: number = 50): AgentMessageEnvelope[] {
    return this.messageLog.slice(0, limit);
  }

  public clearMessages(): void {
    this.messageLog = [];
  }
}

export const agentFramework = new AgentFrameworkEngine();
