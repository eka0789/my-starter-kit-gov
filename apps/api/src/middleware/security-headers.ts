import type { Context, Next } from 'hono';

// Baseline security headers sesuai .ai/security.md § Security Headers (Wajib).
// Diset setelah next() agar tetap terpasang pada response error sekalipun.
export async function securityHeaders(c: Context, next: Next) {
  await next();
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
  c.header(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'; frame-ancestors 'none'"
  );
  // HSTS hanya efektif di belakang TLS; diabaikan browser saat HTTP, wajib saat produksi HTTPS.
  c.header('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
}