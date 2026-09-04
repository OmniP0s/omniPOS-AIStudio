/**
 * Company Repository Contract - Port (Hexagonal)
 * لا يعتمد على Postgres، فقط Interface
 */

import type { Company, CompanyId, OrganizationId } from './companyEntity'

export interface CompanyFilter {
  tenantId: OrganizationId
  isActive?: boolean
  search?: string // يبحث في nameEn, nameAr, code, vatNumber
}

export interface CompanySummary {
  companyId: CompanyId
  code: string
  nameEn: string
  nameAr: string
  vatNumber: string
  branchesCount: number
  terminalsCount: number
  totalSalesThisMonthMinor: bigint
  currency: string
  isActive: boolean
}

export interface ICompanyRepository {
  findById(tenantId: OrganizationId, companyId: CompanyId): Promise<Company | null>
  findByCode(tenantId: OrganizationId, code: string): Promise<Company | null>
  findByVat(tenantId: OrganizationId, vatNumber: string): Promise<Company | null>
  findMany(filter: CompanyFilter): Promise<Company[]>
  findSummaries(tenantId: OrganizationId): Promise<CompanySummary[]>
  save(company: Company): Promise<Company>
  deactivate(tenantId: OrganizationId, companyId: CompanyId): Promise<void>
  countBranches(tenantId: OrganizationId, companyId: CompanyId): Promise<number>
}

// Use Cases Contracts
export interface CreateCompanyInput {
  tenantId: OrganizationId
  code: string
  nameEn: string
  nameAr: string
  vatNumber: string
  crNumber: string
  currency?: string
  country?: string
  correlationId: string
  idempotencyKey: string
}

export interface UpdateCompanyInput {
  tenantId: OrganizationId
  companyId: CompanyId
  nameEn?: string
  nameAr?: string
  config?: Partial<Company['config']>
  correlationId: string
}
