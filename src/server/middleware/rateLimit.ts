import type { NextFunction, Request, Response } from "express";
import { logSecurityEvent } from "../infrastructure/securityLogger";

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
  if (nextBucket.count > limit) {
    logSecurityEvent("rate_limited", req, { limit, windowMs });
    return res.status(429).json({ error: { code: "RATE_LIMITED", message: "Too many requests." } });
  }
  return next();
}
