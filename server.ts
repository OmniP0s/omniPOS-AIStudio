import express, { type Request, type Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { serverConfig } from "./src/server/config/runtime";
import { validateRequiredSecrets } from "./src/server/config/security";
import { authenticateApiRequest } from "./src/server/middleware/authentication";
import { authorizeApiRequest } from "./src/server/middleware/authorization";
import { enforceTenantIsolation } from "./src/server/middleware/tenantIsolation";
import { validateApiRequest } from "./src/server/validation/apiRequestValidation";
import { rateLimitApiRequests } from "./src/server/middleware/rateLimit";
import { applySecurityHeaders, enforceCorsAllowlist } from "./src/server/middleware/httpSecurity";
import { handleApiError } from "./src/server/middleware/errorHandler";
import { registerApiRoutes } from "./src/server/routes/apiRoutes";

validateRequiredSecrets();

async function startServer() {
  const app = express();
  const PORT = serverConfig.port;

  app.use(enforceCorsAllowlist);
  app.use(applySecurityHeaders);
  app.use(express.json({ limit: "1mb" }));
  app.use(rateLimitApiRequests);
  app.use(validateApiRequest);
  app.use(authenticateApiRequest);
  app.use(authorizeApiRequest);
  app.use(enforceTenantIsolation);

  registerApiRoutes(app);

  // Vite middleware for development vs Static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(handleApiError);
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Enterprise Server] running securely on http://0.0.0.0:${PORT}`);
  });
}

startServer();
