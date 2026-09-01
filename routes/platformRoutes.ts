import { Router } from "express";
import { getApiDatabaseHealth, getApiHealth, getApiMetrics } from "../controllers/platformController";

export const platformRouter = Router();

platformRouter.get("/health", getApiHealth);
platformRouter.get("/metrics", getApiMetrics);
platformRouter.get("/db/health", getApiDatabaseHealth);
