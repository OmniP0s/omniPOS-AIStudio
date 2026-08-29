import crypto from "crypto";
import type { NextFunction, Request, Response } from "express";

export function handleApiError(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (res.headersSent) return;
  const errorId = `err-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
  console.error(JSON.stringify({ level: "error", event: "api_error", errorId, path: req.path, method: req.method, name: err instanceof Error ? err.name : "UnknownError" }));
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "An internal server error occurred.", errorId } });
}
