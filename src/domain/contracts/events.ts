// Enterprise Domain Event Bus & Stream Contracts

export interface IDomainEvent<TPayload = any> {
  eventId: string;
  eventName: string;
  tenantId: string;
  branchId: string;
  occurredAt: string;
  version: number;
  correlationId?: string;
  causationId?: string;
  payload: TPayload;
}

export type DomainEventHandler<TEvent extends IDomainEvent = IDomainEvent> = (event: TEvent) => Promise<void> | void;

export interface IEventBus {
  publish<TPayload>(event: IDomainEvent<TPayload>): Promise<void>;
  publishAll(events: IDomainEvent[]): Promise<void>;
  subscribe<TPayload>(eventName: string, handler: DomainEventHandler<IDomainEvent<TPayload>>): () => void;
}

// In-Memory Synchronous & Asynchronous Event Bus Implementation for Hexagonal Architecture
export class DomainEventBus implements IEventBus {
  private handlers = new Map<string, Set<DomainEventHandler<any>>>();

  public subscribe<TPayload>(eventName: string, handler: DomainEventHandler<IDomainEvent<TPayload>>): () => void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, new Set());
    }
    this.handlers.get(eventName)!.add(handler);

    return () => {
      this.handlers.get(eventName)?.delete(handler);
    };
  }

  public async publish<TPayload>(event: IDomainEvent<TPayload>): Promise<void> {
    const directHandlers = this.handlers.get(event.eventName) || new Set();
    const wildcardHandlers = this.handlers.get('*') || new Set();

    const allHandlers = [...directHandlers, ...wildcardHandlers];
    await Promise.allSettled(allHandlers.map(handler => Promise.resolve(handler(event))));
  }

  public async publishAll(events: IDomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }

  public clear(): void {
    this.handlers.clear();
  }
}

export const globalEventBus = new DomainEventBus();
