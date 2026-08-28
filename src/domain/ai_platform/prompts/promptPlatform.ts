/**
 * OmniPOS Enterprise Prompt Management Platform
 * Prompt Templates, Semantic Versioning, Variable Validation, Approval Workflows & Rollbacks
 */

import {
  PromptTemplate,
  PromptVersion,
  PromptApprovalStatus,
  PromptVariableSchema,
} from '../types';

export class EnterprisePromptPlatform {
  private templates: Map<string, PromptTemplate> = new Map();

  constructor() {
    this.seedEnterprisePromptTemplates();
  }

  private seedEnterprisePromptTemplates() {
    const defaultTemplates: PromptTemplate[] = [
      {
        id: 'PRM-001',
        name: 'POS Intelligent Upsell & Pairing Advisor',
        slug: 'pos-smart-upsell-v1',
        category: 'POS',
        descriptionEn: 'Analyzes cart items in real time to recommend high-margin beverage, side, or dessert pairings.',
        descriptionAr: 'يحلل محتويات سلة الطلب فورياً لاقتراح إضافات ومشروبات وحلويات ذات هوامش ربحية مرتفعة.',
        currentVersion: 'v1.2.0',
        tags: ['pos', 'upsell', 'margin', 'cart'],
        versions: [
          {
            version: 'v1.2.0',
            templateContent: `You are an elite POS cashier assistant for {{restaurantName}} in {{city}}.
Current Cart: {{cartItemsJson}}
Current Cart Total: {{cartTotalSar}} SAR.
Customer Loyalty Tier: {{loyaltyTier}}.

Task: Recommend up to 2 complementary items from the menu that maximize satisfaction and profit margin.
Rules:
1. If the cart contains a burger, suggest a truffle fries or artisanal beverage.
2. If customer tier is VIP or PLATINUM, mention exclusive member discount of {{vipDiscountPercent}}%.
3. Output strictly in JSON adhering to the schema.`,
            variables: [
              { name: 'restaurantName', type: 'STRING', required: true, defaultValue: 'OmniSteakhouse', descriptionEn: 'Brand name', descriptionAr: 'اسم المطعم' },
              { name: 'city', type: 'STRING', required: true, defaultValue: 'Riyadh', descriptionEn: 'Branch city', descriptionAr: 'المدينة' },
              { name: 'cartItemsJson', type: 'JSON', required: true, descriptionEn: 'JSON list of items in current ticket', descriptionAr: 'قائمة منتجات السلة' },
              { name: 'cartTotalSar', type: 'NUMBER', required: true, defaultValue: 0, descriptionEn: 'Cart subtotal in SAR', descriptionAr: 'إجمالي السلة' },
              { name: 'loyaltyTier', type: 'STRING', required: false, defaultValue: 'REGULAR', descriptionEn: 'Customer loyalty tier', descriptionAr: 'فئة العميل' },
              { name: 'vipDiscountPercent', type: 'NUMBER', required: false, defaultValue: 10, descriptionEn: 'VIP discount percentage', descriptionAr: 'نسبة خصم كبار الشخصيات' },
            ],
            systemInstruction: 'You are a hospitality sales optimization AI. Be concise, polite, and data-driven.',
            temperature: 0.3,
            status: 'APPROVED',
            createdBy: 'lead-architect@omnipos.sa',
            createdAt: '2026-08-20T10:00:00Z',
            approvedBy: 'chief-revenue-officer@omnipos.sa',
            approvedAt: '2026-08-21T14:30:00Z',
            changeLogEn: 'Added VIP tier discount variable and strict JSON output constraint.',
            changeLogAr: 'إضافة متغير خصم فئات كبار الشخصيات وإلزام المخرجات بصيغة JSON.',
          },
          {
            version: 'v1.0.0',
            templateContent: `Recommend upsell items for cart: {{cartItemsJson}}. Restaurant: {{restaurantName}}.`,
            variables: [
              { name: 'restaurantName', type: 'STRING', required: true, descriptionEn: 'Brand name', descriptionAr: 'اسم المطعم' },
              { name: 'cartItemsJson', type: 'JSON', required: true, descriptionEn: 'Cart items', descriptionAr: 'منتجات السلة' },
            ],
            status: 'ARCHIVED',
            createdBy: 'engineer@omnipos.sa',
            createdAt: '2026-08-01T08:00:00Z',
            approvedBy: 'lead-architect@omnipos.sa',
            approvedAt: '2026-08-01T09:00:00Z',
            changeLogEn: 'Initial version of POS upsell prompt.',
            changeLogAr: 'الإصدار الأولي لنموذج اقتراحات البيع الإضافي.',
          },
        ],
      },
      {
        id: 'PRM-002',
        name: 'ZATCA Phase 2 E-Invoice Cryptographic Auditor',
        slug: 'zatca-invoice-auditor-v1',
        category: 'ZATCA',
        descriptionEn: 'Validates invoice UBL 2.1 XML structure, hash chaining, and Tag 1-9 QR code conformance.',
        descriptionAr: 'تدقيق التوافق مع متطلبات المرحلة الثانية لهيئة الزكاة والضريبة والجمارك وتشفير QR.',
        currentVersion: 'v2.0.0',
        tags: ['zatca', 'tax', 'vat', 'audit', 'compliance'],
        versions: [
          {
            version: 'v2.0.0',
            templateContent: `You are the Lead ZATCA Phase 2 Tax Compliance Auditor.
Audit the following invoice submission:
Invoice Number: {{invoiceNumber}}
Invoice UUID: {{invoiceUuid}}
Total VAT Amount: {{vatAmountSar}} SAR
Grand Total: {{grandTotalSar}} SAR
Invoice Hash (SHA-256): {{invoiceSha256}}
Previous Invoice Hash: {{previousInvoiceSha256}}

Instructions:
1. Verify that 15% VAT calculation matches grand total exactly.
2. Confirm cryptographic sequence continuity between current hash and previous hash.
3. Validate that seller TIN is 15 digits starting and ending with 3.
4. Output structured audit verification result.`,
            variables: [
              { name: 'invoiceNumber', type: 'STRING', required: true, descriptionEn: 'Sequential invoice number', descriptionAr: 'رقم الفاتورة' },
              { name: 'invoiceUuid', type: 'STRING', required: true, descriptionEn: 'ZATCA UUID v4', descriptionAr: 'معرف الفاتورة العالمي' },
              { name: 'vatAmountSar', type: 'NUMBER', required: true, descriptionEn: '15% VAT amount', descriptionAr: 'مبلغ الضريبة' },
              { name: 'grandTotalSar', type: 'NUMBER', required: true, descriptionEn: 'Grand total with VAT', descriptionAr: 'المبلغ الإجمالي' },
              { name: 'invoiceSha256', type: 'STRING', required: true, descriptionEn: 'Invoice SHA-256 hash', descriptionAr: 'هاش الفاتورة' },
              { name: 'previousInvoiceSha256', type: 'STRING', required: true, descriptionEn: 'Previous sequential hash', descriptionAr: 'هاش الفاتورة السابقة' },
            ],
            systemInstruction: 'Enforce zero-tolerance ZATCA regulatory compliance.',
            temperature: 0.0,
            status: 'APPROVED',
            createdBy: 'ciso-tax@omnipos.sa',
            createdAt: '2026-08-25T09:00:00Z',
            approvedBy: 'head-of-tax@omnipos.sa',
            approvedAt: '2026-08-25T11:00:00Z',
            changeLogEn: 'Upgraded to Phase 2 cryptographic chaining rules.',
            changeLogAr: 'تحديث قواعد التدقيق للتوافق مع تشفير المرحلة الثانية والربط المتسلسل.',
          },
        ],
      },
      {
        id: 'PRM-003',
        name: 'Multi-Branch Inventory Spoilage & Reorder Forecaster',
        slug: 'inventory-spoilage-forecaster-v1',
        category: 'INVENTORY',
        descriptionEn: 'Predicts ingredient stockouts and expiry scrap across central kitchen and branches.',
        descriptionAr: 'توقع نفاد المواد الأولية وتلف المخزون بين المطبخ المركزي والفروع.',
        currentVersion: 'v1.1.0',
        tags: ['inventory', 'cogs', 'spoilage', 'bom'],
        versions: [
          {
            version: 'v1.1.0',
            templateContent: `Evaluate stock longevity for Branch: {{branchName}} (Tenant: {{tenantName}}).
Active Inventory Snapshot: {{inventoryJson}}
Upcoming 7-Day Forecasted Covers: {{forecastedCovers}}
Current Seasonality Factor: {{seasonalityFactor}}

Task: Identify top 3 at-risk perishable ingredients and provide exact transfer or purchase order quantities.`,
            variables: [
              { name: 'branchName', type: 'STRING', required: true, descriptionEn: 'Branch name', descriptionAr: 'اسم الفرع' },
              { name: 'tenantName', type: 'STRING', required: true, descriptionEn: 'Tenant enterprise name', descriptionAr: 'اسم المنشأة' },
              { name: 'inventoryJson', type: 'JSON', required: true, descriptionEn: 'Current inventory state', descriptionAr: 'بيانات المخزون' },
              { name: 'forecastedCovers', type: 'NUMBER', required: true, defaultValue: 500, descriptionEn: 'Expected guest count', descriptionAr: 'عدد الضيوف المتوقع' },
              { name: 'seasonalityFactor', type: 'STRING', required: false, defaultValue: 'NORMAL', descriptionEn: 'Seasonality code', descriptionAr: 'معامل الموسمية' },
            ],
            systemInstruction: 'Focus on Food Safety, FIFO rotation, and prime COGS target < 28%.',
            temperature: 0.2,
            status: 'APPROVED',
            createdBy: 'supply-chain-lead@omnipos.sa',
            createdAt: '2026-08-22T12:00:00Z',
            approvedBy: 'coo@omnipos.sa',
            approvedAt: '2026-08-23T08:00:00Z',
            changeLogEn: 'Enhanced shelf-life perishability alerts.',
            changeLogAr: 'تحسين تنبيهات الصلاحية للمواد سريعة التلف.',
          },
        ],
      },
    ];

    defaultTemplates.forEach(t => this.templates.set(t.id, t));
  }

