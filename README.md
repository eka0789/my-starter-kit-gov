# Government Starter Kit

Enterprise monorepo blueprint untuk aplikasi pemerintahan Indonesia.

## Status

Starter kit menyediakan implementasi dasar yang dapat dikembangkan menuju production. Integrasi identity, TTE PSrE, infrastruktur PDN/on-premise, DPIA, dan approval legal tetap wajib diselesaikan sebelum production.

## Quick Start

```bash
pnpm install
cp .env.example .env
pnpm db:migrate   # buat tabel (butuh Postgres: docker compose -f infra/docker-compose.yml up -d postgres)
pnpm db:seed      # data dummy: wilayah BPS + pegawai contoh
pnpm dev
```

- Web: http://localhost:5173 — login dev: `dev-admin` / `dev-operator` / `dev-pimpinan`
  (LocalAdapter, otomatis nonaktif di production; production wajib SSO resmi)
- API: http://localhost:8787 (`GET /health/live`, `GET /api/v1/audit/verify`)

## Quality Gates

Semua perintah berikut wajib hijau sebelum menyatakan pekerjaan selesai (lihat `.ai/coding-standards.md`):

```bash
pnpm lint        # ESLint + jsx-a11y (0 error)
pnpm typecheck   # tsc --noEmit (strict)
pnpm test        # Vitest (apps/api smoke tests)
pnpm build       # Turbo build (api + web)
```

## Struktur

- `apps/api` — Hono API
- `apps/web` — React + Vite frontend
- `packages/database` — Drizzle schema dan migrations
- `packages/identity` — adapter OIDC/SAML2/local
- `packages/audit` — append-only audit logger + HMAC
- `packages/interoperability` — metadata Satu Data dan kode wilayah
- `packages/ui` — komponen UI aksesibel
- `packages/types` — shared types
- `packages/config` — konfigurasi lint dan TypeScript
- `.ai` — aturan arsitektur, compliance, dan template
- `infra` — Docker Compose dan Nginx

## Compliance Baseline

Implementasi wajib mengikuti `.ai/compliance-baseline.md`, `.ai/data-protection.md`, `.ai/identity-and-signature.md`, `.ai/audit-integrity.md`, `.ai/accessibility.md`, dan `.ai/deployment-and-supply-chain.md`.
