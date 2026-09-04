/**
 * DomainEvent - الأساس الثابت للأحداث
 * كل حدث يجب أن يحمل tenantId + companyId + correlationId
 */

export interface DomainEventBase {
  eventId: string
  eventType: string
  aggregateType: string
  aggregateId: string
  tenantId: string
  companyId?: string
  branchId?: string
  payload: Record<string, unknown>
  vectorClock?: Record<string, number>
  idempotencyKey: string
  correlationId: string
  occurredAt: string // ISO
  version: number
}

export type DomainEvent<TPayload = Record<string, unknown>> = DomainEventBase & {
  payload: TPayload
}

// Factory helper - ثابت
export function createDomainEvent(params: {
  eventType: string
  aggregateType: string
  aggregateId: string
  tenantId: string
  companyId?: string
  branchId?: string
  payload: Record<string, unknown>
  correlationId: string
  idempotencyKey?: string
}): DomainEvent {
  const now = new Date().toISOString()
  return {
    eventId: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    eventType: params.eventType,
    aggregateType: params.aggregateType,
    aggregateId: params.aggregateId,
    tenantId: params.tenantId,
    companyId: params.companyId,
    branchId: params.branchId,
    payload: params.payload,
    idempotencyKey: params.idempotencyKey || `idem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    correlationId: params.correlationId,
    occurredAt: now,
    version: 1,
  }
}

// Domain Events Contracts - ثابتة
export const DOMAIN_EVENTS = {
  ORDER_CREATED: 'order.created',
  ORDER_PAID: 'order.paid',
  ORDER_VOIDED: 'order.voided',
  ORDER_COMPLETED: 'order.completed', // -> triggers ZATCA
  SHIFT_OPENED: 'shift.opened',
  SHIFT_CLOSED: 'shift.closed',
  COMPANY_CREATED: 'company.created',
  COMPANY_UPDATED: 'company.updated',
  STOCK_ADJUSTED: 'inventory.stock_adjusted',
  ZATCA_REPORTED: 'zatca.reported',
} as const
