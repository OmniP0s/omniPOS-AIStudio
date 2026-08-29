import crypto from "crypto";
import type { Request } from "express";
import { AUTH_TOKEN_PARTS, DEFAULT_PRIVATE_API_POLICY, PUBLIC_API_ROUTES, ROUTE_AUTHORIZATION_POLICIES } from "../config/security";
import type { AuthenticatedUser, AuthTokenPayload, AuthorizationDecision, RouteAuthorizationPolicy } from "../types/auth";

export function isPublicApiRoute(req: Request): boolean {
  return PUBLIC_API_ROUTES.has(`${req.method} ${req.path}`);
}

function decodeBase64UrlJson<T>(value: string): T | null {
  try { return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as T; } catch { return null; }
}

function signAuthPayload(encodedPayload: string, secret: string): Buffer {
  return crypto.createHmac("sha256", secret).update(encodedPayload).digest();
}

export function verifyAuthToken(token: string, secret: string): AuthenticatedUser | null {
  const tokenParts = token.split(".");
  if (tokenParts.length !== AUTH_TOKEN_PARTS) return null;
  const [encodedPayload, encodedSignature] = tokenParts;
  const expectedSignature = signAuthPayload(encodedPayload, secret);
  const suppliedSignature = Buffer.from(encodedSignature, "base64url");
  if (suppliedSignature.length !== expectedSignature.length || !crypto.timingSafeEqual(suppliedSignature, expectedSignature)) return null;
  const payload = decodeBase64UrlJson<AuthTokenPayload>(encodedPayload);
  if (!payload || !payload.sub || !payload.tenantId || !Array.isArray(payload.roles) || payload.roles.length === 0) return null;
  if (!Number.isFinite(payload.exp) || payload.exp <= Math.floor(Date.now() / 1000)) return null;
  return { id: payload.sub, tenantId: payload.tenantId, roles: payload.roles.filter((role) => typeof role === "string" && role.trim().length > 0), attributes: payload.attributes ?? {} };
}

function resolveAuthorizationPolicy(req: Request): RouteAuthorizationPolicy {
  return ROUTE_AUTHORIZATION_POLICIES.find(({ method, pathPrefix }) => req.method === method && req.path.startsWith(pathPrefix))?.policy ?? DEFAULT_PRIVATE_API_POLICY;
}

export function evaluateAuthorization(req: Request): AuthorizationDecision {
  const policy = resolveAuthorizationPolicy(req);
  if (!req.user) return { allowed: false, action: policy.action, resource: policy.resource, reason: "AUTHENTICATED_IDENTITY_REQUIRED" };
  if (policy.requireTenant && !req.user.tenantId.startsWith("TENANT-")) return { allowed: false, action: policy.action, resource: policy.resource, reason: "TENANT_ATTRIBUTE_REQUIRED" };
  const principalRoles = new Set(req.user.roles.map((role) => role.toLowerCase()));
  const hasAllowedRole = policy.allowedRoles.some((role) => principalRoles.has(role.toLowerCase()));
  if (!hasAllowedRole) return { allowed: false, action: policy.action, resource: policy.resource, reason: "REQUIRED_ROLE_MISSING" };
  return { allowed: true, action: policy.action, resource: policy.resource };
}

export function firstTenantIdCandidate(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const tenantId = (value as Record<string, unknown>).tenantId;
  return typeof tenantId === "string" && tenantId.trim().length > 0 ? tenantId : null;
}
