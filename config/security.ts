import type { RouteAuthorizationPolicy } from "../types/security";

export const PUBLIC_API_ROUTES = new Set(["GET /api/health"]);
export const AUTH_TOKEN_PARTS = 2;
export const DEFAULT_PRIVATE_API_POLICY: RouteAuthorizationPolicy = { action: "access", resource: "private-api", allowedRoles: ["admin"], requireTenant: true };
export const ROUTE_AUTHORIZATION_POLICIES: Array<{ method: string; pathPrefix: string; policy: RouteAuthorizationPolicy }> = [
  { method: "GET", pathPrefix: "/api/metrics", policy: { action: "read", resource: "platform-metrics", allowedRoles: ["admin", "ops"], requireTenant: true } },
  { method: "GET", pathPrefix: "/api/db/health", policy: { action: "read", resource: "database-health", allowedRoles: ["admin", "ops"], requireTenant: true } },
  { method: "GET", pathPrefix: "/api/orders", policy: { action: "read", resource: "orders", allowedRoles: ["admin", "cashier", "manager", "ops"], requireTenant: true } },
  { method: "POST", pathPrefix: "/api/orders", policy: { action: "write", resource: "orders", allowedRoles: ["admin", "cashier", "manager"], requireTenant: true } },
  { method: "GET", pathPrefix: "/api/inventory", policy: { action: "read", resource: "inventory", allowedRoles: ["admin", "manager", "inventory_clerk"], requireTenant: true } },
  { method: "GET", pathPrefix: "/api/shifts", policy: { action: "read", resource: "shifts", allowedRoles: ["admin", "cashier", "manager"], requireTenant: true } },
  { method: "POST", pathPrefix: "/api/shifts", policy: { action: "write", resource: "shifts", allowedRoles: ["admin", "cashier", "manager"], requireTenant: true } },
  { method: "POST", pathPrefix: "/api/ai", policy: { action: "invoke", resource: "ai-services", allowedRoles: ["admin", "ai_operator"], requireTenant: true } },
  { method: "POST", pathPrefix: "/api/ai-apps", policy: { action: "invoke", resource: "ai-applications", allowedRoles: ["admin", "ai_operator"], requireTenant: true } },
  { method: "POST", pathPrefix: "/api/ai-agents", policy: { action: "invoke", resource: "ai-agents", allowedRoles: ["admin", "ai_operator"], requireTenant: true } },
  { method: "POST", pathPrefix: "/api/chat", policy: { action: "invoke", resource: "ai-chat", allowedRoles: ["admin", "ai_operator", "cashier"], requireTenant: true } },
  { method: "POST", pathPrefix: "/api/generate", policy: { action: "invoke", resource: "content-generation", allowedRoles: ["admin", "ai_operator", "manager"], requireTenant: true } },
  { method: "POST", pathPrefix: "/api/sync", policy: { action: "write", resource: "sync-outbox", allowedRoles: ["admin", "system"], requireTenant: true } },
  { method: "POST", pathPrefix: "/api/zatca", policy: { action: "write", resource: "zatca-compliance", allowedRoles: ["admin", "compliance"], requireTenant: true } },
];

export function getCorsAllowedOrigins(): Set<string> {
  return new Set((process.env.CORS_ALLOWED_ORIGINS || "").split(",").map((origin) => origin.trim()).filter(Boolean));
}
