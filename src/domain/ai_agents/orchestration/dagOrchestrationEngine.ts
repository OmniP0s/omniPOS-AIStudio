/**
 * OmniPOS DAG Workflow Orchestration Engine & Human Approval Gates
 * Sprint 3.2
 */

import {
  DagWorkflowPlan,
  WorkflowStepNode,
  WorkflowStatus,
  HumanApprovalGate,
  AgentRole
} from '../types';
import { agentFramework } from '../core/agentFrameworkEngine';
import { toolMarketplace } from '../marketplace/toolMarketplaceEngine';

export class DagOrchestrationEngine {
  private activeWorkflows: Map<string, DagWorkflowPlan> = new Map();
  private approvalGates: Map<string, HumanApprovalGate> = new Map();

  constructor() {
    this.seedInitialApprovalGates();
  }

  private seedInitialApprovalGates() {
    const seedGate: HumanApprovalGate = {
      gateId: 'gate-po-98214',
      tenantId: 'TENANT_DEFAULT_KSA',
      workflowId: 'wf-auto-po-01',
      stepId: 'step-dispatch-po',
      requestedByAgent: 'EXECUTOR',
      actionTitle: 'Supplier Purchase Order Authorization (Wagyu A5 & Truffle Oil)',
      actionSummary: 'Automatic reorder triggered for Olaya branch. Total PO exceeds 5,000 SAR financial threshold (SAR 5,577.50).',
      financialImpactSar: 5577.50,
      riskLevel: 'MEDIUM',
      policyTriggered: 'POL-PROCUREMENT-THRESHOLD-5K',
      requiredRole: 'PROCUREMENT_DIRECTOR',
      status: 'PENDING',
      requestedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      autoExpireAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      payloadSnapshot: {
        supplierName: 'Gulf Premium Foods Co.',
        branch: 'Riyadh Olaya Flagship',
        itemsCount: 2,
        totalWithVatSar: 5577.50,
        expectedDelivery: 'Tomorrow, 08:00 AM'
      }
    };
    this.approvalGates.set(seedGate.gateId, seedGate);
  }

  public getApprovalGates(): HumanApprovalGate[] {
    return Array.from(this.approvalGates.values());
  }

  public getPendingApprovalGates(): HumanApprovalGate[] {
    return Array.from(this.approvalGates.values()).filter(g => g.status === 'PENDING');
  }

  public decideApprovalGate(
    gateId: string,
    decision: 'APPROVED' | 'REJECTED',
    userId: string = 'USR-MGR-001',
    userName: string = 'Tariq Al-Mansoor (Procurement Director)',
    notes: string = 'Approved for expedited Olaya weekend stock readiness'
  ): { success: boolean; gate?: HumanApprovalGate; message: string } {
    const gate = this.approvalGates.get(gateId);
    if (!gate) return { success: false, message: 'Approval gate not found' };

    gate.status = decision;
    gate.decidedAt = new Date().toISOString();
    gate.decidedByUserId = userId;
    gate.decidedByUserName = userName;
    gate.decisionNotes = notes;

    this.approvalGates.set(gateId, gate);

    // If workflow is waiting for this gate, resume it
    const workflow = this.activeWorkflows.get(gate.workflowId);
    if (workflow && workflow.status === 'PAUSED_FOR_APPROVAL') {
      if (decision === 'APPROVED') {
        workflow.status = 'RUNNING';
        workflow.executionLogs.push({
          timestamp: new Date().toISOString(),
          stepId: gate.stepId,
          agentRole: 'SUPERVISOR',
          level: 'INFO',
          message: `Human Approval Gate '${gate.gateId}' APPROVED by ${userName}. Resuming workflow DAG.`
        });
        // Continue execution
        this.resumeWorkflow(workflow.workflowId);
      } else {
        workflow.status = 'CANCELLED';
        workflow.executionLogs.push({
          timestamp: new Date().toISOString(),
          stepId: gate.stepId,
          agentRole: 'SUPERVISOR',
          level: 'WARN',
          message: `Human Approval Gate '${gate.gateId}' REJECTED by ${userName}. Notes: ${notes}. Workflow cancelled.`
        });
      }
      this.activeWorkflows.set(workflow.workflowId, workflow);
    }

    return {
      success: true,
      gate,
      message: `Gate ${gateId} marked as ${decision}`
    };
  }

