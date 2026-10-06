# Enterprise Government Starter Kit (`my-starter-kit-gov`)

Starter Kit Enterprise Aplikasi Pemerintah Indonesia berbasis arsitektur **Feature-First Monorepo**, dibangun dengan teknologi modern, tipe terstruktur, aman, serta menyediakan **baseline kontrol teknis** untuk memenuhi standar Sistem Pemerintahan Berbasis Elektronik (SPBE).

---

## Tujuan Repositori

Repositori ini dirancang sebagai sistem acuan (starter kit) untuk membangun aplikasi instansi pemerintah (Kementerian, Lembaga, Daerah / Pemda) dengan kriteria:

1. **Baseline Teknis Siap Pakai**: Mendukung fitur standar seperti e-Surat/Naskah Dinas Digital, SIMPEG/Manajemen ASN, E-Kinerja, Sistem Pengaduan/SP4N-LAPOR, hingga Layanan Publik.
2. **Baseline Kontrol SPBE & BSSN**: Mengikuti pedoman keamanan informasi, audit trail, akses berbasis peran (RBAC), serta enkripsi data sensitif.
3. **AI-FIRST Development**: Dilengkapi dengan sistem konteks `.ai` (System Rules, Prompts Library, dan Code Templates) yang memungkinkan AI Coding Assistant memproduksi kode berkualitas produksi secara konsisten.
4. **Deployment Fleksibel**: Mendukung profil deployment PDN (Pusat Data Nasional), on-premise, dan private cloud souveran — **bukan mengunci ke vendor tertentu**.

---

## ⚠️ Penting: Status Repositori

Ini adalah **blueprint arsitektur + instruksi AI**. Kode aplikasi belum ada. Developer/Instansi wajib:

1. Menjalankan scaffolding: `prompts/initialize-project.md`
2. Mengonfigurasi profil deployment instansi (PDN, on-prem, dsb)
3. Mengintegrasikan SSO resmi (INA Digital/OIDC/SAML2)
4. Mengintegrasikan TTE PSrE berlisensi
5. Melakukan validasi compliance (DPIA, penetration test, legal review) sebelum production

---

## Struktur Direktori `.ai/`

```text
.ai/
├── README.md                     # Dokumentasi ini
├── constitution.md               # Kontrak kerja & urutan prioritas pembacaan AI
├── project.md                    # Visi & prinsip dasar proyek
├── tech-stack.md                 # Stack teknologi & profil deployment
├── architecture.md               # Arsitektur Feature-First Vertical Slice
├── folder-structure.md           # Struktur direktori monorepo & aplikasi
├── business-rules.md             # Aturan bisnis & regulasi standar pemerintah
├── coding-standards.md           # Standar penulisan kode & type-safety
├── backend.md                    # Aturan pengembangan Backend (Hono + Zod + Drizzle)
├── frontend.md                   # Aturan pengembangan Frontend (React + Vite + shadcn)
├── database.md                   # Aturan database PostgreSQL & Drizzle ORM
├── api-rules.md                  # Standar REST API & OpenAPI
├── security.md                   # Keamanan RBAC, Audit Trail, & OWASP
├── data-protection.md            # Standar implementasi UU PDP No. 27/2022
├── identity-and-signature.md     # SSO OIDC/SAML2 & TTE BSrE
├── interoperability.md           # Satu Data Indonesia & SPLP
├── audit-integrity.md            # Audit trail append-only & HMAC
├── deployment-and-supply-chain.md # Deployment PDN/on-prem, SBOM, license
├── accessibility.md              # WCAG 2.1 AA untuk aplikasi pemerintah
├── ui-guidelines.md              # Panduan UI/UX Enterprise Government
├── workflow.md                   # Alur pengembangan fitur
├── definition-of-done.md         # Checklist kriteria kelayakan fitur (DoD)
├── agent-memory.md               # Catatan keputusan arsitektur jangka panjang
├── compliance-baseline.md        # Matriks regulasi & status kontrol
├── prompt-library.md             # Daftar perintah prompt AI yang tersedia
├── domain-kemenag-pesantren.md   # Spesifikasi domain Kemenag (contoh)
├── prompts/                      # Instruksi prompt AI siap pakai
└── templates/                    # Boilerplate & template kode produksi
```

---

## Urutan Pembacaan Konteks AI (Reading Order)

Sebelum AI Assistant menghasilkan atau memodifikasi kode, AI **WAJIB** membaca dokumen berikut secara berurutan (lihat `constitution.md` untuk daftar lengkap):

