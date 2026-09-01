import { Router, type Request, type Response } from "express";
import { TenantRepositoryFactory } from "../src/server/db/tenantRepository";
import { TenantContextHolder } from "../src/server/security/tenantContext";
import { OutboxRelayWorker } from "../src/server/sync/outboxRelayWorker";
import { getAccountingServices } from "../src/domain/accounting";
import { CsidLifecycleManager } from "../src/domain/zatca";
import { Money } from "../src/domain/financial/money";

export const enterpriseRouter = Router();

function requireTenant(req: Request, res: Response): string | null {
  const tenantId = req.tenantId ?? req.user?.tenantId;
  if (!tenantId) {
    res.status(403).json({
      error: {
        code: "TENANT_CONTEXT_REQUIRED",
        message: "A verified tenant context is required for this endpoint.",
      },
    });
    return null;
  }
  return tenantId;
}

// Enterprise Tenant-Scoped Orders Endpoints
enterpriseRouter.get("/api/orders", async (req: Request, res: Response) => {
  try {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;
    const branchId = String(req.query.branchId || "");
    const status = req.query.status as any;

    const orderRepo = TenantRepositoryFactory.getOrderRepository();
    TenantContextHolder.setTenantId(tenantId);

    const query: Record<string, any> = {};
    if (branchId) query.branchId = branchId;
    if (status) query.status = status;

    const orders = await orderRepo.findMany(tenantId, query);
    return res.json({ tenantId, count: orders.length, orders });
  } catch (err: any) {
    return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: err.message } });
  }
});

enterpriseRouter.post("/api/orders", async (req: Request, res: Response) => {
  try {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;
    const order = req.body;
    if (!order || !order.id) {
      return res.status(400).json({ error: "Invalid order payload" });
    }

    order.tenantId = tenantId;
    TenantContextHolder.setTenantId(tenantId);

    const uow = TenantRepositoryFactory.getUnitOfWork(tenantId);
    const saved = await uow.withTransaction(tenantId, ({ orderRepo }) =>
      orderRepo.save(tenantId, order)
    );

    return res.status(201).json({ success: true, order: saved });
  } catch (err: any) {
    return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: err.message } });
  }
});

enterpriseRouter.get("/api/orders/:id", async (req: Request, res: Response) => {
  try {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;
    const { id } = req.params;

    TenantContextHolder.setTenantId(tenantId);
    const orderRepo = TenantRepositoryFactory.getOrderRepository();
    const order = await orderRepo.findById(tenantId, id);

    if (!order) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Order not found" } });
    }

    return res.json({ tenantId, order });
  } catch (err: any) {
    return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: err.message } });
  }
});

// Enterprise Tenant-Scoped Inventory Endpoints
enterpriseRouter.get("/api/inventory", async (req: Request, res: Response) => {
  try {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;
    TenantContextHolder.setTenantId(tenantId);
    const invRepo = TenantRepositoryFactory.getInventoryRepository();
    const items = await invRepo.findMany(tenantId);
    return res.json({ tenantId, count: items.length, items });
  } catch (err: any) {
    return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: err.message } });
  }
});

// Enterprise Tenant-Scoped Shifts Endpoints
enterpriseRouter.get("/api/shifts/active", async (req: Request, res: Response) => {
  try {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;
    const branchId = String(req.query.branchId || "branch-01");
    const terminalId = String(req.query.terminalId || "POS-01");
    const userId = String(req.query.userId || req.user?.id || "usr-cashier-01");

    TenantContextHolder.setTenantId(tenantId);
    const shiftRepo = TenantRepositoryFactory.getShiftRepository();
    const activeShift = await shiftRepo.findActiveShift(tenantId, branchId, terminalId, userId);

    return res.json({ tenantId, activeShift });
  } catch (err: any) {
    return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: err.message } });
  }
});

