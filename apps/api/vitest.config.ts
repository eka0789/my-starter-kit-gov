import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    env: {
      NODE_ENV: 'test',
      // Dummy: postgres-js lazy, tidak connect sampai query dieksekusi.
      // Endpoint yang dites (health/live, 401/403) tidak menyentuh DB.
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
      // Kunci uji 32-byte base64 (Buffer.alloc(32, 7)) untuk crypto.test.ts.
      FIELD_ENCRYPTION_KEY: 'BwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwc=',
    },
  },
});