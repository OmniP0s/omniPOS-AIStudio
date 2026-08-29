import type { Request, Response } from "express";
import { getHealthStatus, getPlatformMetrics } from "../services/platformService";

export function getHealth(_req: Request, res: Response) {
  res.json(getHealthStatus());
}

export function getMetrics(_req: Request, res: Response) {
  res.json(getPlatformMetrics());
}
