import { PaginationParams, PaginatedResult } from './types';

export interface IdempotencyRecord {
  key: string;
  endpoint: string;
  requestPayloadHash: string;
  responseStatus: number;
  responseBody: any;
  createdAt: number;
  expiresAt: number;
}

export class EnterpriseApiStandardsEngine {
  private idempotencyStore: Map<string, IdempotencyRecord> = new Map();

  public paginateArray<T extends Record<string, any>>(
    items: T[],
    params: PaginationParams
  ): PaginatedResult<T> {
    let filtered = [...items];

    // 1. Dynamic Filtering
    if (params.filters) {
      for (const [key, filterVal] of Object.entries(params.filters)) {
        if (typeof filterVal === 'object' && filterVal !== null) {
          if (filterVal.gte !== undefined) {
            filtered = filtered.filter(item => item[key] >= filterVal.gte);
          }
          if (filterVal.lte !== undefined) {
            filtered = filtered.filter(item => item[key] <= filterVal.lte);
          }
          if (filterVal.eq !== undefined) {
            filtered = filtered.filter(item => item[key] === filterVal.eq);
          }
          if (filterVal.in !== undefined && Array.isArray(filterVal.in)) {
            filtered = filtered.filter(item => filterVal.in.includes(item[key]));
          }
        } else {
          filtered = filtered.filter(item =>
            String(item[key]).toLowerCase().includes(String(filterVal).toLowerCase())
          );
        }
      }
    }

    // 2. Sorting
    if (params.sortBy) {
      const dir = params.sortDirection === 'desc' ? -1 : 1;
      const key = params.sortBy;
      filtered.sort((a, b) => {
        if (a[key] < b[key]) return -1 * dir;
        if (a[key] > b[key]) return 1 * dir;
        return 0;
      });
    }

    // 3. Pagination (Offset & Cursor)
    const limit = params.limit || 10;
    let page = params.page || 1;
    let startIndex = (page - 1) * limit;

    if (params.cursor) {
      try {
        const decoded = atob(params.cursor);
        const cursorData = JSON.parse(decoded);
        const cursorIndex = filtered.findIndex(item => item.id === cursorData.id);
        if (cursorIndex !== -1) {
          startIndex = cursorIndex + 1;
        }
      } catch (e) {
        // Fallback to offset
      }
    }

    const sliced = filtered.slice(startIndex, startIndex + limit);
    const hasNextPage = startIndex + limit < filtered.length;
    const hasPrevPage = startIndex > 0;

    let nextCursor: string | undefined;
    if (hasNextPage && sliced.length > 0) {
      const lastItem = sliced[sliced.length - 1];
      nextCursor = btoa(JSON.stringify({ id: lastItem.id, timestamp: lastItem.createdAt || Date.now() }));
    }

    // 4. Sparse Field Selection
    let finalData = sliced;
    if (params.fields && params.fields.length > 0) {
      finalData = sliced.map(item => {
        const picked: Record<string, any> = {};
        params.fields!.forEach(f => {
          if (f in item) picked[f] = item[f];
        });
        return picked as T;
      });
    }

    return {
      data: finalData,
      meta: {
        total: filtered.length,
        page,
        limit,
        hasNextPage,
        hasPrevPage,
        nextCursor,
      },
    };
  }

  public generateETag(data: any): string {
    const serialized = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < serialized.length; i++) {
      const char = serialized.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `W/"etag-${Math.abs(hash).toString(16)}"`;
  }

  public checkConditionalETag(
    currentETag: string,
    ifNoneMatchHeader?: string,
    ifMatchHeader?: string
  ): { isModified: boolean; status: number } {
    if (ifNoneMatchHeader && ifNoneMatchHeader === currentETag) {
      return { isModified: false, status: 304 }; // Not Modified
    }

    if (ifMatchHeader && ifMatchHeader !== currentETag) {
      return { isModified: true, status: 412 }; // Precondition Failed
    }

    return { isModified: true, status: 200 };
  }

  public checkIdempotency(key: string, endpoint: string, payload: any): {
    isDuplicate: boolean;
    cachedResponse?: IdempotencyRecord;
  } {
    const record = this.idempotencyStore.get(key);
    const now = Date.now();

    if (record && record.expiresAt > now) {
      return {
        isDuplicate: true,
        cachedResponse: record,
      };
    }

    return { isDuplicate: false };
  }

  public storeIdempotentResponse(
    key: string,
    endpoint: string,
    payload: any,
    status: number,
    responseBody: any,
    ttlSeconds: number = 86400
  ): void {
    const now = Date.now();
    this.idempotencyStore.set(key, {
      key,
      endpoint,
      requestPayloadHash: this.generateETag(payload),
      responseStatus: status,
      responseBody,
      createdAt: now,
      expiresAt: now + ttlSeconds * 1000,
    });
  }
}

export const apiStandardsEngine = new EnterpriseApiStandardsEngine();
