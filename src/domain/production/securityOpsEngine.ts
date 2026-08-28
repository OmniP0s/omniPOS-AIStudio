import { SecurityThreatEvent } from '../../types/production';

export interface ActiveSession {
  sessionId: string;
  userId: string;
  userName: string;
  role: string;
  branchName: string;
  ipAddress: string;
  deviceFingerprint: string;
  loginTime: string;
  lastActive: string;
  mfaVerified: boolean;
  riskScore: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'ACTIVE' | 'TERMINATED';
}

export class EnterpriseSecurityOpsEngine {
  private threatEvents: SecurityThreatEvent[] = [
    {
      id: 'SEC-THREAT-01',
      severity: 'HIGH',
      eventType: 'UNAUTHORIZED_DRAWER',
      sourceIp: '192.168.1.144',
      userAgent: 'OmniPOS-Terminal-Hardware-Agent/v3.4',
      targetTenant: 'TNT-001',
      targetUser: 'cashier.yousef',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      mitigationApplied: 'Manager Biometric Verification Required & Cash Audit Flagged',
      status: 'INVESTIGATING',
    },
    {
      id: 'SEC-THREAT-02',
      severity: 'CRITICAL',
      eventType: 'SQL_INJECTION_PROBE',
      sourceIp: '185.220.101.5',
      userAgent: 'sqlmap/1.6.12#stable',
      targetTenant: 'TNT-GLOBAL',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      mitigationApplied: 'WAF IP Banned for 72 Hours at Cloudflare Edge',
      status: 'BLOCKED',
    },
    {
      id: 'SEC-THREAT-03',
      severity: 'MEDIUM',
      eventType: 'IMPOSSIBLE_TRAVEL',
      sourceIp: '82.178.44.12',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4)',
      targetTenant: 'TNT-001',
      targetUser: 'manager.ahmed',
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      mitigationApplied: 'Enforced Push MFA & Session Token Revocation',
      status: 'RESOLVED',
    },
    {
      id: 'SEC-THREAT-04',
      severity: 'CRITICAL',
      eventType: 'ZATCA_TAMPERING',
      sourceIp: '10.0.4.12',
      userAgent: 'Direct-REST-Curl/7.88',
      targetTenant: 'TNT-001',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      mitigationApplied: 'Invoice Hash Mismatch Detected: Auto-quarantined and Reported to ZATCA Compliance Officer',
      status: 'RESOLVED',
    }
  ];

  private sessions: ActiveSession[] = [
    {
      sessionId: 'sess-8491-a1',
      userId: 'usr-101',
      userName: 'Eng. Khalid Al-Mansoor',
      role: 'SUPER_ADMIN',
      branchName: 'Corporate HQ - Riyadh',
      ipAddress: '10.12.0.44',
      deviceFingerprint: 'DEV-FINGERPRINT-MACBOOK-M3-9A',
      loginTime: new Date(Date.now() - 18000000).toISOString(),
      lastActive: new Date().toISOString(),
      mfaVerified: true,
      riskScore: 'LOW',
      status: 'ACTIVE',
    },
    {
      sessionId: 'sess-9942-b2',
      userId: 'usr-204',
      userName: 'Sultan Al-Otaibi',
      role: 'BRANCH_MANAGER',
      branchName: 'Olaya Main Branch',
      ipAddress: '192.168.10.12',
      deviceFingerprint: 'DEV-FINGERPRINT-IPAD-PRO-KSA-01',
      loginTime: new Date(Date.now() - 7200000).toISOString(),
      lastActive: new Date(Date.now() - 60000).toISOString(),
      mfaVerified: true,
      riskScore: 'LOW',
      status: 'ACTIVE',
    },
    {
      sessionId: 'sess-3310-c3',
      userId: 'usr-308',
      userName: 'Yousef Al-Harbi',
      role: 'CASHIER',
      branchName: 'Tahlia Street Branch',
      ipAddress: '192.168.20.15',
      deviceFingerprint: 'DEV-FINGERPRINT-SUNMI-T2-04',
      loginTime: new Date(Date.now() - 14400000).toISOString(),
      lastActive: new Date(Date.now() - 120000).toISOString(),
      mfaVerified: true,
      riskScore: 'MEDIUM',
      status: 'ACTIVE',
    }
  ];

  public getThreats(): SecurityThreatEvent[] {
    return this.threatEvents;
  }

  public getSessions(): ActiveSession[] {
    return this.sessions;
  }

  public terminateSession(sessionId: string): ActiveSession {
    const session = this.sessions.find(s => s.sessionId === sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);
    session.status = 'TERMINATED';
    return session;
  }

  public resolveThreat(threatId: string): SecurityThreatEvent {
    const threat = this.threatEvents.find(t => t.id === threatId);
    if (!threat) throw new Error(`Threat ${threatId} not found`);
    threat.status = 'RESOLVED';
    return threat;
  }
}

export const securityOpsEngine = new EnterpriseSecurityOpsEngine();
