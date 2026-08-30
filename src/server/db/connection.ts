// Enterprise PostgreSQL Connection Pool & Tenant Session Context Manager
// Enforces database-level session variables (SET LOCAL app.current_tenant_id) for Row Level Security (RLS).

import pg from 'pg';
const { Pool } = pg;

export interface IDbConfig {
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  ssl?: boolean | { rejectUnauthorized: boolean };
  maxConnections?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

export class PostgresConnectionManager {
  private static instance: PostgresConnectionManager | null = null;
  private pool: pg.Pool | null = null;
  private config: IDbConfig;
  private configured: boolean = false;

  private constructor() {
    this.config = this.resolveConfig();
    this.initializePool();
  }

  public static getInstance(): PostgresConnectionManager {
    if (!PostgresConnectionManager.instance) {
      PostgresConnectionManager.instance = new PostgresConnectionManager();
    }
    return PostgresConnectionManager.instance;
  }

  private resolveConfig(): IDbConfig {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (connectionString) {
      this.configured = true;
      return {
        connectionString,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20', 10),
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      };
    }

    if (process.env.PGHOST && process.env.PGDATABASE) {
      this.configured = true;
      return {
        host: process.env.PGHOST,
        port: parseInt(process.env.PGPORT || '5432', 10),
        database: process.env.PGDATABASE,
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || '',
        ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : false,
        maxConnections: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      };
    }

    this.configured = false;
    return {};
  }

  private initializePool(): void {
    if (!this.configured) return;
    try {
      this.pool = new Pool(this.config as any);
      this.pool.on('error', (err) => {
        console.error('[Postgres Connection Pool Error]:', err.message);
      });
    } catch (err: any) {
      console.warn('[Postgres Pool Init Warning]:', err.message);
      this.pool = null;
    }
  }

  public isConfigured(): boolean {
    return this.configured && this.pool !== null;
  }

  public getPool(): pg.Pool | null {
    return this.pool;
  }

  /**
   * Executes a database operation within a dedicated client session where
   * SET LOCAL app.current_tenant_id = $1 is guaranteed to enforce RLS.
   */
  public async withTenantClient<T>(
    tenantId: string,
    operation: (client: pg.PoolClient) => Promise<T>
  ): Promise<T> {
    if (!this.pool) {
      throw new Error('Database connection pool is not configured or unavailable');
    }

    const client = await this.pool.connect();
    try {
      // Set session variable for RLS
      await client.query('SET LOCAL app.current_tenant_id = $1', [tenantId]);
      const result = await operation(client);
      return result;
    } finally {
      client.release();
    }
  }

  /**
   * Direct parameterized query against the pool with optional tenant isolation
   */
  public async query<T = any>(
    sqlText: string,
    params: any[] = [],
    tenantId?: string
  ): Promise<pg.QueryResult<T>> {
    if (!this.pool) {
      throw new Error('Database connection pool is not configured or unavailable');
    }

    if (tenantId) {
      return this.withTenantClient(tenantId, async (client) => {
        return client.query<T>(sqlText, params);
      });
    }

    return this.pool.query<T>(sqlText, params);
  }

  /**
   * Healthcheck verifying live database connectivity and latency
   */
  public async healthCheck(): Promise<{
    connected: boolean;
    latencyMs?: number;
    error?: string;
  }> {
    if (!this.pool) {
      return { connected: false, error: 'DATABASE_URL not configured' };
    }

    const start = Date.now();
    try {
      await this.pool.query('SELECT 1 AS health');
      return {
        connected: true,
        latencyMs: Date.now() - start,
      };
    } catch (err: any) {
      return {
        connected: false,
        error: err.message,
      };
    }
  }

  public async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}

export const db = PostgresConnectionManager.getInstance();
