import type { Request } from "express";

export function logSecurityEvent(event: string, req: Request, details: Record<string, unknown> = {}) {
  console.log(JSON.stringify({
    level: "info",
    event,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userId: req.user?.id,
    tenantId: req.tenantId ?? req.user?.tenantId,
    ...details,
  }));
}