  public getAllTemplates(): PromptTemplate[] {
    return Array.from(this.templates.values());
  }

  public getTemplate(idOrSlug: string): PromptTemplate | undefined {
    if (this.templates.has(idOrSlug)) {
      return this.templates.get(idOrSlug);
    }
    for (const t of this.templates.values()) {
      if (t.slug === idOrSlug) {
        return t;
      }
    }
    return undefined;
  }

  public getActiveVersion(templateId: string): PromptVersion | undefined {
    const template = this.templates.get(templateId);
    if (!template) return undefined;
    return template.versions.find(v => v.version === template.currentVersion);
  }

  public renderPrompt(
    templateId: string,
    variables: Record<string, any>,
    versionOverride?: string
  ): { renderedText: string; systemInstruction?: string; temperature?: number } {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Prompt template '${templateId}' not found.`);
    }

    const version = versionOverride
      ? template.versions.find(v => v.version === versionOverride)
      : template.versions.find(v => v.version === template.currentVersion);

    if (!version) {
      throw new Error(`Version '${versionOverride || template.currentVersion}' not found for template '${templateId}'.`);
    }

    // 1. Validate variables against schema
    this.validateVariables(version.variables, variables);

    // 2. Interpolate variables (Mustache style: {{variableName}})
    let rendered = version.templateContent;
    for (const varSchema of version.variables) {
      const val = variables[varSchema.name] !== undefined ? variables[varSchema.name] : varSchema.defaultValue;
      const placeholder = new RegExp(`{{\\s*${varSchema.name}\\s*}}`, 'g');
      const replacement = typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val ?? '');
      rendered = rendered.replace(placeholder, replacement);
    }

    return {
      renderedText: rendered,
      systemInstruction: version.systemInstruction,
      temperature: version.temperature,
    };
  }

  private validateVariables(schemaList: PromptVariableSchema[], suppliedVars: Record<string, any>) {
    for (const schema of schemaList) {
      const val = suppliedVars[schema.name];
      if (schema.required && (val === undefined || val === null || val === '')) {
        if (schema.defaultValue === undefined) {
          throw new Error(`Required prompt variable '${schema.name}' was not provided.`);
        }
      }

      if (val !== undefined && val !== null) {
        if (schema.type === 'NUMBER' && isNaN(Number(val))) {
          throw new Error(`Variable '${schema.name}' must be a valid number.`);
        }
        if (schema.type === 'BOOLEAN' && typeof val !== 'boolean') {
          throw new Error(`Variable '${schema.name}' must be a boolean.`);
        }
      }
    }
  }

  public createPromptVersion(
    templateId: string,
    newVersion: PromptVersion,
    setAsCurrent: boolean = false
  ): boolean {
    const template = this.templates.get(templateId);
    if (!template) return false;

    // Check if version string already exists
    if (template.versions.some(v => v.version === newVersion.version)) {
      throw new Error(`Version '${newVersion.version}' already exists for template '${templateId}'.`);
    }

    template.versions.unshift(newVersion);
    if (setAsCurrent) {
      template.currentVersion = newVersion.version;
    }
    return true;
  }

  public updateApprovalStatus(
    templateId: string,
    versionStr: string,
    status: PromptApprovalStatus,
    reviewerEmail: string
  ): boolean {
    const template = this.templates.get(templateId);
    if (!template) return false;

    const version = template.versions.find(v => v.version === versionStr);
    if (!version) return false;

    version.status = status;
    if (status === 'APPROVED') {
      version.approvedBy = reviewerEmail;
      version.approvedAt = new Date().toISOString();
      template.currentVersion = version.version;
    }
    return true;
  }

  public rollbackVersion(templateId: string, targetVersion: string, authorizedBy: string): boolean {
    const template = this.templates.get(templateId);
    if (!template) return false;

    const target = template.versions.find(v => v.version === targetVersion);
    if (!target) {
      throw new Error(`Target rollback version '${targetVersion}' does not exist.`);
    }

    if (target.status !== 'APPROVED' && target.status !== 'ARCHIVED') {
      throw new Error(`Cannot rollback to non-approved version '${targetVersion}' (Status: ${target.status}).`);
    }

    target.status = 'APPROVED';
    target.approvedBy = authorizedBy;
    target.approvedAt = new Date().toISOString();
    template.currentVersion = target.version;
    return true;
  }
}

export const promptPlatform = new EnterprisePromptPlatform();
