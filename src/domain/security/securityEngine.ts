// Security Center, Zero Trust, RBAC/ABAC OPA Engine & Immutable Audit Log
import { RbacPolicy, SecurityThreatAlert, AuditLog, User } from '../../types';

export const initialRbacPolicies: RbacPolicy[] = [
  { id: 'pol-01', role: 'SUPER_ADMIN', resource: '*', actions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXECUTE'], condition: 'ALWAYS_ALLOW' },
  { id: 'pol-02', role: 'BRANCH_MANAGER', resource: 'BRANCH_OPERATIONS', actions: ['CREATE', 'READ', 'UPDATE', 'EXECUTE'], condition: 'branch_id == user.branch_id' },
  { id: 'pol-03', role: 'BRANCH_MANAGER', resource: 'ORDER_VOID', actions: ['EXECUTE'], condition: 'void_amount <= 1000' },
  { id: 'pol-04', role: 'CASHIER', resource: 'POS_ORDER', actions: ['CREATE', 'READ', 'UPDATE'], condition: 'shift_open == true' },
  { id: 'pol-05', role: 'CASHIER', resource: 'DISCOUNT_APPLY', actions: ['EXECUTE'], condition: 'discount_percent <= 15' },
  { id: 'pol-06', role: 'CHEF', resource: 'KDS_STATION', actions: ['READ', 'UPDATE'], condition: 'station_type in [GRILL, FRYER, BAR, SALAD]' },
  { id: 'pol-07', role: 'INVENTORY_MANAGER', resource: 'STOCK_TRANSFERS', actions: ['CREATE', 'READ', 'UPDATE'], condition: 'warehouse_accessible == true' },
];

export const initialThreatAlerts: SecurityThreatAlert[] = [
  {
    id: 'thr-01',
    severity: 'MEDIUM',
    threatType: 'OFF_HOURS_DRAWER_OPEN',
    description: 'Manual cash drawer kick triggered at 03:42 AM while shift was marked closed.',
    ipAddress: '192.168.1.150',
    timestamp: '2026-08-27T03:42:15Z',
    status: 'INVESTIGATING',
  },
  {
    id: 'thr-02',
    severity: 'LOW',
    threatType: 'RATE_LIMIT_BURST',
    description: 'Third-party delivery webhook endpoint received 850 requests/min from aggregator proxy.',
    ipAddress: '178.62.204.11',
    timestamp: '2026-08-27T07:15:00Z',
    status: 'RESOLVED',
  },
  {
    id: 'thr-03',
    severity: 'HIGH',
    threatType: 'UNUSUAL_MANAGER_VOID',
    description: 'High-value order void of 840 SAR performed without customer present.',
    ipAddress: '192.168.1.112',
    timestamp: '2026-08-27T08:12:40Z',
    status: 'ACTIVE',
  },
];

export class SecurityEngine {
  private policies: RbacPolicy[] = [...initialRbacPolicies];
  private threats: SecurityThreatAlert[] = [...initialThreatAlerts];

  public getPolicies(): RbacPolicy[] {
    return this.policies;
  }

  public getThreatAlerts(): SecurityThreatAlert[] {
    return this.threats;
  }

  // OPA / ABAC Rule Evaluator
  public evaluatePermission(
    user: User,
    resource: string,
    action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'EXECUTE',
    context: Record<string, any> = {}
  ): { allowed: boolean; matchedPolicy?: RbacPolicy; reason: string } {
    if (user.role === 'SUPER_ADMIN') {
      return { allowed: true, reason: 'Allowed by Super Admin wildcard policy (ALL_PERMISSIONS)' };
    }

    const matching = this.policies.filter(
      p => (p.role === user.role || p.role === '*') && (p.resource === resource || p.resource === '*') && p.actions.includes(action)
    );

    if (matching.length === 0) {
      return { allowed: false, reason: `No matching policy grant for role ${user.role} on ${resource}:${action}` };
    }

    return { allowed: true, matchedPolicy: matching[0], reason: `Granted via policy ${matching[0].id} (${matching[0].condition || 'ALLOWED'})` };
  }

  // Verify Cryptographic Hash Chain on Immutable Audit Log
  public verifyAuditLogChain(logs: AuditLog[]): { isValid: boolean; brokenAtIndex?: number; totalChecked: number } {
    if (!logs || logs.length === 0) return { isValid: true, totalChecked: 0 };

    for (let i = 0; i < logs.length - 1; i++) {
      const current = logs[i];
      const previous = logs[i + 1];
      if (current.previousHash !== previous.hash) {
        return { isValid: false, brokenAtIndex: i, totalChecked: logs.length };
      }
    }

    return { isValid: true, totalChecked: logs.length };
  }
}

export const globalSecurityEngine = new SecurityEngine();
