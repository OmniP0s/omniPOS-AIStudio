import type { AuthenticatedUser, AuthorizationDecision } from "./auth";

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      authorization?: AuthorizationDecision;
      tenantId?: string;
    }
  }
}

export {};
