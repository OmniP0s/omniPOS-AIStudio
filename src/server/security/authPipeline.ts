// Zero-Trust Authentication, RBAC/ABAC Authorization Pipeline & Audit Logger

import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { ITenantContext, TenantContextHolder } from './tenantContext';

export interface TokenClaims {
  sub: string;
  tenantId: string;
  branchId?: string;
  roles: string[];
  permissions?: string[];
  exp: number;
  iat?: number;
  iss?: string;
  aud?: string;
}

export class AuthConfigurationError extends Error {
  constructor() {
    super('API_AUTH_SECRET must be configured for authentication token signing.');
    this.name = 'AuthConfigurationError';
  }
}

export class SecurityPipeline {
  private static readonly AUTH_TOKEN_PARTS = 2; // [base64url(payload), base64url(hmacSignature)]
  private static readonly LOCAL_TEST_SIGNING_SECRET = crypto.randomBytes(32).toString('base64url');

  private static isExplicitLocalDevelopmentMode(): boolean {
    return process.env.NODE_ENV === 'development' && process.env.API_AUTH_ALLOW_INSECURE_LOCAL_SECRET === 'true';
  }

  private static getSigningSecret(): string {
    const configuredSecret = process.env.API_AUTH_SECRET || process.env.API_AUTH_TOKEN;
    if (configuredSecret) return configuredSecret;

    if (process.env.NODE_ENV === 'test' || this.isExplicitLocalDevelopmentMode()) {
      return this.LOCAL_TEST_SIGNING_SECRET;
    }

    throw new AuthConfigurationError();
  }

  public static assertConfiguredForRuntime(): void {
    this.getSigningSecret();
  }

  /**
   * Generates a tamper-proof cryptographically signed authorization token
   */
  public static generateToken(claims: Omit<TokenClaims, 'exp' | 'iat'>, ttlSeconds: number = 86400): string {
    const now = Math.floor(Date.now() / 1000);
    const fullClaims: TokenClaims = {
      ...claims,
      iat: now,
      exp: now + ttlSeconds,
      iss: 'omni-pos-identity-service',
      aud: 'omni-pos-api',
      permissions: claims.permissions || this.inferPermissions(claims.roles),
    };

    const encodedPayload = Buffer.from(JSON.stringify(fullClaims), 'utf8').toString('base64url');
    const signature = crypto.createHmac('sha256', this.getSigningSecret()).update(encodedPayload).digest('base64url');
    return `${encodedPayload}.${signature}`;
  }

  /**
   * Validates token cryptographic signature, expiry, and payload integrity
   */
  public static verifyToken(token: string): TokenClaims | null {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== this.AUTH_TOKEN_PARTS) return null;

    const [encodedPayload, encodedSignature] = parts;
    const expectedSignature = crypto.createHmac('sha256', this.getSigningSecret()).update(encodedPayload).digest('base64url');

    // Constant-time timing-safe comparison to prevent side-channel timing attacks
    const sigBufA = Buffer.from(encodedSignature);
    const sigBufB = Buffer.from(expectedSignature);
    if (sigBufA.length !== sigBufB.length || !crypto.timingSafeEqual(sigBufA, sigBufB)) {
      return null;
    }

    try {
      const claims = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as TokenClaims;
      const now = Math.floor(Date.now() / 1000);

      if (!claims.sub || !claims.tenantId || !Array.isArray(claims.roles)) {
        return null;
      }
      if (typeof claims.exp !== 'number' || claims.exp <= now) {
        return null;
      }

      return claims;
    } catch {
      return null;
    }
  }

  /**
   * Infers fine-grained ABAC/RBAC permissions from enterprise roles
   */
  public static inferPermissions(roles: string[]): string[] {
    const perms = new Set<string>();
    for (const role of roles) {
      switch (role.toLowerCase()) {
        case 'super_admin':
        case 'admin':
          perms.add('*');
          break;
        case 'branch_manager':
        case 'manager':
          perms.add('pos:order:read');
          perms.add('pos:order:create');
          perms.add('pos:order:update');
          perms.add('pos:order:discount');
          perms.add('pos:order:void');
          perms.add('pos:shift:open');
          perms.add('pos:shift:close');
          perms.add('pos:inventory:read');
          perms.add('pos:inventory:adjust');
          perms.add('pos:report:view');
          break;
        case 'cashier':
          perms.add('pos:order:read');
          perms.add('pos:order:create');
          perms.add('pos:order:pay');
          perms.add('pos:shift:open');
          perms.add('pos:shift:close');
          break;
        case 'waiter':
        case 'captain':
          perms.add('pos:order:read');
          perms.add('pos:order:create');
          perms.add('pos:table:transfer');
          break;
        case 'kitchen':
        case 'kds':
          perms.add('pos:kds:read');
          perms.add('pos:kds:status_update');
          break;
        case 'compliance':
        case 'auditor':
          perms.add('zatca:invoice:view');
          perms.add('audit:log:read');
          break;
      }
    }
    return Array.from(perms);
  }

  /**
   * Express Middleware for Zero-Trust Authentication, Context Injection & Correlation Tracking
   */
  public static middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const correlationId = (req.header('x-correlation-id') as string) || `req-${crypto.randomUUID().slice(0, 12)}`;
      res.setHeader('x-correlation-id', correlationId);

      // Only the liveness endpoint is public. Operational endpoints require authentication.
      if (req.path === '/api/health' || !req.path.startsWith('/api')) {
        return next();
      }

      const authHeader = req.header('authorization') || '';
      const customApiKey = req.header('x-api-key') || '';
      const [, bearerToken] = authHeader.split(' ');
      const token = bearerToken || (customApiKey as string);

      let claims: TokenClaims | null = null;

      if (token) {
        claims = SecurityPipeline.verifyToken(token);
      }

      if (!claims) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'A valid authentication token is required.',
          },
        });
      }

      const tenantContext: ITenantContext = {
        tenantId: claims.tenantId,
        branchId: claims.branchId,
        userId: claims.sub,
        roles: claims.roles,
        permissions: claims.permissions || SecurityPipeline.inferPermissions(claims.roles),
        correlationId,
      };

      // Expose to req object for backwards-compatibility
      (req as any).user = {
        id: tenantContext.userId,
        tenantId: tenantContext.tenantId,
        branchId: tenantContext.branchId,
        roles: tenantContext.roles,
        permissions: tenantContext.permissions,
      };
      (req as any).tenantId = tenantContext.tenantId;
      (req as any).correlationId = correlationId;

      // Wrap downstream middleware and route handlers in AsyncLocalStorage tenant isolation
      TenantContextHolder.run(tenantContext, () => {
        next();
      });
    };
  }

  /**
   * Enforces specific permission requirements on protected route handlers
   */
  public static requirePermission(permission: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      const ctx = TenantContextHolder.get();
      if (!ctx) {
        return res.status(401).json({ error: 'Unauthorized: missing authentication context' });
      }

      const hasWildcard = ctx.permissions.includes('*');
      const hasSpecificPerm = ctx.permissions.includes(permission);

      if (!hasWildcard && !hasSpecificPerm) {
        return res.status(403).json({
          error: 'Forbidden: Insufficient privileges',
          requiredPermission: permission,
          correlationId: ctx.correlationId,
        });
      }

      next();
    };
  }
}
