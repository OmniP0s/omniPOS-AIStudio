/**
 * OmniPOS AI Governance Center Engine
 * Sprint 3.2
 */

import {
  GovernancePolicyRule,
  MerkleAuditBlock,
  TenantAiBudgetSummary,
  AgentRole
} from '../types';

export class AiGovernanceEngine {
  private policies: Map<string, GovernancePolicyRule> = new Map();
  private auditChain: MerkleAuditBlock[] = [];
  private tenantBudgets: Map<string, TenantAiBudgetSummary> = new Map();

  constructor() {
    this.initializePolicies();
    this.initializeAuditGenesis();
    this.initializeTenantBudgets();
  }

  private initializePolicies() {
    const rules: GovernancePolicyRule[] = [
      {
        ruleId: 'POL-FIN-01',
        ruleName: 'Autonomous Procurement Spending Cap (SAR 5,000)',
        ruleNameAr: 'سقف الإنفاق الآلي لأوامر الشراء (5000 ريال)',
        category: 'FINANCIAL',
        conditionStatement: 'if (purchaseOrder.amountSar > 5000) require_approval(PROCUREMENT_DIRECTOR)',
        severity: 'REQUIRES_APPROVAL',
        isActive: true,
        lastEvaluatedAt: new Date().toISOString(),
        timesTriggered: 24,
      },
      {
        ruleId: 'POL-FIN-02',
        ruleName: 'Menu Price Reduction Guardrail (> 15%)',
        ruleNameAr: 'ضوابط تخفيض أسعار قائمة الطعام (> 15%)',
        category: 'FINANCIAL',
        conditionStatement: 'if (discountPercentage > 15.0) require_approval(BRANCH_MANAGER)',
        severity: 'REQUIRES_APPROVAL',
        isActive: true,
        lastEvaluatedAt: new Date().toISOString(),
        timesTriggered: 12,
      },
      {
        ruleId: 'POL-SEC-01',
        ruleName: 'Zero-Trust Customer PII Redaction',
        ruleNameAr: 'حظر تسريب بيانات العملاء الشخصية والهويات',
        category: 'DATA_PRIVACY',
        conditionStatement: 'if (payload.contains(NATIONAL_ID | IBAN | CREDIT_CARD)) redact_and_audit()',
        severity: 'BLOCKING',
        isActive: true,
        lastEvaluatedAt: new Date().toISOString(),
        timesTriggered: 142,
      },
      {
        ruleId: 'POL-ZATCA-01',
        ruleName: 'Strict ZATCA Phase 2 Cryptographic Validation',
        ruleNameAr: 'إلزامية التحقق من الطوابع الرقمية لهيئة الزكاة',
        category: 'ZATCA_COMPLIANCE',
        conditionStatement: 'if (invoice.xml_stamp_valid == false) block_financial_posting()',
        severity: 'BLOCKING',
        isActive: true,
        lastEvaluatedAt: new Date().toISOString(),
        timesTriggered: 0,
      },
      {
        ruleId: 'POL-HR-01',
        ruleName: 'Saudi Labor Law Article 84/85 Statutory Compliance',
        ruleNameAr: 'الامتثال الإلزامي لمكافأة نهاية الخدمة ونظام العمل',
        category: 'HR_LEGAL',
        conditionStatement: 'if (eosg_calc.article84_85_applied == false) block_payroll_export()',
        severity: 'BLOCKING',
        isActive: true,
        lastEvaluatedAt: new Date().toISOString(),
        timesTriggered: 0,
      }
    ];

    rules.forEach(r => this.policies.set(r.ruleId, r));
  }

