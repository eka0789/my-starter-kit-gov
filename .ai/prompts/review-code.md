# AI Prompt: Code Review & Security Audit

## Context & Purpose
Gunakan prompt ini untuk melakukan peninjauan kode (code review) dan audit keamanan terhadap file atau modul tertentu sebelum dimasukkan ke dalam branch utama atau lingkungan produksi.

---

## 🤖 AI Instructions

Saat mengeksekusi peninjauan kode, lakukan pemeriksaan menyeluruh berdasarkan 6 dimensi berikut:

### 1. Keamanan & Standar OWASP / BSSN
- Apakah ada potensi SQL Injection? (Harus menggunakan Drizzle ORM parameterized query).
- Apakah ada kredensial/secret key yang di-hardcode dalam kode?
- Apakah endpoint private dilindungi middleware Autentikasi & RBAC?
- Apakah input data divalidasi ketat dengan Zod di sisi server?

### 2. Kepatuhan Aturan Bisnis Pemerintah & Regulasi
- Apakah tabel bisnis memiliki **6 kolom audit** (`created_at`, `updated_at`, `deleted_at`, `created_by` NOT NULL, `updated_by` NOT NULL, `deleted_by` nullable)?
- Apakah fitur menggunakan **Soft Delete** alih-alih `DELETE` permanen?
- Apakah NIK divalidasi 16 digit angka? NIP 18 digit angka?
- Apakah data pribadi spesifik (NIK/NIP/nama lengkap) di-mask di response API berdasarkan permission?
- Apakah mutasi mencatat audit log dalam transaksi yang sama (fail-closed)?
- Apakah query database menggunakan parameterized query (DILARANG interpolasi string SQL)?
- Apakah form/endpoint consent mencatat consent datetime dan IP address untuk UU PDP?

### 3. Kualitas Kode & Type Safety
- Apakah ada penggunaan `any` atau `// @ts-ignore`? (Wajib dihapus/diperbaiki).
- Apakah ada kode mati, unused imports, atau komentar `TODO`?
- Apakah panjang fungsi di bawah 50 baris dan komponen UI di bawah 300 baris?

### 4. Performa & Query Efficiency
- Apakah ada masalah N+1 Query pada database?
- Apakah pencarian besar menggunakan paginasi?

### 5. Format Respons & Error Handling
- Apakah REST API mengembalikan format JSON standar (`success`, `message`, `data`, `meta`)?
- Apakah error handling mencegah ekspos stack trace internal ke pengguna client?
- Apakah metadata Satu Data Indonesia (`dataOwner`, `dataClassification`) disertakan di response list?

### 6. Aksesibilitas WCAG 2.1 AA
- Apakah halaman dibungkus `ErrorBoundary`?
- Apakah 6 state UI lengkap (Loading / Error / Empty / Data / Responsive / DarkMode)?
- Apakah tombol ikon-only memiliki `aria-label`?
- Apakah header tabel memiliki `scope="col"`?
- Apakah status badge tidak hanya mengandalkan warna (ada teks/ikon)?
- Apakah aksi hapus memicu `AlertDialog` konfirmasi?
- Apakah label form terhubung via `htmlFor`/`id` dan error memakai `aria-invalid` + `aria-describedby`?
- Apakah kontras teks minimal 4.5:1?

---

## 📊 Format Output Laporan Audit

Hasilkan laporan review dengan format berikut:
1. **Ringkasan Skor Kualitas**: (Skor 1-10 & Status PASSED/FAILED).
2. **Temuan Kritis (Critical Issues)**: Masalah keamanan/bug yang wajib diperbaiki segera.
3. **Temuan Sedang (Warnings)**: Pelanggaran coding standards / type safety.
4. **Rekomendasi Perbaikan (Refactoring Code)**: Kode hasil perbaikan siap pakai.
