import { afterEach, describe, expect, it } from 'vitest';
import { enforceCorsAllowlist } from '../../middleware/httpSecurity';

const originalAllowedOrigins = process.env.CORS_ALLOWED_ORIGINS;

afterEach(() => {
  if (originalAllowedOrigins === undefined) delete process.env.CORS_ALLOWED_ORIGINS;
  else process.env.CORS_ALLOWED_ORIGINS = originalAllowedOrigins;
});

function request(origin: string, host = 'pos.example.com') {
  return {
    method: 'GET',
    protocol: 'https',
    header: (name: string) => name === 'origin' ? origin : undefined,
    get: (name: string) => name === 'host' ? host : undefined,
  } as any;
}

function response() {
  return {
    statusCode: 200,
    body: undefined as unknown,
    headers: {} as Record<string, string>,
    status(code: number) { this.statusCode = code; return this; },
    json(body: unknown) { this.body = body; return this; },
    setHeader(name: string, value: string) { this.headers[name] = value; },
  } as any;
}

describe('CORS origin enforcement', () => {
  it('allows same-origin requests without allowlist configuration', () => {
    delete process.env.CORS_ALLOWED_ORIGINS;
    const res = response();
    let nextCalled = false;

    enforceCorsAllowlist(request('https://pos.example.com'), res, () => { nextCalled = true; });

    expect(nextCalled).toBe(true);
    expect(res.headers['Access-Control-Allow-Origin']).toBe('https://pos.example.com');
  });

  it('allows cross-origin requests only when explicitly allowlisted', () => {
    process.env.CORS_ALLOWED_ORIGINS = 'https://admin.example.com';
    const res = response();
    let nextCalled = false;

    enforceCorsAllowlist(request('https://admin.example.com'), res, () => { nextCalled = true; });

    expect(nextCalled).toBe(true);
    expect(res.headers['Access-Control-Allow-Origin']).toBe('https://admin.example.com');
  });

  it('fails closed for unlisted cross-origin requests', () => {
    delete process.env.CORS_ALLOWED_ORIGINS;
    const res = response();

    enforceCorsAllowlist(request('https://attacker.example'), res, () => {
      throw new Error('next must not be called');
    });

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ error: { code: 'CORS_ORIGIN_DENIED', message: 'Origin is not allowed.' } });
  });
});
