import express, { Request, Response } from "express";
import { apiRouter } from "./routes/apiRoutes";
import path from "path";
import { createServer as createViteServer } from "vite";
import { validateRequiredSecrets } from "./config/env";
import { applySecurityHeaders, authenticateApiRequest, authorizeApiRequest, enforceCorsAllowlist, enforceTenantIsolation, handleApiError, rateLimitApiRequests, validateApiRequest } from "./middleware/security";

validateRequiredSecrets();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(enforceCorsAllowlist);
  app.use(applySecurityHeaders);
  app.use(express.json({ limit: "1mb" }));
  app.use(rateLimitApiRequests);
  app.use(validateApiRequest);
  app.use(authenticateApiRequest);
  app.use(authorizeApiRequest);
  app.use(enforceTenantIsolation);

  app.use("/api", apiRouter);

  // Vite middleware for development
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
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
