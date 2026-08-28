/**
 * OmniPOS Enterprise Tool Marketplace Engine
 * Sprint 3.2
 */

import {
  EnterpriseTool,
  ToolExecutionResult,
  ToolParameterSchema
} from '../types';

export class ToolMarketplaceEngine {
  private tools: Map<string, EnterpriseTool> = new Map();
  private executionLog: ToolExecutionResult[] = [];

  constructor() {
    this.registerCoreTools();
  }

  private registerCoreTools() {
    const defaultTools: EnterpriseTool[] = [
      {
        toolId: 'tool-zatca-validator',
        name: 'ZATCA Phase 2 E-Invoice Validator',
        nameAr: 'أداة التحقق من الفوترة الإلكترونية (المرحلة 2)',
        category: 'ERP_ZATCA',
        version: '2.4.1',
        description: 'Validates XML invoice structures, cryptographic stamps, QR codes, and UUIDs against KSA ZATCA regulations.',
        requiredPermission: 'ZATCA_ADMIN',
        riskTier: 'READ_ONLY',
        parameters: [
          { name: 'invoiceXml', type: 'string', description: 'Raw UBL 2.1 XML invoice string', required: true },
          { name: 'invoiceType', type: 'string', description: 'STANDARD or SIMPLIFIED', required: true, defaultValue: 'SIMPLIFIED' }
        ],
        isInstalled: true,
        rateLimitPerMin: 300,
        usageCount: 4120,
        avgExecutionMs: 42,
      },
      {
        toolId: 'tool-erp-gl-poster',
        name: 'ERP General Ledger Journal Poster',
        nameAr: 'أداة ترحيل القيود المحاسبية لدفتر الأستاذ',
        category: 'FINANCE',
        version: '1.9.0',
        description: 'Posts balanced double-entry debits and credits to the ERP General Ledger with automatic cost-center mapping.',
        requiredPermission: 'ACCOUNTING_POST',
        riskTier: 'FINANCIAL_IMPACT',
        parameters: [
          { name: 'journalEntries', type: 'array', description: 'Array of debits and credits', required: true },
          { name: 'postingDate', type: 'string', description: 'YYYY-MM-DD posting date', required: true },
          { name: 'branchId', type: 'string', description: 'Branch cost center identifier', required: true }
        ],
        isInstalled: true,
        rateLimitPerMin: 60,
        usageCount: 1890,
        avgExecutionMs: 115,
      },
      {
        toolId: 'tool-inventory-stock-query',
        name: 'Real-Time Inventory Stock Inspector',
        nameAr: 'أداة فحص المخزون الفعلي بالمستودعات',
        category: 'INVENTORY',
        version: '3.1.0',
        description: 'Queries multi-branch inventory balances, minimum safety thresholds, and ingredient depletion velocity.',
        requiredPermission: 'INVENTORY_READ',
        riskTier: 'READ_ONLY',
        parameters: [
          { name: 'branchId', type: 'string', description: 'Branch identifier', required: true },
          { name: 'categoryFilter', type: 'string', description: 'PROTEIN, DAIRY, PRODUCE, DRY_GOODS', required: false }
        ],
        isInstalled: true,
        rateLimitPerMin: 200,
        usageCount: 9450,
        avgExecutionMs: 28,
      },
      {
        toolId: 'tool-purchase-order-generator',
        name: 'Automated Purchase Order Generator',
        nameAr: 'أداة إنشاء أوامر الشراء الآلية للموردين',
        category: 'INVENTORY',
        version: '2.0.2',
        description: 'Generates standardized Purchase Orders with supplier terms, lead time tracking, and tax line items.',
        requiredPermission: 'PROCUREMENT_WRITE',
        riskTier: 'HIGH_MUTATION',
        parameters: [
          { name: 'supplierId', type: 'string', description: 'Target supplier code', required: true },
          { name: 'items', type: 'array', description: 'List of SKUs, quantities and target unit price', required: true },
          { name: 'deliveryDate', type: 'string', description: 'Requested delivery date', required: true }
        ],
        isInstalled: true,
        rateLimitPerMin: 45,
        usageCount: 780,
        avgExecutionMs: 88,
      },
      {
        toolId: 'tool-staff-schedule-optimizer',
        name: 'Saudi Labor Law Shift Optimizer',
        nameAr: 'أداة جدولة الورديات وفق نظام العمل السعودي',
        category: 'STAFF',
        version: '2.5.0',
        description: 'Calculates compliant staffing rosters optimizing for peak branch sales forecasts and legal rest intervals.',
        requiredPermission: 'HR_MANAGE',
        riskTier: 'LOW_MUTATION',
        parameters: [
          { name: 'branchId', type: 'string', description: 'Target branch code', required: true },
          { name: 'forecastSalesSar', type: 'number', description: 'Projected weekly sales', required: true },
          { name: 'targetSaudizationPct', type: 'number', description: 'Nitaqat Saudization target', required: true, defaultValue: 30 }
        ],
        isInstalled: true,
        rateLimitPerMin: 30,
        usageCount: 650,
        avgExecutionMs: 210,
      },
      {
        toolId: 'tool-crm-rfm-segmenter',
        name: 'Customer RFM Segmentation Engine',
        nameAr: 'أداة تحليل وتقسيم العملاء حسب النشاط والإنفاق',
        category: 'CRM_MARKETING',
        version: '1.8.4',
        description: 'Computes Recency, Frequency, and Monetary scores across diner purchase histories for micro-targeting.',
        requiredPermission: 'MARKETING_READ',
        riskTier: 'READ_ONLY',
        parameters: [
          { name: 'timeHorizonDays', type: 'number', description: 'Lookback period in days', required: false, defaultValue: 90 },
          { name: 'minSpendSar', type: 'number', description: 'Minimum spend threshold', required: false, defaultValue: 100 }
        ],
        isInstalled: true,
        rateLimitPerMin: 50,
        usageCount: 1340,
        avgExecutionMs: 145,
      },
      {
        toolId: 'tool-sms-promo-dispatcher',
        name: 'Omnichannel SMS & WhatsApp Dispatcher',
        nameAr: 'أداة إرسال الحملات التسويقية (رسائل نصية وواتساب)',
        category: 'CRM_MARKETING',
        version: '2.1.0',
        description: 'Dispatches targeted marketing coupons and personalized promotions with margin-safety rate caps.',
        requiredPermission: 'MARKETING_DISPATCH',
        riskTier: 'FINANCIAL_IMPACT',
        parameters: [
          { name: 'segmentId', type: 'string', description: 'Target segment name', required: true },
          { name: 'messageText', type: 'string', description: 'Promotional message body', required: true },
          { name: 'discountCode', type: 'string', description: 'Unique voucher code', required: true }
        ],
        isInstalled: true,
        rateLimitPerMin: 20,
        usageCount: 420,
        avgExecutionMs: 180,
      },
      {
        toolId: 'tool-bank-settlement-matcher',
        name: 'Saudi Mada / SPAN Settlement Matcher',
        nameAr: 'أداة مطابقة تسويات مدى والبطاقات الائتمانية',
        category: 'FINANCE',
        version: '3.0.1',
        description: 'Reconciles daily POS payment gateway batches against Saudi Central Bank (SAMA) Mada settlement files.',
        requiredPermission: 'FINANCE_AUDIT',
        riskTier: 'READ_ONLY',
        parameters: [
          { name: 'batchDate', type: 'string', description: 'Reconciliation date', required: true },
          { name: 'terminalIds', type: 'array', description: 'List of POS terminal IDs', required: true }
        ],
        isInstalled: true,
        rateLimitPerMin: 40,
        usageCount: 2890,
        avgExecutionMs: 95,
      },
      {
        toolId: 'tool-recipe-cost-margin-eval',
        name: 'Recipe Food Cost & Margin Calculator',
        nameAr: 'أداة حساب تكلفة الوجبات وهوامش الربحية',
        category: 'INVENTORY',
        version: '1.5.0',
        description: 'Calculates live recipe yield costs by aggregating current ingredient procurement unit prices with scrap factor.',
        requiredPermission: 'MENU_MANAGE',
        riskTier: 'READ_ONLY',
        parameters: [
          { name: 'dishId', type: 'string', description: 'Menu item identifier', required: true },
          { name: 'sellingPriceSar', type: 'number', description: 'Menu retail price in SAR', required: true }
        ],
        isInstalled: true,
        rateLimitPerMin: 120,
        usageCount: 3780,
        avgExecutionMs: 34,
      }
    ];

    defaultTools.forEach(tool => this.tools.set(tool.toolId, tool));
  }

