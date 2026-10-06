# Folder Structure (Struktur Direktori Monorepo)

```text
my-starter-kit-gov/
├── apps/
│   ├── web/                       # Frontend React + Vite + Tailwind + shadcn/ui
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── assets/
│   │   │   ├── components/        # Global UI components
│   │   │   ├── features/          # Feature-first vertical slices
│   │   │   ├── hooks/             # Global React hooks
│   │   │   ├── layouts/           # Root App Shell, Sidebar, Header
│   │   │   ├── lib/               # Utility functions & API client
│   │   │   ├── routes/            # Router configurations
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── README.md
│   │
│   └── api/                       # Backend API Hono Framework
│       ├── src/
│       │   ├── features/          # Feature-first backend endpoints & services
│       │   ├── middleware/        # Global Hono middlewares (Auth, Logger, CORS)
│       │   ├── lib/               # Helper utilities
│       │   ├── index.ts           # Entry point server Hono
│       │   └── router.ts          # Centralized app router
│       ├── package.json
│       └── README.md
│
├── packages/
│   ├── ui/                        # Shared UI Components library (shadcn/ui)
│   ├── database/                  # Drizzle ORM Schemas, Migrations, helpers
│   │   ├── schema/
│   │   │   ├── helpers.ts         # auditColumns, baseTable
│   │   │   ├── audit-logs.ts      # Append-only audit_logs DDL
│   │   │   ├── users.ts
│   │   │   ├── employees.ts
│   │   │   └── wilayah.ts         # BPS/Kemendagri reference data
│   │   ├── migrations/
│   │   └── index.ts
│   ├── identity/                  # Auth adapter interface (OIDC/SAML2/local)
│   │   ├── interface.ts
│   │   ├── adapters/
│   │   │   ├── oidc.ts            # Production OIDC
│   │   │   ├── saml2.ts           # Production SAML2
│   │   │   └── local.ts           # Development ONLY
│   │   ├── tte/
│   │   │   ├── interface.ts
│   │   │   └── adapters/
│   │   │       ├── bsre.ts        # BSrE API
│   │   │       └── mock.ts        # Test ONLY
│   │   └── index.ts
│   ├── audit/                     # Audit logger utilities + HMAC helpers
│   ├── interoperability/          # Satu Data, BPS wilayah, SPLP client
│   ├── config/                    # Shared ESLint, Prettier, TypeScript configs
│   └── types/                     # Shared global DTOs & TypeScript interfaces
│
├── infra/                         # Infrastructure as Code
│   ├── docker/
│   │   ├── docker-compose.dev.yml
│   │   ├── docker-compose.pdn.yml
│   │   └── Dockerfile
│   ├── nginx/
│   │   └── nginx.conf
│   ├── k8s/                       # Kubernetes manifests (jika digunakan)
│   └── deployment-guides/         # PDN/on-prem deployment docs
│
├── docs/                          # Dokumentasi teknis & arsitektur proyek
│   ├── architecture/
│   ├── compliance/                # DPIA templates, audit checklists
│   └── deployment/
│
├── scripts/                       # Utility scripts (seed, backup, deployment)
│   ├── seed-wilayah.ts            # Sync BPS/Kemendagri wilayah
│   ├── verify-audit-chain.ts     # HMAC chain verification
│   └── generate-sbom.sh
│
├── .ai/                           # Sistem instruksi AI Assistant (Rules, Prompts, Templates)
├── .github/                       # GitHub Actions CI/CD workflows
│   └── workflows/
│       ├── ci.yml
│       └── security-scan.yml
│
├── pnpm-workspace.yaml            # Konfigurasi workspace pnpm
├── turbo.json                     # Konfigurasi Turborepo pipeline
├── package.json                   # Root package.json
├── .gitignore
├── .env.example                   # Environment variables template (tanpa nilai sensitif)
├── LICENSE                        # MIT/Apache 2.0/BMN License
└── README.md                      # Root README proyek
```

---

## Aturan Direktori

1. Setiap folder modul/package WAJIB memiliki `README.md` yang menjelaskan tujuan dan cara penggunaannya.
2. Dilarang membuat folder baru yang tidak memiliki tujuan jelas.
3. Struktur folder wajib mengikuti pola *Feature First*.
4. `infra/` wajib ada untuk profil deployment PDN/on-premise.
5. File root (`LICENSE`, `.env.example`, `pnpm-workspace.yaml`, `turbo.json`) wajib dihasilkan oleh scaffolding prompt.
