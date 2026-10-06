# AI Prompt: Optimize Performance

## Context & Purpose
Gunakan prompt ini untuk menganalisis dan meningkatkan performa aplikasi pada lapisan database (Drizzle ORM query), backend server (Hono response speed), maupun frontend UI rendering (React re-render & asset loading).

---

## 🤖 AI Instructions

Saat mengeksekusi optimasi performa, ikuti panduan berikut:

### 1. Database & ORM Optimization
- **Hindari `SELECT *`**: Pilih hanya kolom yang dibutuhkan (`db.select({ id: table.id, name: table.name })`).
- **Eliminasi N+1 Queries**: Gunakan Drizzle Relational Queries (`with: { department: true }`) atau JOIN eksplisit alih-alih melakukan query per loop.
- **Tambahkan Indexing**: Identifikasi kolom filter/foreign key yang belum di-index (`index('idx_employee_nip').on(table.nip)`).
- **Implementasikan Server-Side Pagination**: Pastikan endpoint list selalu menggunakan `limit` dan `offset`.

### 2. Frontend React Optimization
- **Pencegahan Re-render**: Gunakan `useMemo` dan `useCallback` pada perhitungan berat atau callback prop yang diteruskan ke komponen anak.
- **TanStack Query Caching**: Konfigurasikan `staleTime` dan `gcTime` yang tepat untuk menghindari refetch berulang yang tidak perlu.
- **Code Splitting & Lazy Loading**: Terapkan `React.lazy()` dan `Suspense` pada halaman-halaman route utama.
- **Debounce Search Input**: Gunakan debounce pada input pencarian teks.

### 3. Output Analysis & Benchmark Report
Tulis laporan perbandingan sebelum & sesudah optimasi (contoh: Jumlah query berkurang dari 50 ke 2 query, waktu render turun dari 450ms ke 60ms).