enterpriseRouter.post("/api/shifts", async (req: Request, res: Response) => {
  try {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;
    const shift = req.body;
    if (!shift || !shift.id) {
      return res.status(400).json({ error: "Invalid shift payload" });
    }

    shift.tenantId = tenantId;
    TenantContextHolder.setTenantId(tenantId);
    const shiftRepo = TenantRepositoryFactory.getShiftRepository();
    const saved = await shiftRepo.save(tenantId, shift);

    return res.status(201).json({ success: true, shift: saved });
  } catch (err: any) {
    return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: err.message } });
  }
});

enterpriseRouter.post("/api/sync/outbox/batch", async (req: Request, res: Response) => {
  try {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;
    const { batch } = req.body;
    if (!Array.isArray(batch)) {
      return res.status(400).json({ error: "Invalid payload: batch array is required" });
    }

    TenantContextHolder.setTenantId(tenantId);
    const outboxService = TenantRepositoryFactory.getOutboxService();
    const batchResult = await outboxService.processSyncBatch(tenantId, batch);

    return res.json({
      success: batchResult.success,
      result: batchResult,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: err.message } });
  }
});

enterpriseRouter.get("/api/sync/outbox/pending", async (req: Request, res: Response) => {
  try {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;
    const limit = parseInt(req.query.limit as string, 10) || 50;

    TenantContextHolder.setTenantId(tenantId);
    const outboxService = TenantRepositoryFactory.getOutboxService();
    const pending = await outboxService.getPendingBatch(tenantId, limit);

    return res.json({ tenantId, pendingCount: pending.length, events: pending });
  } catch (err: any) {
    return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: err.message } });
  }
});

enterpriseRouter.post("/api/sync/outbox/dispatch", async (req: Request, res: Response) => {
  try {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;
    const batchSize = parseInt(req.body.batchSize as string, 10) || 25;

    TenantContextHolder.setTenantId(tenantId);
    const result = await OutboxRelayWorker.dispatchTenantEvents(tenantId, batchSize);

    return res.json({ success: true, result });
  } catch (err: any) {
    return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: err.message } });
  }
});

const serverCsidManager = new CsidLifecycleManager();

// ==========================================
// ZATCA Phase 2 E-Invoicing Endpoints
// ==========================================

// 2. Generate Compliant CSR for ZATCA EGS Onboarding
enterpriseRouter.post("/api/zatca/csr/generate", (req: Request, res: Response) => {
  try {
    const { commonName, egsSerialNumber, organizationIdentifier, organizationUnitName, organizationName, location } = req.body;

    const csrResult = serverCsidManager.generateCsr({
      commonName: commonName || "OmniPOS EGS Main Branch",
      egsSerialNumber: egsSerialNumber || "1-OmniPOS|2-Branch01|3-Term01",
      organizationIdentifier: organizationIdentifier || "300998877600003",
      organizationUnitName: organizationUnitName || "Riyadh Olaya Branch",
      organizationName: organizationName || "شركة الحلول الذكية للتجارة والمطاعم",
      countryName: "SA",
      invoiceType: "1100",
      location: location || "Riyadh",
      industry: "Food & Beverage",
    });

    return res.json({
      success: true,
      egsSerialNumber,
      csrPem: csrResult.csrPem,
      csrBase64: csrResult.csrBase64,
      publicKeyPem: csrResult.publicKeyPem,
    });
  } catch (err: any) {
    return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: err.message } });
  }
});

// 3. Register CSID Certificate
enterpriseRouter.post("/api/zatca/csid/register", (req: Request, res: Response) => {
  try {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;
    const { branchId, egsSerialNumber, csidType, binarySecurityToken, secret, requestId } = req.body;

    if (!binarySecurityToken || !secret) {
      return res.status(400).json({ error: "Missing required binarySecurityToken or secret" });
    }

    serverCsidManager.registerCsid({
      tenantId,
      branchId: branchId || "branch-01",
      egsSerialNumber: egsSerialNumber || "1-OmniPOS|2-Branch01|3-Term01",
      csidType: csidType || "PRODUCTION",
      binarySecurityToken,
      secret,
      requestId: requestId || `req-${Date.now()}`,
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
      isActive: true,
    });

    return res.json({ success: true, message: "CSID certificate registered successfully." });
  } catch (err: any) {
    return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: err.message } });
  }
});

