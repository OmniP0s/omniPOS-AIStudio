/**
 * OmniPOS Enterprise AI Memory Framework
 * Multi-Tier Memory Store: Session, Branch, Customer & Enterprise Long-Term Memory
 */

import {
  AiMemoryItem,
  MemoryScope,
} from '../types';

export class EnterpriseAiMemoryFramework {
  private memoryStore: Map<string, AiMemoryItem> = new Map();

  constructor() {
    this.seedDefaultMemories();
  }

  private seedDefaultMemories() {
    const defaultItems: AiMemoryItem[] = [
      {
        id: 'MEM-ENT-001',
        scope: 'ENTERPRISE_LONG_TERM',
        tenantId: 'TENANT-DEFAULT-01',
        scopeId: 'CORP-POLICY',
        key: 'standard_vat_rate',
        value: 'Standard VAT in Saudi Arabia is 15.0% enforced on all commercial restaurant sales and delivery fees.',
        importanceScore: 10,
        accessCount: 142,
        lastAccessedAt: new Date().toISOString(),
        createdAt: '2026-08-01T00:00:00Z',
      },
      {
        id: 'MEM-BR-001',
        scope: 'BRANCH',
        tenantId: 'TENANT-DEFAULT-01',
        scopeId: 'BR-OLAYA-01',
        key: 'peak_rush_window',
        value: 'Olaya branch experiences intense lunch rush between 12:30 PM - 02:45 PM (corporate workers) and midnight weekend surge.',
        importanceScore: 8,
        accessCount: 45,
        lastAccessedAt: new Date().toISOString(),
        createdAt: '2026-08-10T00:00:00Z',
      },
      {
        id: 'MEM-CUST-001',
        scope: 'CUSTOMER',
        tenantId: 'TENANT-DEFAULT-01',
        scopeId: 'CUST-SARAH-99',
        key: 'dietary_restrictions',
        value: 'Severe peanut allergy. Prefers oat milk in specialty coffees. VIP Gold member who always orders truffle sliders medium-well.',
        importanceScore: 9,
        accessCount: 12,
        lastAccessedAt: new Date().toISOString(),
        createdAt: '2026-08-15T00:00:00Z',
      },
    ];

    defaultItems.forEach(item => this.memoryStore.set(item.id, item));
  }

  public saveMemory(
    scope: MemoryScope,
    tenantId: string,
    scopeId: string,
    key: string,
    value: string,
    importanceScore: number = 5,
    ttlSeconds?: number
  ): AiMemoryItem {
    const existingId = Array.from(this.memoryStore.values()).find(
      m => m.scope === scope && m.tenantId === tenantId && m.scopeId === scopeId && m.key === key
    )?.id;

    const id = existingId || `MEM-${scope.substring(0, 3)}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const expiresAt = ttlSeconds ? new Date(Date.now() + ttlSeconds * 1000).toISOString() : undefined;

    const item: AiMemoryItem = {
      id,
      scope,
      tenantId,
      scopeId,
      key,
      value,
      importanceScore,
      accessCount: 1,
      lastAccessedAt: new Date().toISOString(),
      expiresAt,
      createdAt: new Date().toISOString(),
    };

    this.memoryStore.set(id, item);
    return item;
  }

  public retrieveMemories(
    tenantId: string,
    scopes: MemoryScope[],
    scopeIds: string[],
    searchQuery?: string,
    limit: number = 6
  ): AiMemoryItem[] {
    const now = Date.now();
    const candidates = Array.from(this.memoryStore.values()).filter(item => {
      if (item.tenantId !== tenantId) return false;
      if (!scopes.includes(item.scope)) return false;
      if (!scopeIds.includes(item.scopeId) && item.scope !== 'ENTERPRISE_LONG_TERM') return false;
      if (item.expiresAt && new Date(item.expiresAt).getTime() < now) return false;
      return true;
    });

    if (searchQuery && searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      candidates.sort((a, b) => {
        const scoreA = (a.key.toLowerCase().includes(q) ? 5 : 0) + (a.value.toLowerCase().includes(q) ? 3 : 0) + a.importanceScore;
        const scoreB = (b.key.toLowerCase().includes(q) ? 5 : 0) + (b.value.toLowerCase().includes(q) ? 3 : 0) + b.importanceScore;
        return scoreB - scoreA;
      });
    } else {
      // Sort by importance and recency
      candidates.sort((a, b) => b.importanceScore - a.importanceScore);
    }

    const selected = candidates.slice(0, limit);
    // Update access count and time
    selected.forEach(m => {
      m.accessCount += 1;
      m.lastAccessedAt = new Date().toISOString();
    });

    return selected;
  }

  public getAllMemories(tenantId?: string): AiMemoryItem[] {
    const items = Array.from(this.memoryStore.values());
    if (tenantId) {
      return items.filter(m => m.tenantId === tenantId);
    }
    return items;
  }

  public deleteMemory(id: string): boolean {
    return this.memoryStore.delete(id);
  }
}

export const aiMemoryFramework = new EnterpriseAiMemoryFramework();
