import type { Context, Next } from 'hono';
import { LocalAdapter } from '@kit/identity';
import type { Actor } from '@kit/types';

declare module 'hono' {
  interface ContextVariableMap {
    actor: Actor;
    requestId: string;
  }
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json(
      {
        success: false,
        message: 'Akses ditolak: token otentikasi tidak disediakan',
        meta: { request_id: c.get('requestId'), timestamp: new Date().toISOString() },
      },
      401
    );
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    const actor = await LocalAdapter.validate(token);
    c.set('actor', actor);
    await next();
  } catch (err: any) {
    return c.json(
      {
        success: false,
        message: err.message ?? 'Token tidak valid',
        meta: { request_id: c.get('requestId'), timestamp: new Date().toISOString() },
      },
      401
    );
  }
}

export function requirePermission(permission: string) {
  return async (c: Context, next: Next) => {
    const actor = c.get('actor');
    if (!actor) {
      return c.json(
        {
          success: false,
          message: 'Akses ditolak',
          meta: { request_id: c.get('requestId'), timestamp: new Date().toISOString() },
        },
        401
      );
    }

    if (actor.permissions.includes('*') || actor.permissions.includes(permission)) {
      await next();
    } else {
      return c.json(
        {
          success: false,
          message: `Akses ditolak: Anda membutuhkan izin '${permission}'`,
          meta: { request_id: c.get('requestId'), timestamp: new Date().toISOString() },
        },
        403
      );
    }
  };
}
