/**
 * API Client Foundation - ثابت
 * يتعامل مع: Idempotency, Correlation, Company Header, Offline Queue
 */

export interface ApiClientConfig {
  baseUrl: string
  getAuthToken: () => string | null
  getTenantContext: () => { tenantId?: string; companyId?: string; branchId?: string; correlationId?: string }
  onOfflineQueue?: (req: QueuedRequest) => Promise<void>
}

export interface QueuedRequest {
  id: string
  url: string
  method: string
  body: any
  headers: Record<string, string>
  timestamp: string
}

export class ApiClient {
  constructor(private config: ApiClientConfig) {}

  private buildHeaders(extra?: Record<string, string>): Record<string, string> {
    const ctx = this.config.getTenantContext()
    const token = this.config.getAuthToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...extra,
    }
    if (token) headers['Authorization'] = `Bearer ${token}`
    if (ctx.correlationId) headers['X-Correlation-Id'] = ctx.correlationId
    else headers['X-Correlation-Id'] = `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    if (ctx.companyId) headers['X-Company-Id'] = ctx.companyId
    if (ctx.branchId) headers['X-Branch-Id'] = ctx.branchId

    // Idempotency for write methods - auto-generated if not provided
    if (!headers['Idempotency-Key'] && extra && ['POST','PUT','PATCH'].includes(extra['method'] || '')) {
      headers['Idempotency-Key'] = `idem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    }

    return headers
  }

  async request<T>(path: string, options: { method?: string; body?: any; headers?: Record<string, string> } = {}): Promise<T> {
    const method = options.method || 'GET'
    const headers = this.buildHeaders({ ...options.headers, method })

    // Auto idempotency for writes
    if (['POST','PUT','PATCH'].includes(method) && !headers['Idempotency-Key']) {
      headers['Idempotency-Key'] = `idem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    }

    const url = `${this.config.baseUrl}${path}`

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      })

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new ApiError(res.status, errBody?.error?.code || 'UNKNOWN', errBody?.error?.message || res.statusText, errBody)
      }

      return (await res.json()) as T
    } catch (e) {
      // Offline handling
      if (e instanceof TypeError && e.message.includes('fetch') && !navigator.onLine) {
        if (this.config.onOfflineQueue && ['POST','PUT','PATCH'].includes(method)) {
          const queued: QueuedRequest = {
            id: headers['Idempotency-Key'],
            url: path,
            method,
            body: options.body,
            headers,
            timestamp: new Date().toISOString(),
          }
          await this.config.onOfflineQueue(queued)
          // Return queued marker
          return { queued: true, id: queued.id } as unknown as T
        }
      }
      throw e
    }
  }

  get<T>(path: string, headers?: Record<string, string>) {
    return this.request<T>(path, { method: 'GET', headers })
  }

  post<T>(path: string, body: any, headers?: Record<string, string>) {
    return this.request<T>(path, { method: 'POST', body, headers })
  }

  put<T>(path: string, body: any, headers?: Record<string, string>) {
    return this.request<T>(path, { method: 'PUT', body, headers })
  }

  delete<T>(path: string, headers?: Record<string, string>) {
    return this.request<T>(path, { method: 'DELETE', headers })
  }
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly body?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Singleton factory
let clientInstance: ApiClient | null = null

export function createApiClient(config: ApiClientConfig): ApiClient {
  clientInstance = new ApiClient(config)
  return clientInstance
}

export function getApiClient(): ApiClient {
  if (!clientInstance) throw new Error('ApiClient not initialized - call createApiClient first')
  return clientInstance
}
