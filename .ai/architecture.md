# Architecture Guidelines

## Architecture Style

- **Modular Monorepo**: Dikelola dengan Turborepo & pnpm workspace.
- **Feature First (Vertical Slice)**: Kode dikelompokkan berdasarkan fitur bisnis, bukan lapisan teknikal.
- **Domain Separation**: Setiap modul domain (`pegawai`, `correspondence`, `organization`) terisolasi rapi.
- **Shared Packages**: Kode bersama di `packages/` (`ui`, `database`, `config`, `types`, `identity`, `audit`, `interoperability`).
- **Adapter Pattern untuk External Services**: Identity (SSO), TTE, dan SPLP menggunakan interface/adapter — tidak di-hardcode ke satu vendor.

---

## Pemisahan: Feature Slice vs Shared Packages

| Letakkan di | Kriteria |
|-------------|----------|
| `features/[feature]/` | Logic, komponen, schema, hooks yang spesifik satu fitur bisnis |
| `packages/database` | Drizzle schema primitif, `auditColumns`, `baseTable`, migration tooling |
| `packages/identity` | Interface IdentityProvider, adapter OIDC/SAML/lokal |
| `packages/audit` | `auditLogger` utility, hash chain helpers |
| `packages/interoperability` | BPS wilayah client, SPLP client, SDI metadata helpers |
| `packages/ui` | shadcn/ui wrapper, design system tokens |
| `packages/types` | Shared DTOs, enums global, contract API |

Skema Zod validasi request boleh ada di feature slice. Schema database (`pgTable`) ada di `packages/database/schema/[domain].ts`.

---

## Larangan Arsitektur

- **Dilarang** MVC Klasik (folder global `controllers/`, `models/`, `repositories/`).
- **Dilarang** *tight coupling* antar fitur. Fitur berkomunikasi hanya via shared packages atau event/message.
- **Dilarang** hardcode identity provider atau TTE provider langsung di route handler.
- **Dilarang** menyimpan secret di kode; gunakan environment variable.

---

## Struktur Feature-First (Backend)

```text
apps/api/src/features/[feature_name]/
├── routes.ts       # Hono route handler + middleware mounting
├── schema.ts       # Zod validation schema (request body, query, params)
├── service.ts      # Business logic + Drizzle ORM queries
├── mapper.ts       # Entity → DTO mapping (jangan return raw DB row)
├── types.ts        # TypeScript DTO & return types
└── index.ts        # Public exports
```

## Struktur Feature-First (Frontend)

```text
apps/web/src/features/[feature_name]/
├── components/     # UI components spesifik fitur (Cards, Modals)
├── pages/          # Route target components
├── hooks/          # TanStack Query hooks (useQuery, useMutation)
├── services/       # API call functions (typed fetch wrapper)
├── schemas/        # Zod form validation schemas
├── types/          # Frontend TypeScript types
└── index.ts        # Public exports
```

---

## Adapter Layer: Identity & TTE

```text
packages/identity/
├── interface.ts        # IdentityProvider interface
├── adapters/
│   ├── oidc.ts         # Production: OIDC Authorization Code + PKCE
│   ├── saml2.ts        # Production: SAML2 ACS
│   └── local.ts        # Development ONLY — jangan aktifkan di production
└── index.ts

packages/identity/tte/
├── interface.ts        # SignatureProvider interface
├── adapters/
│   ├── bsre.ts         # BSrE / BSSN API
│   ├── peruri.ts       # Peruri API
│   └── mock.ts         # Unit test ONLY — fail jika NODE_ENV=production
└── index.ts
```

---

## Prinsip Desain

- Setiap fitur bertanggung jawab penuh atas UI, API, Validasi, Tipe Data, Hooks, dan Logic Bisnis miliknya.
- Kode yang dipakai lebih dari 2 modul diletakkan di `packages/`.
- Utamakan Komposisi dibanding Pewarisan.
- Setiap modul harus dapat diuji secara independen.
- Fail-fast: sistem wajib gagal dengan pesan jelas jika konfigurasi kritis tidak tersedia (database URL, identity config, env).
