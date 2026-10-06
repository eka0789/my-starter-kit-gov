import { Hono } from 'hono';
import { verifyChain } from '@kit/audit';
import { db } from '@kit/database';
import { authMiddleware, requirePermission } from '../middleware/auth';

export const auditRoutes = new Hono();

auditRoutes.use('*', authMiddleware);

// Verifikasi integritas hash chain audit_logs (lihat .ai/audit-integrity.md).
// Jalankan berkala oleh petugas audit / monitoring; akses dibatasi permission khusus.
auditRoutes.get('/verify', requirePermission('audit.verify'), async (c) => {
  const result = await verifyChain(db);

  return c.json({
    success: true,
    message: result.valid ? 'Hash chain audit valid' : 'Hash chain audit RUSAK — investigasi segera',
    data: result,
    meta: {
      request_id: c.get('requestId'),
      timestamp: new Date().toISOString(),
      version: 'v1',
      pagination: null,
      sdi_metadata: null,
    },
  });
});