// ==========================================
// Double-Entry Accounting Endpoints
// ==========================================

// 4. Get Chart of Accounts
enterpriseRouter.get("/api/accounting/chart-of-accounts", (req: Request, res: Response) => {
  try {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;
    const accounts = getAccountingServices(tenantId).engine.getAccounts(tenantId);
    return res.json({
      tenantId,
      accounts: accounts.map(a => ({
        ...a,
        balanceFormatted: a.balance.formatMajor(),
        balanceAmount: a.balance.toMajor(),
      })),
    });
  } catch (err: any) {
    return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: err.message } });
  }
});

// 5. Get Journal Entries
enterpriseRouter.get("/api/accounting/journal-entries", (req: Request, res: Response) => {
  try {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;
    const entries = getAccountingServices(tenantId).engine.getEntries(tenantId);
    return res.json({
      tenantId,
      count: entries.length,
      entries: entries.map(e => ({
        ...e,
        lines: e.lines.map(l => ({
          ...l,
          debitFormatted: l.debit.formatMajor(),
          creditFormatted: l.credit.formatMajor(),
          debitAmount: l.debit.toMajor(),
          creditAmount: l.credit.toMajor(),
        })),
      })),
    });
  } catch (err: any) {
    return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: err.message } });
  }
});

// 6. Post Manual or Automated Journal Entry
enterpriseRouter.post("/api/accounting/journal-entries", (req: Request, res: Response) => {
  try {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;
    const { branchId, entryNumber, date, reference, sourceType, sourceId, idempotencyKey, memo, postedBy, lines } = req.body;

    if (!lines || !Array.isArray(lines) || lines.length < 2) {
      return res.status(400).json({ error: "Journal entry must contain at least two lines." });
    }

    const domainLines = lines.map((l: any, idx: number) => ({
      id: l.id || `line-${idx + 1}`,
      accountId: l.accountId || `coa-${l.accountCode}-${tenantId}`,
      accountCode: l.accountCode,
      accountName: l.accountName,
      debit: Money.fromMajor(l.debit || 0, "SAR"),
      credit: Money.fromMajor(l.credit || 0, "SAR"),
      memo: l.memo,
      costCenter: l.costCenter,
      branchId: l.branchId || branchId,
    }));

    const postedEntry = getAccountingServices(tenantId).engine.postJournalEntry({
      tenantId,
      branchId: branchId || "branch-01",
      entryNumber: entryNumber || `JE-${Date.now()}`,
      date: date || new Date().toISOString().split("T")[0],
      reference: reference || "MANUAL",
      sourceType: sourceType || "MANUAL_JOURNAL",
      sourceId: sourceId || `src-${Date.now()}`,
      idempotencyKey: idempotencyKey || `idemp-manual-${Date.now()}`,
      memo: memo || "Manual Journal Entry",
      postedBy: postedBy || req.user?.id || "Accountant",
      postedAt: new Date().toISOString(),
      lines: domainLines,
    });

    return res.json({ success: true, entry: postedEntry });
  } catch (err: any) {
    return res.status(400).json({ error: { code: "ACCOUNTING_ERROR", message: err.message } });
  }
});

// 7. Reverse a Journal Entry Immutably
enterpriseRouter.post("/api/accounting/journal-entries/:id/reverse", (req: Request, res: Response) => {
  try {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;
    const { id } = req.params;
    const { reason, postedBy } = req.body;

    const reversal = getAccountingServices(tenantId).engine.reverseJournalEntry({
      tenantId,
      originalEntryId: id,
      reason: reason || "Manager requested reversal",
      postedBy: postedBy || req.user?.id || "Accountant",
    });

    return res.json({ success: true, reversalEntry: reversal });
  } catch (err: any) {
    return res.status(400).json({ error: { code: "REVERSAL_ERROR", message: err.message } });
  }
});

