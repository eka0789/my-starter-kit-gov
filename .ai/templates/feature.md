# Template: Feature Vertical Slice Blueprint

Template struktur lengkap untuk pembuatan fitur vertikal otonom (Vertical Slice Feature) dengan 6 kolom audit, parameterized query, type safety penuh, dan fail-closed audit logging.

---

## 📁 File Structure

```text
features/[feature_name]/
├── components/
│   ├── [Feature]Table.tsx
│   └── [Feature]FormModal.tsx
├── hooks/
│   └── use-[feature].ts
├── pages/
│   └── [Feature]Page.tsx
├── schemas/
│   └── [feature].schema.ts
├── services/
│   └── [feature].service.ts
├── routes.ts
└── types.ts
```

---

## 💻 Sample Code Blueprints

### 1. `schemas/[feature].schema.ts`

```typescript
import { z } from 'zod';

export const createFeatureSchema = z.object({
  title: z.string().min(3, 'Judul minimal 3 karakter').max(255),
  code: z.string().min(2, 'Kode minimal 2 karakter').max(50),
  description: z.string().max(2000).optional()
});

export const updateFeatureSchema = createFeatureSchema.partial();

export const queryFeatureSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  q: z.string().trim().max(100).optional()
});

export const idParamSchema = z.object({
  id: z.string().uuid('ID tidak valid')
});
```

### 2. `types.ts`

```typescript
import { z } from 'zod';
import { createFeatureSchema, queryFeatureSchema } from './schemas/[feature].schema';

export type CreateFeatureDTO = z.infer<typeof createFeatureSchema>;
export type QueryFeatureDTO = z.infer<typeof queryFeatureSchema>;

export interface FeatureEntity {
  id: string;
  title: string;
  code: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  createdBy: string; // UUID, NOT NULL
  updatedBy: string; // UUID, NOT NULL
  deletedBy?: string | null; // UUID, nullable
}
```

### 3. `services/[feature].service.ts`

```typescript
import { db } from '@my-starter-kit-gov/database';
import { features, auditLogs } from '@my-starter-kit-gov/database/schema';
import { eq, isNull, and, or, ilike, count } from 'drizzle-orm';
import { computeEventHash, getLastEventHash } from '@my-starter-kit-gov/audit';
import type { CreateFeatureDTO, QueryFeatureDTO } from '../types';

function sanitizeSearchQuery(q: string): string {
  return q.replace(/[%_\\]/g, '\\$&');
}

export async function getFeatureList(query: QueryFeatureDTO) {
  const { page, pageSize, q } = query;
  const offset = (page - 1) * pageSize;

  const conditions = [isNull(features.deletedAt)];
  if (q) {
    const sanitized = sanitizeSearchQuery(q);
    conditions.push(
      or(
        ilike(features.title, `%${sanitized}%`),
        ilike(features.code, `%${sanitized}%`)
      )!
    );
  }

  const whereClause = and(...conditions);

  const [items, totalResult] = await Promise.all([
    db.select().from(features).where(whereClause).limit(pageSize).offset(offset),
    db.select({ total: count() }).from(features).where(whereClause)
  ]);

  const total = totalResult[0]?.total ?? 0;

  return {
    items,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  };
}

export async function createFeature(
  data: CreateFeatureDTO,
  actorId: string,
  requestId?: string
) {
  return db.transaction(async (tx) => {
    const [inserted] = await tx.insert(features).values({
      ...data,
      createdBy: actorId,
      updatedBy: actorId
    }).returning();

    const previousEventHash = await getLastEventHash(tx);
    const eventHash = computeEventHash({
      actorId,
      action: 'CREATE',
      resourceType: 'features',
      resourceId: inserted.id,
      previousEventHash
    });

    await tx.insert(auditLogs).values({
      occurredAt: new Date(),
      actorId,
      action: 'CREATE',
      resourceType: 'features',
      resourceId: inserted.id,
      requestId,
      eventHash,
      previousEventHash
    });

    return inserted;
  });
}

export async function softDeleteFeature(
  id: string,
  actorId: string,
  requestId?: string
) {
  return db.transaction(async (tx) => {
    const [existing] = await tx.select()
      .from(features)
      .where(and(eq(features.id, id), isNull(features.deletedAt)))
      .limit(1);

    if (!existing) return null;

    const [deleted] = await tx.update(features)
      .set({
        deletedAt: new Date(),
        deletedBy: actorId
      })
      .where(eq(features.id, id))
      .returning();

    const previousEventHash = await getLastEventHash(tx);
    const eventHash = computeEventHash({
      actorId,
      action: 'DELETE',
      resourceType: 'features',
      resourceId: id,
      previousEventHash
    });

    await tx.insert(auditLogs).values({
      occurredAt: new Date(),
      actorId,
      action: 'DELETE',
      resourceType: 'features',
      resourceId: id,
      requestId,
      eventHash,
      previousEventHash
    });

    return deleted;
  });
}
```

