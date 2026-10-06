# Backend Rules & Standards

## Framework & Tech Stack
- **Framework**: `Hono` (Ringan, super cepat, ideal untuk Node.js)
- **Validation**: `Zod` (Validasi input eksplisit)
- **ORM**: `Drizzle ORM` (Type-safe SQL queries)
- **Identity Layer**: `packages/identity` (Adapter OIDC/SAML2 untuk production; local untuk dev)
- **Audit Layer**: `packages/audit` (Append-only audit logger + HMAC)

---

## Structure Per Feature (Backend Vertical Slice)

Setiap fitur pada aplikasi backend (`apps/api/src/features/[feature_name]/`) WAJIB berisi:

1. `routes.ts`: Definisi Hono route handler & mounting middleware.
2. `schema.ts`: Skema validasi Zod untuk Request Body, Query Params, dan URL Params.
3. `service.ts`: Eksekusi logika bisnis dan operasi database Drizzle.
4. `mapper.ts`: DTO mapping (jangan pernah return raw database row).
5. `types.ts`: Definisi TypeScript DTO & return types.
6. `index.ts`: Ekspor publik fitur.

---

## Larangan Struktur Backend

- **DILARANG** membuat folder terpisah `controllers/`, `repositories/`, `entities/` secara global.
- **DILARANG** menempatkan SQL query langsung di dalam berkas `routes.ts`.
- **DILARANG** mengembalikan data mentah (*raw DB entity*) tanpa formatting/mapping DTO (risiko kebocoran PII).
- **DILARANG** menggunakan interpolasi string pada query (`like(..., `%${q}%`)`); selalu gunakan parameter binding.
- **DILARANG** hard-delete data bisnis tanpa purge workflow resmi.

---

## Security & Middleware Guidelines

1. **Autentikasi**: Semua private route wajib dilindungi middleware `authMiddleware` (validasi JWT dari identity adapter).
2. **Otorisasi / RBAC**: Cek hak akses menggunakan `requirePermission('surat.create')` sebelum menjalankan service logic.
3. **Penyaringan Soft Delete**: Pastikan query Drizzle selalu menyertakan `isNull(table.deleted_at)` kecuali untuk aksi pemulihan (*restore*).
4. **Audit Logging (6 Kolom & Append-Only)**:
   - Setiap mutasi wajib mengisi `created_by` / `updated_by` (NOT NULL).
   - Soft delete wajib mengisi `deleted_at = now()` dan `deleted_by = user_id`.
   - Panggil `auditLogger.log()` pada setiap aksi mutasi data (`POST`, `PATCH`, `DELETE`) dan transaksi sensitif.
   - **Fail-closed**: jika penulisan log audit gagal, operasi mutasi wajib dibatalkan (rollback transaction).
5. **Centralized Error Handling**: Gunakan `app.onError()` di level utama Hono untuk menangkap error yang tidak terduga dan mengembalikan format respons standar tanpa menyebarkan stack trace SQL, PII, atau secret.
6. **Data Masking**: Terapkan masking untuk NIK/NIP di layer mapper/DTO kecuali user memiliki permission eksplisit dan purpose yang sah.

---

## Health & Readiness Probes

Aplikasi backend wajib menyediakan endpoint:
- `GET /health/live`: 200 jika server merespons (liveness).
- `GET /health/ready`: 200 jika koneksi database dan cache aktif (readiness). Digunakan untuk load balancer / Kubernetes.
