import { Router } from "express";
import { getHealth, getMetrics } from "../controllers/platformController";

export const platformRouter = Router();

platformRouter.get("/health", getHealth);
platformRouter.get("/metrics", getMetrics);
