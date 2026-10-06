# Development Workflow

## Alur Kerja Pengembangan Fitur (Feature Development Cycle)

Setiap pengembangan fitur baru **WAJIB** mengikuti 8 alur sistematis berikut:

```text
0. SCAFFOLD (jika baru)
1. ANALISIS & KEPATUHAN
2. DESAIN SKEMA
3. REST API
4. FRONTEND UI
5. KEAMANAN & PRIVASI
6. AKSESIBILITAS
7. VERIFIKASI, DOKUMENTASI & SBOM
```

---

## Tahapan Alur Kerja

### 0. Scaffolding (Hanya untuk Inisialisasi Proyek)
- Jalankan `prompts/initialize-project.md`.
- Hasilkan: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `apps/`, `packages/`, `infra/`, `.env.example`, `LICENSE`.
- Setup Docker Compose development (`infra/docker/docker-compose.dev.yml`).
- Verifikasi `pnpm install`, `pnpm build`, `pnpm lint` sukses.

### 1. Analisis & Kepatuhan
- Pahami kebutuhan bisnis dan regulasi pemerintah terkait (`compliance-baseline.md`, `data-protection.md`).
- Identifikasi klasifikasi data: Publik, Internal, Pribadi Umum, Pribadi Spesifik, Rahasia.
- Tentukan dasar pemrosesan, retensi, dan legal hold.
- Tentukan scope data, peranan (RBAC), dan aturan audit trail.
- Jika data spesifik atau data anak: lakukan DPIA sebelum implementasi.

### 2. Desain Database & Skema Zod
- Buat tabel Drizzle ORM di `packages/database/schema/`.
- Sertakan **6 kolom audit** (`created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`, `deleted_by`).
- `created_by` dan `updated_by` **NOT NULL**.
- Buat skema Zod untuk validasi data.
- Generate file migrasi database (`pnpm drizzle-kit generate`).
- Jika tabel menggunakan kode wilayah: gunakan tabel `wilayah` BPS/Kemendagri, jangan hardcode.

### 3. Pengembangan Backend REST API (Hono)
- Buat router dan handler di `apps/api/src/features/[feature]/`.
- Terapkan `authMiddleware`, `requirePermission`, dan `Zod validator`.
- Tulis service logic Drizzle ORM (parameterized, bukan interpolasi).
- Sertakan mapper DTO (jangan return raw DB row).
- Panggil `auditLogger.log()` pada setiap mutasi.
- Fail-closed: jika audit logging gagal, rollback mutasi.
- Masking NIK/NIP di DTO kecuali permission dan purpose sah.

### 4. Pengembangan Frontend UI (React + shadcn/ui)
- Buat custom hook TanStack Query (`useQuery` / `useMutation`) di `apps/web/src/features/[feature]/hooks/`.
- Buat komponen UI dan Halaman di `apps/web/src/features/[feature]/pages/`.
- Wrap page dengan `ErrorBoundary`.
- Pastikan mendukung 6 State UI: **Loading (Skeleton)**, **Error**, **Empty**, **Data View**, **Responsive**, **Dark Mode**.
- Icon-only button: `aria-label` + `sr-only`.
- Form: label terkait, `aria-describedby` untuk error.
- Table: `scope="col"` pada header.
- Destructive action: `AlertDialog` konfirmasi.

### 5. Keamanan & Privasi
- Verifikasi RBAC + data scoping diterapkan.
- Verifikasi PII tidak muncul di log, URL, error.
- Verifikasi query parameterized.
- Verifikasi TTE (jika naskah dinas) menggunakan PSrE berlisensi, bukan mock.
- Verifikasi SSO menggunakan OIDC/SAML2 resmi (bukan mock di production).

### 6. Aksesibilitas
- Jalankan `eslint-plugin-jsx-a11y` (zero errors).
- Jalankan Lighthouse Accessibility Audit (score ≥ 90).
- Jalankan `axe-core` (zero critical/serious).
- Test keyboard-only (Tab, Shift+Tab, Enter, Escape, Arrow keys).
- Test screen reader (NVDA atau VoiceOver) untuk flow kritis.

### 7. Verifikasi, Dokumentasi & SBOM
- `pnpm build` dan `pnpm lint` sukses.
- `pnpm audit --audit-level=high` tanpa temuan high/critical.
- Generate SBOM (`pnpm cyclonedx-bom`).
- Perbarui dokumentasi di `README.md` modul.
- Perbarui OpenAPI spec.
- Catat keputusan arsitektur di `agent-memory.md` jika ada perubahan signifikan.