1. `project.md`
2. `compliance-baseline.md`
3. `tech-stack.md`
4. `architecture.md`
5. `folder-structure.md`
5. `coding-standards.md`
6. `backend.md`
7. `frontend.md`
8. `database.md`
9. `api-rules.md`
10. `security.md`
11. `data-protection.md`
12. `identity-and-signature.md`
13. `interoperability.md`
14. `audit-integrity.md`
15. `deployment-and-supply-chain.md`
16. `accessibility.md`
17. `ui-guidelines.md`
18. `workflow.md`
19. `definition-of-done.md`
20. `business-rules.md`
21. `domain-*.md` (jika ada)
22. `agent-memory.md`

---

## Cara Menggunakan Starter Kit

### 1. Inisialisasi Proyek (WAJIB)
Gunakan prompt siap pakai di `.ai/prompts/initialize-project.md` yang akan menghasilkan:
- `package.json`, `pnpm-workspace.yaml`, `turbo.json`
- `apps/web`, `apps/api`
- `packages/ui`, `packages/database`, `packages/config`, `packages/types`, `packages/identity`, `packages/audit`, `packages/interoperability`
- `infra/` (Docker Compose, Nginx config)
- `.env.example`, `LICENSE`, `.github/workflows/ci.yml`

Contoh eksekusi perintah ke AI:
> *"Tolong inisialisasi proyek monorepo menggunakan instruksi dari `.ai/prompts/initialize-project.md`."*

### 2. Pengembangan Fitur Baru
Gunakan prompt `.ai/prompts/create-feature.md` atau salin template dari `.ai/templates/feature.md`.

Contoh:
> *"Tolong buatkan fitur pengajuan surat keluar (outgoing-mail) menggunakan instruksi dari `.ai/prompts/create-feature.md`."*

### 3. Pembuatan API Endpoint
Gunakan prompt `.ai/prompts/create-api.md` dan template `.ai/templates/api.md`.

### 4. Pembuatan Halaman UI & Tabel Data
Gunakan `.ai/prompts/create-page.md`, `.ai/prompts/create-table.md`, dan template `.ai/templates/table.md`.

### 5. Audit Compliance & Security
Gunakan prompt:
- `.ai/prompts/pdp-review.md` (UU PDP)
- `.ai/prompts/compliance-review.md` (SPBE/BSSN/Satu Data)
- `.ai/prompts/accessibility-review.md` (WCAG 2.1 AA)
- `.ai/prompts/tte-integration.md` (TTE BSrE)
- `.ai/prompts/sso-integration.md` (OIDC/SAML2)

---

## Standar Wajib Aplikasi Pemerintah (Baseline Kontrol)

| Area | Persyaratan | Referensi |
|------|-------------|-----------|
| **Identitas** | NIP 18-digit (`^\d{18}$`), NIK 16-digit (`^\d{16}$`) | `business-rules.md` |
| **Audit Trail** | 6 kolom wajib: `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`, `deleted_by` + tabel `audit_logs` append-only + HMAC chain | `database.md`, `audit-integrity.md` |
| **Soft Delete** | `deleted_at` + `deleted_by`; tidak hard-delete tanpa purge workflow resmi | `business-rules.md`, `data-protection.md` |
| **RBAC** | Granular permission (`surat.read`, `surat.approve`), data scoping unit kerja | `security.md` |
| **SSO** | OIDC Authorization Code + PKCE / SAML2 resmi (INA Digital/IKD) | `identity-and-signature.md` |
| **TTE** | PSrE berlisensi BSSN (BSrE, Peruri, Privy); mock hanya untuk test | `identity-and-signature.md` |
| **Data Pribadi** | Masking NIK/NIP default, enkripsi, consent, data subject request, DPIA | `data-protection.md` |
| **Satu Data** | Metadata SDI, kode wilayah BPS/Kemendagri resmi, SPLP contract | `interoperability.md` |
| **Aksesibilitas** | WCAG 2.1 AA (kontras 4.5:1, keyboard, screen reader, table scope, aria-label) | `accessibility.md` |
| **Deployment** | Data warga di wilayah RI (PDN/on-prem), SBOM, license, secret scan | `deployment-and-supply-chain.md` |

---

## Disclaimer Hukum

Starter kit ini menyediakan **baseline kontrol teknis**. Kepatuhan hukum penuh (UU PDP, SPBE, PP 71/2019, UU ITE, BSSN, BPK) bergantung pada implementasi, konfigurasi, validasi DPO/Legal/auditor instansi, dan sertifikasi eksternal. Starter kit **tidak menyediakan** jaminan compliance otomatis, legal opinion, atau sertifikat auditor.

---

## Kontribusi & Eskalasi

- Gap compliance: Eskalasi ke DPO/Legal instansi.
- Keamanan: Laporkan ke CSIRT instansi.
- Keputusan arsitektur: Catat di `agent-memory.md`.

---

**Versi**: 2.0.0 (Baseline Kontrol Teknis)  
**Tanggal**: 2026-10-06