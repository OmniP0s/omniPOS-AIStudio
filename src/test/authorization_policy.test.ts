import { describe, expect, it } from 'vitest';
import { authorizeApiRequest, evaluateAuthorization } from '../../middleware/security';

function createResponse() {
  const res: any = {
    statusCode: 200,
    body: undefined,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
  return res;
}

describe('API authorization policy enforcement', () => {
  it('denies authenticated users whose roles are not allowed for a protected route', () => {
    const req: any = {
      method: 'POST',
      path: '/api/zatca/compliance-check',
      user: {
        id: 'usr-cashier-1',
        tenantId: 'TENANT-SA-01',
        roles: ['cashier'],
        attributes: {},
      },
    };
    const res = createResponse();
    let nextCalled = false;

    authorizeApiRequest(req, res, () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(false);
    expect(req.authorization).toEqual({
      allowed: false,
      action: 'write',
      resource: 'zatca-compliance',
      reason: 'INSUFFICIENT_ROLE',
    });
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({
      error: {
        code: 'INSUFFICIENT_ROLE',
        message: 'Insufficient privileges for this resource.',
        action: 'write',
        resource: 'zatca-compliance',
      },
    });
  });

  it('allows authenticated users whose roles match the configured route policy', () => {
    const req: any = {
      method: 'POST',
      path: '/api/zatca/compliance-check',
      user: {
        id: 'usr-compliance-1',
        tenantId: 'TENANT-SA-01',
        roles: ['compliance'],
        attributes: {},
      },
    };
    const res = createResponse();
    let nextCalled = false;

    authorizeApiRequest(req, res, () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(true);
    expect(req.authorization).toEqual({
      allowed: true,
      action: 'write',
      resource: 'zatca-compliance',
    });
    expect(res.statusCode).toBe(200);
  });

  it('requires tenant identity when a route policy is tenant-scoped', () => {
    const decision = evaluateAuthorization({
      method: 'GET',
      path: '/api/orders',
      user: {
        id: 'usr-admin-1',
        tenantId: '',
        roles: ['admin'],
        attributes: {},
      },
    } as any);

    expect(decision).toEqual({
      allowed: false,
      action: 'read',
      resource: 'orders',
      reason: 'TENANT_REQUIRED',
    });
  });

  it.each(['/api/metrics', '/api/db/health'])('limits %s to admin and ops roles', (path) => {
    const cashierDecision = evaluateAuthorization({
      method: 'GET', path, user: { id: 'usr-1', tenantId: 'TENANT-SA-01', roles: ['cashier'], attributes: {} },
    } as any);
    const opsDecision = evaluateAuthorization({
      method: 'GET', path, user: { id: 'usr-2', tenantId: 'TENANT-SA-01', roles: ['ops'], attributes: {} },
    } as any);

    expect(cashierDecision.allowed).toBe(false);
    expect(cashierDecision.reason).toBe('INSUFFICIENT_ROLE');
    expect(opsDecision.allowed).toBe(true);
  });
});
