import { describe, expect, it } from 'vitest';
import { app } from './app';

describe('health', () => {
  it('GET /health/live returns ok', async () => {
    const res = await app.request('/health/live');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
  });

  it('sets mandatory security headers (security.md)', async () => {
    const res = await app.request('/health/live');
    expect(res.headers.get('x-frame-options')).toBe('DENY');
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
    expect(res.headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin');
    expect(res.headers.get('content-security-policy')).toContain("default-src 'self'");
    expect(res.headers.get('strict-transport-security')).toContain('max-age=');
  });
});

describe('dev login (LocalAdapter, non-production only)', () => {
  it('issues token for known local account', async () => {
    const res = await app.request('/api/v1/auth/dev-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'dev-admin' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.token).toBe('dev-admin');
    expect(body.data.actor.permissions).toContain('*');
  });

  it('rejects unknown username (401)', async () => {
    const res = await app.request('/api/v1/auth/dev-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'penyusup' }),
    });
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
  });
});

describe('auth guard', () => {
  it('rejects protected route without token (401)', async () => {
    const res = await app.request('/api/v1/pegawai');
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.meta.request_id).toBeDefined();
  });

  it('accepts valid local dev token, then hits DB (not 401/403)', async () => {
    const res = await app.request('/api/v1/pegawai', {
      headers: { Authorization: 'Bearer dev-admin' },
    });
    // Route ini butuh DB (postgres) — tanpa DB, dijamin gagal selain 401/403 (biasanya 500).
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });
});

describe('audit verify (RBAC)', () => {
  it('rejects without token (401)', async () => {
    const res = await app.request('/api/v1/audit/verify');
    expect(res.status).toBe(401);
  });

  it('rejects account without audit.verify permission (403)', async () => {
    const res = await app.request('/api/v1/audit/verify', {
      headers: { Authorization: 'Bearer dev-operator' },
    });
    expect(res.status).toBe(403);
  });
});