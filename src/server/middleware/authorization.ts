import type { NextFunction, Request, Response } from "express";
import { DEFAULT_PRIVATE_API_POLICY, PUBLIC_API_ROUTES, ROUTE_AUTHORIZATION_POLICIES } from "../config/security";
import { logSecurityEvent } from "../infrastructure/securityLogger";
import type { AuthorizationDecision, RouteAuthorizationPolicy } from "../types/auth";

function isPublicApiRoute(req: Request): boolean {
  return PUBLIC_API_ROUTES.has(`${req.method} ${req.path}`);
}

function resolveAuthorizationPolicy(req: Request): RouteAuthorizationPolicy {
  return ROUTE_AUTHORIZATION_POLICIES.find(({ method, pathPrefix }) => req.method === method && req.path.startsWith(pathPrefix))?.policy ?? DEFAULT_PRIVATE_API_POLICY;
}

function evaluateAuthorization(req: Request): AuthorizationDecision {
  const policy = resolveAuthorizationPolicy(req);
  if (!req.user) return { allowed: false, action: policy.action, resource: policy.resource, reason: "AUTHENTICATED_IDENTITY_REQUIRED" };
  if (policy.requireTenant && !req.user.tenantId.startsWith("TENANT-")) return { allowed: false, action: policy.action, resource: policy.resource, reason: "TENANT_ATTRIBUTE_REQUIRED" };
  const principalRoles = new Set(req.user.roles.map((role) => role.toLowerCase()));
  const hasAllowedRole = policy.allowedRoles.some((role) => principalRoles.has(role.toLowerCase()));
  if (!hasAllowedRole) return { allowed: false, action: policy.action, resource: policy.resource, reason: "REQUIRED_ROLE_MISSING" };
  return { allowed: true, action: policy.action, resource: policy.resource };
}

export function authorizeApiRequest(req: Request, res: Response, next: NextFunction) {
  if (!req.path.startsWith("/api") || isPublicApiRoute(req)) return next();
  const decision = evaluateAuthorization(req);
  req.authorization = decision;
  if (!decision.allowed) {
    logSecurityEvent("authorization_denied", req, { reason: decision.reason, resource: decision.resource, action: decision.action });
    return res.status(403).json({ error: { code: "FORBIDDEN", message: "The authenticated principal is not authorized to access this endpoint." } });
  }
  return next();
}
