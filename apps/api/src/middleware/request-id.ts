import type { Context, Next } from 'hono';
import { randomUUID } from 'crypto';

export async function requestIdMiddleware(c: Context, next: Next) {
  const reqId = c.req.header('x-request-id') ?? randomUUID();
  c.set('requestId', reqId);
  c.header('x-request-id', reqId);
  await next();
}
