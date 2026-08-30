import { afterEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { SecurityPipeline, AuthConfigurationError } from '../server/security/authPipeline';

const originalNodeEnv = process.env.NODE_ENV;
const originalAuthSecret = process.env.API_AUTH_SECRET;
const originalAuthToken = process.env.API_AUTH_TOKEN;
const originalAllowLocal = process.env.API_AUTH_ALLOW_INSECURE_LOCAL_SECRET;

afterEach(() => {
  process.env.NODE_ENV = originalNodeEnv;
  if (originalAuthSecret === undefined) delete process.env.API_AUTH_SECRET;
  else process.env.API_AUTH_SECRET = originalAuthSecret;
  if (originalAuthToken === undefined) delete process.env.API_AUTH_TOKEN;
  else process.env.API_AUTH_TOKEN = originalAuthToken;
  if (originalAllowLocal === undefined) delete process.env.API_AUTH_ALLOW_INSECURE_LOCAL_SECRET;
  else process.env.API_AUTH_ALLOW_INSECURE_LOCAL_SECRET = originalAllowLocal;
});

describe('authentication signing secret configuration', () => {
  it('fails safely in production when no authentication signing secret is configured', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.API_AUTH_SECRET;
    delete process.env.API_AUTH_TOKEN;
    delete process.env.API_AUTH_ALLOW_INSECURE_LOCAL_SECRET;

    expect(() => SecurityPipeline.assertConfiguredForRuntime()).toThrow(AuthConfigurationError);
    expect(() => SecurityPipeline.generateToken({
      sub: 'usr-admin-1',
      tenantId: 'TENANT-SA-01',
      roles: ['admin'],
    })).toThrow(AuthConfigurationError);
  });

  it('allows unsigned local fallback only when development mode explicitly opts in', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.API_AUTH_SECRET;
    delete process.env.API_AUTH_TOKEN;
    process.env.API_AUTH_ALLOW_INSECURE_LOCAL_SECRET = 'true';

    expect(() => SecurityPipeline.assertConfiguredForRuntime()).not.toThrow();
    const token = SecurityPipeline.generateToken({
      sub: 'usr-local-dev',
      tenantId: 'TENANT-LOCAL',
      roles: ['admin'],
    });

    expect(SecurityPipeline.verifyToken(token)?.sub).toBe('usr-local-dev');
  });

  it('does not retain the removed hard-coded production signing secret in the authentication path', () => {
    const authPipelineSource = readFileSync('src/server/security/authPipeline.ts', 'utf8');

    expect(authPipelineSource).not.toContain('omni-pos-enterprise-signing-secret-2026');
    expect(authPipelineSource).not.toMatch(/SYSTEM_SIGNING_SECRET\s*=.*['"]/);
  });
});
