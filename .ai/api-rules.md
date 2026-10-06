# API Rules

## Purpose

Standar API REST untuk aplikasi pemerintah. Setiap API yang dihasilkan wajib mengikuti aturan ini dan dokumen kanonis (`security.md`, `data-protection.md`, `interoperability.md`).

---

## Environment & Base Config

- **Development**: `http://localhost:8787` (lihat `.env.example` → `PORT=8787`, dijalankan via `pnpm dev`).
- **Production**: base URL mengikuti domain instansi; masuk di belakang Nginx/gateway (lihat `infra/nginx.conf`).
- **Response format**: JSON, selalu menyertakan `meta.request_id` (dijamin middleware `requestIdMiddleware` di `apps/api/src/middleware/request-id.ts`).
- **Versioning**: base path wajib `/api/v1`; breaking change = major version baru dengan deprecation ≥ 6 bulan.
- Mount route dilakukan di `apps/api/src/app.ts` (bukan `index.ts`). Untuk test, `apps/api/src/index.ts` tidak menjalankan listener saat `NODE_ENV=test` (lihat `app.ts` + `vitest.config.ts`).

---

## API Style & URL

- REST API, nouns bukan verbs.
- Lowercase, kebab-case, plural nouns.
- Base path wajib versioned: `/api/v1/users`.
- Breaking change = major version baru. Deprecation minimal 6 bulan dengan migration guide.

---

## Request Validation

Validasi setiap:
- body
- params
- query
- headers (jika dibutuhkan)

Gunakan Zod dekat dengan feature. Reject invalid request sebelum business logic. Jangan percaya validasi client.

---

## Response Format

```json
{
  "success": true,
  "message": "Operasi berhasil",
  "data": {},
  "meta": {
    "request_id": "req_abc123",
    "timestamp": "2026-10-06T07:00:00Z",
    "version": "v1",
    "pagination": null,
    "sdi_metadata": null
  }
}
```

Error:

```json
{
  "success": false,
  "message": "Validasi gagal",
  "errors": [{ "code": "INVALID_NIP", "field": "nip", "message": "NIP harus 18 digit" }],
  "meta": { "request_id": "req_abc123", "timestamp": "2026-10-06T07:00:00Z" }
}
```

- Jangan return raw database object.
- Jangan return stack trace, SQL, secret, atau PII penuh.
- `request_id` wajib untuk tracing/audit.

---

## HTTP Status

`200` OK, `201` Created, `202` Accepted (async), `204` No Content, `400` Bad Request, `401` Unauthorized, `403` Forbidden, `404` Not Found, `409` Conflict, `422` Unprocessable Entity, `429` Rate Limited, `500` Internal Server Error.

---

## CRUD & Soft Delete

- `GET /resources`, `GET /resources/:id`, `POST /resources`, `PATCH /resources/:id`, `DELETE /resources/:id`.
- `DELETE` endpoint melakukan soft delete (`deleted_at` + `deleted_by`) secara default.
- Hard purge hanya endpoint/workflow khusus dengan approval DPO dan retention/legal-hold check.
- Query normal selalu `deleted_at IS NULL`.

---

## Pagination, Sorting, Filtering, Search

- List endpoint wajib pagination (`page`, `pageSize`, max pageSize 100).
- Response meta: `page`, `pageSize`, `total`, `totalPages`.
- Sort allowlist (`sort=name`, `sort=-created_at`); jangan menerima arbitrary column.
- Filter allowlist; jangan membuat filter SQL dari key user langsung.
- Search input: trim, length-limit (maks 100 chars), normalize Unicode, escape wildcard `%`/`_` bila diperlukan.
- Query menggunakan Drizzle parameter binding; **dilarang** concat/interpolasi string user ke SQL.

---

## Authentication & Authorization

- Semua private endpoint memakai `authMiddleware` dari `packages/identity`.
- Production auth: OIDC Authorization Code + PKCE atau SAML2 resmi; bukan Supabase JWT lock-in.
- Permission granular (`users.read`, `pegawai.export`, `surat.approve`).
- Check permission dan unit-work scope sebelum service logic.
- Endpoint export/PII penuh wajib permission, purpose, re-auth/MFA, dan audit.
- Public routes harus eksplisit allowlist: `/health/live`, `/health/ready`, endpoint katalog publik yang disetujui.

