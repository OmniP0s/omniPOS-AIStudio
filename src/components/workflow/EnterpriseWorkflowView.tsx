import React, { useState } from 'react';
import { globalWorkflow } from '../../domain/workflow/workflowSagaEngine';
import { WorkflowTask, SagaTransaction } from '../../types';
import {
  GitFork,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  ArrowRight,
  RefreshCcw,
  Zap,
  Activity,
  Layers,
  AlertTriangle,
} from 'lucide-react';

interface EnterpriseWorkflowViewProps {
  isArabic: boolean;
}

export const EnterpriseWorkflowView: React.FC<EnterpriseWorkflowViewProps> = ({ isArabic }) => {
  const [tasks, setTasks] = useState<WorkflowTask[]>(() => globalWorkflow.getTasks());
  const [sagas, setSagas] = useState<SagaTransaction[]>(() => globalWorkflow.getSagas());
  const [activeTab, setActiveTab] = useState<'INBOX' | 'SAGA'>('INBOX');

  const refreshState = () => {
    setTasks([...globalWorkflow.getTasks()]);
    setSagas([...globalWorkflow.getSagas()]);
  };

  const handleApprove = (taskId: string) => {
    globalWorkflow.approveTask(taskId, 'Fahad (Branch Manager)');
    refreshState();
  };

  const handleReject = (taskId: string) => {
    globalWorkflow.rejectTask(taskId, 'Fahad (Branch Manager)', 'Rejected per corporate expense budget limits');
    refreshState();
  };

  const handleSimulateSaga = (fail: boolean) => {
    globalWorkflow.simulateSagaExecution('ORDER_FULFILLMENT_SAGA', fail);
    refreshState();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 text-slate-100">
      {/* Header Bar */}
      <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GitFork className="w-5 h-5 text-indigo-400" />
            <h1 className="text-lg font-black tracking-tight text-white">
              {isArabic ? 'محرك مسارات العمل وسلسلة الاعتمادات (BPMN & Sagas)' : 'Enterprise Workflow & Distributed Saga Engine'}
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
              ACID Saga Orchestrator
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {isArabic
              ? 'سلسلة موافقات متعددة المستويات، تصعيد آلي للمهام، ومزامنة المعاملات الموزعة مع التراجع التلقائي (Compensations)'
              : 'Multi-level approval state machines, SLA escalation timers, and distributed Saga transactions with compensation actions'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSimulateSaga(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isArabic ? 'تشغيل Saga ناجحة' : 'Trigger Success Saga'}</span>
          </button>
          <button
            onClick={() => handleSimulateSaga(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>{isArabic ? 'محاكاة فشل وتعويض Saga' : 'Simulate Saga Rollback'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/40 px-4 gap-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('INBOX')}
          className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'INBOX'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          {isArabic ? 'صندوق مهام الاعتماد (Human Tasks)' : 'Human Approval Tasks Inbox'} ({tasks.filter(t => t.status === 'PENDING').length})
        </button>
        <button
          onClick={() => setActiveTab('SAGA')}
          className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'SAGA'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          {isArabic ? 'سجل العمليات الموزعة (Saga Traces)' : 'Distributed Saga Execution Traces'} ({sagas.length})
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'INBOX' && (
          <div className="space-y-3">
            {tasks.map(t => (
              <div key={t.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-indigo-400 font-bold text-xs">{t.referenceId}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.status === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : t.status === 'REJECTED'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white">{isArabic ? t.titleAr : t.titleEn}</h3>
                    <p className="text-xs text-slate-400">
                      {isArabic ? 'مقدم الطلب:' : 'Initiated by:'} {t.initiatedBy} • {isArabic ? 'المهلة الزمنية (SLA):' : 'SLA Due:'}{' '}
                      <span className="text-amber-400 font-bold">{t.slaDueTimestamp}</span>
                    </p>
                  </div>

                  {t.status === 'PENDING' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReject(t.id)}
                        className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>{isArabic ? 'رفض' : 'Reject'}</span>
                      </button>
                      <button
                        onClick={() => handleApprove(t.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-md shadow-emerald-600/20"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isArabic ? 'اعتماد وموافقة' : 'Approve Step'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Workflow steps visualization */}
                <div className="pt-3 border-t border-slate-800 flex items-center gap-2 text-xs">
                  {t.approvalChain.map((step, idx) => (
                    <React.Fragment key={idx}>
                      <div
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold ${
                          step.status === 'APPROVED'
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                            : step.status === 'REJECTED'
                            ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <span>{step.role}</span>
                        {step.status === 'APPROVED' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      {idx < t.approvalChain.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-slate-600" />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'SAGA' && (
          <div className="space-y-3">
            {sagas.map(s => (
              <div key={s.sagaId} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-indigo-400 font-bold text-xs">{s.sagaId}</span>
                    <span className="text-xs font-bold text-white">{s.type}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.status === 'COMMITTED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : s.status === 'COMPENSATED'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Distributed Orchestration Trace</span>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 space-y-2 text-xs">
                  {s.steps.map((st, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-900/60 font-mono">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            st.status === 'SUCCESS'
                              ? 'bg-emerald-400'
                              : st.status === 'COMPENSATED'
                              ? 'bg-amber-400'
                              : 'bg-rose-500'
                          }`}
                        />
                        <span className="text-slate-200">{st.stepName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {st.compensationAction && (
                          <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded">
                            ↩ {st.compensationAction}
                          </span>
                        )}
                        <span
                          className={`font-bold ${
                            st.status === 'SUCCESS'
                              ? 'text-emerald-400'
                              : st.status === 'COMPENSATED'
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {st.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
