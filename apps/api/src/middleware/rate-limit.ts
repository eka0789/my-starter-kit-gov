import type { Context, Next } from 'hono';

interface RateLimitOptions {
  /** Panjang jendela waktu (milidetik) */
  windowMs: number;
  /** Maksimum permintaan per jendela per kunci */
  max: number;
  /** Kunci rate limit; default IP dari X-Forwarded-For */
  keyGenerator?: (c: Context) => string;
}

export function getClientIp(c: Context): string {
  const forwarded = c.req.header('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() ?? 'unknown';
  }
  return c.req.header('x-real-ip') ?? 'unknown';
}

// Baseline in-memory (sliding window) sesuai .ai/security.md § Rate Limiting.
// Production wajib memakai pembatasan di gateway (Nginx limit_req) atau Redis —
// in-memory tidak dibagi antar instance/replika.
export function createRateLimiter(options: RateLimitOptions) {
  const keyOf = options.keyGenerator ?? ((c: Context) => getClientIp(c));
  const buckets = new Map<string, number[]>();

  return async function rateLimiter(c: Context, next: Next) {
    const key = keyOf(c);
    const now = Date.now();
    const hits = (buckets.get(key) ?? []).filter((t) => t > now - options.windowMs);

    if (hits.length >= options.max) {
      const oldest = hits[0] ?? now;
      const retryAfter = Math.max(Math.ceil((oldest + options.windowMs - now) / 1000), 1);
      return c.json(
        {
          success: false,
          message: 'Terlalu banyak permintaan. Silakan coba lagi nanti.',
          meta: { request_id: c.get('requestId') ?? 'unknown', timestamp: new Date().toISOString() },
        },
        429,
        { 'Retry-After': String(retryAfter) }
      );
    }

    hits.push(now);
    buckets.set(key, hits);

    // Proteksi memori: buang bucket yang sudah basi bila map membesar.
    if (buckets.size > 5000) {
      for (const [k, v] of buckets) {
        if (!v.some((t) => t > now - options.windowMs)) {
          buckets.delete(k);
        }
      }
    }

    await next();
  };
}