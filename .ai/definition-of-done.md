# Definition of Done (DoD)

Sebuah fitur dinyatakan **SELESAI (DONE)** dan siap disebar ke lingkungan production **hanya jika** telah memenuhi seluruh poin pemeriksaan berikut. Klaim "production-ready" tanpa checklist ini adalah **defect**.

---

## Database & Migrasi
- [ ] Tabel Drizzle ORM didefinisikan dengan Primary Key UUID & **6 kolom audit** (`created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`, `deleted_by`).
- [ ] `created_by` dan `updated_by` **NOT NULL**.
- [ ] File migrasi SQL berhasil dibuat (`drizzle-kit generate`) dan diuji (`drizzle-kit migrate`).
- [ ] Soft delete diterapkan; query default `deleted_at IS NULL`.
- [ ] Index pada kolom pencarian/join (`nip`, `unit_kerja_id`, `created_at`, `status`).
- [ ] Tabel referensi wilayah BPS/Kemendagri digunakan jika ada kode lokasi.

## Validasi & Type Safety
- [ ] Skema Zod lengkap untuk Body, Query, dan Params.
- [ ] Bebas dari tipe `any`, `@ts-ignore`, atau warning TypeScript.
- [ ] DTO mapping: tidak ada raw DB row yang dikembalikan ke client.

## Backend API
- [ ] Route Hono terpasang dengan middleware autentikasi & RBAC permission.
- [ ] Data scoping berdasarkan unit kerja diterapkan.
- [ ] Mengembalikan format JSON standar (`success`, `message`, `data`, `meta` dengan `request_id`).
- [ ] Log audit tercatat untuk operasi mutasi (`POST`, `PATCH`, `DELETE`, export, TTE).
- [ ] Fail-closed: jika audit logging gagal, mutasi di-rollback.
- [ ] Query parameterized (tidak ada interpolasi string).
- [ ] NIK/NIP masked di DTO kecuali permission dan purpose sah.
- [ ] Error handling: tidak leak SQL, stack trace, secret, atau PII.
- [ ] OpenAPI / dokumentasi API diperbarui.

## Frontend & UI
- [ ] Menggunakan komponen `shadcn/ui` + Tailwind CSS.
- [ ] Mendukung 6 State UI: **Loading (Skeleton)**, **Error**, **Empty**, **Data View**, **Responsive**, **Dark Mode**.
- [ ] Page dibungkus `ErrorBoundary`.
- [ ] Icon-only button memiliki `aria-label` + `sr-only`.
- [ ] Form input memiliki `<label>` terkait + `aria-describedby` untuk error.
- [ ] Table header menggunakan `scope="col"`.
- [ ] Status tidak hanya dibedakan warna (ada teks/ikon alternatif).
- [ ] Destructive action memakai `AlertDialog` konfirmasi.
- [ ] NIK/NIP tidak ditampilkan penuh di tabel/URL/log.

## Aksesibilitas (WCAG 2.1 AA)
- [ ] `eslint-plugin-jsx-a11y` zero errors.
- [ ] Lighthouse Accessibility score ≥ 90.
- [ ] `axe-core` zero critical/serious.
- [ ] Keyboard-only test lulus (Tab, Shift+Tab, Enter, Escape, Arrow).
- [ ] Screen reader test lulus untuk flow kritis (NVDA/VoiceOver).
- [ ] Kontras teks ≥ 4.5:1 (normal) / 3:1 (besar).
- [ ] Zoom 200% tidak merusak layout.

## Keamanan
- [ ] Identity adapter terkonfigurasi (OIDC/SAML2 production; local hanya development).
- [ ] Token tidak disimpan di `localStorage`.
- [ ] MFA aktif untuk privileged role (jika relevan).
- [ ] TTE (jika naskah dinas) menggunakan PSrE berlisensi, bukan mock.
- [ ] Mock TTE/SSO **tidak dapat diaktifkan** di production (`NODE_ENV=production` fail-fast).
- [ ] Secret di secret manager, bukan hardcoded.
- [ ] Security headers terpasang (CSP, HSTS, X-Frame-Options, dll).
- [ ] Rate limiting aktif pada endpoint publik dan authenticated.

## Data Protection (UU PDP)
- [ ] Data inventory dan classification lengkap.
- [ ] Legal basis dan retention disetujui DPO (jika data pribadi).
- [ ] DPIA selesai untuk data berisiko tinggi (data spesifik, data anak).
- [ ] Data subject request workflow tersedia (akses, koreksi, erasure).
- [ ] Soft-delete dan purge workflow terpisah.
- [ ] PII tidak muncul di log/URL/error.

## Satu Data & Interoperabilitas
- [ ] Metadata SDI tersedia untuk data yang dipertukarkan.
- [ ] Kode wilayah menggunakan BPS/Kemendagri resmi.
- [ ] SPLP contract (jika integrasi eksternal) dengan idempotency dan audit.

## Pengujian & Build
- [ ] Build aplikasi backend & frontend sukses tanpa error (`pnpm build`).
- [ ] Linter & Formatter sukses tanpa warning (`pnpm lint`).
- [ ] Unit test (Vitest) lulus.
- [ ] E2E test (Playwright) untuk flow kritis lulus.

## Supply Chain & Deployment
- [ ] `pnpm audit --audit-level=high` tanpa temuan high/critical.
- [ ] Secret scan (`gitleaks`) lulus.
- [ ] SBOM di-generate (`cyclonedx-bom`).
- [ ] `LICENSE` ada di root repository.
- [ ] Deployment profile sesuai instansi (PDN/on-prem/private-cloud).
- [ ] Data center berada di wilayah RI (untuk data warga negara).
- [ ] Backup dan restore drill terdokumentasi.

## Dokumentasi
- [ ] Berkas `README.md` pada modul terkait telah diperbarui.
- [ ] OpenAPI spec diperbarui.
- [ ] Keputusan arsitektur dicatat di `agent-memory.md` (jika ada perubahan signifikan).
- [ ] Runbook operasional tersedia (jika production).
