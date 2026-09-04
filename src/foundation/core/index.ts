/**
 * Foundation Core - Public API
 * المدخل الوحيد المسموح لباقي النظام
 */

export * from './result'
export * from './domainEvent'
export * from './errors'

// Re-export Money from existing domain/financial to keep single source
export { Money, CURRENCY_REGISTRY } from '../../domain/financial/money'
export type { CurrencyCode, CurrencyMeta } from '../../domain/financial/money'
export { Decimal } from '../../domain/financial/decimal'
export type { RoundingMode } from '../../domain/financial/decimal'
