import React, { useState } from 'react';
import {
  ShieldAlert,
  Lock,
  Zap,
  CheckCircle2,
  AlertOctagon,
  UserX,
  KeyRound,
  Eye,
  Radio,
  Clock,
  Ban,
  Activity,
} from 'lucide-react';
import { runtimeEngine } from '../../domain/runtime/runtimeEngine';

interface Props {
  isArabic: boolean;
}

export const RuntimeSecurityIntelligenceView: React.FC<Props> = ({ isArabic }) => {
  const [threats, setThreats] = useState([...runtimeEngine.securityThreats]);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const blockThreat = (id: string) => {
    runtimeEngine.blockThreat(id);
    setThreats([...runtimeEngine.securityThreats]);
    setActionMessage(
      isArabic
        ? 'تم حظر الهجوم فورياً وتعميم الـ IP على الجدار الناري وحذف جلسات المستخدم.'
        : 'Threat actively mitigated: IP blacklisted on Edge WAF and all sessions revoked.'
    );
    setTimeout(() => setActionMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight">
                  {isArabic ? 'استخبارات أمان التشغيل (Runtime Security Intelligence)' : 'Runtime Security Intelligence & Threat Response'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                  REAL-TIME SOC AI
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isArabic
                  ? 'مراقبة حية للتهديدات السيبرانية: اختطاف الجلسات، إعادة تدوير الرموز، تصعيد الصلاحيات، هجمات حشو الاعتمادات، والتهديدات الداخلية'
                  : 'Active defense against Session Hijacking, Token Replay, Privilege Escalation, Credential Stuffing, and Insider Threats.'}
              </p>
            </div>
          </div>
        </div>

        {/* 7 Threat Detectors Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 mt-6">
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
            <UserX className="w-5 h-5 mx-auto text-red-400 mb-1" />
            <div className="text-xs font-bold text-white">Session Hijack</div>
            <div className="text-[10px] text-slate-400 mt-0.5">TLS + IP Lock</div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
            <KeyRound className="w-5 h-5 mx-auto text-amber-400 mb-1" />
            <div className="text-xs font-bold text-white">Token Replay</div>
            <div className="text-[10px] text-slate-400 mt-0.5">JTI Nonce Check</div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
            <Lock className="w-5 h-5 mx-auto text-purple-400 mb-1" />
            <div className="text-xs font-bold text-white">Priv Escalation</div>
            <div className="text-[10px] text-slate-400 mt-0.5">RBAC &amp; ABAC</div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
            <Activity className="w-5 h-5 mx-auto text-blue-400 mb-1" />
            <div className="text-xs font-bold text-white">API Anomaly</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Spike Detector</div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
            <Eye className="w-5 h-5 mx-auto text-cyan-400 mb-1" />
            <div className="text-xs font-bold text-white">Insider Threat</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Bulk Export Alert</div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
            <AlertOctagon className="w-5 h-5 mx-auto text-rose-400 mb-1" />
            <div className="text-xs font-bold text-white">Credential Stuff</div>
            <div className="text-[10px] text-slate-400 mt-0.5">WAF Shield</div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
            <Ban className="w-5 h-5 mx-auto text-orange-400 mb-1" />
            <div className="text-xs font-bold text-white">API Abuse</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Token Bucket Limiter</div>
          </div>
        </div>

        {actionMessage && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-red-400" />
            <span>{actionMessage}</span>
          </div>
        )}
      </div>

      {/* Security Threat Stream */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <AlertOctagon className="w-4 h-4 text-red-400" />
            <span>{isArabic ? 'الإنذارات الأمنية والاستجابة الآلية الفورية' : 'Live Intercepted Security Incidents'}</span>
          </div>
          <span className="text-xs text-red-400 font-mono">{threats.length} Critical Alerts</span>
        </div>

        <div className="space-y-4">
          {threats.map((threat) => (
            <div key={threat.id} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold font-mono bg-red-500/20 text-red-400 border border-red-500/30">
                    {threat.threatType}
                  </span>
                  <span className="text-white font-bold text-xs">{threat.targetAccountOrTenant}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-400 font-mono">{threat.timestamp}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-red-300 border border-red-900/50">
                    STATUS: {threat.status}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-1 text-xs">
                <div className="text-slate-400 text-[11px] font-bold">Threat Evidence (Payload Analysis):</div>
                <div className="text-slate-200 font-mono text-[11px]">{threat.evidence}</div>
              </div>

              <div className="p-3 bg-red-950/20 rounded-lg border border-red-500/30 space-y-1 text-xs">
                <div className="text-red-400 font-bold text-[11px] flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Automated SOC Mitigation Action:</span>
                </div>
                <div className="text-red-200">{threat.automatedResponse}</div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs text-slate-500 font-mono">
                <span>Source IP: {threat.sourceIp}</span>

                {threat.status !== 'BLOCKED' && (
                  <button
                    onClick={() => blockThreat(threat.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md shadow-red-600/30 flex items-center gap-1"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>{isArabic ? 'حظر وتعميم فوري' : 'Enforce Immediate Ban'}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
