import type { NextFunction, Request, Response } from "express";
import { PUBLIC_API_ROUTES } from "../config/security";
import { logSecurityEvent } from "../infrastructure/securityLogger";

function isPublicApiRoute(req: Request): boolean {
  return PUBLIC_API_ROUTES.has(`${req.method} ${req.path}`);
}

function firstTenantIdCandidate(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const tenantId = record.tenantId;
  return typeof tenantId === "string" && tenantId.trim().length > 0 ? tenantId : null;
}

export function enforceTenantIsolation(req: Request, res: Response, next: NextFunction) {
  if (!req.path.startsWith("/api") || isPublicApiRoute(req)) return next();
  if (!req.user) return res.status(403).json({ error: { code: "TENANT_CONTEXT_REQUIRED", message: "A verified tenant context is required for this endpoint." } });
  const authenticatedTenantId = req.user.tenantId;
  const suppliedTenantId = firstTenantIdCandidate(req.body) ?? firstTenantIdCandidate(req.query) ?? firstTenantIdCandidate(req.params);
  if (suppliedTenantId && suppliedTenantId !== authenticatedTenantId) {
    logSecurityEvent("tenant_mismatch", req);
    return res.status(403).json({ error: { code: "TENANT_MISMATCH", message: "Client-supplied tenant context does not match the authenticated tenant." } });
  }
  req.tenantId = authenticatedTenantId;
  return next();
}
