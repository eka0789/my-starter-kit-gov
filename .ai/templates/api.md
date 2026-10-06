# Template: Hono REST API Route & Service (Pola Kanonis `apps/api`)

Boilerplate REST API Hono yang akurat dengan implementasi aktual di repo ini: `authMiddleware` + `requirePermission` dari `apps/api/src/middleware/auth.ts`, service terpisah yang menulis audit **fail-closed** via `logAudit` dari `@kit/audit`, dan DTO map yang tidak mengembalikan raw DB row.

> Gunakan pola di `apps/api/src/features/employee-profiles/` sebagai acuan terbaru. Template di bawah adalah generalisasi yang sudah disesuaikan dengan nama package nyata (`@kit/*`) dan struktur `routes.ts` + `schema.ts` + `service.ts` per fitur.

---

## 1. Zod Schema (`./schema.ts`)

```typescript
import { z } from 'zod';

export const ListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(100).optional(),
});

export const CreateItemSchema = z.object({
  // contoh: identitas wajib & validasi ketat (lihat business-rules.md)
  code: z.string().min(1).max(64),
  name: z.string().min(1, 'Nama wajib diisi').max(255),
  email: z.string().email('Format email tidak valid').optional(),
});

export type ListQuery = z.infer<typeof ListQuerySchema>;
export type CreateItemInput = z.infer<typeof CreateItemSchema>;
```

## 2. Service dengan Audit Fail-Closed (`./service.ts`)

```typescript
import { and, desc, eq, ilike, isNull, sql, type SQL } from 'drizzle-orm';
import { db, type Database } from '@kit/database';
import { employeeProfiles } from '@kit/database/schema';
import { logAudit } from '@kit/audit';
import type { Actor, Uuid } from '@kit/types';
import type { CreateItemInput, ListQuery } from './schema';

function sanitizeSearchQuery(query: string): string {
  return query.replace(/[%_\\]/g, '\\$&').trim();
}

export async function listItems(query: ListQuery) {
  const { page, pageSize, search } = query;
  const offset = (page - 1) * pageSize;

  const conditions: SQL[] = [isNull(employeeProfiles.deletedAt)];

  if (search) {
    const sanitized = sanitizeSearchQuery(search);
    conditions.push(
      sql`(${ilike(employeeProfiles.name, `%${sanitized}%`)} OR ${ilike(employeeProfiles.nip, `%${sanitized}%`)})`
    );
  }

  const [data, totalCount] = await Promise.all([
    db
      .select()
      .from(employeeProfiles)
      .where(and(...conditions))
      .orderBy(desc(employeeProfiles.createdAt))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(employeeProfiles)
      .where(and(...conditions)),
  ]);

  return {
    data,
    pagination: {
      page,
      pageSize,
      total: totalCount[0]?.count ?? 0,
      totalPages: Math.ceil((totalCount[0]?.count ?? 0) / pageSize),
    },
  };
}

export async function createItem(
  actor: Actor,
  input: CreateItemInput,
  requestId: string,
  ipAddress?: string
) {
  return await db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(employeeProfiles)
      .values({
        nip: input.code,
        name: input.name,
        email: input.email,
        createdBy: actor.id,
        updatedBy: actor.id,
      })
      .returning();

    if (!inserted) {
      throw new Error('Gagal menambahkan data');
    }

    // Fail-closed: bila logAudit gagal, transaksi ikut rollback.
    await logAudit(tx as unknown as Database, {
      actor,
      action: 'ITEM_CREATE',
      resourceType: 'employee_profiles',
      resourceId: inserted.id,
      requestId,
      ipAddress,
      newValue: { nip: inserted.nip, name: inserted.name },
    });

    return inserted;
  });
}
```

## 3. Route Hono (`./routes.ts`)