### 4. `routes.ts` (Hono API Route)

```typescript
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { authMiddleware } from '@/middleware/auth';
import { requirePermission } from '@/middleware/rbac';
import { createFeatureSchema, queryFeatureSchema, idParamSchema } from './schemas/[feature].schema';
import { getFeatureList, createFeature, softDeleteFeature } from './services/[feature].service';

const featureRoutes = new Hono();

featureRoutes.use('*', authMiddleware);

featureRoutes.get(
  '/',
  requirePermission('feature.read'),
  zValidator('query', queryFeatureSchema),
  async (c) => {
    const query = c.req.valid('query');
    const result = await getFeatureList(query);
    return c.json({
      success: true,
      message: 'Data berhasil diambil',
      data: result.items,
      meta: {
        ...result.meta,
        requestId: c.req.header('x-request-id'),
        timestamp: new Date().toISOString()
      }
    });
  }
);

featureRoutes.post(
  '/',
  requirePermission('feature.create'),
  zValidator('json', createFeatureSchema),
  async (c) => {
    const body = c.req.valid('json');
    const currentUser = c.get('user');

    if (!currentUser?.id) {
      return c.json({ success: false, message: 'Sesi tidak valid' }, 401);
    }

    const newItem = await createFeature(body, currentUser.id, c.req.header('x-request-id'));
    return c.json({
      success: true,
      message: 'Data berhasil dibuat',
      data: newItem
    }, 201);
  }
);

featureRoutes.delete(
  '/:id',
  requirePermission('feature.delete'),
  zValidator('param', idParamSchema),
  async (c) => {
    const { id } = c.req.valid('param');
    const currentUser = c.get('user');

    if (!currentUser?.id) {
      return c.json({ success: false, message: 'Sesi tidak valid' }, 401);
    }

    const deleted = await softDeleteFeature(id, currentUser.id, c.req.header('x-request-id'));
    if (!deleted) {
      return c.json({ success: false, message: 'Data tidak ditemukan' }, 404);
    }

    return c.json({
      success: true,
      message: 'Data berhasil dihapus (soft delete)'
    });
  }
);

export { featureRoutes };
```

---

## Catatan Wajib

1. **6 Kolom Audit**: `createdAt`, `updatedAt`, `deletedAt`, `createdBy` (NOT NULL), `updatedBy` (NOT NULL), `deletedBy` (nullable).
2. **Type Safety**: Semua DTO di-infer dari Zod schema. Dilarang `any`.
3. **Parameterized Query**: Gunakan `ilike()`, `eq()`, `and()` dari Drizzle. Dilarang interpolasi string ke SQL.
4. **Fail-Closed Audit**: INSERT/UPDATE/DELETE + audit log dalam transaksi yang sama. Jika audit gagal, rollback.
5. **Sanitize Search**: Escape `%`, `_`, `\` sebelum `ilike`. Batas query 100 karakter.
6. **Soft Delete**: Set `deletedAt` + `deletedBy`. Jangan hard-delete. Purge hanya via workflow DPO.
