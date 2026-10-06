import { describe, expect, it } from 'vitest';
import { app } from './app';

describe('health', () => {
  it('GET /health/live returns ok', async () => {
    const res = await app.request('/health/live');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
  });
});

describe('auth guard', () => {
  it('rejects protected route without token', async () => {
    const res = await app.request('/api/v1/pegawai');
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.meta.request_id).toBeDefined();
  });

  it('accepts valid local dev token (NODE_ENV != production)', async () => {
    const res = await app.request('/api/v1/pegawai', {
      headers: { Authorization: 'Bearer dev-admin' },
    });
    // Route ini butuh DB (postgres) — kalau DB mati, dijamin gagal selain 401.
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });
});