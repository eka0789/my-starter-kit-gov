import 'dotenv/config';
import { serve } from '@hono/node-server';
import { app } from './app';

const port = Number(process.env.PORT ?? 8787);

// Jalankan listener hanya ketika bukan mode test (Vitest import app langsung,
// tanpa membuka port). Vite node-server tidak perlu di-spawn saat NODE_ENV=test.
if (process.env.NODE_ENV !== 'test') {
  serve({ fetch: app.fetch, port }, () => {
    console.log(`API server berjalan di http://localhost:${port}`);
  });
}

export default app;