// 8. Generate Trial Balance & Mathematical Verification
enterpriseRouter.get("/api/accounting/trial-balance", (req: Request, res: Response) => {
  try {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;
    const trialBalance = getAccountingServices(tenantId).reporting.generateTrialBalance(tenantId);
    return res.json({
      ...trialBalance,
      totalDebitsFormatted: trialBalance.totalDebits.formatMajor(),
      totalCreditsFormatted: trialBalance.totalCredits.formatMajor(),
      varianceFormatted: trialBalance.variance.formatMajor(),
      rows: trialBalance.rows.map(r => ({
        ...r,
        debitFormatted: r.debitTotal.formatMajor(),
        creditFormatted: r.creditTotal.formatMajor(),
        debitAmount: r.debitTotal.toMajor(),
        creditAmount: r.creditTotal.toMajor(),
      })),
    });
  } catch (err: any) {
    return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: err.message } });
  }
});

// 9. Generate Profit & Loss Statement
enterpriseRouter.get("/api/accounting/profit-and-loss", (req: Request, res: Response) => {
  try {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;
    const pnl = getAccountingServices(tenantId).reporting.generateProfitAndLoss(tenantId);
    return res.json({
      ...pnl,
      grossRevenueFormatted: pnl.grossRevenue.formatMajor(),
      totalDiscountsFormatted: pnl.totalDiscounts.formatMajor(),
      netRevenueFormatted: pnl.netRevenue.formatMajor(),
      totalCogsFormatted: pnl.totalCogs.formatMajor(),
      grossProfitFormatted: pnl.grossProfit.formatMajor(),
      totalExpensesFormatted: pnl.totalExpenses.formatMajor(),
      netOperatingIncomeFormatted: pnl.netOperatingIncome.formatMajor(),
    });
  } catch (err: any) {
    return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: err.message } });
  }
});

// 10. Generate Balance Sheet Statement
enterpriseRouter.get("/api/accounting/balance-sheet", (req: Request, res: Response) => {
  try {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;
    const bs = getAccountingServices(tenantId).reporting.generateBalanceSheet(tenantId);
    return res.json({
      ...bs,
      totalAssetsFormatted: bs.totalAssets.formatMajor(),
      totalLiabilitiesFormatted: bs.totalLiabilities.formatMajor(),
      totalEquityFormatted: bs.totalEquity.formatMajor(),
      liabilitiesAndEquityFormatted: bs.liabilitiesAndEquity.formatMajor(),
      varianceFormatted: bs.variance.formatMajor(),
    });
  } catch (err: any) {
    return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: err.message } });
  }
});

// 11. Generate ZATCA VAT Return Form 2026
enterpriseRouter.get("/api/accounting/zatca-vat-return", (req: Request, res: Response) => {
  try {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;
    const vatReturn = getAccountingServices(tenantId).reporting.generateZatcaVatReturn(tenantId);
    return res.json({
      ...vatReturn,
      standardRatedSalesFormatted: vatReturn.standardRatedSales.formatMajor(),
      standardRatedOutputVatFormatted: vatReturn.standardRatedOutputVat.formatMajor(),
      standardRatedPurchasesFormatted: vatReturn.standardRatedPurchases.formatMajor(),
      standardRatedInputVatFormatted: vatReturn.standardRatedInputVat.formatMajor(),
      inputVatDeductibleFormatted: vatReturn.inputVatDeductible.formatMajor(),
      netVatDueFormatted: vatReturn.netVatDue.formatMajor(),
    });
  } catch (err: any) {
    return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: err.message } });
  }
});


// AI Forecasting & Restaurant Intelligence (Powered by Gemini)
