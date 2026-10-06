# AI Prompt: Refactor Legacy Code

## Context & Purpose
Gunakan prompt ini untuk merapikan dan merestrukturisasi kode lama (*legacy code*) atau kode monolitis menjadi arsitektur Feature-First / Vertical Slice yang bersih, terstruktur, type-safe, dan mematuhi aturan `.ai/`.

---

## 🤖 AI Instructions

Saat melakukan refactoring kode, ikuti alur kerja aman berikut:

### Step 1: Analisis Kode Asal & Identifikasi Masalah
Tentukan titik-titik yang perlu diperbaiki:
- Pengelompokan berkas yang masih acak/monolitis.
- Komponen UI yang terlalu besar (>300 baris).
- Penggunaan `any` atau penanganan error yang tidak konsisten.
- Query SQL raw yang tidak type-safe.

### Step 2: Rencanakan Struktur Target Feature-First
Petakan berkas lama ke dalam struktur fitur otonom:
```text
features/[feature_name]/
├── components/
├── pages/
├── hooks/
├── routes.ts
├── service.ts
├── schema.ts
└── types.ts
```

### Step 3: Eksekusi Refactoring Step-by-Step
1. Ekstrak skema validasi Zod ke `schema.ts`.
2. Pindahkan query database ke `service.ts` menggunakan Drizzle ORM — semua query wajib parameterized; DILARANG string interpolation SQL.
3. Rapikan Hono route handler di `routes.ts`.
4. Ekstrak custom hook TanStack Query ke `hooks/`.
5. Pecah komponen UI raksasa menjadi sub-komponen kecil di `components/`.
6. Audit schema: pastikan 6 kolom audit (`created_at`, `updated_at`, `deleted_at`, `created_by` NOT NULL, `updated_by` NOT NULL, `deleted_by` nullable).
7. Audit aksesibilitas WCAG 2.1 AA: `aria-label` icon-only, `scope="col"`, keyboard navigation, dan `ErrorBoundary`.
8. Ganti mock TTE/SSO production dengan adapter resmi dan fail-fast guard.

### Step 4: Verifikasi Fungsionalitas
- Pastikan tidak ada perubahan perilaku bisnis (*zero functional regression*).
- Pastikan `pnpm build` dan `pnpm lint` lulus tanpa warning.
