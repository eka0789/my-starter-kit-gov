# AI Prompt: Create Business Domain Module

## Context & Purpose
Gunakan prompt ini untuk membuat Modul Bisnis Domain baru (contoh: Modul Naskah Dinas/Surat, Modul Kepegawaian/SIMPEG, Modul E-Kinerja, Modul Pengaduan). Modul mengelompokkan beberapa fitur bisnis terkait dalam satu domain otonom.

---

## 🤖 AI Instructions

Ketika diminta membuat modul bisnis domain baru:

### Step 1: Pahami Domain Bisnis Pemerintah
- Minta atau analisis nama domain (contoh: `correspondence` untuk Naskah Dinas, `employee` untuk SIMPEG).
- Identifikasi peran (RBAC) yang berkepentingan (contoh: Operator Surat, Verifikator, Pimpinan).

### Step 2: Buat Struktur Folder Backend Modul
Di `apps/api/src/features/[module_name]/`:
1. Buat folder untuk sub-fitur utama (contoh: `incoming-mail`, `outgoing-mail`).
2. Setiap sub-fitur harus memuat: `routes.ts`, `schema.ts`, `service.ts`, `types.ts`.
3. Buat `index.ts` untuk mendaftarkan seluruh route sub-fitur ke router utama modul.

### Step 3: Buat Struktur Folder Frontend Modul
Di `apps/web/src/features/[module_name]/`:
1. Buat subfolder per fitur dengan struktur: `components/`, `pages/`, `hooks/`, `schemas/`, `services/`.
2. Sediakan halaman index utama modul dengan tab/navigation bar jika memuat beberapa sub-fitur.

### Step 4: Daftarkan Ke Router Aplikasi Utama
- Daftarkan route backend modul ke `apps/api/src/router.ts`.
- Daftarkan route frontend ke `apps/web/src/routes/app-router.tsx`.
- Tambahkan item menu modul ke Sidebar Navigation dengan Lucide Icon yang relevan.

### Step 5: Dokumentasi Modul
Buat berkas `README.md` di dalam direktori modul yang menjelaskan:
- Tujuan Modul.
- Daftar Peran/Permission (RBAC) yang dibutuhkan.
- Skema Database & Tabel terkait (termasuk 6 kolom audit wajib).
- Alur kerja bisnis (workflow).
- Status DPIA (Data Protection Impact Assessment) jika modul memproses data pribadi.
- Daftar PSrE/TTE yang digunakan (jika ada naskah dinas/dokumen bertanda tangan).

### Step 6: Pemenuhan Regulasi Wajib Modul
- Setiap tabel di modul wajib 6 kolom audit: `created_at`, `updated_at`, `deleted_at`, `created_by` NOT NULL, `updated_by` NOT NULL, `deleted_by` nullable.
- Gunakan helper `auditColumns` dari `packages/database`.
- Query backend wajib parameterized (Drizzle ORM) — DILARANG string interpolation SQL.
- Jika modul mengolah data PII (NIK/NIP/nama lengkap), lakukan masking di layer API berdasarkan permission pengguna.
- Komponen UI wajib memenuhi 6 state (Loading/Error/Empty/Data/Responsive/DarkMode) dan WCAG 2.1 AA.
- Jika modul naskah dinas: integrasi TTE wajib PSrE berlisensi (BSrE/Peruri/Privy), bukan mock.
