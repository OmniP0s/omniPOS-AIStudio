import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const routers = [
  { file: 'routes/platformRoutes.ts', prefix: '/api' },
  { file: 'routes/aiRoutes.ts', prefix: '/api' },
  { file: 'routes/aiAppsRoutes.ts', prefix: '/api/ai-apps' },
  { file: 'routes/aiAgentsRoutes.ts', prefix: '/api/ai-agents' },
  { file: 'routes/cognitiveAiRoutes.ts', prefix: '/api/cognitive-ai' },
  { file: 'routes/syncRoutes.ts', prefix: '/api/sync' },
  { file: 'routes/zatcaRoutes.ts', prefix: '/api/zatca' },
  { file: 'routes/enterpriseRoutes.ts', prefix: '' },
];

function joinPath(prefix: string, path: string): string {
  return `${prefix}/${path}`.replace(/\/{2,}/g, '/').replace(/\/$/, '') || '/';
}

describe('API route registration', () => {
  it('defines every method and full path in exactly one router', () => {
    const registrations = routers.flatMap(({ file, prefix }) => {
      const source = readFileSync(file, 'utf8');
      return [...source.matchAll(/\w+Router\.(get|post|put|patch|delete)\(["']([^"']+)["']/g)]
        .map((match) => ({ key: `${match[1].toUpperCase()} ${joinPath(prefix, match[2])}`, file }));
    });
    const filesByRoute = new Map<string, string[]>();
    for (const { key, file } of registrations) {
      filesByRoute.set(key, [...(filesByRoute.get(key) ?? []), file]);
    }
    const duplicates = [...filesByRoute].filter(([, files]) => files.length > 1);

    expect(duplicates).toEqual([]);
    expect(filesByRoute.get('GET /api/metrics')).toEqual(['routes/platformRoutes.ts']);
    expect(filesByRoute.get('GET /api/db/health')).toEqual(['routes/platformRoutes.ts']);
  });
});
