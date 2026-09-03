// Enterprise Authentication Repository Port Contracts
// Pure Hexagonal boundaries decoupled from database implementations

// A single credential row from the tenant-scoped users table (migration 20260830_003).
// `passwordHash` and `pinHash` are both nullable because an account authenticates with a
// password, a PIN, or either — but the database guarantees at least one is present.
export interface AuthUserRecord {
  id: string;
  tenantId: string;
  email: string;
  passwordHash: string | null;
  pinHash: string | null;
  roles: string[];
  branchId: string;
  isActive: boolean;
}

// Minimal tenant projection used to resolve a tenant code before any credential lookup.
// Carries `status` so the caller can refuse suspended tenants without a second query.
export interface TenantLookupRecord {
  id: string;
  status: string;
}

// Deliberately read-only and deliberately NOT derived from IRepository: the login flow only
// ever reads credentials, so exposing save/delete here would widen the attack surface for no
// benefit. Credential writes belong to a separate administrative contract.
//
// Every lookup is tenant-scoped so that PostgreSQL Row-Level Security can enforce isolation
// and so that a PIN cannot be probed across tenants.
export interface IAuthUserRepository {
  findTenantIdByCode(code: string): Promise<TenantLookupRecord | null>;
  findAuthByEmail(tenantId: string, email: string): Promise<AuthUserRecord | null>;
  findActivePinUser(tenantId: string, pinHash: string): Promise<AuthUserRecord | null>;
}