```typescript
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { authMiddleware, requirePermission } from '../../middleware/auth';
import { CreateItemSchema, ListQuerySchema } from './schema';
import { createItem, listItems, softDeleteItem } from './service';

export const itemRoutes = new Hono();

itemRoutes.use('*', authMiddleware);

itemRoutes.get(
  '/',
  requirePermission('pegawai.read'), // ganti permission sesuai resource
  zValidator('query', ListQuerySchema),
  async (c) => {
    const query = c.req.valid('query');
    const result = await listItems(query);

    return c.json({
      success: true,
      message: 'Berhasil mengambil data',
      data: result.data, // pastikan DTO mask NIK/NIP (lihat catatan no. 3)
      meta: {
        request_id: c.get('requestId'),
        timestamp: new Date().toISOString(),
        version: 'v1',
        pagination: result.pagination,
        sdi_metadata: {
          dataOwner: process.env.INSTANSI_NAME ?? 'Instansi',
          dataClassification: 'INTERNAL',
        },
      },
    });
  }
);

itemRoutes.post(
  '/',
  requirePermission('pegawai.create'),
  zValidator('json', CreateItemSchema),
  async (c) => {
    const actor = c.get('actor');
    const input = c.req.valid('json');
    const requestId = c.get('requestId');
    const ipAddress = c.req.header('x-forwarded-for') ?? c.req.header('cf-connecting-ip');

    const item = await createItem(actor, input, requestId, ipAddress);

    return c.json(
      {
        success: true,
        message: 'Data berhasil ditambahkan',
        data: { id: item.id },
        meta: {
          request_id: requestId,
          timestamp: new Date().toISOString(),
          version: 'v1',
          pagination: null,
          sdi_metadata: null,
        },
      },
      201
    );
  }
);

itemRoutes.delete(
  '/:id',
  requirePermission('pegawai.delete'),
  async (c) => {
    const actor = c.get('actor');
    const id = String(c.req.param('id'));
    const requestId = c.get('requestId');
    const ipAddress = c.req.header('x-forwarded-for');

    await softDeleteItem(actor, id, requestId, ipAddress);

    return c.json({
      success: true,
      message: 'Data berhasil dihapus (soft delete)',
      data: null,
      meta: {
        request_id: requestId,
        timestamp: new Date().toISOString(),
        version: 'v1',
        pagination: null,
        sdi_metadata: null,
      },
    });
  }
);
```

---

## Catatan Penting

1. **Package alias**: package di repo ini bernama `@kit/*` (`@kit/database`, `@kit/audit`, `@kit/types`). Jangan menulis `@my-starter-kit-gov/*` atau alias lain — import tidak akan resolve.
2. **Auth middleware**: `authMiddleware` dan `requirePermission` ada di `apps/api/src/middleware/auth.ts`. Tidak ada modul `middleware/rbac` terpisah.
3. **Masking NIK/NIP**: DTO mapping di template di atas sengaja sederhana. Untuk resource ber-PII, terapkan masking (`****1234`) di lapisan service/DTO, bukan di client. Lihat `data-protection.md` dan `api-rules.md` § Data Privacy API.
4. **Audit fail-closed**: `logAudit` dari `@kit/audit` (lihat `packages/audit/src/logger.ts`). Panggil dalam transaksi yang sama dengan mutasi — kalau audit gagal, rollback. Fungsi `computeEventHash`/`getLastEventHash` **tidak** diekspor; hash chain dihitung internal oleh `logAudit`/`verifyChain`.
5. **Parameterized query**: gunakan `sql` tagged template atau helper Drizzle (`ilike`, `eq`, `and`). Dilarang concat string user ke SQL.
6. **Sanitasi search**: escape `%`, `_`, `\`; batas 100 karakter (lihat `api-rules.md` § Pagination).
7. **Soft delete**: set `deletedAt` + `deletedBy`, jangan hard-delete. Purge hanya via workflow DPO (lihat `data-protection.md`).
8. **SDI metadata**: sertakan `sdi_metadata` di `meta` untuk interoperabilitas Satu Data Indonesia (lihat `interoperability.md`).
9. **Mount route**: daftarkan router di `apps/api/src/app.ts` (`app.route('/api/v1/...', ...)`), bukan di `index.ts`.