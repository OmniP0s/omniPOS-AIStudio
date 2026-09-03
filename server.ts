import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { serverConfig } from "./config/env";
import {
  applySecurityHeaders,
  authorizeApiRequest,
  enforceCorsAllowlist,
  enforceTenantIsolation,
  handleApiError,
  rateLimitApiRequests,
  validateApiRequest,
} from "./middleware/security";
import { registerApiRoutes } from "./routes/apiRoutes";
import { db } from "./src/server/db/connection";
import { MigrationResult, MigrationRunner } from "./src/server/db/migrationRunner";
import { SecurityPipeline } from "./src/server/security/authPipeline";

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Applies pending database migrations and refuses to let startup continue when they fail.
 *
 * An absent database connection is NOT treated as a failure: that is the supported
 * in-memory development/test mode, and MigrationRunner reports it as a successful run
 * with nothing applied. Only a genuine migration failure aborts the process, so the
 * server can never come up silently missing required tables such as "users".
 */
async function runMigrations(): Promise<void> {
  let migrationResult: MigrationResult;

  try {
    migrationResult = await MigrationRunner.run();
  } catch (error: unknown) {
    throw new Error(`Database migration could not be executed: ${describeError(error)}`);
  }

  if (!migrationResult.success) {
    const appliedBeforeFailure =
      migrationResult.applied.length > 0 ? migrationResult.applied.join(", ") : "none";
    throw new Error(
      `Database migration failed, so the server cannot start. ` +
        `Reason: ${migrationResult.error ?? "unknown migration error"}. ` +
        `Migrations applied before the failure: ${appliedBeforeFailure}. ` +
        `The migration transaction was rolled back, which means required tables ` +
        `(including "users") are missing. Resolve the underlying cause and restart.`
    );
  }

  if (migrationResult.totalApplied > 0) {
    console.log(`[DB Migration] Successfully applied ${migrationResult.totalApplied} migrations.`);
    return;
  }

  // Nothing was applied. Distinguish the two very different reasons explicitly:
  // (a) no database at all -> supported in-memory mode, or (b) everything already applied.
  if (!db.isConfigured()) {
    console.warn(
      "[DB Migration] No PostgreSQL connection configured (DATABASE_URL/POSTGRES_URL unset). " +
        "Migrations were skipped and the server will run with in-memory persistence only."
    );
    return;
  }

  console.log(
    `[DB Migration] All ${migrationResult.skipped.length} migrations already applied; nothing to do.`
  );
}

async function startServer(): Promise<void> {
  SecurityPipeline.assertConfiguredForRuntime();

  try {
    await runMigrations();
  } catch (error: unknown) {
    // Fail loudly and abort boot: continuing would expose an API backed by an
    // incomplete schema, which is worse than not starting at all.
    console.error("[Startup Aborted]", describeError(error));
    process.exit(1);
  }

  const app = express();

  app.use(enforceCorsAllowlist);
  app.use(applySecurityHeaders);
  app.use(express.json({ limit: "1mb" }));
  app.use(rateLimitApiRequests);
  app.use(validateApiRequest);
  app.use(SecurityPipeline.middleware());
  app.use(authorizeApiRequest);
  app.use(enforceTenantIsolation);

  registerApiRoutes(app);

  if (serverConfig.environment !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Error middleware must be registered last in every environment.
  app.use(handleApiError);

  app.listen(serverConfig.port, "0.0.0.0", () => {
    console.log(`[Enterprise Server] running securely on http://0.0.0.0:${serverConfig.port}`);
  });
}

void startServer();
