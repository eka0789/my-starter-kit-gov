# Official Technology Stack

## Core Ecosystem & Monorepo
- **Package Manager**: `pnpm` (Fast, disk space-efficient)
- **Monorepo Manager**: `Turborepo` (High-performance build system)

## Frontend Stack
- **Framework**: `React 18+`
- **Language**: `TypeScript` (Strict mode — zero `any`)
- **Build Tool**: `Vite`
- **Routing**: `React Router v6+`
- **Styling**: `Tailwind CSS v3+`
- **UI Components**: `shadcn/ui` + `Radix UI` primitives
- **Icons**: `Lucide Icons`
- **State & Data Fetching**: `TanStack Query v5`
- **Form Management**: `React Hook Form`
- **Validation**: `Zod`
- **Error Boundary**: `react-error-boundary`

## Backend Stack
- **Framework**: `Hono` (Ultrafast, Edge/Node.js)
- **Language**: `TypeScript` (Strict mode)
- **Runtime**: `Node.js` (primary); adaptable ke environment lain

## Database & ORM
- **Engine**: `PostgreSQL` (wajib relasional; lihat profil deployment di bawah)
- **ORM**: `Drizzle ORM` (Type-safe SQL)
- **Migration**: `drizzle-kit`
- **Connection Pooling**: `PgBouncer` (for on-premise/production)

## Identity & Signature (Adapter-based)
- **Auth Layer**: `packages/identity` — interface berbasis OIDC/SAML2
- **Production SSO**: OIDC Authorization Code + PKCE / SAML2 (INA Digital, Keycloak, IdP instansi)
- **Development Auth**: Local/mock hanya untuk `development` profile
- **TTE**: Adapter PSrE berlisensi (BSrE, Peruri, Privy, dll.)
- **DILARANG production**: Supabase Auth sebagai satu-satunya identity provider, mock TTE

## Profil Deployment

| Profile | Penggunaan | Hosting | Database |
|---------|-----------|---------|----------|
| `pdn-managed` | Production data publik/warga | PDN / fasilitas PDN | PostgreSQL on-PDN |
| `on-premise` | Intranet instansi | Server instansi | PostgreSQL server instansi |
| `approved-private-cloud` | Cloud sovereign dengan approval legal | Cloud RI-bersertifikat | Managed PostgreSQL RI |
| `development` | Dev lokal & CI | Docker Compose lokal | PostgreSQL Docker lokal |

> Supabase (self-hosted PostgreSQL) dapat digunakan sebagai **adapter pengembangan** atau untuk instansi yang memiliki deployment Supabase di infrastruktur PDN. Bukan sebagai lock-in cloud US/EU.

> **PP 71/2019**: Data yang menyangkut kepentingan publik wajib berada di wilayah RI. Verifikasi dengan legal instansi sebelum production.

## Testing & Quality
- **Unit & Integration**: `Vitest`
- **End-to-End**: `Playwright`
- **Accessibility**: `@axe-core/react`, `eslint-plugin-jsx-a11y`, Lighthouse
- **Linter**: `ESLint` + `eslint-plugin-jsx-a11y`
- **Formatter**: `Prettier`

## Security & Supply Chain
- **Secret Scan**: `gitleaks`
- **SAST**: `Semgrep` atau ESLint security rules
- **Dependency Audit**: `pnpm audit`
- **SBOM**: `cyclonedx-bom` (setiap release)
- **Container Scan**: `trivy` (jika Docker image)

## Package Wajib Starter Kit

| Package | Lokasi | Tujuan |
|---------|--------|--------|
| `@kit/database` | `packages/database` | Drizzle schema, migration, audit columns |
| `@kit/ui` | `packages/ui` | shadcn/ui components |
| `@kit/types` | `packages/types` | Shared TypeScript types & DTOs |
| `@kit/config` | `packages/config` | ESLint, Prettier, tsconfig base |
| `@kit/identity` | `packages/identity` | Auth adapter interface |
| `@kit/audit` | `packages/audit` | Audit logger utilities |
| `@kit/interoperability` | `packages/interoperability` | Satu Data, BPS wilayah, SPLP client |

---

> ⚠️ **Aturan Penting**: Dilarang menambah pustaka pihak ketiga di luar daftar resmi ini tanpa keputusan arsitektur yang dicatat di `agent-memory.md`. Pertimbangkan dampak lisensi, supply-chain, dan maintenance.
