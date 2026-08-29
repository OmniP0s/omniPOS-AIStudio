import type { Request, Response } from "express";
import { getHealthStatus, getPlatformMetrics } from "../services/platformService";

export function healthController(_req: Request, res: Response) {
  res.json(getHealthStatus());
}

export function metricsController(_req: Request, res: Response) {
  res.json(getPlatformMetrics());
}
