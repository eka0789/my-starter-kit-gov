# Agent Memory (Log Keputusan Arsitektur Jangka Panjang)

Dokumen ini mencatat keputusan arsitektural dan konvensi penting yang telah disepakati untuk repositori ini.

---

## 📌 Keputusan Terdaftar

### [2026-07-21] Adopsi Penuh Feature-First Monorepo
- **Keputusan**: Repositori menggunakan Turborepo + pnpm workspace dengan struktur Feature-First / Vertical Slice.
- **Rasional**: Memudahkan isolasi modul bisnis pemerintah (Naskah Dinas, Kepegawaian, E-Kinerja) agar dapat dipelihara mandiri.

### [2026-07-21] Standardisasi Audit Trail & Soft Delete Enterprise (Superseded 2026-10-06)
- **Keputusan lama**: Setiap tabel bisnis memiliki 5 kolom audit (`created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`) dan menggunakan UUID v4.
- **Keputusan kanonis (2026-10-06)**: 6 kolom audit wajib — `created_at`, `updated_at`, `deleted_at`, `created_by` NOT NULL, `updated_by` NOT NULL, `deleted_by` nullable. UUID v7 untuk PK.
- **Status**: Superseded oleh keputusan 2026-10-06. Jangan gunakan definisi 5 kolom lama untuk schema baru.

### [2026-07-21] Framework Backend Hono & Drizzle ORM
- **Keputusan**: Backend menggunakan Hono Framework dengan Drizzle ORM dan Supabase PostgreSQL.
- **Rasional**: Performa eksekusi super cepat, tipe terstruktur penuh (type-safe), dan overhead memori sangat rendah.

### [2026-07-21] Frontend Stack React + Vite + Tailwind + shadcn/ui
- **Keputusan**: Web frontend menggunakan React 18, Vite, Tailwind CSS, shadcn/ui primitives, dan TanStack Query v5.
- **Rasional**: Pengalaman UI/UX enterprise yang modern, responsif, dan konsisten.

### [2026-10-06] Ekspansi Audit Trail ke 6 Kolom Kanonis (`deleted_by`)
- **Keputusan**: Tambahkan `deleted_by` UUID sebagai kolom ke-6 wajib pada setiap tabel bisnis. `created_by` dan `updated_by` wajib `NOT NULL`. Background job menggunakan service principal UUID `00000000-0000-0000-0000-000000000001`.
- **Rasional**: Memperbaiki kontradiksi antar dokumen (5 vs 6 kolom). Diperlukan untuk audit trail lengkap saat soft delete (siapa yang menghapus) dan memenuhi standar BPK.

### [2026-10-06] Multi-Target Deployment Profiles (PDN / On-Prem / Approved Cloud / Dev)
- **Keputusan**: Hilangkan hard lock ke Supabase Cloud (US/EU). Tambahkan 4 profil deployment: `pdn-managed` (Pusat Data Nasional, wajib data warga), `on-premise` (Docker/K8s server instansi), `approved-private-cloud` (cloud berlisensi BSSN di wilayah RI), `development` (Docker Compose lokal).
- **Rasional**: PP 71/2019 mewajibkan data publik disimpan di wilayah RI. Supabase Cloud US/EU melanggar kedaulatan data. Adapter pattern memungkinkan PostgreSQL self-hosted di PDN/on-prem.

### [2026-10-06] Adapter Pattern untuk Identity (OIDC/SAML2/Local) & TTE (PSrE/Mock-Test-Only)
- **Keputusan**: Pisahkan interface dari implementasi. `packages/identity` menyediakan adapter: `oidc-official` (INA Digital/Keycloak, PKCE), `saml2-official`, `development-local`, `break-glass`. `packages/tte` adapter: `bsre-official`, `peruri-official`, `privy-official`, `mock-test-only`. Mock TTE dilarang keras di production (fail-fast NODE_ENV=production).
- **Rasional**: UU ITE & Peraturan BSSN mewajibkan TTE tersertifikasi PSrE berlisensi (BSrE, Peruri, Privy). Mock token tidak sah hukum. SSO produksi wajib OIDC Authorization Code + PKCE atau SAML2.

### [2026-10-06] UU PDP Implementation: Soft-Delete Lifecycle vs Purge Workflow (Hak Penghapusan)
- **Keputusan**: Pisahkan soft-delete (lifecycle aplikasi: `deleted_at` + `deleted_by`) dari purge/anonymization workflow (hak penghapusan UU PDP Pasal 8). Purge hanya via workflow resmi: cek legal hold → cek jadwal retensi → approval DPO → anonymize/delete DB + storage + cache + backup → catat audit.
- **Rasional**: UU PDP 27/2022 Pasal 8 memberi hak penghapusan. Aturan lama "DILARANG DELETE permanen" bertentangan hukum. Reconcile: soft-delete untuk operasional, purge workflow untuk hak hukum.

