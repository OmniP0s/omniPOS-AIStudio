import type { NextFunction, Request, Response } from "express";
import { DEFAULT_PRIVATE_API_POLICY, ROUTE_AUTHORIZATION_POLICIES } from "../config/security";
import { logSecurityEvent } from "../infrastructure/logger";
import type { AuthorizationDecision, RouteAuthorizationPolicy } from "../types/security";
import { isPublicApiRoute } from "./authentication";

function resolveAuthorizationPolicy(req: Request): RouteAuthorizationPolicy {
  return ROUTE_AUTHORIZATION_POLICIES.find(({ method, pathPrefix }) => req.method === method && req.path.startsWith(pathPrefix))?.policy ?? DEFAULT_PRIVATE_API_POLICY;
}

export function evaluateAuthorization(req: Request): AuthorizationDecision {
  const policy = resolveAuthorizationPolicy(req);
  if (!req.user) return { allowed: false, action: policy.action, resource: policy.resource, reason: "AUTHENTICATION_REQUIRED" };
  if (policy.requireTenant && !req.user.tenantId) return { allowed: false, action: policy.action, resource: policy.resource, reason: "TENANT_REQUIRED" };

  const principalRoles = new Set(req.user.roles.map((role) => role.toLowerCase()));
  const hasAllowedRole = policy.allowedRoles.some((role) => principalRoles.has(role.toLowerCase()));
  if (!hasAllowedRole) return { allowed: false, action: policy.action, resource: policy.resource, reason: "INSUFFICIENT_ROLE" };

  return { allowed: true, action: policy.action, resource: policy.resource };
}

export function authorizeApiRequest(req: Request, res: Response, next: NextFunction) {
  if (!req.path.startsWith("/api") || isPublicApiRoute(req)) return next();
  const decision = evaluateAuthorization(req);
  req.authorization = decision;
  if (!decision.allowed) {
    logSecurityEvent("authorization_denied", req, { reason: decision.reason, resource: decision.resource, action: decision.action });
    const status = decision.reason === "AUTHENTICATION_REQUIRED" ? 401 : 403;
    return res.status(status).json({ error: {
      code: decision.reason || "FORBIDDEN",
      message: status === 401 ? "Authentication is required." : "Insufficient privileges for this resource.",
      action: decision.action,
      resource: decision.resource,
    } });
  }
  return next();
}
