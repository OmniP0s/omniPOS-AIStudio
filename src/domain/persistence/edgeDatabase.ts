// Enterprise Edge / Offline IndexedDB Database & Transaction Engine
// Replaces fragile localStorage with durable, structured, multi-tenant IndexedDB storage.
// Enforces schema versioning, transaction boundaries, index querying, and zero fallback to localStorage in production.

export const EDGE_DB_NAME = 'omni_pos_edge_db';
export const EDGE_DB_VERSION = 2; // Version 2 introduces structured tenant-isolated stores & metadata

export interface IEdgeDbSchemaMeta {
  version: number;
  appliedAt: string;
  stores: string[];
}

export type StoreName = 'orders' | 'shifts' | 'inventory' | 'outbox_events' | 'schema_meta';

export class EdgeDatabase {
  private dbName: string;
  private version: number;
  private db: IDBDatabase | null = null;
  private initPromise: Promise<IDBDatabase> | null = null;

  constructor(dbName: string = EDGE_DB_NAME, version: number = EDGE_DB_VERSION) {
    this.dbName = dbName;
    this.version = version;
  }

  private getIndexedDB(): IDBFactory {
    if (typeof window !== 'undefined' && window.indexedDB) {
      return window.indexedDB;
    }
    if (typeof globalThis !== 'undefined' && (globalThis as any).indexedDB) {
      return (globalThis as any).indexedDB;
    }
    throw new Error(
      '[EdgeDatabase] IndexedDB is not supported in this runtime environment. LocalStorage fallback is strictly forbidden in production.'
    );
  }

