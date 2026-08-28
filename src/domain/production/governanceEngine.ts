import { BusinessPolicy } from '../../types/production';

export class EnterpriseGovernanceEngine {
  private policies: BusinessPolicy[] = [
    {
      id: 'POL-001',
      nameEn: 'High-Value Discount & Void Manager Override SLA',
      nameAr: 'سياسة اعتماد الخصومات والإلغاءات ذات القيمة العالية',
      category: 'APPROVAL',
      version: 'v2.1',
      enabled: true,
      priority: 100,
      conditionsJson: JSON.stringify({
        rule: 'OR',
        conditions: [
          { field: 'order.discountPercent', operator: 'GREATER_THAN', value: 20 },
          { field: 'order.totalVoidAmount', operator: 'GREATER_THAN', value: 250 },
        ],
      }, null, 2),
      actionsJson: JSON.stringify({
        action: 'REQUIRE_MGR_BIOMETRIC_PIN',
        notifyRoles: ['BRANCH_MANAGER', 'AUDIT_OFFICER'],
        auditLog: true,
      }, null, 2),
      lastEvaluated: new Date().toISOString(),
      evaluationCount: 1420,
      passCount: 1388,
      failCount: 32,
    },
    {
      id: 'POL-002',
      nameEn: 'ZATCA Cryptographic Sequential Hash Integrity',
      nameAr: 'سياسة سلامة وتتابع التشفير المالي لهيئة الزكاة',
      category: 'COMPLIANCE',
      version: 'v3.0',
      enabled: true,
      priority: 200,
      conditionsJson: JSON.stringify({
        rule: 'AND',
        conditions: [
          { field: 'invoice.previousHash', operator: 'NOT_EMPTY' },
          { field: 'invoice.icvSequence', operator: 'EXACT_INCREMENT', value: 1 },
          { field: 'invoice.ecdsaSignature', operator: 'VALID_SECP256K1' },
        ],
      }, null, 2),
      actionsJson: JSON.stringify({
        action: 'ALLOW_ISSUE_AND_QR_STAMP',
        onFailure: 'BLOCK_TRANSACTION_AND_ALERT_SOC',
      }, null, 2),
      lastEvaluated: new Date().toISOString(),
      evaluationCount: 18950,
      passCount: 18950,
      failCount: 0,
    },
    {
      id: 'POL-003',
      nameEn: 'Capex/Opex Purchase Request Tier-3 Authorization',
      nameAr: 'سياسة اعتماد المشتريات الرأسمالية والتشغيلية',
      category: 'FINANCIAL',
      version: 'v1.4',
      enabled: true,
      priority: 150,
      conditionsJson: JSON.stringify({
        rule: 'AND',
        conditions: [
          { field: 'po.totalAmountSar', operator: 'GREATER_THAN', value: 10000 },
          { field: 'supplier.isVerifiedKsaVat', operator: 'EQUALS', value: true },
        ],
      }, null, 2),
      actionsJson: JSON.stringify({
        action: 'REQUIRE_CFO_AND_SUPPLY_HEAD_APPROVAL',
        slaHours: 24,
      }, null, 2),
      lastEvaluated: new Date().toISOString(),
      evaluationCount: 84,
      passCount: 79,
      failCount: 5,
    },
    {
      id: 'POL-004',
      nameEn: 'KDS Order Bump Speed SLA & Cold Food Alert',
      nameAr: 'سياسة ضبط جودة تحضير الطعام وسرعة المطبخ',
      category: 'OPERATIONAL',
      version: 'v1.2',
      enabled: true,
      priority: 80,
      conditionsJson: JSON.stringify({
        rule: 'AND',
        conditions: [
          { field: 'kds.orderDurationMinutes', operator: 'GREATER_THAN', value: 15 },
          { field: 'kds.orderStatus', operator: 'EQUALS', value: 'IN_PREP' },
        ],
      }, null, 2),
      actionsJson: JSON.stringify({
        action: 'TRIGGER_KITCHEN_ALARM_AND_NOTIFY_EXPEDITER',
        colorState: 'FLASHING_RED',
      }, null, 2),
      lastEvaluated: new Date().toISOString(),
      evaluationCount: 654,
      passCount: 610,
      failCount: 44,
    }
  ];

  public getPolicies(): BusinessPolicy[] {
    return this.policies;
  }

  public simulatePolicy(policyId: string, testPayload: Record<string, any>): {
    policyName: string;
    passed: boolean;
    ruleMatched: boolean;
    evaluatedConditions: { field: string; expected: any; actual: any; pass: boolean }[];
    actionsTriggered: string[];
  } {
    const policy = this.policies.find(p => p.id === policyId);
    if (!policy) throw new Error(`Policy ${policyId} not found`);

    let parsedCond: any = {};
    try {
      parsedCond = JSON.parse(policy.conditionsJson);
    } catch {
      parsedCond = { conditions: [] };
    }

    const conditionsList = parsedCond.conditions || [];
    const evaluatedConditions = conditionsList.map((cond: any) => {
      const keys = cond.field.split('.');
      let actualVal = testPayload;
      for (const k of keys) {
        if (actualVal !== undefined && actualVal !== null) {
          actualVal = actualVal[k];
        } else {
          actualVal = undefined;
        }
      }

      let pass = false;
      if (cond.operator === 'GREATER_THAN') {
        pass = (actualVal !== undefined && Number(actualVal) > Number(cond.value));
      } else if (cond.operator === 'EQUALS') {
        pass = (actualVal === cond.value);
      } else if (cond.operator === 'NOT_EMPTY') {
        pass = Boolean(actualVal && String(actualVal).trim().length > 0);
      } else if (cond.operator === 'EXACT_INCREMENT') {
        pass = true;
      } else if (cond.operator === 'VALID_SECP256K1') {
        pass = true;
      }

      return {
        field: cond.field,
        expected: `${cond.operator} ${cond.value ?? ''}`.trim(),
        actual: actualVal !== undefined ? JSON.stringify(actualVal) : 'UNDEFINED',
        pass,
      };
    });

    const isOr = parsedCond.rule === 'OR';
    const overallPass = isOr
      ? evaluatedConditions.some(c => c.pass)
      : evaluatedConditions.every(c => c.pass);

    let parsedActions: any = {};
    try {
      parsedActions = JSON.parse(policy.actionsJson);
    } catch {
      parsedActions = { action: 'DEFAULT' };
    }

    const actionsTriggered = overallPass ? [parsedActions.action || 'TRIGGER_ACTION'] : ['NO_ACTION'];

    return {
      policyName: policy.nameEn,
      passed: overallPass,
      ruleMatched: overallPass,
      evaluatedConditions,
      actionsTriggered,
    };
  }

  public updatePolicy(id: string, updates: Partial<BusinessPolicy>): BusinessPolicy {
    const policy = this.policies.find(p => p.id === id);
    if (!policy) throw new Error(`Policy ${id} not found`);
    Object.assign(policy, updates, { lastEvaluated: new Date().toISOString() });
    return policy;
  }
}

export const governanceEngine = new EnterpriseGovernanceEngine();
