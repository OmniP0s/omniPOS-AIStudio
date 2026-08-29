import type { RouteAuthorizationPolicy } from "../types/auth";

export const PUBLIC_API_ROUTES = new Set(["GET /api/health"]);
export const AUTH_TOKEN_PARTS = 2;
export const DEFAULT_PRIVATE_API_POLICY: RouteAuthorizationPolicy = { action: "access", resource: "private-api", allowedRoles: ["admin"], requireTenant: true };
export const ROUTE_AUTHORIZATION_POLICIES: Array<{ method: string; pathPrefix: string; policy: RouteAuthorizationPolicy }> = [
  { method: "GET", pathPrefix: "/api/metrics", policy: { action: "read", resource: "platform-metrics", allowedRoles: ["admin", "ops"], requireTenant: true } },
  { method: "POST", pathPrefix: "/api/ai", policy: { action: "invoke", resource: "ai-services", allowedRoles: ["admin", "ai_operator"], requireTenant: true } },
  { method: "POST", pathPrefix: "/api/ai-apps", policy: { action: "invoke", resource: "ai-applications", allowedRoles: ["admin", "ai_operator"], requireTenant: true } },
  { method: "POST", pathPrefix: "/api/ai-agents", policy: { action: "invoke", resource: "ai-agents", allowedRoles: ["admin", "ai_operator"], requireTenant: true } },
  { method: "POST", pathPrefix: "/api/chat", policy: { action: "invoke", resource: "ai-chat", allowedRoles: ["admin", "ai_operator", "cashier"], requireTenant: true } },
  { method: "POST", pathPrefix: "/api/generate", policy: { action: "invoke", resource: "content-generation", allowedRoles: ["admin", "ai_operator", "manager"], requireTenant: true } },
  { method: "POST", pathPrefix: "/api/sync", policy: { action: "write", resource: "sync-outbox", allowedRoles: ["admin", "system"], requireTenant: true } },
  { method: "POST", pathPrefix: "/api/zatca", policy: { action: "write", resource: "zatca-compliance", allowedRoles: ["admin", "compliance"], requireTenant: true } },
];
