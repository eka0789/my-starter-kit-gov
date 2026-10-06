# AI Prompt: Create REST API Endpoint

## Context & Purpose
Gunakan prompt ini untuk membuat REST API endpoint baru menggunakan Hono, Zod Validation, Drizzle ORM, Supabase Auth, dan standar JSON Response Enterprise.

---

## 🤖 AI Instructions

Saat membuat REST API baru, jalankan urutan langkah berikut:

### Step 1: Definisikan Kontrak Endpoint (API Contract)
Jelaskan terlebih dahulu:
- **HTTP Method & URL Path**: contoh: `GET /api/v1/employees`, `POST /api/v1/employees`.
- **Persyaratan Otorisasi**: Peran & Permission yang dibutuhkan (contoh: `pegawai.read`, `pegawai.create`).
- **Skema Input**: Query String, Path Params, dan JSON Body.
- **Skema Output**: Struktur respons JSON sukses dan error.

### Step 2: Hasilkan Skema Zod (`schema.ts`)
Tulis skema validasi Zod presisi tinggi dengan pesan kesalahan ber-bahasa Indonesia:
```typescript
import { z } from 'zod';

export const createEmployeeSchema = z.object({
  nip: z.string().length(18, 'NIP harus persis 18 digit angka'),
  name: z.string().min(3, 'Nama pegawai minimal 3 karakter'),
  email: z.string().email('Format email tidak valid'),
  unit_kerja_id: z.string().uuid('ID Unit Kerja tidak valid')
});
```

### Step 3: Hasilkan Service Layer (`service.ts`)
Gunakan Drizzle ORM untuk eksekusi query ke PostgreSQL:
- Selalu filter `isNull(table.deletedAt)` untuk soft-delete.
- Selalu sertakan pencatatan audit trail dengan 6 kolom: `created_by`, `updated_by` (NOT NULL), `deleted_by` (nullable).
- Tangani pagination (`page`, `pageSize`) dan filter pencarian (`q`) dengan sanitasi wildcard (`sanitizeSearchQuery()` untuk escape `%`, `_`, `\`).
- Wajib parameterized query — gunakan `ilike()`, `eq()`, `and()` dari Drizzle. DILARANG interpolasi string ke SQL.
- Setiap mutasi wajib tulis ke `audit_logs` dalam transaksi yang sama (fail-closed).

### Step 4: Hasilkan Hono Route Handler (`routes.ts`)
- Terapkan `authMiddleware` untuk validasi JWT/session.
- Terapkan middleware `requirePermission('[resource].[action]')` sebelum business logic.
- Jalankan validasi input Zod via `@hono/zod-validator` untuk body, query, dan params.
- Masking NIK/NIP berdasarkan permission `[resource].view_full_nip`.
- Kembalikan respons terstruktur dengan SDI metadata:
```json
{
  "success": true,
  "message": "Data berhasil dibuat.",
  "data": { ... },
  "meta": {
    "page": 1,
    "pageSize": 10,
    "total": 100,
    "requestId": "...",
    "timestamp": "2026-10-06T07:58:00Z",
    "sdiMetadata": {
      "dataOwner": "Bagian Kepegawaian",
      "dataClassification": "Pribadi Spesifik",
      "sourceSystem": "SIMPEG"
    }
  }
}
```

### Step 5: Tuliskan Dokumentasi OpenAPI / Usage Example
Tulis contoh eksekusi API menggunakan `curl` atau JavaScript `fetch`.