  /**
   * Initializes and opens the IndexedDB database with schema versioning and store migrations.
   */
  public async open(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const idb = this.getIndexedDB();
      const request = idb.open(this.dbName, this.version);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = request.result;
        const oldVersion = event.oldVersion;
        const newVersion = event.newVersion || this.version;

        console.info(`[EdgeDatabase] Upgrading IndexedDB schema from v${oldVersion} to v${newVersion}...`);

        // 1. Orders Store
        if (!db.objectStoreNames.contains('orders')) {
          const orderStore = db.createObjectStore('orders', { keyPath: 'id' });
          orderStore.createIndex('by_tenant', 'tenantId', { unique: false });
          orderStore.createIndex('by_tenant_branch', ['tenantId', 'branchId'], { unique: false });
          orderStore.createIndex('by_status', 'status', { unique: false });
          orderStore.createIndex('by_created', 'createdAt', { unique: false });
        } else {
          // Schema Migration v1 -> v2: Add by_tenant_branch composite index if missing
          const orderTx = request.transaction;
          if (orderTx) {
            const orderStore = orderTx.objectStore('orders');
            if (!orderStore.indexNames.contains('by_tenant_branch')) {
              orderStore.createIndex('by_tenant_branch', ['tenantId', 'branchId'], { unique: false });
            }
          }
        }

        // 2. Shifts Store
        if (!db.objectStoreNames.contains('shifts')) {
          const shiftStore = db.createObjectStore('shifts', { keyPath: 'id' });
          shiftStore.createIndex('by_tenant', 'tenantId', { unique: false });
          shiftStore.createIndex('by_tenant_terminal', ['tenantId', 'terminalId'], { unique: false });
          shiftStore.createIndex('by_status', 'status', { unique: false });
        }

        // 3. Inventory Store
        if (!db.objectStoreNames.contains('inventory')) {
          const invStore = db.createObjectStore('inventory', { keyPath: 'id' });
          invStore.createIndex('by_sku', 'sku', { unique: false });
        }

        // 4. Outbox Events Queue Store (Durable Edge Outbox)
        if (!db.objectStoreNames.contains('outbox_events')) {
          const outboxStore = db.createObjectStore('outbox_events', { keyPath: 'id' });
          outboxStore.createIndex('by_tenant', 'tenantId', { unique: false });
          outboxStore.createIndex('by_status', 'status', { unique: false });
          outboxStore.createIndex('by_idempotency_key', 'idempotencyKey', { unique: true });
          outboxStore.createIndex('by_timestamp', 'timestamp', { unique: false });
        } else {
          // Verify idempotency index in v2
          const outboxTx = request.transaction;
          if (outboxTx) {
            const outboxStore = outboxTx.objectStore('outbox_events');
            if (!outboxStore.indexNames.contains('by_idempotency_key')) {
              outboxStore.createIndex('by_idempotency_key', 'idempotencyKey', { unique: true });
            }
            if (!outboxStore.indexNames.contains('by_tenant')) {
              outboxStore.createIndex('by_tenant', 'tenantId', { unique: false });
            }
          }
        }

        // 5. Schema Metadata Store
        if (!db.objectStoreNames.contains('schema_meta')) {
          db.createObjectStore('schema_meta', { keyPath: 'version' });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        // Record schema version metadata
        this.recordSchemaMeta(this.db, this.version).catch(() => {});
        resolve(this.db);
      };

      request.onerror = () => {
        this.initPromise = null;
        reject(request.error || new Error('[EdgeDatabase] Failed to open IndexedDB'));
      };

      request.onblocked = () => {
        console.warn('[EdgeDatabase] IndexedDB upgrade blocked by open connection in another tab.');
      };
    });

    return this.initPromise;
  }

  private async recordSchemaMeta(db: IDBDatabase, version: number): Promise<void> {
    try {
      const tx = db.transaction('schema_meta', 'readwrite');
      const store = tx.objectStore('schema_meta');
      const meta: IEdgeDbSchemaMeta = {
        version,
        appliedAt: new Date().toISOString(),
        stores: Array.from(db.objectStoreNames),
      };
      store.put(meta);
    } catch {
      // Ignore meta record failures on readonly or during teardown
    }
  }

  /**
   * Executes an atomic multi-store read/write transaction against IndexedDB.
   */
  public async transaction<T>(
    storeNames: StoreName | StoreName[],
    mode: IDBTransactionMode,
    operation: (tx: IDBTransaction, stores: Record<StoreName, IDBObjectStore>) => Promise<T>
  ): Promise<T> {
    const db = await this.open();
    const names = Array.isArray(storeNames) ? storeNames : [storeNames];

    return new Promise<T>((resolve, reject) => {
      const tx = db.transaction(names, mode);
      const storeMap = {} as Record<StoreName, IDBObjectStore>;

      names.forEach((name) => {
        storeMap[name] = tx.objectStore(name);
      });

      let operationResult: T;
      let operationFailed = false;

      // Handle async promise inside transaction lifecycle
      operation(tx, storeMap)
        .then((res) => {
          operationResult = res;
        })
        .catch((err) => {
          operationFailed = true;
          try {
            tx.abort();
          } catch {
            // Transaction might already be closed
          }
          reject(err);
        });

      tx.oncomplete = () => {
        if (!operationFailed) {
          resolve(operationResult);
        }
      };

      tx.onerror = () => {
        if (!operationFailed) {
          reject(tx.error || new Error('[EdgeDatabase] Transaction aborted or failed'));
        }
      };

      tx.onabort = () => {
        if (!operationFailed) {
          reject(tx.error || new Error('[EdgeDatabase] Transaction aborted'));
        }
      };
    });
  }

  /**
   * Closes the active database connection.
   */
  public close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initPromise = null;
    }
  }

  /**
   * Drops the database completely (useful for isolated unit tests).
   */
  public async deleteDatabase(): Promise<void> {
    this.close();
    const idb = this.getIndexedDB();
    return new Promise((resolve, reject) => {
      const req = idb.deleteDatabase(this.dbName);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
      req.onblocked = () => resolve();
    });
  }
}

export const globalEdgeDatabase = new EdgeDatabase();
