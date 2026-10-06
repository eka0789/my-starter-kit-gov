# Template: Hono REST API Route & Handler

Boilerplate kode REST API Hono lengkap dengan Autentikasi JWT, RBAC Permission, Zod Validator, Parameterized Query, NIK/NIP Masking, dan Audit Logger Fail-Closed.

---

```typescript
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { authMiddleware } from '@/middleware/auth';
import { requirePermission } from '@/middleware/rbac';
import { z } from 'zod';
import { db } from '@my-starter-kit-gov/database';
import { employeeProfiles, auditLogs } from '@my-starter-kit-gov/database/schema';
import { eq, isNull, and, or, ilike, count, sql } from 'drizzle-orm';
import { computeEventHash, getLastEventHash } from '@my-starter-kit-gov/audit';
import { maskNip } from '@my-starter-kit-gov/utils';

const SYSTEM_PRINCIPAL_ID = '00000000-0000-0000-0000-000000000001';

// ============================================================================
// 1. Zod Validation Schemas
// ============================================================================
const createEmployeeSchema = z.object({
  nip: z.string().length(18, 'NIP harus persis 18 digit angka').regex(/^\d{18}$/, 'NIP hanya boleh angka'),
  name: z.string().min(3, 'Nama minimal 3 karakter').max(255),
  email: z.string().email('Format email tidak valid').max(255),
  department_id: z.string().uuid('ID Departemen tidak valid')
});

const queryEmployeeSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  q: z.string().trim().max(100).optional()
});

const idParamSchema = z.object({
  id: z.string().uuid('ID tidak valid')
});

// ============================================================================
// 2. Helper: Sanitize Search Query (Escape LIKE Wildcards)
// ============================================================================
function sanitizeSearchQuery(q: string): string {
  // Escape special LIKE characters: %, _, \
  return q.replace(/[%_\\]/g, '\\$&');
}

// ============================================================================
// 3. Helper: Mask NIK/NIP berdasarkan Role
// ============================================================================
function mapEmployeeDto(employee: typeof employeeProfiles.$inferSelect, canViewFullNip: boolean) {
  return {
    id: employee.id,
    nip: canViewFullNip ? employee.nip : maskNip(employee.nip), // Mask: ****1234
    name: employee.name,
    email: employee.email,
    departmentId: employee.departmentId,
    status: employee.status,
    createdAt: employee.createdAt,
    updatedAt: employee.updatedAt,
  };
}

// ============================================================================
// 4. Helper: Write Audit Log (Fail-Closed)
// ============================================================================
async function writeAuditLog(tx: typeof db, params: {
  actorId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'READ';
  resourceType: string;
  resourceId: string;
  requestId?: string;
  ipAddress?: string;
  userAgent?: string;
  changes?: Record<string, unknown>;
}) {
  const previousEventHash = await getLastEventHash(tx);
  const eventHash = computeEventHash({
    actorId: params.actorId,
    action: params.action,
    resourceType: params.resourceType,
    resourceId: params.resourceId,
    previousEventHash,
  });

  await tx.insert(auditLogs).values({
    occurredAt: new Date(),
    actorId: params.actorId,
    action: params.action,
    resourceType: params.resourceType,
    resourceId: params.resourceId,
    requestId: params.requestId,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    eventHash,
    previousEventHash,
  });
}

// ============================================================================
// 5. Hono Router Setup
// ============================================================================
const employeeRoutes = new Hono();

employeeRoutes.use('*', authMiddleware);

// ============================================================================
// GET /api/v1/employees (List with Pagination & Search)
// ============================================================================
employeeRoutes.get(
  '/',
  requirePermission('employee.read'),
  zValidator('query', queryEmployeeSchema),
  async (c) => {
    const { page, pageSize, q } = c.req.valid('query');
    const currentUser = c.get('user');
    const offset = (page - 1) * pageSize;

    // Parameterized WHERE: selalu filter deleted_at IS NULL
    const conditions = [isNull(employeeProfiles.deletedAt)];

    if (q) {
      const sanitized = sanitizeSearchQuery(q);
      // Gunakan ilike dengan parameterized binding (BUKAN interpolasi string)
      conditions.push(
        or(
          ilike(employeeProfiles.nip, `%${sanitized}%`),
          ilike(employeeProfiles.name, `%${sanitized}%`)
        )!
      );
    }

    const whereClause = and(...conditions);

    const [items, totalResult] = await Promise.all([
      db.select()
        .from(employeeProfiles)
        .where(whereClause)
        .limit(pageSize)
        .offset(offset),
      db.select({ total: count() })
        .from(employeeProfiles)
        .where(whereClause)
    ]);

    const total = totalResult[0]?.total || 0;
    const canViewFullNip = currentUser.permissions?.includes('employee.view_full_nip') ?? false;

    return c.json({
      success: true,
      message: 'Daftar pegawai berhasil diambil',
      data: items.map((item) => mapEmployeeDto(item, canViewFullNip)),
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        requestId: c.req.header('x-request-id'),
        timestamp: new Date().toISOString(),
        sdiMetadata: {
          dataOwner: 'Bagian Kepegawaian',
          dataClassification: 'Pribadi Spesifik',
          sourceSystem: 'SIMPEG'
        }
      }
    });
  }
);

// ============================================================================
// GET /api/v1/employees/:id (Single Resource)
// ============================================================================
employeeRoutes.get(
  '/:id',
  requirePermission('employee.read'),
  zValidator('param', idParamSchema),
  async (c) => {
    const { id } = c.req.valid('param');
    const currentUser = c.get('user');

    const [item] = await db.select()
      .from(employeeProfiles)
      .where(and(eq(employeeProfiles.id, id), isNull(employeeProfiles.deletedAt)))
      .limit(1);

    if (!item) {
      return c.json({ success: false, message: 'Pegawai tidak ditemukan' }, 404);
    }

    const canViewFullNip = currentUser.permissions?.includes('employee.view_full_nip') ?? false;

    return c.json({
      success: true,
      message: 'Detail pegawai berhasil diambil',
      data: mapEmployeeDto(item, canViewFullNip)
    });
  }
);

// ============================================================================
// POST /api/v1/employees (Create Item)
// ============================================================================
employeeRoutes.post(
  '/',
  requirePermission('employee.create'),
  zValidator('json', createEmployeeSchema),
  async (c) => {
    const body = c.req.valid('json');
    const currentUser = c.get('user');

    if (!currentUser?.id) {
      return c.json({ success: false, message: 'Sesi tidak valid' }, 401);
    }

    // Transaksi: INSERT + Audit Log (Fail-Closed)
    const newItem = await db.transaction(async (tx) => {
      const [inserted] = await tx.insert(employeeProfiles).values({
        nip: body.nip,
        name: body.name,
        email: body.email,
        departmentId: body.department_id,
        createdBy: currentUser.id,
        updatedBy: currentUser.id,
      }).returning();

      await writeAuditLog(tx, {
        actorId: currentUser.id,
        action: 'CREATE',
        resourceType: 'employee_profiles',
        resourceId: inserted.id,
        requestId: c.req.header('x-request-id'),
        ipAddress: c.req.header('x-forwarded-for') || undefined,
        userAgent: c.req.header('user-agent'),
      });

      return inserted;
    });

    const canViewFullNip = currentUser.permissions?.includes('employee.view_full_nip') ?? false;

    return c.json({
      success: true,
      message: 'Pegawai berhasil ditambahkan',
      data: mapEmployeeDto(newItem, canViewFullNip)
    }, 201);
  }
);

// ============================================================================
// PATCH /api/v1/employees/:id (Update Partially)
// ============================================================================
employeeRoutes.patch(
  '/:id',
  requirePermission('employee.update'),
  zValidator('param', idParamSchema),
  zValidator('json', createEmployeeSchema.partial()),
  async (c) => {
    const { id } = c.req.valid('param');
    const body = c.req.valid('json');
    const currentUser = c.get('user');

    if (!currentUser?.id) {
      return c.json({ success: false, message: 'Sesi tidak valid' }, 401);
    }

    const updated = await db.transaction(async (tx) => {
      const [existing] = await tx.select()
        .from(employeeProfiles)
        .where(and(eq(employeeProfiles.id, id), isNull(employeeProfiles.deletedAt)))
        .limit(1);

      if (!existing) {
        return null;
      }

      const [result] = await tx.update(employeeProfiles)
        .set({
          ...body,
          departmentId: body.department_id ?? existing.departmentId,
          updatedBy: currentUser.id,
          updatedAt: new Date(),
        })
        .where(eq(employeeProfiles.id, id))
        .returning();

      await writeAuditLog(tx, {
        actorId: currentUser.id,
        action: 'UPDATE',
        resourceType: 'employee_profiles',
        resourceId: id,
        requestId: c.req.header('x-request-id'),
        ipAddress: c.req.header('x-forwarded-for') || undefined,
      });

      return result;
    });

    if (!updated) {
      return c.json({ success: false, message: 'Pegawai tidak ditemukan' }, 404);
    }

    const canViewFullNip = currentUser.permissions?.includes('employee.view_full_nip') ?? false;

    return c.json({
      success: true,
      message: 'Pegawai berhasil diperbarui',
      data: mapEmployeeDto(updated, canViewFullNip)
    });
  }
);

// ============================================================================
// DELETE /api/v1/employees/:id (Soft Delete)
// ============================================================================
employeeRoutes.delete(
  '/:id',
  requirePermission('employee.delete'),
  zValidator('param', idParamSchema),
  async (c) => {
    const { id } = c.req.valid('param');
    const currentUser = c.get('user');

    if (!currentUser?.id) {
      return c.json({ success: false, message: 'Sesi tidak valid' }, 401);
    }

    const deleted = await db.transaction(async (tx) => {
      const [existing] = await tx.select()
        .from(employeeProfiles)
        .where(and(eq(employeeProfiles.id, id), isNull(employeeProfiles.deletedAt)))
        .limit(1);

      if (!existing) {
        return null;
      }

      const [result] = await tx.update(employeeProfiles)
        .set({
          deletedAt: new Date(),
          deletedBy: currentUser.id,
        })
        .where(eq(employeeProfiles.id, id))
        .returning();

      await writeAuditLog(tx, {
        actorId: currentUser.id,
        action: 'DELETE',
        resourceType: 'employee_profiles',
        resourceId: id,
        requestId: c.req.header('x-request-id'),
        ipAddress: c.req.header('x-forwarded-for') || undefined,
      });

      return result;
    });

    if (!deleted) {
      return c.json({ success: false, message: 'Pegawai tidak ditemukan' }, 404);
    }

    return c.json({
      success: true,
      message: 'Pegawai berhasil dihapus (soft delete)'
    });
  }
);

export { employeeRoutes };
```

---

## Catatan Penting

1. **Parameterized Query**: Gunakan `ilike()`, `eq()`, `and()` dari Drizzle. Dilarang interpolasi string ke SQL (`sql\`...\${userInput}\`` tanpa tagged template).
2. **Sanitize Search**: Escape `%`, `_`, `\` sebelum `ilike`. Batas panjang query: 100 karakter.
3. **NIK/NIP Masking**: Default mask (`****1234`) kecuali user punya permission `employee.view_full_nip`.
4. **Fail-Closed Audit**: INSERT + audit log dalam transaksi yang sama. Jika audit gagal, rollback mutasi.
5. **Actor Validation**: Cek `currentUser.id` sebelum mutasi. Background job gunakan `SYSTEM_PRINCIPAL_ID`.
6. **Soft Delete**: Set `deletedAt` + `deletedBy`. Jangan hard-delete. Purge hanya via workflow DPO.
7. **SDI Metadata**: Sertakan `sdiMetadata` di response `meta` untuk interoperabilitas Satu Data Indonesia.