### [2026-10-06] Append-Only Audit Logs dengan HMAC Hash Chain & DB-Level Immutability
- **Keputusan**: Tabel `audit_logs` append-only (INSERT/SELECT saja untuk app_user). Trigger DB mencegah UPDATE/DELETE/TRUNCATE. Hash chain: `event_hash = HMAC_SHA256(key, id||occurred_at||actor_id||action||resource_type||resource_id||request_id||previous_event_hash)`. Verifikasi harian/mingguan.
- **Rasional**: Standar audit BPK & BSSN butuh bukti tidak termodifikasi (tamper-evident). Database role restriction + trigger + hash chain = defense in depth.

### [2026-10-06] Fail-Closed Audit Logging (Mutation Rollback Jika Audit Gagal)
- **Keputusan**: Setiap operasi mutasi (INSERT/UPDATE/DELETE) wajib menulis ke `audit_logs` dalam transaksi yang sama. Jika penulisan audit gagal → rollback mutasi. Tidak boleh "best effort".
- **Rasional**: Mencegah celah di mana aksi sensitif terjadi tanpa jejak audit. Memenuhi prinsip keamanan BSSN & audit BPK.

### [2026-10-06] WCAG 2.1 Level AA Baseline Wajib (Bukan Opsional)
- **Keputusan**: Setiap halaman/komponen wajib memenuhi WCAG 2.1 AA (Permen Kominfo 8/2019). 6 State UI wajib: Loading (Skeleton), Error, Empty, Data View, Responsive, Dark Mode. ErrorBoundary per halaman. Icon-only button: `aria-label` + `sr-only`. Form: `<label htmlFor>` + `aria-invalid` + `aria-describedby`. Table: `<th scope="col">`.
- **Rasional**: Regulasi wajib untuk portal publik pemerintah. Aksesibilitas bukan fitur tambahan tapi syarat legal.

### [2026-10-07] Baseline Security Middleware API (Headers, Rate Limit, Dev Login)
- **Keputusan**: Terpasang `securityHeaders` (CSP, X-Frame-Options, HSTS, dll. — juga di `infra/nginx.conf`) dan rate limiter in-memory per-IP di `apps/api`: global `/api/*` 100 req/menit, login 5/15 menit. Endpoint `POST /api/v1/auth/dev-login` (LocalAdapter) hanya aktif non-production; production wajib SSO resmi (OIDC/SAML2). Verifikasi hash chain diekspos via `GET /api/v1/audit/verify` (permission `audit.verify`).
- **Rasional**: Menerapkan `security.md` yang sebelumnya hanya dokumen. Rate limiter in-memory adalah baseline dev — production wajib tambahan gateway (Nginx `limit_req`) atau Redis karena tidak dibagi antar instance.

### [2026-10-07] Perbaikan Hash Chain Audit (previous_hash dari event TERAKHIR)
- **Keputusan**: `logAudit` kini mengambil `previousEventHash` dari baris terbaru (`ORDER BY created_at DESC LIMIT 1`), bukan baris terlama.
- **Rasional**: Bug: urutan ascending mengambil baris pertama sehingga `verifyChain` gagal mulai baris ke-3 — merusak klaim tamper-evident (BPK/BSSN). Catatan: untie dua insert dengan `created_at` identik masih mungkin; jika audit volume tinggi, pertimbangkan sequence kolom monotonik.

### [2026-10-07] Enkripsi Field-Level AES-256-GCM + Fail-Fast HMAC Production
- **Keputusan**: Util `encryptField/decryptField` (AES-256-GCM, kunci `FIELD_ENCRYPTION_KEY` base64 32-byte) di `apps/api/src/utils/crypto.ts` untuk kolom `*_encrypted`. `AUDIT_HMAC_KEY` kini wajib (fail-fast saat boot) di production. Token web disimpan di memori saja (dilarang localStorage). CI GitHub Actions (lint/typecheck/test/build + `pnpm audit` + gitleaks) di `.github/workflows/ci.yml`.
- **Rasional**: `data-protection.md` mensyaratkan enkripsi at-rest untuk NIK; kolom `nik_encrypted` sudah ada tapi tidak ada mekanismenya. Kunci HMAC dev yang dipakai production membuat event_hash bisa direkayasa ulang pihak luar.