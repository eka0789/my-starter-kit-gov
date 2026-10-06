# AI Prompt: Initialize Enterprise Government Project

## Context & Purpose
Gunakan prompt ini saat ingin menginisialisasi atau menscafhold struktur repositori Monorepo `my-starter-kit-gov` dari nol menggunakan Turborepo, pnpm workspaces, Hono backend, React Vite frontend, Drizzle ORM, PostgreSQL, Tailwind CSS, dan shadcn/ui.

---

## 🤖 AI Instructions

Saat mengeksekusi inisialisasi proyek, ikuti langkah-langkah berikut secara ketat:

### Step 1: Analisis Konfigurasi Monorepo
- Siapkan struktur `pnpm-workspace.yaml` yang menghubungkan `apps/*` dan `packages/*`.
- Siapkan `turbo.json` dengan pipeline `build`, `lint`, `dev`, `db:generate`, `db:push`, `test`, `audit:deps`, `sbom:generate`.

### Step 2: Inisialisasi Apps & Packages
1. **`apps/api`**:
   - Framework Hono dengan router terpusat (`apps/api/src/router.ts`).
   - Middleware autentikasi berbasis **adapter OIDC/SAML2/local** (bukan Supabase JWT hardcoded), CORS, logger, error handler terpusat.
2. **`apps/web`**:
   - React 18 + Vite + TypeScript.
   - Konfigurasi Tailwind CSS dan penyedia shadcn/ui primitives.
   - Konfigurasi TanStack Query Client Provider dan React Router root.
   - Wrapper `ErrorBoundary` pada root layout.
3. **`packages/database`**:
   - Konfigurasi PostgreSQL Client (self-hosted/PDN/on-prem) & Drizzle ORM instance.
   - Helper `auditColumns` (6 kolom wajib): `created_at`, `updated_at`, `deleted_at`, `created_by` (NOT NULL), `updated_by` (NOT NULL), `deleted_by` (nullable).
   - Tabel `audit_logs` append-only dengan HMAC hash chain + trigger immutability.
4. **`packages/ui`**:
   - Tempat komponen UI shadcn universal (WCAG 2.1 AA compliant).
5. **`packages/config`**:
   - Konfigurasi bersama ESLint (dengan `eslint-plugin-jsx-a11y`), Prettier, tsconfig.base.json.
6. **`packages/identity`**:
   - Interface `IdentityAdapter` + implementasi: `oidc-official`, `saml2-official`, `development-local`, `break-glass`.
7. **`packages/tte`**:
   - Interface `TteAdapter` + implementasi: `bsre-official`, `peruri-official`, `privy-official`, `mock-test-only` (fail-fast di production).
8. **`packages/audit`**:
   - `computeEventHash`, `getLastEventHash`, `appendAuditLog` (fail-closed).
9. **`packages/interoperability`**:
   - SDI metadata helper, BPS/Kemendagri wilayah codes reference, SPLP client.
10. **`packages/utils`**:
    - `maskNip`, `maskNik`, `sanitizeSearchQuery`.

### Step 3: Deployment Profile Default
- Buat `.env.example` dengan profil deployment: `pdn-managed`, `on-premise`, `approved-private-cloud`, `development`.
- Database connection string untuk PostgreSQL self-hosted (bukan Supabase Cloud URL).

### Step 4: Verifikasi Script Root
Pastikan `package.json` root memiliki script utama:
```json
{
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{ts,tsx,md,json}\"",
    "db:generate": "turbo run db:generate",
    "db:push": "turbo run db:push",
    "test": "turbo run test",
    "audit:deps": "pnpm audit --audit-level=high",
    "sbom:generate": "pnpm exec syft . -o cyclonedx-json=sbom.json"
  }
}
```

### Step 5: File Root Mandatory
Buat file berikut di root:
- `LICENSE` (MIT/Apache-2.0)
- `README.md` (mengacu ke `.ai/README.md`)
- `.env.example`
- `.gitignore` (node_modules, .turbo, dist, build, .env, *.log)

### Step 6: Output Execution Summary
Hasilkan laporan ringkas struktur folder yang telah dibuat, file root, dan instruksi menjalankan server dev (`pnpm install && pnpm dev`).
