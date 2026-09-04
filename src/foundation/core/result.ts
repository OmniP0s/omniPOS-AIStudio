/**
 * Result<T,E> - Functional error handling for Domain Layer
 * الأساس الثابت: لا نرمي Exceptions في Domain، نرجع Result
 */

export type ResultOk<T> = { ok: true; value: T }
export type ResultErr<E> = { ok: false; error: E }
export type Result<T, E = DomainError> = ResultOk<T> | ResultErr<E>

export interface DomainError {
  code: string
  message: string
  details?: Record<string, unknown>
}

export function ok<T>(value: T): ResultOk<T> {
  return { ok: true, value }
}

export function err<E extends DomainError>(error: E): ResultErr<E> {
  return { ok: false, error }
}

export function isOk<T, E>(r: Result<T, E>): r is ResultOk<T> {
  return r.ok === true
}

export function isErr<T, E>(r: Result<T, E>): r is ResultErr<E> {
  return r.ok === false
}

// Example usage:
// function createOrder(...): Result<Order, DomainError> {
//   if (!items.length) return err({ code: 'EMPTY_ORDER', message: '...' })
//   return ok(order)
// }
