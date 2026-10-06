# AI Prompt: Create Enterprise React Page

## Context & Purpose
Gunakan prompt ini untuk membuat Halaman Utama (Page Component) React enterprise yang konsisten, berstruktur jelas, ramah pengguna, responsif, dan mendukung mode gelap.

---

## 🤖 AI Instructions

Setiap Halaman UI enterprise yang dihasilkan WAJIB mengikuti tata letak standar berikut:

### Step 1: Struktur Tata Letak (Page Layout Hierarchy)
Setiap halaman wajib memuat 5 bagian utama:

1. **Header Halaman (Page Header & Breadcrumb)**:
   - Component `Breadcrumb` yang menunjukkan lokasi hirarki (contoh: `Beranda > Naskah Dinas > Surat Masuk`).
   - `Page Title` (Heading 1) yang jelas.
   - `Page Description` ringkas mengenai fungsi halaman.
   - `Primary Action Button` (contoh: `+ Buat Surat Baru`).

2. **Bilah Filter & Pencarian (Filter Bar)**:
   - Input Search (dengan icon `Search`).
   - Select Filter Status, Filter Tanggal, atau Filter Unit Kerja.
   - Tombol Reset Filter.

3. **Area Konten Utama (Main Content Area)**:
   - Komponen Data Table / Grid Card / Dashboard Cards.

4. **Pagination Controls**:
   - Informasi jumlah total data (contoh: `Menampilkan 1-10 dari 150 data`).
   - Control Tombol `Previous`, `Next`, dan Pemilih Halaman.

### Step 2: Penanganan 6 State UI Wajib (WCAG 2.1 AA)
1. ⏳ **Loading State**: Render Skeleton Loader (`<Skeleton className="h-12 w-full" />`) saat `isLoading === true`. Tambahkan `aria-busy="true"`.
2. ❌ **Error State**: Render komponen Alert Error dengan tombol `Retry` jika `isError === true`. Gunakan `role="alert"` dan bungkus halaman dengan `ErrorBoundary`.
3. 📭 **Empty State**: Render Ilustrasi/Icon kosong, judul "Belum ada data", deskripsi penjelas, dan tombol aksi "Buat Data Pertama".
4. 📊 **Data View**: Render tampilan data (tabel atau grid card) saat data berhasil dimuat.
5. 📱 **Responsive View**: Gunakan grid/flex Tailwind (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`) agar fleksibel dari HP hingga Layar Lebar.
6. 🌙 **Dark Mode**: Gunakan utility Tailwind `bg-background text-foreground border-border dark:...`.

### Step 3: Aksesibilitas Halaman (WCAG 2.1 AA)
- Bungkus seluruh halaman dalam `ErrorBoundary` (`<ErrorBoundary FallbackComponent={PageErrorFallback}>`).
- `Breadcrumb` menggunakan elemen semantik: `<nav aria-label="Breadcrumb">` dan `<ol>`.
- Item breadcrumb aktif diberi `aria-current="page"`.
- Input pencarian memiliki label terasosiasi (`htmlFor="page-search"` atau `sr-only`).
- Semua icon dekoratif diberi `aria-hidden="true"`.
- Heading hierarchy teratur: hanya satu `<h1>` per halaman, section menggunakan `<h2>`/`<h3>`.
- Kontras warna teks dan elemen interaktif memenuhi minimal 4.5:1.

### Step 4: Implementasi Kode React Production Ready
Tulis berkas `.tsx` lengkap dengan import Lucide Icons, komponen shadcn, ErrorBoundary, dan TanStack Query Hook. Impor template dari `.ai/templates/page.md`.
