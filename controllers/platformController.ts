import { Request, Response } from "express";
import { getHealthStatus, getPlatformMetrics } from "../services/platformService";

export const getApiHealth = (_req: Request, res: Response) => {
  res.json(getHealthStatus());
};

// Prometheus Telemetry Metrics Endpoint
export const getApiMetrics = (_req: Request, res: Response) => {
  res.json(getPlatformMetrics());
};

// Outbox & Vector Clock Conflict Resolution Sync
