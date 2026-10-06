# AI Prompt Library

Kumpulan perintah prompt AI terstruktur yang tersedia di direktori `.ai/prompts/` untuk mempercepat pembuatan, pemeliharaan, dan audit kepatuhan aplikasi pemerintah enterprise.

---

## 📚 Perintah Prompt Terdaftar

### 1. Inisialisasi & Modul Arsitektur
| Perintah Prompt | Berkas Panduan | Tujuan Utama |
| :--- | :--- | :--- |
| `Inisialisasi Proyek` | `.ai/prompts/initialize-project.md` | Membuat struktur monorepo Turborepo + Hono + React Vite dari awal |
| `Buat Modul Domain` | `.ai/prompts/create-module.md` | Menginisialisasi modul bisnis domain baru (contoh: Naskah Dinas, Kepegawaian) |
| `Buat Fitur Vertical Slice` | `.ai/prompts/create-feature.md` | Membangun fitur end-to-end (Database ➔ Zod ➔ API ➔ UI Component) |

### 2. Backend & Database
| Perintah Prompt | Berkas Panduan | Tujuan Utama |
| :--- | :--- | :--- |
| `Buat REST API` | `.ai/prompts/create-api.md` | Membuat API endpoint Hono + Zod + Drizzle ORM + OpenAPI + SDI meta |
| `Buat Tabel & Migrasi` | `.ai/prompts/create-table.md` | Membuat tabel Drizzle dengan 6 kolom audit, indeks, RLS, & audit_logs |

### 3. Frontend & UI
| Perintah Prompt | Berkas Panduan | Tujuan Utama |
| :--- | :--- | :--- |
| `Buat Halaman UI` | `.ai/prompts/create-page.md` | Membuat halaman React enterprise dengan 6 State, ErrorBoundary, Breadcrumb |
| `Buat Dashboard` | `.ai/prompts/create-dashboard.md` | Membuat eksekutif dashboard e-Gov dengan Ringkasan Card, Chart, & Aksesibilitas |
| `Buat Data Table` | `.ai/prompts/create-table.md` | Membuat tabel data TanStack + shadcn dengan search, pagination, filter, WCAG AA |
| `Buat Form Complex` | `.ai/prompts/create-form.md` | Membuat form kompleks React Hook Form + Zod dengan validasi instan & mask |

### 4. Kualitas, Keamanan & Pemeliharaan
| Perintah Prompt | Berkas Panduan | Tujuan Utama |
| :--- | :--- | :--- |
| `Review Kode / Audit` | `.ai/prompts/review-code.md` | Mengaudit kualitas kode terhadap standar OWASP, BSSN, & Type-safety |
| `Refactor Kode` | `.ai/prompts/refactor.md` | Merapikan kode legacy menjadi arsitektur Feature-First Clean Code |
| `Optimasi Performa` | `.ai/prompts/optimize.md` | Mengoptimalkan query database Drizzle & rendering React |
| `Debug & Fix Bug` | `.ai/prompts/debug.md` | Menganalisis dan mengoreksi masalah/bug sistematis hingga tuntas |

### 5. Kepatuhan Regulasi & Integrasi Nasional (Baru)
| Perintah Prompt | Berkas Panduan | Tujuan Utama |
| :--- | :--- | :--- |
| `Audit Kepatuhan UU PDP` | `.ai/prompts/pdp-review.md` | Audit kepatuhan UU PDP 27/2022 pada fitur: consent, hak subjek, masking NIK/NIP |
| `Audit Kepatuhan SPBE & BSSN` | `.ai/prompts/compliance-review.md` | Evaluasi kepatuhan SPBE Perpres 95/2018, BSSN baseline, PP 71/2019, Satu Data |
| `Audit Aksesibilitas WCAG 2.1 AA` | `.ai/prompts/accessibility-review.md` | Memeriksa kepatuhan aksesibilitas web Permen Kominfo 8/2019 & WCAG 2.1 AA |
| `Integrasi TTE Resmi PSrE` | `.ai/prompts/tte-integration.md` | Panduan integrasi TTE tersertifikasi (BSrE, Peruri, Privy) tanpa mock di production |
| `Integrasi SSO Nasional / INA Digital` | `.ai/prompts/sso-integration.md` | Panduan integrasi SSO OIDC PKCE / SAML2 untuk portal pemerintah |

---

## 💡 Cara Menggunakan Prompt

Berikan instruksi kepada AI Assistant dengan mereferensikan berkas prompt terkait.
Contoh:
> *"Tolong buatkan REST API pengelolaan data pegawai berdasarkan panduan `.ai/prompts/create-api.md`."*
> *"Tolong audit modul kepegawaian terhadap kepatuhan UU PDP menggunakan `.ai/prompts/pdp-review.md`."*