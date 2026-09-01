import type { Express } from "express";
import { aiAgentsRouter } from "./aiAgentsRoutes";
import { aiAppsRouter } from "./aiAppsRoutes";
import { aiRouter } from "./aiRoutes";
import { cognitiveAiRouter } from "./cognitiveAiRoutes";
import { platformRouter } from "./platformRoutes";
import { syncRouter } from "./syncRoutes";
import { zatcaRouter } from "./zatcaRoutes";
import { enterpriseRouter } from "./enterpriseRoutes";

export function registerApiRoutes(app: Express) {
  app.use("/api", platformRouter);
  app.use("/api", aiRouter);
  app.use("/api/ai-apps", aiAppsRouter);
  app.use("/api/ai-agents", aiAgentsRouter);
  app.use("/api/cognitive-ai", cognitiveAiRouter);
  app.use("/api/sync", syncRouter);
  app.use("/api/zatca", zatcaRouter);
  app.use(enterpriseRouter);
}
