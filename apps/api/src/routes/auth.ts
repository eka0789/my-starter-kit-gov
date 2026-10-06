import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { LocalAdapter } from '@kit/identity';
import { createRateLimiter } from '../middleware/rate-limit';

// security.md § Rate Limiting: login 5 attempt / 15 menit per IP.
const loginLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 5 });

const devLoginSchema = z.object({
  username: z.string().trim().min(1, 'Username wajib diisi').max(64),
});

export const authRoutes = new Hono();

authRoutes.use('*', loginLimiter);

// Login development via LocalAdapter — SENGJAJA tidak aktif di production
// (fail-fast: di production endpoint disembunyikan dan LocalAdapter menolak).
// Production memakai SSO resmi: OIDC Authorization Code + PKCE / SAML2.
authRoutes.post('/dev-login', zValidator('json', devLoginSchema), async (c) => {
  if (process.env.NODE_ENV === 'production') {
    return c.json({ success: false, message: 'Not Found' }, 404);
  }

  const { username } = c.req.valid('json');

  try {
    const actor = await LocalAdapter.validate(username);
    return c.json({
      success: true,
      message: 'Login berhasil',
      data: { token: username, actor },
      meta: {
        request_id: c.get('requestId'),
        timestamp: new Date().toISOString(),
        version: 'v1',
        pagination: null,
        sdi_metadata: null,
      },
    });
  } catch {
    return c.json(
      {
        success: false,
        message: 'Username tidak dikenali pada adapter identitas lokal',
        meta: { request_id: c.get('requestId'), timestamp: new Date().toISOString() },
      },
      401
    );
  }
});