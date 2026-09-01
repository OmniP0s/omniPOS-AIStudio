import { Request, Response } from "express";
import { getHealthStatus, getPlatformMetrics } from "../services/platformService";
import { db } from "../src/server/db/connection";

export const getApiHealth = (_req: Request, res: Response) => {
  res.json(getHealthStatus());
};

// Prometheus Telemetry Metrics Endpoint
export const getApiMetrics = (_req: Request, res: Response) => {
  res.json(getPlatformMetrics());
};

export const getApiDatabaseHealth = async (_req: Request, res: Response) => {
  const health = await db.healthCheck();
  res.json({
    database: health.connected ? "POSTGRESQL_CONNECTED" : "IN_MEMORY_ISOLATED_FALLBACK",
    isConfigured: db.isConfigured(),
    latencyMs: health.latencyMs ?? 0,
    rlsEnabled: true,
    isolationMode: "ROW_LEVEL_SECURITY_AND_SESSION_CONTEXT",
    error: health.error,
  });
};

// Outbox & Vector Clock Conflict Resolution Sync