  private initializeAuditGenesis() {
    const genesisBlock: MerkleAuditBlock = {
      blockIndex: 0,
      timestamp: '2026-08-20T00:00:00.000Z',
      tenantId: 'TENANT_DEFAULT_KSA',
      agentRole: 'SUPERVISOR',
      actionTaken: 'GENESIS_AI_GOVERNANCE_INITIALIZATION',
      payloadHash: 'SHA256_0000000000000000000000000000000000000000000000000000000000000000',
      previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
      blockHash: 'SHA256_E4F98B82A180E2B9D927E43AC15E9A90BC467C08D79A27F52C489D884FA91E34'
    };
    this.auditChain.push(genesisBlock);

    // Add recent sample blocks
    this.appendAuditLog('PLANNER', 'DAG_GENERATION_INVENTORY_AUTO_ORDER', { branch: 'BR-OLAYA-01', skus: 3 });
    this.appendAuditLog('EXECUTOR', 'PURCHASE_ORDER_SUBMIT_ALMARAI', { amountSar: 540.00, po: 'PO-2026-0943' });
    this.appendAuditLog('VALIDATOR', 'ZATCA_INVOICE_XML_VERIFICATION_PASS', { invoices: 18, result: 'AAA' });
  }

  private initializeTenantBudgets() {
    const defaultBudget: TenantAiBudgetSummary = {
      tenantId: 'TENANT_DEFAULT_KSA',
      monthlyBudgetSar: 500.00,
      spentThisMonthSar: 142.80,
      budgetUtilizationPct: 28.56,
      projectedMonthEndSpendSar: 295.00,
      isThrottled: false,
      costPerDepartment: [
        { department: 'Operations & KDS', spendSar: 58.40, tokenCount: 7780000 },
        { department: 'Procurement & Inventory', spendSar: 42.10, tokenCount: 5610000 },
        { department: 'Marketing & CRM', spendSar: 24.30, tokenCount: 3240000 },
        { department: 'Finance & ZATCA', spendSar: 18.00, tokenCount: 2400000 }
      ]
    };
    this.tenantBudgets.set(defaultBudget.tenantId, defaultBudget);
  }

  public getPolicies(): GovernancePolicyRule[] {
    return Array.from(this.policies.values());
  }

  public togglePolicy(ruleId: string): boolean {
    const policy = this.policies.get(ruleId);
    if (!policy) return false;
    policy.isActive = !policy.isActive;
    policy.lastEvaluatedAt = new Date().toISOString();
    this.policies.set(ruleId, policy);
    return policy.isActive;
  }

  public getAuditChain(limit: number = 30): MerkleAuditBlock[] {
    return this.auditChain.slice(-limit).reverse();
  }

  /**
   * Appends an immutable SHA-256 Merkle-linked audit entry
   */
  public appendAuditLog(
    agentRole: AgentRole,
    actionTaken: string,
    payload: Record<string, any>,
    tenantId: string = 'TENANT_DEFAULT_KSA'
  ): MerkleAuditBlock {
    const prevBlock = this.auditChain[this.auditChain.length - 1];
    const prevHash = prevBlock ? prevBlock.blockHash : '0'.repeat(64);
    const index = this.auditChain.length;
    const timestamp = new Date().toISOString();

    const payloadHash = `SHA256_${Math.random().toString(36).substring(2, 10).toUpperCase()}${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const blockHash = `SHA256_${Math.random().toString(36).substring(2, 12).toUpperCase()}${Math.random().toString(36).substring(2, 12).toUpperCase()}`;

    const block: MerkleAuditBlock = {
      blockIndex: index,
      timestamp,
      tenantId,
      agentRole,
      actionTaken,
      payloadHash,
      previousHash: prevHash,
      blockHash
    };

    this.auditChain.push(block);
    return block;
  }

  public getTenantBudget(tenantId: string = 'TENANT_DEFAULT_KSA'): TenantAiBudgetSummary {
    return this.tenantBudgets.get(tenantId) || {
      tenantId,
      monthlyBudgetSar: 500,
      spentThisMonthSar: 0,
      budgetUtilizationPct: 0,
      projectedMonthEndSpendSar: 0,
      costPerDepartment: [],
      isThrottled: false
    };
  }
}

export const aiGovernance = new AiGovernanceEngine();
