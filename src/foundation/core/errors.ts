/**
 * Domain Errors - هرم الأخطاء الثابت
 */

export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 400,
    public readonly details?: Record<string, unknown>,
    public readonly correlationId?: string
  ) {
    super(message)
    this.name = this.constructor.name
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
        correlationId: this.correlationId,
        timestamp: new Date().toISOString(),
      },
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>, correlationId?: string) {
    super('VALIDATION_ERROR', message, 400, details, correlationId)
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string, id: string, correlationId?: string) {
    super('NOT_FOUND', `${entity} with id ${id} not found`, 404, { entity, id }, correlationId)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', details?: Record<string, unknown>, correlationId?: string) {
    super('FORBIDDEN', message, 403, details, correlationId)
  }
}

export class CompanyAccessDeniedError extends AppError {
  constructor(companyId: string, correlationId?: string) {
    super('COMPANY_ACCESS_DENIED', `Access denied to company ${companyId}`, 403, { companyId }, correlationId)
  }
}

export class TenantMismatchError extends AppError {
  constructor(correlationId?: string) {
    super('TENANT_MISMATCH', 'Client-supplied tenant context does not match authenticated tenant', 403, undefined, correlationId)
  }
}

export class ConflictError extends AppError {
  constructor(code: string, message: string, details?: Record<string, unknown>, correlationId?: string) {
    super(code, message, 409, details, correlationId)
  }
}

export class InsufficientStockError extends AppError {
  constructor(sku: string, available: number, requested: number, correlationId?: string) {
    super('INSUFFICIENT_STOCK', `Insufficient stock for ${sku}`, 409, { sku, available, requested }, correlationId)
  }
}

export class IdempotencyKeyRequiredError extends AppError {
  constructor(correlationId?: string) {
    super('IDEMPOTENCY_KEY_REQUIRED', 'Idempotency-Key header is required for this operation', 400, undefined, correlationId)
  }
}
