import { describe, expect, it } from 'vitest';
import { Hono } from 'hono';
import { createRateLimiter } from './rate-limit';

function buildApp(max: number) {
  const testApp = new Hono();
  testApp.use('*', createRateLimiter({ windowMs: 60_000, max }));
  testApp.get('/ping', (c) => c.json({ ok: true }));
  return testApp;
}

describe('rate limiter', () => {
  it('allows requests under the limit', async () => {
    const testApp = buildApp(3);
    for (let i = 0; i < 3; i += 1) {
      const res = await testApp.request('/ping');
      expect(res.status).toBe(200);
    }
  });

  it('returns 429 with Retry-After when over the limit', async () => {
    const testApp = buildApp(2);
    await testApp.request('/ping');
    await testApp.request('/ping');

    const res = await testApp.request('/ping');
    expect(res.status).toBe(429);
    expect(Number(res.headers.get('retry-after'))).toBeGreaterThan(0);

    const body = await res.json();
    expect(body.success).toBe(false);
  });
});