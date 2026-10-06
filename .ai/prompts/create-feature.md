# AI Prompt: Create Feature (Vertical Slice)

## Context & Purpose
Gunakan prompt ini untuk membuat fitur vertikal komplit (End-to-End Vertical Slice Feature) yang mencakup Database Schema, Validation Zod, Backend API Hono, Custom React Hooks TanStack Query, dan Komponen UI Frontend.

---

## 🤖 AI Instructions

Saat mengeksekusi instruksi pembuatan fitur, AI **WAJIB** membuat komponen berikut tanpa menyisakan TODO/placeholder:

### 0. Analisis Awal (Sebelum Mulai Coding)
- Identifikasi: apakah fitur memproses data pribadi spesifik atau data anak? → Jika ya, DPIA wajib didokumentasikan dulu.
- Identifikasi klasifikasi data dan role RBAC yang diperlukan.

### 1. Database Schema (`packages/database/schema/`)
- Tentukan tabel Drizzle ORM dengan Primary Key UUID `defaultRandom()`.
- Wajib sertakan **6 kolom audit**: `created_at`, `updated_at`, `deleted_at`, `created_by` (NOT NULL), `updated_by` (NOT NULL), `deleted_by` (nullable).
- Import `auditColumns` dari `packages/database/schema/helpers.ts` — jangan tulis ulang kolom ini manual.
- Tentukan tipe DTO inferensi (`Select[Feature]`, `Insert[Feature]`).

### 2. Validation & Types (`features/[feature]/`)
- `schema.ts`: Buat skema Zod untuk create (`create[Feature]Schema`), update (`update[Feature]Schema`), dan query filter (`query[Feature]Schema`).
- `types.ts`: Ekstrak tipe TypeScript eksplisit dari skema Zod.

### 3. Backend Service & Routes (`apps/api/src/features/[feature]/`)
- `service.ts`: Buat fungsi pencarian (pagination, search dengan sanitasi wildcard, filter), detail (by ID), insert, update, dan soft delete.
- Semua query wajib parameterized (gunakan `eq()`, `ilike()`, `and()` dari Drizzle — DILARANG interpolasi string ke SQL).
- Setiap mutasi (INSERT/UPDATE/DELETE) wajib tulis audit log dalam transaksi yang sama (fail-closed: jika audit gagal, rollback mutasi).
- `routes.ts`: Terapkan Hono router dengan `authMiddleware`, `requirePermission`, validasi Zod body/query/params, dan response handler terstruktur dengan SDI metadata.

### 4. Frontend Custom Hooks & Service (`apps/web/src/features/[feature]/`)
- `services/[feature]-api.ts`: Fungsi API client (`fetch` / `axios` wrapper).
- `hooks/use-[feature].ts`: Custom hook TanStack Query (`useQuery` untuk list/detail, `useMutation` untuk create/update/delete) dengan toast notification dan auto query invalidation.

### 5. Frontend UI Pages & Components (`apps/web/src/features/[feature]/`)
- `components/[Feature]Table.tsx`: Data Table shadcn/ui dengan search, sorting, pagination, action dropdown, dan AlertDialog konfirmasi hapus.
- `components/[Feature]FormModal.tsx`: Form Modal React Hook Form + Zod dengan NIK/NIP mask, aria-label, aria-invalid, aria-describedby.
- `pages/[Feature]Page.tsx`: Halaman utama dibungkus ErrorBoundary, dengan Header, Breadcrumb, Button Tambah, Table, dan Form Modal.
- Wajib dukung **6 state UI**: Loading (Skeleton), Error (Alert + retry), Empty (ilustrasi + CTA), Data View, Responsive (md: breakpoints), dan Dark Mode (semantic tokens).
- Aksesibilitas WCAG 2.1 AA: `<label htmlFor>`, `scope="col"` pada `<th>`, `aria-label` untuk icon-only button, status badge bukan hanya warna (harus ada teks + ikon).
