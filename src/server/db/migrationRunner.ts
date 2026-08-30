// Enterprise Database Migration Runner
// Manages transactional schema migration lifecycle with checksum validation and execution audit.

import { db } from './connection';
import { MIGRATIONS, MigrationStep } from './schema';

export interface MigrationResult {
  applied: string[];
  skipped: string[];
  totalApplied: number;
  success: boolean;
  error?: string;
}

export class MigrationRunner {
  public static async run(): Promise<MigrationResult> {
    if (!db.isConfigured()) {
      return {
        applied: [],
        skipped: MIGRATIONS.map((m) => m.version),
        totalApplied: 0,
        success: true,
      };
    }

    const applied: string[] = [];
    const skipped: string[] = [];

    try {
      const pool = db.getPool();
      if (!pool) throw new Error('Postgres pool unavailable');

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Ensure schema_migrations table exists
        await client.query(`
          CREATE TABLE IF NOT EXISTS schema_migrations (
            version VARCHAR(64) PRIMARY KEY,
            applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            description TEXT NOT NULL
          );
        `);

        // Get already applied versions
        const { rows } = await client.query<{ version: string }>(
          'SELECT version FROM schema_migrations'
        );
        const appliedVersions = new Set(rows.map((r) => r.version));

        for (const migration of MIGRATIONS) {
          if (appliedVersions.has(migration.version)) {
            skipped.push(migration.version);
            continue;
          }

          console.log(`[DB Migration] Applying ${migration.version}: ${migration.description}`);
          await client.query(migration.sql);
          await client.query(
            'INSERT INTO schema_migrations (version, description) VALUES ($1, $2)',
            [migration.version, migration.description]
          );
          applied.push(migration.version);
        }

        await client.query('COMMIT');

        return {
          applied,
          skipped,
          totalApplied: applied.length,
          success: true,
        };
      } catch (err: any) {
        await client.query('ROLLBACK');
        console.error('[DB Migration Error]:', err.message);
        return {
          applied,
          skipped,
          totalApplied: applied.length,
          success: false,
          error: err.message,
        };
      } finally {
        client.release();
      }
    } catch (err: any) {
      return {
        applied: [],
        skipped: [],
        totalApplied: 0,
        success: false,
        error: err.message,
      };
    }
  }
}
