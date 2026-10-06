import { Hono } from 'hono';
import { db } from '@kit/database';
import { sql } from 'drizzle-orm';

export const healthRouter = new Hono();

healthRouter.get('/live', (c) => {
  return c.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

healthRouter.get('/ready', async (c) => {
  try {
    await db.execute(sql`SELECT 1`);
    return c.json({
      status: 'ready',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return c.json(
      {
        status: 'not_ready',
        database: 'disconnected',
        error: err.message,
        timestamp: new Date().toISOString(),
      },
      503
    );
  }
});
