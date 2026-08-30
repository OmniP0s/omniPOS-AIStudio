export type SecurityAttributeValue = string | number | boolean | string[];

export type AuthenticatedUser = {
  id: string;
  tenantId: string;
  roles: string[];
  attributes: Record<string, SecurityAttributeValue>;
};

export type AuthTokenPayload = {
  sub: string;
  tenantId: string;
  roles: string[];
  exp: number;
  attributes?: Record<string, SecurityAttributeValue>;
};

export type AuthorizationDecision = {
  allowed: boolean;
  action: string;
  resource: string;
  reason?: string;
};

export type RouteAuthorizationPolicy = {
  action: string;
  resource: string;
  allowedRoles: string[];
  requireTenant: boolean;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      authorization?: AuthorizationDecision;
      tenantId?: string;
    }
  }
}
