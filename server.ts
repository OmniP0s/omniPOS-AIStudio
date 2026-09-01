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
import { MigrationRunner } from "./src/server/db/migrationRunner";
import { SecurityPipeline } from "./src/server/security/authPipeline";

async function runMigrations(): Promise<void> {
  try {
    const migrationResult = await MigrationRunner.run();
    if (migrationResult.totalApplied > 0) {
      console.log(`[DB Migration] Successfully applied ${migrationResult.totalApplied} migrations.`);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown migration error";
    console.warn("[DB Migration Warning]:", message);
  }
}

async function startServer(): Promise<void> {
  SecurityPipeline.assertConfiguredForRuntime();
  await runMigrations();

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
