import crypto from "crypto";
import type { NextFunction, Request, Response } from "express";
import { AUTH_TOKEN_PARTS, PUBLIC_API_ROUTES } from "../config/security";
import { logSecurityEvent } from "../infrastructure/securityLogger";
import type { AuthenticatedUser, AuthTokenPayload } from "../types/auth";

function isPublicApiRoute(req: Request): boolean {
  return PUBLIC_API_ROUTES.has(`${req.method} ${req.path}`);
}

function sendAuthenticationError(res: Response, status: number, code: string, message: string) {
  return res.status(status).json({ error: { code, message } });
}

function decodeBase64UrlJson<T>(value: string): T | null {
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
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

  return {
    id: payload.sub,
    tenantId: payload.tenantId,
    roles: payload.roles.filter((role) => typeof role === "string" && role.trim().length > 0),
    attributes: payload.attributes ?? {},
  };
}

export function authenticateApiRequest(req: Request, res: Response, next: NextFunction) {
  if (!req.path.startsWith("/api") || isPublicApiRoute(req)) return next();

  const authSecret = process.env.API_AUTH_SECRET;
  if (!authSecret) {
    logSecurityEvent("auth_not_configured", req);
    return sendAuthenticationError(res, 503, "AUTH_NOT_CONFIGURED", "Authentication is not configured for this service.");
  }

  const authHeader = req.header("authorization") || "";
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    logSecurityEvent("auth_missing", req);
    return sendAuthenticationError(res, 401, "UNAUTHENTICATED", "Authentication is required for this endpoint.");
  }

  const authenticatedUser = verifyAuthToken(token, authSecret);
  if (!authenticatedUser) {
    logSecurityEvent("auth_invalid_token", req);
    return sendAuthenticationError(res, 401, "INVALID_TOKEN", "The supplied authentication token is invalid or expired.");
  }

  req.user = authenticatedUser;
  return next();
}
