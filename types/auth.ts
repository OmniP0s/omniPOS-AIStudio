export type AuthenticatedUser = {
  id: string;
  tenantId: string;
  roles: string[];
  attributes: Record<string, string | number | boolean | string[]>;
};

export type AuthTokenPayload = {
  sub: string;
  tenantId: string;
  roles: string[];
  exp: number;
  attributes?: Record<string, string | number | boolean | string[]>;
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
