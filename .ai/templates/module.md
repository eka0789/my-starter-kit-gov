# Template: Module Structure Blueprint

Gunakan template cetak biru ini untuk menginisialisasi struktur folder dan pengorganisasian modul bisnis enterprise baru, termasuk `packages/` bersama untuk audit, identity, dan interoperabilitas.

---

## 📁 Backend Module Structure (`apps/api/src/features/[module_name]/`)

```text
[module_name]/
├── [sub_feature_1]/
│   ├── routes.ts      — Hono route handler (validasi, RBAC, thin layer)
│   ├── service.ts     — Business logic + DB query + audit logger (fail-closed)
│   ├── schema.ts      — Zod schemas (create, update, query, id param)
│   └── types.ts       — Inferred DTO types + Entity interface
├── [sub_feature_2]/
│   ├── routes.ts
│   ├── service.ts
│   ├── schema.ts
│   └── types.ts
├── README.md          — Deskripsi modul, DPIA status, data classes diproses
└── index.ts           — Router aggregator
```

### Backend Module Index (`apps/api/src/features/[module_name]/index.ts`)

```typescript
import { Hono } from 'hono';
import { authMiddleware } from '@/middleware/auth';
import { subFeature1Routes } from './[sub_feature_1]/routes';
import { subFeature2Routes } from './[sub_feature_2]/routes';

const moduleRouter = new Hono();

// Auth wajib di seluruh modul
moduleRouter.use('*', authMiddleware);

// Mount Sub-Features
moduleRouter.route('/[sub-feature-1]', subFeature1Routes);
moduleRouter.route('/[sub-feature-2]', subFeature2Routes);

export { moduleRouter };
```

---

## 📁 Frontend Module Structure (`apps/web/src/features/[module_name]/`)

```text
[module_name]/
├── components/
│   ├── [Module]Header.tsx     — Header/Nav untuk modul ini
│   └── [Module]NavTabs.tsx    — Tab navigasi sub-fitur dalam modul
├── pages/
│   ├── [SubFeature1]Page.tsx  — Dibungkus ErrorBoundary, 6 State UI
│   └── [SubFeature2]Page.tsx
├── README.md                  — Deskripsi halaman, role yang diizinkan
└── index.ts                   — Barrel export pages
```

### Frontend Module Index (`apps/web/src/features/[module_name]/index.ts`)

```typescript
export * from './pages/[SubFeature1]Page';
export * from './pages/[SubFeature2]Page';
```

---

## 📁 Database Schema (`packages/database/schema/[module_name]/`)

```text
[module_name]/
├── [sub_feature_1].ts  — pgTable schema dengan 6 kolom audit
└── [sub_feature_2].ts
```

### Schema file wajib menyertakan auditColumns:

```typescript
import { pgTable, uuid, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { auditColumns } from '../helpers';

export const [tableName] = pgTable(
  '[table_name]',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    // ... kolom bisnis
    ...auditColumns, // 6 kolom audit (created_at, updated_at, deleted_at, created_by, updated_by, deleted_by)
  },
  (table) => ({
    deletedIdx: index('idx_[table]_deleted').on(table.deletedAt),
  })
);
```

---

## 📁 Packages Bersama (digunakan oleh semua modul)

```text
packages/
├── audit/              — computeEventHash, getLastEventHash, appendAuditLog
├── identity/           — Adapter OIDC/SAML2/local, verifyToken, getUser
├── interoperability/   — SDI metadata, wilayah BPS codes, SPLP client
├── database/
│   └── schema/
│       ├── helpers.ts      — auditColumns helper (6 kolom)
│       ├── audit-logs.ts   — append-only audit_logs table
│       └── wilayah.ts      — reference table BPS/Kemendagri
└── utils/
    └── mask.ts             — maskNip, maskNik, sanitizeSearchQuery
```

---

## 📄 README.md Template untuk Setiap Modul

```markdown
# Modul: [Nama Modul]

## Tujuan
Deskripsi singkat modul ini.

## Sub-Fitur
- `[sub-feature-1]`: Deskripsi.
- `[sub-feature-2]`: Deskripsi.

## Data yang Diproses
| Entitas | Klasifikasi Data | DPIA Diperlukan? |
|---------|-----------------|-----------------|
| [Entity] | Pribadi Umum / Pribadi Spesifik | Ya / Tidak |

## DPIA Status
- [ ] DPIA telah dilakukan dan didokumentasikan di `docs/dpia/[module].md`
- [ ] DPO telah mereview

## Role yang Diizinkan
| Role | Sub-Fitur | Permission |
|------|-----------|-----------|
| [ROLE_NAME] | [sub-feature-1] | read, create |
```

---

## Catatan Wajib

1. **README.md per Modul**: Wajib ada, termasuk DPIA status dan role RBAC.
2. **Auth di Level Modul**: `authMiddleware` dipasang di index modul, bukan di tiap route individual.
3. **6 Kolom Audit**: Semua tabel domain import `auditColumns` dari `packages/database/schema/helpers.ts`.
4. **Packages Bersama**: Jangan duplikasi logic audit/identity/mask di feature. Gunakan dari `packages/`.
5. **DPIA Dulu**: Sebelum implementasi data spesifik atau data anak, selesaikan DPIA terlebih dahulu.