  /**
   * Creates and initializes a DAG workflow plan
   */
  public createWorkflowPlan(
    name: string,
    category: DagWorkflowPlan['category'],
    objective: string,
    steps: Omit<WorkflowStepNode, 'status' | 'retryCount'>[]
  ): DagWorkflowPlan {
    const workflowId = `wf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const fullSteps: WorkflowStepNode[] = steps.map(s => ({
      ...s,
      status: 'PENDING',
      retryCount: 0,
      maxRetries: s.maxRetries || 2,
      timeoutMs: s.timeoutMs || 5000,
    }));

    const workflow: DagWorkflowPlan = {
      workflowId,
      tenantId: 'TENANT_DEFAULT_KSA',
      workflowName: name,
      category,
      objective,
      status: 'QUEUED',
      steps: fullSteps,
      createdAt: new Date().toISOString(),
      estimatedCostSar: 0.05,
      actualCostSar: 0.0,
      executionLogs: [
        {
          timestamp: new Date().toISOString(),
          agentRole: 'PLANNER',
          level: 'INFO',
          message: `DAG Workflow '${name}' initialized with ${steps.length} topological nodes.`
        }
      ]
    };

    this.activeWorkflows.set(workflowId, workflow);
    return workflow;
  }

  /**
   * Executes a workflow DAG step by step with dependency resolution and approval gate checks
   */
  public async executeWorkflow(workflowId: string): Promise<DagWorkflowPlan> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) throw new Error(`Workflow ${workflowId} not found`);

    workflow.status = 'RUNNING';
    workflow.startedAt = new Date().toISOString();
    const startTime = Date.now();

    // Loop through steps in topological dependency order
    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      workflow.currentStepId = step.id;

      // Check dependencies
      const depsReady = step.dependencies.every(depId => {
        const depStep = workflow.steps.find(s => s.id === depId);
        return depStep && depStep.status === 'SUCCESS';
      });

      if (!depsReady) {
        step.status = 'WAITING_DEPENDENCIES';
        continue;
      }

      // Check for Human Approval Gate
      if (step.requiresHumanApproval) {
        const gateId = `gate-${Date.now().toString().slice(-6)}`;
        const gate: HumanApprovalGate = {
          gateId,
          tenantId: workflow.tenantId,
          workflowId: workflow.workflowId,
          stepId: step.id,
          requestedByAgent: step.assignedAgent,
          actionTitle: step.name,
          actionSummary: step.approvalConditionDescription || `Action exceeds autonomous threshold (${step.approvalThresholdSar || 5000} SAR).`,
          financialImpactSar: step.approvalThresholdSar,
          riskLevel: (step.approvalThresholdSar && step.approvalThresholdSar > 10000) ? 'HIGH' : 'MEDIUM',
          policyTriggered: 'POL-AUTONOMOUS-HITL-TRIGGER',
          requiredRole: 'BRANCH_MANAGER',
          status: 'PENDING',
          requestedAt: new Date().toISOString(),
          autoExpireAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          payloadSnapshot: step.parameters
        };

        this.approvalGates.set(gateId, gate);
        workflow.status = 'PAUSED_FOR_APPROVAL';
        workflow.approvalGateId = gateId;
        step.status = 'AWAITING_APPROVAL';

        workflow.executionLogs.push({
          timestamp: new Date().toISOString(),
          stepId: step.id,
          agentRole: 'SUPERVISOR',
          level: 'WARN',
          message: `Step '${step.name}' triggered Human Approval Gate '${gateId}'. Execution paused awaiting human authorization.`
        });

        // Notify agents via communication envelope
        agentFramework.dispatchMessage(
          step.assignedAgent,
          'SUPERVISOR',
          'APPROVAL_REQUEST',
          { gateId, stepId: step.id, thresholdSar: step.approvalThresholdSar }
        );

        this.activeWorkflows.set(workflowId, workflow);
        return workflow;
      }

      // Execute Step
      step.status = 'IN_PROGRESS';
      step.startedAt = new Date().toISOString();
      const stepStartTime = Date.now();

      agentFramework.updateAgentStatus(step.assignedAgent, 'BUSY');

      workflow.executionLogs.push({
        timestamp: new Date().toISOString(),
        stepId: step.id,
        agentRole: step.assignedAgent,
        level: 'INFO',
        message: `Agent [${step.assignedAgent}] executing step: ${step.name}...`
      });

      // Tool call if defined
      let stepResult: any = { executed: true };
      if (step.toolToExecute) {
        const toolRes = await toolMarketplace.executeTool(step.toolToExecute, step.parameters, step.assignedAgent);
        stepResult = toolRes.output;
      }

      step.output = stepResult;
      step.status = 'SUCCESS';
      step.durationMs = Date.now() - stepStartTime;
      step.completedAt = new Date().toISOString();

      agentFramework.recordTaskCompletion(step.assignedAgent, step.durationMs, true);
      agentFramework.updateAgentStatus(step.assignedAgent, 'IDLE');

      workflow.executionLogs.push({
        timestamp: new Date().toISOString(),
        stepId: step.id,
        agentRole: step.assignedAgent,
        level: 'INFO',
        message: `Step '${step.name}' completed successfully in ${step.durationMs}ms.`
      });
    }

    // All steps executed
    workflow.status = 'COMPLETED';
    workflow.completedAt = new Date().toISOString();
    workflow.totalDurationMs = Date.now() - startTime;
    workflow.actualCostSar = Number((workflow.steps.length * 0.012).toFixed(3));

    workflow.executionLogs.push({
      timestamp: new Date().toISOString(),
      agentRole: 'SUPERVISOR',
      level: 'INFO',
      message: `Workflow DAG '${workflow.workflowName}' completed all steps successfully. Total duration: ${workflow.totalDurationMs}ms.`
    });

    this.activeWorkflows.set(workflowId, workflow);
    return workflow;
  }

  /**
   * Resumes a previously paused workflow after approval
   */
  public async resumeWorkflow(workflowId: string): Promise<DagWorkflowPlan> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) throw new Error('Workflow not found');

    const step = workflow.steps.find(s => s.status === 'AWAITING_APPROVAL');
    if (step) {
      step.status = 'IN_PROGRESS';
      step.startedAt = new Date().toISOString();
      const stepStartTime = Date.now();

      let stepResult: any = { approvedAndExecuted: true };
      if (step.toolToExecute) {
        const toolRes = await toolMarketplace.executeTool(step.toolToExecute, step.parameters, step.assignedAgent);
        stepResult = toolRes.output;
      }

      step.output = stepResult;
      step.status = 'SUCCESS';
      step.durationMs = Date.now() - stepStartTime;
      step.completedAt = new Date().toISOString();

      workflow.executionLogs.push({
        timestamp: new Date().toISOString(),
        stepId: step.id,
        agentRole: step.assignedAgent,
        level: 'INFO',
        message: `Approved Step '${step.name}' executed with output recorded.`
      });
    }

    // Complete remainder of workflow
    return this.executeWorkflow(workflowId);
  }

  public getWorkflowById(workflowId: string): DagWorkflowPlan | undefined {
    return this.activeWorkflows.get(workflowId);
  }

  public getAllWorkflows(): DagWorkflowPlan[] {
    return Array.from(this.activeWorkflows.values());
  }
}

export const dagOrchestration = new DagOrchestrationEngine();