  public getAllTools(): EnterpriseTool[] {
    return Array.from(this.tools.values());
  }

  public getToolById(toolId: string): EnterpriseTool | undefined {
    return this.tools.get(toolId);
  }

  public toggleToolInstallation(toolId: string): boolean {
    const tool = this.tools.get(toolId);
    if (!tool) return false;
    tool.isInstalled = !tool.isInstalled;
    this.tools.set(toolId, tool);
    return tool.isInstalled;
  }

  /**
   * Executes an enterprise tool in a sandboxed, deterministic simulation harness
   */
  public async executeTool(
    toolId: string,
    parameters: Record<string, any>,
    callerRole: string = 'EXECUTOR'
  ): Promise<ToolExecutionResult> {
    const tool = this.tools.get(toolId);
    const startTime = Date.now();

    if (!tool) {
      return {
        toolId,
        executionId: `exec-${Date.now()}`,
        success: false,
        statusCode: 404,
        output: { error: `Tool with ID '${toolId}' not found in registry.` },
        executionTimeMs: 0,
        timestamp: new Date().toISOString(),
        auditHash: 'ERR_NOT_FOUND',
      };
    }

    if (!tool.isInstalled) {
      return {
        toolId,
        executionId: `exec-${Date.now()}`,
        success: false,
        statusCode: 403,
        output: { error: `Tool '${tool.name}' is currently disabled/uninstalled.` },
        executionTimeMs: 0,
        timestamp: new Date().toISOString(),
        auditHash: 'ERR_DISABLED',
      };
    }

    // Mock realistic business responses based on tool
    let output: any = {};
    let success = true;

    switch (toolId) {
      case 'tool-zatca-validator':
        output = {
          zatcaComplianceStatus: 'VALID_COMPLIANT',
          cryptographicStamp: 'MEYCIQDx4a0gY9fL7rZ08yvE+34=...',
          qrCodeDecoded: { seller: 'OmniPOS Fine Dining Co.', vatNumber: '310123456700003', timestamp: new Date().toISOString(), totalSar: 345.00, vatSar: 45.00 },
          schemaErrorsCount: 0,
          warnings: []
        };
        break;

      case 'tool-erp-gl-poster':
        output = {
          journalVoucherNumber: `JV-${Date.now().toString().slice(-6)}`,
          status: 'POSTED_TO_LEDGER',
          totalDebitsSar: 12500.00,
          totalCreditsSar: 12500.00,
          isBalanced: true,
          fiscalPeriod: '2026-Q3'
        };
        break;

      case 'tool-inventory-stock-query':
        output = {
          branchId: parameters.branchId || 'BR-OLAYA-01',
          stockItems: [
            { itemId: 'SKU-WAGYU-BEEF', name: 'Wagyu Beef Ribeye A5', onHandKg: 12.4, minSafetyKg: 25.0, status: 'REORDER_CRITICAL', unitCostSar: 185.0 },
            { itemId: 'SKU-TRUFFLE-OIL', name: 'Black Truffle Oil 500ml', onHandUnits: 4, minSafetyUnits: 10, status: 'REORDER_NEEDED', unitCostSar: 95.0 },
            { itemId: 'SKU-BRIOCHE-BUNS', name: 'Artisan Brioche Buns (Pack 12)', onHandPacks: 22, minSafetyPacks: 15, status: 'HEALTHY', unitCostSar: 18.0 },
            { itemId: 'SKU-PARMESAN-REGG', name: 'Parmigiano Reggiano 24M', onHandKg: 8.5, minSafetyKg: 5.0, status: 'HEALTHY', unitCostSar: 72.0 }
          ],
          criticalDepletionCount: 2
        };
        break;

      case 'tool-purchase-order-generator':
        const poNum = `PO-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
        output = {
          poNumber: poNum,
          supplierId: parameters.supplierId || 'SUP-ALMARAI-01',
          status: 'DRAFT_GENERATED',
          itemsOrderedCount: Array.isArray(parameters.items) ? parameters.items.length : 3,
          subtotalSar: 4850.00,
          vat15PctSar: 727.50,
          totalAmountSar: 5577.50,
          paymentTerms: 'NET_30_DAYS'
        };
        break;

      case 'tool-staff-schedule-optimizer':
        output = {
          branchId: parameters.branchId || 'BR-OLAYA-01',
          shiftsPlanned: 28,
          totalLaborHours: 224,
          saudizationAchievedPct: 32.5,
          laborCostRatioPct: 18.2,
          overtimeViolations: 0,
          saudiLaborLawArticles84_85Compliant: true
        };
        break;

      case 'tool-crm-rfm-segmenter':
        output = {
          totalCustomersAnalyzed: 4520,
          segments: {
            CHAMPIONS: { count: 480, avgSpendSar: 1250, avgFrequency: 8.2 },
            LOYALISTS: { count: 920, avgSpendSar: 740, avgFrequency: 4.1 },
            AT_RISK_VIP: { count: 210, avgSpendSar: 980, avgFrequency: 1.2, churnRiskPct: 68 },
            LAPSED: { count: 1850, avgSpendSar: 220, avgFrequency: 1.0 }
          }
        };
        break;

      case 'tool-sms-promo-dispatcher':
        output = {
          campaignId: `CMP-${Date.now().toString().slice(-5)}`,
          messagesDispatched: 210,
          deliveryRatePct: 99.1,
          voucherAssigned: parameters.discountCode || 'VIP-SAVE-20',
          estimatedRevenueUpliftSar: 18500.00
        };
        break;

      case 'tool-bank-settlement-matcher':
        output = {
          batchDate: parameters.batchDate || new Date().toISOString().split('T')[0],
          posReportedCardTotalSar: 34210.00,
          madaBankSettledTotalSar: 34210.00,
          varianceSar: 0.00,
          reconciliationStatus: 'PERFECT_MATCH',
          terminalsMatchedCount: 4
        };
        break;

      case 'tool-recipe-cost-margin-eval':
        const price = parameters.sellingPriceSar || 85.0;
        const foodCost = 23.80;
        output = {
          dishId: parameters.dishId || 'DISH-WAGYU-BURGER',
          sellingPriceSar: price,
          ingredientCostSar: foodCost,
          foodCostPercentage: Number(((foodCost / price) * 100).toFixed(1)),
          grossMarginSar: Number((price - foodCost).toFixed(2)),
          marginTier: 'HIGH_PROFITABILITY'
        };
        break;

      default:
        output = { executed: true, paramsReceived: parameters };
    }

    const duration = Date.now() - startTime;
    tool.usageCount += 1;
    tool.avgExecutionMs = Math.round((tool.avgExecutionMs * 0.9) + (duration * 0.1));

    const result: ToolExecutionResult = {
      toolId,
      executionId: `exec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      success,
      statusCode: 200,
      output,
      executionTimeMs: Math.max(12, duration),
      timestamp: new Date().toISOString(),
      auditHash: `SHA256_${Math.random().toString(36).substring(2, 14).toUpperCase()}`
    };

    this.executionLog.unshift(result);
    if (this.executionLog.length > 100) this.executionLog.pop();

    return result;
  }

  public getRecentExecutions(limit: number = 30): ToolExecutionResult[] {
    return this.executionLog.slice(0, limit);
  }
}

export const toolMarketplace = new ToolMarketplaceEngine();
