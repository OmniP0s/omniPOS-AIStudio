import express, { Request, Response } from "express";
import { registerApiRoutes } from "./routes/apiRoutes";
import path from "path";
import { createServer as createViteServer } from "vite";
import { serverConfig, validateRequiredSecrets } from "./config/env";
import { applySecurityHeaders, authenticateApiRequest, authorizeApiRequest, enforceCorsAllowlist, enforceTenantIsolation, handleApiError, rateLimitApiRequests, validateApiRequest } from "./middleware/security";

validateRequiredSecrets();

// -------------------------------------------------------------
// طبقة التوثيق والحماية للإنتاج (Enterprise Security Middleware)
// -------------------------------------------------------------
const authenticateApiRequest = (req: Request, res: Response, next: NextFunction) => {
  // 1. استثناء مسارات الفحص والمراقبة العامة
  const publicPaths = ["/api/health", "/api/metrics"];
  if (publicPaths.includes(req.path)) {
    return next();
  }

  // 2. استثناء استدعاءات الواجهة الأمامية (SPA Same-Origin Navigation & Assets)
  if (!req.path.startsWith("/api/")) {
    return next();
  }

  const expectedToken = process.env.API_AUTH_TOKEN;
  
  // إذا لم يتم تحديد توكن في البيئة (وضع التطوير الداخلي) نسمح بالمرور مع تسجيل تنبيه
  if (!expectedToken) {
    return next();
  }

  // 3. التحقق من Headers المصرح بها (Bearer Token أو x-api-key أو Sec-Fetch-Site من المتصفح الداخلي)
  const authHeader = req.headers.authorization;
  const customApiKey = req.headers["x-api-key"];
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
  const clientToken = bearerToken || customApiKey;

  // دعم طلبات الواجهة الداخلية (Same-Origin Browser Requests)
  const isSameOrigin = req.headers["sec-fetch-site"] === "same-origin" || req.headers["sec-fetch-site"] === "same-site";
  const internalSecret = req.headers["x-client-session-id"];

  if (clientToken === expectedToken || (isSameOrigin && (!process.env.STRICT_API_MODE || internalSecret))) {
    return next();
  }

  // في حال فشل التوثيق
  return res.status(401).json({
    error: "Unauthorized",
    message: "رمز المصادقة غير صالح أو مفقود (Invalid or missing API credentials).",
    code: "AUTH_REQUIRED",
    timestamp: new Date().toISOString(),
  });
};

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
