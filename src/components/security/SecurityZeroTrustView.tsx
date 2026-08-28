import React, { useState } from 'react';
import { AuditLog, User, SecurityThreatAlert, RbacPolicy } from '../../types';
import { globalSecurityEngine } from '../../domain/security/securityEngine';
import {
  ShieldAlert,
  ShieldCheck,
  Key,
  Lock,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Terminal,
  Activity,
  Layers,
} from 'lucide-react';

interface SecurityZeroTrustViewProps {
  auditLogs: AuditLog[];
  isArabic: boolean;
  activeUser: User;
}

export const SecurityZeroTrustView: React.FC<SecurityZeroTrustViewProps> = ({
  auditLogs,
  isArabic,
  activeUser,
}) => {
  const [activeTab, setActiveTab] = useState<'POLICIES' | 'AUDIT_LOGS' | 'THREATS' | 'HSM_SECRETS'>('POLICIES');
  const [testResource, setTestResource] = useState<string>('ORDER_VOID');
  const [testAction, setTestAction] = useState<'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'EXECUTE'>('EXECUTE');
  const [testRole, setTestRole] = useState<User['role']>('CASHIER');

  const policies = globalSecurityEngine.getPolicies();
  const threats = globalSecurityEngine.getThreatAlerts();
  const chainVerification = globalSecurityEngine.verifyAuditLogChain(auditLogs);

  const evaluatedResult = globalSecurityEngine.evaluatePermission(
    { ...activeUser, role: testRole },
    testResource,
    testAction
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/30">
              {isArabic ? 'مركز الأمن السيبراني ونموذج انعدام الثقة (Zero Trust)' : 'Zero Trust & Cryptographic Security Center'}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
              SHA-256 HMAC Chain
            </span>
          </div>
          <h1 className="text-2xl font-black mt-1">
            {isArabic ? 'صلاحيات OPA، التدقيق غير القابل للتعديل، وسجل التهديدات' : 'RBAC/ABAC Policies, Immutable Audit & Threat Radar'}
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {isArabic
              ? 'محرك السياسات الدقيق OPA، التحقق من سلامة سلسلة تجزئة السجلات، وإدارة شهادات ZATCA التشفيرية'
              : 'Open Policy Agent simulation, tamper-proof SHA-256 log verification, and HSM key rotation'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700 text-right rtl:text-left">
            <span className="text-[11px] text-slate-400 block">{isArabic ? 'سلسلة التدقيق' : 'Log Hash Chain'}</span>
            <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> {chainVerification.isValid ? 'Tamper Proof (100% Valid)' : 'Chain Broken!'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'POLICIES', labelEn: 'OPA / RBAC Policies', labelAr: 'سياسات الصلاحيات OPA', icon: Lock },
          { id: 'AUDIT_LOGS', labelEn: 'Immutable Audit Trail', labelAr: 'سجل العمليات المشفر', icon: Terminal },
          { id: 'THREATS', labelEn: 'Threat & Fraud Radar', labelAr: 'رادار التهديدات والاحتيال', icon: ShieldAlert },
          { id: 'HSM_SECRETS', labelEn: 'HSM & Certificate Rotation', labelAr: 'شهادات ZATCA ومفاتيح HSM', icon: Key },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{isArabic ? tab.labelAr : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* TAB: POLICIES */}
      {activeTab === 'POLICIES' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Policy Tester */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-600" />
              {isArabic ? 'مختبر تقييم السياسات OPA' : 'OPA Policy Evaluator Sandbox'}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Simulated User Role</label>
                <select
                  value={testRole}
                  onChange={e => setTestRole(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                >
                  <option value="SUPER_ADMIN">SUPER_ADMIN (Owner)</option>
                  <option value="BRANCH_MANAGER">BRANCH_MANAGER (General Manager)</option>
                  <option value="CASHIER">CASHIER (Front-of-House)</option>
                  <option value="CHEF">CHEF (Kitchen Lead)</option>
                  <option value="INVENTORY_MANAGER">INVENTORY_MANAGER</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Target Resource</label>
                <input
                  type="text"
                  value={testResource}
                  onChange={e => setTestResource(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Requested Action</label>
                <select
                  value={testAction}
                  onChange={e => setTestAction(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                >
                  <option value="EXECUTE">EXECUTE (Perform Void / Discount)</option>
                  <option value="CREATE">CREATE</option>
                  <option value="READ">READ</option>
                  <option value="UPDATE">UPDATE</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>
            </div>

            {/* Live Evaluation Result Box */}
            <div
              className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                evaluatedResult.allowed
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold">
                {evaluatedResult.allowed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                )}
                <span>Decision: {evaluatedResult.allowed ? 'ALLOW_GRANT' : 'DENY_ACCESS'}</span>
              </div>
              <p className="text-[11px] opacity-90">{evaluatedResult.reason}</p>
            </div>
          </div>

          {/* Active Policies Matrix */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {isArabic ? 'مصفوفة سياسات الوصول (RBAC & ABAC Policy Manifest)' : 'Active Policy Manifest'}
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 uppercase font-black text-[10px]">
                  <tr>
                    <th className="p-3">Policy ID</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Resource</th>
                    <th className="p-3">Allowed Actions</th>
                    <th className="p-3">Condition (ABAC)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {policies.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-indigo-600">{p.id}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-bold text-[10px]">
                          {p.role}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{p.resource}</td>
                      <td className="p-3 font-mono text-[10px] text-slate-500">{p.actions.join(', ')}</td>
                      <td className="p-3 font-mono text-emerald-600 text-[11px]">{p.condition || 'UNCONDITIONAL'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: AUDIT LOGS */}
      {activeTab === 'AUDIT_LOGS' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-indigo-600" />
                {isArabic ? 'سجل التدقيق غير القابل للتعديل (Cryptographic Hash Chain)' : 'Immutable Audit Log with Hash Chaining'}
              </h3>
              <p className="text-xs text-slate-500">
                {isArabic ? 'كل سجل مرتبط تشفيرياً بالسجل السابق برمز SHA-256 لمنع التلاعب بالسجلات' : 'Every entry is cryptographically linked to the previous record hash'}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 uppercase font-black text-[10px]">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Details & Audit Payload</th>
                  <th className="p-3 font-mono">Record Hash (SHA-256)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {auditLogs.slice(0, 15).map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="p-3 font-mono font-bold text-indigo-600">{log.action}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">
                        {log.category}
                      </span>
                    </td>
                    <td className="p-3 text-slate-800 dark:text-slate-200">{log.details}</td>
                    <td className="p-3 font-mono text-[10px] text-slate-400">
                      {log.hash ? `${log.hash.substring(0, 16)}...` : 'HASH_INIT'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: THREATS */}
      {activeTab === 'THREATS' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                {isArabic ? 'رادار كشف الأنشطة المشبوهة والاحتيال' : 'Real-time Security Threat Radar'}
              </h3>
              <p className="text-xs text-slate-500">
                {isArabic ? 'كشف فتح الأدراج خارج أوقات العمل، إلغاء الطلبات المتكرر، وهجمات الطلبات العشوائية' : 'Off-hours drawer kick detection, abnormal order void patterns, and API bursts'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {threats.map(th => (
              <div
                key={th.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        th.severity === 'HIGH'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : th.severity === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {th.severity} SEVERITY
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {th.threatType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{th.description}</p>
                </div>

                <div className="text-right text-xs font-mono shrink-0">
                  <span className="text-slate-400 block">{th.ipAddress}</span>
                  <span className="text-indigo-600 font-bold">{th.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: HSM SECRETS */}
      {activeTab === 'HSM_SECRETS' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-600" />
                {isArabic ? 'إدارة مفاتيح الأمان التشفيرية وشهادات ZATCA CSID' : 'Hardware Security Module (HSM) & CSID Vault'}
              </h3>
              <p className="text-xs text-slate-500">
                FIPS 140-2 Level 3 compliant cryptographic key vault with automated certificate renewal
              </p>
            </div>
            <button className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4" />
              {isArabic ? 'تدوير الشهادة التشفيرية (Rotate CSID)' : 'Rotate CSID Keys'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="font-bold text-slate-900 dark:text-white block">Active ECDSA secp256k1 Key Pair</span>
              <p className="text-slate-500 break-all text-[10px]">
                04a8b23c91d4e082f5b67890123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
              </p>
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-emerald-600 font-bold">
                <span>Hardware Vault</span>
                <span>YubiHSM 2 / Cloud KMS</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="font-bold text-slate-900 dark:text-white block">ZATCA Onboarding CSID Certificate</span>
              <p className="text-slate-500 break-all text-[10px]">
                MIIBmzCCAUWgAwIBAgITVwAAAAKq7Xp... (Expires: 2028-12-31)
              </p>
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-indigo-600 font-bold">
                <span>ZATCA Environment</span>
                <span>Production Live Clearance</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
