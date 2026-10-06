# AI Prompt: Create Executive Government Dashboard

## Context & Purpose
Gunakan prompt ini untuk membuat Halaman Eksekutif Dashboard e-Gov (Dashboard Pimpinan / Admin) yang menyajikan metrik statistik utama, grafik analitis, log aktivitas terbaru, serta akses cepat (*quick actions*).

---

## 🤖 AI Instructions

Saat membuat Dashboard Eksekutif Pemerintah, ikuti panduan berikut:

### Step 1: Susun Metrik Ringkasan Utama (KPI Summary Cards)
Sediakan 4 Top Stats Cards di bagian paling atas:
1. **Total Naskah Dinas / Pegawai** (dengan persentase kenaikan dibanding bulan lalu).
2. **Surat Perlu Disposisi / Menunggu Verifikasi** (Highlight warna Warning/Orange jika ada antrean).
3. **Surat Selesai / Terproses** (Highlight warna Success/Green).
4. **Insiden / Pengaduan Aktif** (Highlight warna Info/Blue).

Setiap Card wajib menyertakan Icon Lucide, Angka Utama (Large Font), Label, dan Trend Indicator.

### Step 2: Sediakan Visualisasi Grafik Analitis (Charts Section)
Gunakan Recharts / Chart Components yang dibungkus Card shadcn:
- **Bar Chart / Line Chart**: Tren Surat Masuk & Keluar per Bulan.
- **Pie Chart / Donut Chart**: Distribusi Kategori Naskah Dinas / Status Kepegawaian.

### Step 3: Area Log Aktivitas & Quick Actions
- **Recent Activities List**: Tabel/List ringkas 5 aktivitas transaksi atau disposisi terakhir lengkap dengan Timestamp dan Avatar Pengguna.
- **Quick Action Panel**: Tombol pintas untuk aksi yang paling sering dilakukan (contoh: "Buat Surat Masuk", "Disposisi Cepat", "Unduh Laporan Bulanan").

### Step 4: Integrasi Data Realtime / TanStack Query
Gunakan hook `useDashboardSummary()` dengan auto refetch interval atau revalidation jika diperlukan. Sediakan Skeleton loader untuk setiap Card dan Chart.

### Step 5: Aksesibilitas Dashboard (WCAG 2.1 AA)
- Setiap KPI Card menyertakan label deskriptif (bukan hanya angka dan warna).
- Grafik memiliki `aria-label` atau `<title>` dalam SVG menjelaskan data yang divisualisasikan.
- Trend indicator (naik/turun) tidak hanya mengandalkan warna — sertakan ikon atau teks (`↑ Naik 12%`).
- Bungkus seluruh Dashboard dalam `ErrorBoundary` dengan fallback yang informatif.
- Loading state menggunakan `Skeleton` dengan `aria-busy="true"`.
- Kontras minimal 4.5:1 untuk semua teks metrik dan label grafik.
