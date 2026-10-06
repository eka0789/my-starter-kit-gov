import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    env: {
      NODE_ENV: 'test',
      // Dummy: postgres-js lazy, tidak connect sampai query dieksekusi.
      // Endpoint yang dites (health/live, 401) tidak menyentuh DB.
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    },
  },
});