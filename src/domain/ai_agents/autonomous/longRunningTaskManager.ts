/**
 * OmniPOS Long Running Autonomous Task Manager
 * Sprint 3.2
 */

import { LongRunningTaskState, WorkflowStatus } from '../types';

export class LongRunningTaskManager {
  private tasks: Map<string, LongRunningTaskState> = new Map();

  constructor() {
    this.seedDefaultTasks();
  }

  private seedDefaultTasks() {
    const seed: LongRunningTaskState[] = [
      {
        taskId: 'task-long-inv-01',
        tenantId: 'TENANT_DEFAULT_KSA',
        workflowId: 'wf-auto-po-01',
        taskTitle: 'Nightly Automated Replenishment & Supplier Synchronization',
        progressPercent: 78,
        status: 'RUNNING',
        checkpointState: {
          branchesScanned: 4,
          skusEvaluated: 148,
          ordersDrafted: 3,
          currentPhase: 'SUPPLIER_EDI_DISPATCH'
        },
        lastHeartbeat: new Date().toISOString(),
        activeAgentsCount: 3,
        estimatedTimeRemainingSec: 45,
        retryAttempts: 0
      },
      {
        taskId: 'task-long-sched-02',
        tenantId: 'TENANT_DEFAULT_KSA',
        workflowId: 'wf-sched-02',
        taskTitle: 'Weekly Riyadh Multi-Branch Smart Shift Scheduler Optimization',
        progressPercent: 100,
        status: 'COMPLETED',
        checkpointState: {
          branchesScheduled: 3,
          shiftsAssigned: 84,
          saudizationVerified: true,
          currentPhase: 'PUBLISHED_TO_HRMS'
        },
        lastHeartbeat: new Date(Date.now() - 3600 * 1000).toISOString(),
        activeAgentsCount: 0,
        estimatedTimeRemainingSec: 0,
        retryAttempts: 0
      }
    ];

    seed.forEach(t => this.tasks.set(t.taskId, t));
  }

  public getAllTasks(): LongRunningTaskState[] {
    return Array.from(this.tasks.values());
  }

  public getTaskById(taskId: string): LongRunningTaskState | undefined {
    return this.tasks.get(taskId);
  }

  public registerTask(
    workflowId: string,
    taskTitle: string,
    initialCheckpoint: Record<string, any> = {}
  ): LongRunningTaskState {
    const taskId = `task-${Date.now().toString().slice(-6)}`;
    const task: LongRunningTaskState = {
      taskId,
      tenantId: 'TENANT_DEFAULT_KSA',
      workflowId,
      taskTitle,
      progressPercent: 5,
      status: 'RUNNING',
      checkpointState: initialCheckpoint,
      lastHeartbeat: new Date().toISOString(),
      activeAgentsCount: 2,
      estimatedTimeRemainingSec: 60,
      retryAttempts: 0
    };

    this.tasks.set(taskId, task);
    return task;
  }

  public updateTaskProgress(
    taskId: string,
    progressPercent: number,
    status?: WorkflowStatus,
    checkpointUpdate?: Record<string, any>
  ): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.progressPercent = Math.min(100, Math.max(0, progressPercent));
      if (status) task.status = status;
      task.lastHeartbeat = new Date().toISOString();
      if (checkpointUpdate) {
        task.checkpointState = { ...task.checkpointState, ...checkpointUpdate };
      }
      if (task.progressPercent >= 100) {
        task.status = 'COMPLETED';
        task.estimatedTimeRemainingSec = 0;
        task.activeAgentsCount = 0;
      }
      this.tasks.set(taskId, task);
    }
  }

  public cancelTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;
    task.status = 'CANCELLED';
    task.activeAgentsCount = 0;
    this.tasks.set(taskId, task);
    return true;
  }
}

export const longRunningTasks = new LongRunningTaskManager();
