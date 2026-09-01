import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { getHealthStatus } from '../../services/platformService';

describe('server security architecture regressions', () => {
  it('keeps API endpoint definitions out of the server bootstrap', () => {
    const source = readFileSync('server.ts', 'utf8');

    expect(source).not.toMatch(/app\.(get|post|put|patch|delete)\(["']\/api\//);
    expect(source).toContain('registerApiRoutes(app)');
  });

  it('registers the global error handler after development and production setup', () => {
    const source = readFileSync('server.ts', 'utf8');

    expect(source.lastIndexOf('app.use(handleApiError)')).toBeGreaterThan(source.lastIndexOf('app.use(vite.middlewares)'));
    expect(source.lastIndexOf('app.use(handleApiError)')).toBeGreaterThan(source.lastIndexOf('app.use(express.static(distPath))'));
  });

  it('does not expose secret configuration state through public health output', () => {
    const health = getHealthStatus();

    expect(health).not.toHaveProperty('hasKey');
    expect(health).not.toHaveProperty('hasAuthTokenConfigured');
  });

  it('contains no hard-coded tenant fallback in API controllers or routes', () => {
    const sources = [
      readFileSync('controllers/aiController.ts', 'utf8'),
      readFileSync('routes/enterpriseRoutes.ts', 'utf8'),
    ].join('\n');

    expect(sources).not.toContain('tenant-sa-001');
    expect(sources).not.toContain('TENANT-DEFAULT-01');
  });
});
