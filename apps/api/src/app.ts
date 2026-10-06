import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { requestIdMiddleware } from './middleware/request-id';
import { healthRouter } from './routes/health';
import { employeeRoutes } from './features/employee-profiles/routes';

export const app = new Hono();

app.use('*', requestIdMiddleware);
app.use('*', logger());
app.use('*', cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' }));

app.route('/health', healthRouter);
app.route('/api/v1/pegawai', employeeRoutes);

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