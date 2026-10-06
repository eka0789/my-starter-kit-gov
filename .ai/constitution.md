# AI Constitution (Kontrak Kerja AI Assistant)

Dokumen ini adalah konstitusi tertinggi yang mengatur perilaku AI Assistant dalam membaca, menghasilkan, dan memodifikasi kode pada repositori ini.

---

## Status Repositori

Repositori ini adalah **blueprint arsitektur + sistem konteks AI**. Kode aplikasi (`apps/`, `packages/`, `infra/`) dihasilkan melalui scaffolding (`prompts/initialize-project.md`). Jangan mengklaim aplikasi production-ready sebelum scaffolding, konfigurasi instansi, dan validasi compliance selesai.

---

## Prioritas Pembacaan Dokumen (Reading Hierarchy)

Sebelum menghasilkan kode, AI wajib membaca dokumen konteks di direktori `.ai/` sesuai urutan berikut:

1. `project.md`
2. `compliance-baseline.md`
3. `tech-stack.md`
4. `architecture.md`
5. `folder-structure.md`
6. `coding-standards.md`
7. `backend.md`
8. `frontend.md`
9. `database.md`
10. `api-rules.md`
11. `security.md`
12. `data-protection.md`
13. `identity-and-signature.md`
14. `interoperability.md`
15. `audit-integrity.md`
16. `deployment-and-supply-chain.md`
17. `accessibility.md`
18. `ui-guidelines.md`
19. `workflow.md`
20. `definition-of-done.md`
21. `business-rules.md`
22. `domain-*.md` (jika domain khusus ada)
23. `agent-memory.md`

---

## Aturan Resolusi Konflik Dokumen

Jika terjadi kontradiksi antar dokumen, tingkat hierarki resolusi keputusan adalah sebagai berikut:

1. `compliance-baseline.md` + `data-protection.md` + `identity-and-signature.md` (Regulasi, kedaulatan data, TTE, PDP)
2. `domain-*.md` + `business-rules.md` (Spesifikasi domain & aturan bisnis instansi)
3. `security.md` + `audit-integrity.md` + `deployment-and-supply-chain.md`
4. `agent-memory.md` (Keputusan arsitektur terbaru)
5. `architecture.md` (Arsitektur Feature-First Monorepo)
6. `coding-standards.md` (Standar kualitas kode)

Jika konflik menyangkut data pribadi, TTE, atau hosting: **regulasi menang**. Jangan pilih kenyamanan developer.

---

## Larangan Keras Bagi AI Assistant

1. Dilarang menghasilkan kode parsial, potongan kode tanpa konteks, atau kode yang menyisakan `// TODO` production.
2. Dilarang mengunci production ke vendor cloud luar negeri (Vercel, Cloudflare Workers sebagai runtime data, Supabase cloud US/EU) tanpa persetujuan Legal/TI instansi.
3. Dilarang menghapus kolom audit trail atau mekanisme Soft Delete pada tabel bisnis.
4. Dilarang mengklaim aplikasi "sudah memenuhi semua regulasi pemerintah" tanpa bukti audit.
5. Dilarang memakai mock TTE, mock SSO, atau secret hardcoded di production.
6. Dilarang menulis query dengan interpolasi input pengguna ke SQL.
7. Dilarang menampilkan NIK/NIP/PII penuh tanpa permission, purpose, dan audit.
8. Dilarang hard-delete data pribadi tanpa purge workflow resmi.

---

## Stack yang Boleh Diadaptasi

Stack dasar yang harus dipertahankan:

- `pnpm` + `Turborepo`
- `Hono` + `TypeScript` strict
- `React` + `Vite` + `Tailwind` + `shadcn/ui`
- `Drizzle ORM` + `PostgreSQL`
- `Zod` + `TanStack Query` + `React Hook Form`

Adapter yang **boleh diganti** sesuai profil deployment instansi:

- Identity provider (OIDC/SAML resmi, Keycloak, INA Digital)
- Database hosting (PostgreSQL on-prem/PDN; Supabase hanya adapter opsional)
- Object storage (S3-compatible on-prem/PDN)
- TTE provider (PSrE berlisensi)
- Runtime hosting (Docker/K8s on-prem/PDN)

---

## Klaim Compliance

Gunakan frasa:

- "baseline kontrol teknis tersedia"
- "wajib divalidasi DPO/Legal/auditor instansi"

Jangan gunakan:

- "sudah 100% compliant SPBE/PDP/BSSN"
- "production ready untuk seluruh instansi tanpa konfigurasi"
