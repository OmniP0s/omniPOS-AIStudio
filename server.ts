import "./types/express";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { getPort, validateRequiredSecrets } from "./config/environment";
import { applySecurityHeaders, authenticateApiRequest, authorizeApiRequest, enforceCorsAllowlist, enforceTenantIsolation, handleApiError, rateLimitApiRequests } from "./middleware/securityMiddleware";
import { validateApiRequest } from "./validation/requestValidation";
import { createApiRouter } from "./routes/apiRoutes";

validateRequiredSecrets();

async function startServer() {
  const app = express();
  const PORT = getPort();

  app.use(enforceCorsAllowlist);
  app.use(applySecurityHeaders);
  app.use(express.json({ limit: "1mb" }));
  app.use(rateLimitApiRequests);
  app.use(validateApiRequest);
  app.use(authenticateApiRequest);
  app.use(authorizeApiRequest);
  app.use(enforceTenantIsolation);
  app.use(createApiRouter());

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(handleApiError);
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Enterprise Server] running securely on http://0.0.0.0:${PORT}`);
  });
}

startServer();