### Dev Login (non-production saja)

- `POST /api/v1/auth/dev-login` — body `{ "username": "dev-admin" | "dev-operator" | "dev-pimpinan" }`, mengembalikan `data.token` + `data.actor`.
- Endpoint ini SENGAJA nonaktif di production (fail-fast 404 + `LocalAdapter` menolak `NODE_ENV=production`).
- Rate limit login: 5 attempt / 15 menit per IP (lihat `routes/auth.ts`).

### Verifikasi Audit Trail

- `GET /api/v1/audit/verify` — verifikasi hash chain `audit_logs` (permission `audit.verify`). Jalankan berkala oleh petugas audit/monitoring.

### Rate Limiting (baseline terpasang)

- Global `/api/*`: 100 request / menit per IP (`app.ts` + `middleware/rate-limit.ts`).
- Login: 5 attempt / 15 menit per IP (`routes/auth.ts`).
- Baseline in-memory per instance; production wajib tambahan pembatasan di gateway (Nginx `limit_req`) atau Redis.

---

## Data Privacy API

Endpoint minimum (sesuaikan policy DPO):

```text
GET  /api/v1/me/privacy-notice
POST /api/v1/me/data-access-requests
POST /api/v1/me/data-correction-requests
POST /api/v1/me/data-erasure-requests
GET  /api/v1/me/data-exports/:id
```

- NIK/NIP masked default (`************1234`).
- PII penuh hanya DTO khusus dengan permission/purpose.
- Jangan letakkan PII di URL path/query bila tidak mutlak.

---

## TTE & SSO Callback

- Callback TTE: validasi webhook signature, idempotency, replay timestamp, certificate evidence.
- OIDC callback: validasi state, nonce, issuer, audience, PKCE verifier.
- SAML ACS: validasi assertion signature, audience, InResponseTo, expiration.
- Semua callback dicatat audit.

---

## Database & Raw SQL

- Gunakan Drizzle ORM.
- Raw SQL hanya jika ORM tidak mampu; harus menggunakan parameter binding:
  ```typescript
  db.execute(sql`SELECT id FROM users WHERE id = ${userId}`);
  ```
- Dilarang:
  ```typescript
  db.execute(sql.raw(`SELECT ... ${userInput}`));
  ```
- Gunakan transaction untuk mutasi multi-tabel, termasuk data + audit event.

---

## Audit Logging

Log: login, logout, create, update, soft delete, restore, purge, permission change, TTE, export PII, data-subject request, failed access.

Field minimum: `actor_id`, `action`, `resource_type`, `resource_id`, `request_id`, `ip_address`, `old_value_hash`, `new_value_hash`, `timestamp`, `event_hash`.

Audit failure = mutation rollback/fail-closed. Detail: `audit-integrity.md`.

---

## Error Handling

- Centralized `app.onError()`.
- Client message umum; server log detail tanpa PII.
- 500 tidak boleh expose stack trace/SQL/environment.

---

## Performance & Documentation

- Select columns yang diperlukan; hindari `SELECT *`.
- Index kolom search/join; hindari N+1.
- Setiap endpoint memiliki OpenAPI schema, contoh request/response, auth requirement, permission, error codes, dan data classification.
- Endpoint integrasi SPLP wajib metadata SDI dan data lineage.

---

## AI Agent Rules (Saat Menambah/Mengubah Endpoint)

1. Baca dokumen ini + `security.md` sebelum menulis endpoint.
2. Gunakan pola yang sudah ada (`apps/api/src/features/employee-profiles/` dan `.ai/templates/api.md`). Jangan mengarang pola baru: response shape, error shape, middleware auth, audit fail-closed.
3. Gunakan `authMiddleware` + `requirePermission` dari `apps/api/src/middleware/auth.ts`. Dilarang membuat middleware auth baru yang duplikat.
4. Package helper berasal dari `@kit/*` (`@kit/identity`, `@kit/audit`, `@kit/database`, `@kit/types`). Dilarang import dari alias lain.
5. Setiap endpoint baru: Zod schema (body/query/params), OpenAPI doc, dan — jika mutasi — audit log dalam transaksi + update jika ada konvensi baru di dokumen ini.
6. Jika dokumen ini bertentangan dengan implementasi nyata, laporkan konflik — jangan diam-diam memilih salah satu.
