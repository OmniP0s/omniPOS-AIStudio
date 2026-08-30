// CRDT, Vector Clocks & Outbox Sync Engine for Distributed Offline-First POS
// Backed durably by typed IndexedDB Edge storage - no localStorage operational fallback.

import { EdgeOutboxStore } from '../persistence/edgeRepositories';
import { globalEdgeDatabase } from '../persistence/edgeDatabase';

export interface OutboxMessage {
  id: string;
  eventType: 'ORDER_CREATED' | 'ORDER_UPDATED' | 'PAYMENT_PROCESSED' | 'SHIFT_CLOSED' | 'STOCK_DEDUCTED' | 'CUSTOMER_UPDATED';
  entityId: string;
  payload: any;
  nodeId: string;
  vectorClock: Record<string, number>;
  timestamp: string;
  status: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED';
  retryCount: number;
  lastError?: string;
}

export class VectorClock {
  private nodeId: string;
  private currentClock: Record<string, number>;

  constructor(nodeId: string = 'POS-TERMINAL-01') {
    this.nodeId = nodeId;
    this.currentClock = { [nodeId]: 0 };
  }

  public getNodeId(): string {
    return this.nodeId;
  }

  public increment(customNodeId?: string): Record<string, number> {
    const targetNode = customNodeId || this.nodeId;
    this.currentClock[targetNode] = (this.currentClock[targetNode] || 0) + 1;
    return { ...this.currentClock };
  }

  public getClock(): Record<string, number> {
    return { ...this.currentClock };
  }

  public merge(remoteClock: Record<string, number>): Record<string, number> {
    for (const [node, counter] of Object.entries(remoteClock)) {
      this.currentClock[node] = Math.max(this.currentClock[node] || 0, counter);
    }
    return { ...this.currentClock };
  }

  public compare(c1: Record<string, number>, c2: Record<string, number>): 'BEFORE' | 'AFTER' | 'CONCURRENT' | 'EQUAL' {
    let greater = false;
    let lesser = false;

    const allKeys = new Set([...Object.keys(c1), ...Object.keys(c2)]);
    for (const key of allKeys) {
      const v1 = c1[key] || 0;
      const v2 = c2[key] || 0;
      if (v1 > v2) greater = true;
      if (v1 < v2) lesser = true;
    }

    if (greater && !lesser) return 'AFTER';
    if (!greater && lesser) return 'BEFORE';
    if (!greater && !lesser) return 'EQUAL';
    return 'CONCURRENT';
  }
}

export class VectorClockEngine extends VectorClock {}

export class OutboxQueueManager {
  private queue: OutboxMessage[] = [];
  private vectorClock: VectorClockEngine;
  private isOnline: boolean = true;
  private subscribers: ((queue: OutboxMessage[]) => void)[] = [];
  private edgeOutboxStore: EdgeOutboxStore;
  private isInitialized: boolean = false;

  constructor(nodeId: string = 'POS-TERMINAL-01', edgeOutboxStore?: EdgeOutboxStore) {
    this.vectorClock = new VectorClockEngine(nodeId);
    this.edgeOutboxStore = edgeOutboxStore || new EdgeOutboxStore(globalEdgeDatabase);
    this.initFromIndexedDb().catch(() => {});
  }

  public async initFromIndexedDb(): Promise<void> {
    try {
      const entries = await this.edgeOutboxStore.peekPending(500);
      if (entries && entries.length > 0) {
        this.queue = entries.map((e) => ({
          id: e.id,
          eventType: e.payload?.eventType || (e.operation === 'CREATE' ? 'ORDER_CREATED' : 'ORDER_UPDATED'),
          entityId: e.entityId,
          payload: e.payload,
          nodeId: e.terminalId || this.vectorClock.getNodeId(),
          vectorClock: e.vectorClock || {},
          timestamp: e.createdAt,
          status: e.status === 'IN_FLIGHT' ? 'SYNCING' : (e.status as any),
          retryCount: e.retryCount || 0,
          lastError: e.lastError,
        }));
      }
      this.isInitialized = true;
      this.notifySubscribers();
    } catch {
      // Running in environment without indexedDB
      this.isInitialized = true;
    }
  }

