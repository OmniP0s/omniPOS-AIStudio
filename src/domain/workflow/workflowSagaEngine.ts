// Enterprise Workflow Engine & Saga Orchestrator - OmniPOS Enterprise
import { WorkflowTask, SagaTransaction } from '../../types';

export class WorkflowSagaEngine {
  private tasks: WorkflowTask[] = [
    {
      id: 'wf-101',
      processType: 'PURCHASE_APPROVAL',
      referenceId: 'PR-2026-0089',
      titleEn: 'Purchase Request #PR-2026-0089 (> 4,000 SAR)',
      titleAr: 'اعتماد طلب شراء لحوم وأجبان طازجة بقيمة 4,250 ريال',
      initiatedBy: 'Executive Chef Youssef',
      createdAt: '2026-08-27T08:30:00Z',
      status: 'PENDING',
      currentStep: 1,
      totalSteps: 2,
      approvalChain: [
        { role: 'BRANCH_MANAGER', approverName: 'Fahad Al-Qahtani', status: 'WAITING' },
        { role: 'FINANCE_DIRECTOR', approverName: 'Hussain Al-Harbi', status: 'WAITING' },
      ],
      slaDueTimestamp: 'Today at 02:00 PM',
    },
    {
      id: 'wf-102',
      processType: 'VOID_REFUND_ESCALATION',
      referenceId: 'ORD-VOID-9921',
      titleEn: 'High-Value Order Void Escalation (> 300 SAR)',
      titleAr: 'تصعيد طلب إلغاء فاتورة بقيمة 385 ريال بعد طباعة الإيصال',
      initiatedBy: 'Cashier Ahmed',
      createdAt: '2026-08-27T09:15:00Z',
      status: 'PENDING',
      currentStep: 1,
      totalSteps: 1,
      approvalChain: [
        { role: 'SHIFT_SUPERVISOR', approverName: 'Omar Al-Zahrani', status: 'WAITING' },
      ],
      slaDueTimestamp: 'In 25 minutes (Urgent)',
    },
  ];

  private sagas: SagaTransaction[] = [
    {
      sagaId: 'saga-ord-8812',
      type: 'ORDER_FULFILLMENT_SAGA',
      status: 'COMMITTED',
      steps: [
        { stepName: '1. POS_ORDER_INITIALIZE', status: 'SUCCESS', payload: { orderId: 'ord-8812', total: 115 } },
        { stepName: '2. INVENTORY_ATOMIC_DECREMENT', status: 'SUCCESS', payload: { patties: -2, buns: -2 }, compensationAction: 'RESTORE_INVENTORY_STOCK' },
        { stepName: '3. PAYMENT_CAPTURE_MADA', status: 'SUCCESS', payload: { rrn: 'RRN-9941', amount: 115 }, compensationAction: 'REVERSE_MADA_PAYMENT' },
        { stepName: '4. ZATCA_PHASE2_UBL_SIGNING', status: 'SUCCESS', payload: { csid: 'VALID', hashChained: true } },
        { stepName: '5. KDS_STATION_ROUTING', status: 'SUCCESS', payload: { grillStation: 'TICKET_SENT' } },
      ],
    },
  ];

  public getTasks(): WorkflowTask[] {
    return this.tasks;
  }

  public getSagas(): SagaTransaction[] {
    return this.sagas;
  }

  public approveTask(taskId: string, approverName: string): void {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;

    const currentChainItem = task.approvalChain[task.currentStep - 1];
    if (currentChainItem) {
      currentChainItem.status = 'APPROVED';
      currentChainItem.approverName = approverName;
      currentChainItem.actionTimestamp = new Date().toISOString();
    }

    if (task.currentStep >= task.totalSteps) {
      task.status = 'APPROVED';
    } else {
      task.currentStep += 1;
    }
  }

  public rejectTask(taskId: string, approverName: string, reason: string): void {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;

    const currentChainItem = task.approvalChain[task.currentStep - 1];
    if (currentChainItem) {
      currentChainItem.status = 'REJECTED';
      currentChainItem.approverName = approverName;
      currentChainItem.comments = reason;
      currentChainItem.actionTimestamp = new Date().toISOString();
    }
    task.status = 'REJECTED';
  }

  public simulateSagaExecution(type: SagaTransaction['type'], shouldSimulateFailure = false): SagaTransaction {
    const sagaId = `saga-${Date.now().toString().slice(-6)}`;
    if (shouldSimulateFailure) {
      const failedSaga: SagaTransaction = {
        sagaId,
        type,
        status: 'COMPENSATED',
        steps: [
          { stepName: '1. RESERVE_INVENTORY_STOCK', status: 'COMPENSATED', payload: { reserved: true }, compensationAction: 'REVERT_INVENTORY_RESERVATION' },
          { stepName: '2. PROCESS_PAYMENT_GATEWAY', status: 'FAILED', payload: { error: 'DECLINED_INSUFFICIENT_FUNDS' } },
        ],
      };
      this.sagas.unshift(failedSaga);
      return failedSaga;
    }

    const successfulSaga: SagaTransaction = {
      sagaId,
      type,
      status: 'COMMITTED',
      steps: [
        { stepName: '1. ORDER_VALIDATION', status: 'SUCCESS', payload: { valid: true } },
        { stepName: '2. INVENTORY_RESERVATION', status: 'SUCCESS', payload: { items: 3 }, compensationAction: 'ROLLBACK_RESERVATION' },
        { stepName: '3. PAYMENT_SETTLEMENT', status: 'SUCCESS', payload: { madaSettled: true } },
        { stepName: '4. ZATCA_TAX_INVOICE_REPORTING', status: 'SUCCESS', payload: { egsStatus: 'CLEARED' } },
      ],
    };
    this.sagas.unshift(successfulSaga);
    return successfulSaga;
  }
}

export const globalWorkflow = new WorkflowSagaEngine();
