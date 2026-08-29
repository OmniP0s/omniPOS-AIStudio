import type { NextFunction, Request, Response } from "express";

function containsUnsafeInput(value: unknown): boolean {
  if (typeof value === "string") return value.length > 20000 || /<script[\s>]/i.test(value);
  if (Array.isArray(value)) return value.some(containsUnsafeInput);
  if (value && typeof value === "object") return Object.values(value as Record<string, unknown>).some(containsUnsafeInput);
  return false;
}

export function validateApiRequest(req: Request, res: Response, next: NextFunction) {
  if (!req.path.startsWith("/api")) return next();
  if (["POST", "PUT", "PATCH"].includes(req.method) && (!req.is("application/json") || req.body === null || typeof req.body !== "object" || Array.isArray(req.body))) {
    return res.status(400).json({ error: { code: "INVALID_REQUEST_BODY", message: "Request body must be a JSON object." } });
  }
  if (containsUnsafeInput(req.body) || containsUnsafeInput(req.query) || containsUnsafeInput(req.params)) {
    return res.status(400).json({ error: { code: "INVALID_INPUT", message: "Request input failed validation." } });
  }
  return next();
}
