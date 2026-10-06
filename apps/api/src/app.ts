import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { requestIdMiddleware } from './middleware/request-id';
import { securityHeaders } from './middleware/security-headers';
import { createRateLimiter } from './middleware/rate-limit';
import { healthRouter } from './routes/health';
import { authRoutes } from './routes/auth';
import { auditRoutes } from './routes/audit';
import { employeeRoutes } from './features/employee-profiles/routes';

export const app = new Hono();

app.use('*', requestIdMiddleware);
app.use('*', logger());
app.use('*', cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' }));
app.use('*', securityHeaders);

// security.md § Rate Limiting: API authenticated 100 request / menit per IP (baseline).
// Endpoint login punya batas lebih ketat (lihat routes/auth.ts).
app.use('/api/*', createRateLimiter({ windowMs: 60 * 1000, max: 100 }));

app.route('/health', healthRouter);
app.route('/api/v1/auth', authRoutes);
app.route('/api/v1/pegawai', employeeRoutes);
app.route('/api/v1/audit', auditRoutes);

app.onError((err, c) => {
  const requestId = c.get('requestId') ?? 'unknown';
  console.error(`[${requestId}] Unhandled error:`, err);

  return c.json(
    {
      success: false,
      message: 'Terjadi kesalahan pada server. Silakan hubungi administrator.',
      meta: { request_id: requestId, timestamp: new Date().toISOString() },
    },
    500
  );
});