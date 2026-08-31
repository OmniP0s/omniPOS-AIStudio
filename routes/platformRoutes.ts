import { Router } from "express";
import { getApiHealth, getApiMetrics } from "../controllers/platformController";

export const platformRouter = Router();

platformRouter.get("/health", getApiHealth);
platformRouter.get("/metrics", getApiMetrics);
