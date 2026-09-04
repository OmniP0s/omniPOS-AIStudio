/**
 * Company Entity - الكيان القانوني - الأساس لنظام الشركات
 * Bounded Context: organization / company
 */

export type CompanyId = string
export type OrganizationId = string // tenantId

export interface CompanyConfig {
  zatcaEnabled: boolean
  zatcaEnv: 'sandbox' | 'simulation' | 'production'
  defaultTaxRate: number // 0.15
  currency: string // SAR
  allowNegativeStock: boolean
  receiptTemplate?: string
  logoUrl?: string
}

export interface Company {
  id: CompanyId
  tenantId: OrganizationId
  code: string // Unique per tenant: BRAND_COFFEE
  nameEn: string
  nameAr: string
  legalNameEn?: string
  legalNameAr?: string
  vatNumber: string // 15 digits
  crNumber: string // 10 digits
  country: string // SA, AE, EG
  currency: string // SAR
  config: CompanyConfig
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Domain Rules (Invariants)
export class CompanyRules {
  static validateVatNumber(vat: string): boolean {
    // ZATCA VAT: 15 digits, starts with 3, ends with 3
    return /^3\d{13}3$/.test(vat)
  }

  static validateCrNumber(cr: string): boolean {
    // Saudi CR: 10 digits
    return /^\d{10}$/.test(cr)
  }

  static canDeactivate(company: Company, activeBranchesCount: number): { allowed: boolean; reason?: string } {
    if (activeBranchesCount > 0) {
      return { allowed: false, reason: `Cannot deactivate company with ${activeBranchesCount} active branches` }
    }
    return { allowed: true }
  }
}

// Factory
export function createCompany(params: {
  id: string
  tenantId: string
  code: string
  nameEn: string
  nameAr: string
  vatNumber: string
  crNumber: string
  currency?: string
  country?: string
}): Company {
  if (!CompanyRules.validateVatNumber(params.vatNumber)) {
    throw new Error(`Invalid VAT number: ${params.vatNumber} - must be 15 digits starting and ending with 3`)
  }
  if (!CompanyRules.validateCrNumber(params.crNumber)) {
    throw new Error(`Invalid CR number: ${params.crNumber} - must be 10 digits`)
  }

  const now = new Date().toISOString()
  return {
    id: params.id,
    tenantId: params.tenantId,
    code: params.code.toUpperCase(),
    nameEn: params.nameEn,
    nameAr: params.nameAr,
    vatNumber: params.vatNumber,
    crNumber: params.crNumber,
    country: params.country || 'SA',
    currency: params.currency || 'SAR',
    config: {
      zatcaEnabled: true,
      zatcaEnv: 'simulation',
      defaultTaxRate: 0.15,
      currency: params.currency || 'SAR',
      allowNegativeStock: false,
    },
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }
}
