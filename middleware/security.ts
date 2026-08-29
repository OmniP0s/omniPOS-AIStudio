import crypto from "crypto";
import type { NextFunction, Request, Response } from "express";
import { AUTH_TOKEN_PARTS, corsAllowedOrigins, DEFAULT_PRIVATE_API_POLICY, PUBLIC_API_ROUTES, ROUTE_AUTHORIZATION_POLICIES } from "../config/security";
import { logSecurityEvent } from "../infrastructure/logger";
import type { AuthenticatedUser, AuthTokenPayload, AuthorizationDecision, RouteAuthorizationPolicy } from "../types/security";

export function isPublicApiRoute(req: Request): boolean {
  return PUBLIC_API_ROUTES.has(`${req.method} ${req.path}`);
}

function sendAuthenticationError(res: Response, status: number, code: string, message: string) {
  return res.status(status).json({ error: { code, message } });
}

function decodeBase64UrlJson<T>(value: string): T | null {
  try { return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as T; } catch { return null; }
}

function signAuthPayload(encodedPayload: string, secret: string): Buffer {
  return crypto.createHmac("sha256", secret).update(encodedPayload).digest();
}

function verifyAuthToken(token: string, secret: string): AuthenticatedUser | null {
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

function evaluateAuthorization(req: Request): AuthorizationDecision {
  const policy = resolveAuthorizationPolicy(req);
  if (!req.user) return { allowed: false, action: policy.action, resource: policy.resource, reason: "AUTHENTICATED_IDENTITY_REQUIRED" };
  if (policy.requireTenant && !req.user.tenantId.startsWith("TENANT-")) return { allowed: false, action: policy.action, resource: policy.resource, reason: "TENANT_ATTRIBUTE_REQUIRED" };
  const principalRoles = new Set(req.user.roles.map((role) => role.toLowerCase()));
  const hasAllowedRole = policy.allowedRoles.some((role) => principalRoles.has(role.toLowerCase()));
  if (!hasAllowedRole) return { allowed: false, action: policy.action, resource: policy.resource, reason: "REQUIRED_ROLE_MISSING" };
  return { allowed: true, action: policy.action, resource: policy.resource };
}

export function authenticateApiRequest(req: Request, res: Response, next: NextFunction) {
  if (!req.path.startsWith("/api") || isPublicApiRoute(req)) return next();
  const authSecret = process.env.API_AUTH_SECRET;
  if (!authSecret) { logSecurityEvent("auth_not_configured", req); return sendAuthenticationError(res, 503, "AUTH_NOT_CONFIGURED", "Authentication is not configured for this service."); }
  const authHeader = req.header("authorization") || "";
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) { logSecurityEvent("auth_missing", req); return sendAuthenticationError(res, 401, "UNAUTHENTICATED", "Authentication is required for this endpoint."); }
  const authenticatedUser = verifyAuthToken(token, authSecret);
  if (!authenticatedUser) { logSecurityEvent("auth_invalid_token", req); return sendAuthenticationError(res, 401, "INVALID_TOKEN", "The supplied authentication token is invalid or expired."); }
  req.user = authenticatedUser;
  return next();
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

function firstTenantIdCandidate(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const tenantId = (value as Record<string, unknown>).tenantId;
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

type RateLimitBucket = { count: number; resetAt: number };
const rateLimitBuckets = new Map<string, RateLimitBucket>();

export function rateLimitApiRequests(req: Request, res: Response, next: NextFunction) {
  if (!req.path.startsWith("/api")) return next();
  const isAiEndpoint = req.path.startsWith("/api/ai") || req.path.startsWith("/api/chat") || req.path.startsWith("/api/generate");
  const limit = isAiEndpoint ? 30 : 120;
  const windowMs = 60_000;
  const key = `${req.ip}:${isAiEndpoint ? "ai" : "api"}`;
  const now = Date.now();
  const bucket = rateLimitBuckets.get(key);
  const nextBucket = !bucket || bucket.resetAt <= now ? { count: 1, resetAt: now + windowMs } : { count: bucket.count + 1, resetAt: bucket.resetAt };
  rateLimitBuckets.set(key, nextBucket);
  res.setHeader("RateLimit-Limit", String(limit));
  res.setHeader("RateLimit-Remaining", String(Math.max(0, limit - nextBucket.count)));
  res.setHeader("RateLimit-Reset", String(Math.ceil(nextBucket.resetAt / 1000)));
  if (nextBucket.count > limit) { logSecurityEvent("rate_limited", req, { limit, windowMs }); return res.status(429).json({ error: { code: "RATE_LIMITED", message: "Too many requests." } }); }
  return next();
}

export function enforceCorsAllowlist(req: Request, res: Response, next: NextFunction) {
  const origin = req.header("origin");
  if (!origin) return next();
  if (!corsAllowedOrigins.has(origin)) return res.status(403).json({ error: { code: "CORS_ORIGIN_DENIED", message: "Origin is not allowed." } });
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();
  return next();
}

export function applySecurityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  res.setHeader("X-DNS-Prefetch-Control", "off");
  res.setHeader("Content-Security-Policy", ["default-src 'self'", "script-src 'self'", "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", "font-src 'self' https://fonts.gstatic.com", "img-src 'self' data: https:", "connect-src 'self'", "frame-ancestors 'none'", "base-uri 'self'", "form-action 'self'"].join("; "));
  return next();
}

export function handleApiError(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (res.headersSent) return;
  const errorId = `err-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
  console.error(JSON.stringify({ level: "error", event: "api_error", errorId, path: req.path, method: req.method, name: err instanceof Error ? err.name : "UnknownError" }));
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "An internal server error occurred.", errorId } });
}
