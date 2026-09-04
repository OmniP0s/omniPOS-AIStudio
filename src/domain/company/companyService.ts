/**
 * Company Service / Use Cases - Application Layer
 * Orchestrates domain rules + repository + outbox
 */

import { createCompany, CompanyRules, type Company, type CompanyId, type OrganizationId } from './companyEntity'
import type { ICompanyRepository, CreateCompanyInput, UpdateCompanyInput, CompanySummary } from './companyRepository'
import { createDomainEvent, DOMAIN_EVENTS } from '../../foundation/core/domainEvent'
import { ok, err, type Result, type DomainError } from '../../foundation/core/result'

// هذا هو Use Case الحقيقي - لا يعتمد على Express أو Postgres مباشرة
export class CompanyService {
  constructor(private readonly repo: ICompanyRepository) {}

  async listCompanies(tenantId: OrganizationId): Promise<Company[]> {
    return this.repo.findMany({ tenantId, isActive: true })
  }

  async listSummaries(tenantId: OrganizationId): Promise<CompanySummary[]> {
    return this.repo.findSummaries(tenantId)
  }

  async getCompany(tenantId: OrganizationId, companyId: CompanyId): Promise<Company | null> {
    return this.repo.findById(tenantId, companyId)
  }

  async createCompany(input: CreateCompanyInput): Promise<Result<Company, DomainError>> {
    // 1. Validate invariants
    if (!CompanyRules.validateVatNumber(input.vatNumber)) {
      return err({ code: 'INVALID_VAT', message: `VAT ${input.vatNumber} invalid` })
    }
    if (!CompanyRules.validateCrNumber(input.crNumber)) {
      return err({ code: 'INVALID_CR', message: `CR ${input.crNumber} invalid` })
    }

    // 2. Check uniqueness
    const existingByCode = await this.repo.findByCode(input.tenantId, input.code)
    if (existingByCode) {
      return err({ code: 'COMPANY_CODE_EXISTS', message: `Company code ${input.code} already exists` })
    }
    const existingByVat = await this.repo.findByVat(input.tenantId, input.vatNumber)
    if (existingByVat) {
      return err({ code: 'VAT_EXISTS', message: `VAT ${input.vatNumber} already used by company ${existingByVat.code}` })
    }

    // 3. Create entity
    const companyId = `comp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const company = createCompany({
      id: companyId,
      tenantId: input.tenantId,
      code: input.code,
      nameEn: input.nameEn,
      nameAr: input.nameAr,
      vatNumber: input.vatNumber,
      crNumber: input.crNumber,
      currency: input.currency,
      country: input.country,
    })

    // 4. Save + emit event (في التنفيذ الحقيقي: داخل UnitOfWork + outbox)
    const saved = await this.repo.save(company)

    // 5. Domain Event (سيُحفظ في outbox_events في Infrastructure layer)
    const event = createDomainEvent({
      eventType: DOMAIN_EVENTS.COMPANY_CREATED,
      aggregateType: 'company',
      aggregateId: saved.id,
      tenantId: saved.tenantId,
      companyId: saved.id,
      payload: {
        companyId: saved.id,
        code: saved.code,
        vatNumber: saved.vatNumber,
      },
      correlationId: input.correlationId,
      idempotencyKey: input.idempotencyKey,
    })

    // في Infrastructure: await outbox.save(event) داخل نفس transaction

    return ok(saved)
  }

  async updateCompany(input: UpdateCompanyInput): Promise<Result<Company, DomainError>> {
    const existing = await this.repo.findById(input.tenantId, input.companyId)
    if (!existing) {
      return err({ code: 'COMPANY_NOT_FOUND', message: `Company ${input.companyId} not found` })
    }

    const updated: Company = {
      ...existing,
      nameEn: input.nameEn ?? existing.nameEn,
      nameAr: input.nameAr ?? existing.nameAr,
      config: { ...existing.config, ...input.config },
      updatedAt: new Date().toISOString(),
    }

    const saved = await this.repo.save(updated)
    return ok(saved)
  }

  async deactivateCompany(tenantId: OrganizationId, companyId: CompanyId): Promise<Result<void, DomainError>> {
    const branchesCount = await this.repo.countBranches(tenantId, companyId)
    const check = CompanyRules.canDeactivate({ id: companyId } as Company, branchesCount)
    if (!check.allowed) {
      return err({ code: 'COMPANY_HAS_BRANCHES', message: check.reason! })
    }
    await this.repo.deactivate(tenantId, companyId)
    return ok(undefined)
  }

  // Consolidated Sales - مثال على تقرير مجمع
  async getConsolidatedSales(tenantId: OrganizationId, from: string, to: string): Promise<{
    totalSalesMinor: bigint
    currency: string
    byCompany: { companyId: string; companyName: string; salesMinor: bigint; ordersCount: number }[]
  }> {
    // في التنفيذ الحقيقي: query يجمع من orders + company
    const summaries = await this.repo.findSummaries(tenantId)
    // Mock aggregation - في الحقيقة JOIN مع orders
    return {
      totalSalesMinor: summaries.reduce((sum, s) => sum + s.totalSalesThisMonthMinor, 0n),
      currency: 'SAR',
      byCompany: summaries.map(s => ({
        companyId: s.companyId,
        companyName: s.nameEn,
        salesMinor: s.totalSalesThisMonthMinor,
        ordersCount: 0, // يُحسب من orders
      })),
    }
  }
}
