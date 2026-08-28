// CRDT, Vector Clocks & Outbox Sync Engine for Distributed Offline-First POS

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

  constructor(nodeId: string = 'POS-TERMINAL-01') {
    this.vectorClock = new VectorClockEngine(nodeId);
    // Load from local storage if available
    try {
      const saved = localStorage.getItem('omni_pos_outbox_queue');
      if (saved) {
        this.queue = JSON.parse(saved);
      }
    } catch {
      this.queue = [];
    }
  }

  public subscribe(fn: (queue: OutboxMessage[]) => void) {
    this.subscribers.push(fn);
    fn(this.getQueue());
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== fn);
    };
  }

  private notify() {
    try {
      localStorage.setItem('omni_pos_outbox_queue', JSON.stringify(this.queue));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    this.subscribers.forEach(fn => fn(this.getQueue()));
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
    this.notify();

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
      this.notify();

      try {
        // Post to server sync endpoint
        const res = await fetch('/api/sync/outbox', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: msg }),
        });

        if (res.ok) {
          msg.status = 'SYNCED';
          // Clean up synced messages older than 5 minutes
          this.queue = this.queue.filter(m => m.id !== msg.id || m.status !== 'SYNCED');
        } else {
          msg.status = 'FAILED';
          msg.retryCount += 1;
          msg.lastError = `Server returned ${res.status}`;
        }
      } catch (err: any) {
        msg.status = 'FAILED';
        msg.retryCount += 1;
        msg.lastError = err.message || 'Network Timeout';
      }
      this.notify();
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

  public clearQueue() {
    this.queue = [];
    this.notify();
  }
}

export const globalOutbox = new OutboxQueueManager();
export const outboxManager = globalOutbox;

