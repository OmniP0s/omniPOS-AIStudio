import { AsyncLocalStorage } from 'async_hooks';
import pg from 'pg';

export class TransactionClientContext {
  private static readonly storage = new AsyncLocalStorage<pg.PoolClient>();

  public static run<T>(client: pg.PoolClient, operation: () => Promise<T>): Promise<T> {
    return this.storage.run(client, operation);
  }

  public static getClient(): pg.PoolClient | undefined {
    return this.storage.getStore();
  }
}