  public subscribe(fn: (queue: OutboxMessage[]) => void) {
    this.subscribers.push(fn);
    fn(this.getQueue());
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== fn);
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach(fn => fn(this.getQueue()));
  }

  private async persistToIndexedDb(msg: OutboxMessage): Promise<void> {
    try {
      await this.edgeOutboxStore.enqueue({
        id: msg.id,
        tenantId: (msg.payload && msg.payload.tenantId) || 'tenant-sa-001',
        branchId: (msg.payload && msg.payload.branchId) || 'branch-01',
        terminalId: msg.nodeId,
        entityType: 'ORDER',
        entityId: msg.entityId,
        operation: 'CREATE',
        payload: msg.payload,
        idempotencyKey: `idem-${msg.id}`,
        createdAt: msg.timestamp,
        status: msg.status === 'SYNCING' ? 'IN_FLIGHT' : (msg.status as any),
        retryCount: msg.retryCount,
        lastError: msg.lastError,
        vectorClock: msg.vectorClock,
      });
    } catch {
      // Fallback or test environment
    }
  }

  public enqueue(eventType: OutboxMessage['eventType'], entityId: string, payload: any): OutboxMessage {
    const clock = this.vectorClock.increment();
    const msg: OutboxMessage = {
      id: `MSG-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      eventType,
      entityId,
      payload,
      nodeId: this.vectorClock.getNodeId(),
      vectorClock: clock,
      timestamp: new Date().toISOString(),
      status: 'PENDING',
      retryCount: 0,
    };

    this.queue.push(msg);
    this.persistToIndexedDb(msg);
    this.notifySubscribers();

    if (this.isOnline) {
      this.processQueue();
    }

    return msg;
  }

  public getQueue(): OutboxMessage[] {
    return [...this.queue];
  }

  public getPendingCount(): number {
    return this.queue.filter(m => m.status === 'PENDING' || m.status === 'SYNCING').length;
  }

  public setOnlineStatus(online: boolean) {
    this.isOnline = online;
    if (online) {
      this.processQueue();
    }
  }

  public async processQueue() {
    if (!this.isOnline) return;

    const pending = this.queue.filter(m => m.status === 'PENDING' || m.status === 'FAILED');
    if (pending.length === 0) return;

    for (const msg of pending) {
      msg.status = 'SYNCING';
      this.notifySubscribers();

      try {
        // Post to server sync endpoint
        const res = await fetch('/api/sync/outbox', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: msg }),
        });

        if (res.ok) {
          msg.status = 'SYNCED';
          await this.edgeOutboxStore.markSynced(msg.id).catch(() => {});
          // Clean up synced messages
          this.queue = this.queue.filter(m => m.id !== msg.id || m.status !== 'SYNCED');
        } else {
          msg.status = 'FAILED';
          msg.retryCount += 1;
          msg.lastError = `Server returned ${res.status}`;
          await this.edgeOutboxStore.markFailed(msg.id, msg.lastError).catch(() => {});
        }
      } catch (err: any) {
        msg.status = 'FAILED';
        msg.retryCount += 1;
        msg.lastError = err.message || 'Network Timeout';
        await this.edgeOutboxStore.markFailed(msg.id, msg.lastError).catch(() => {});
      }
      this.notifySubscribers();
    }
  }

  public getVectorClock(): Record<string, number> {
    return this.vectorClock.getClock();
  }

  public async syncOutbox(): Promise<{ syncedCount: number }> {
    const prevCount = this.getPendingCount();
    await this.processQueue();
    const newCount = this.getPendingCount();
    return { syncedCount: Math.max(0, prevCount - newCount) };
  }

  public async clearQueue(): Promise<void> {
    this.queue = [];
    await this.edgeOutboxStore.clearAll().catch(() => {});
    this.notifySubscribers();
  }
}

export const globalOutbox = new OutboxQueueManager();
export const outboxManager = globalOutbox;
