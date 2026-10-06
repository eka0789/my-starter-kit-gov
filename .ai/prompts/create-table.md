# AI Prompt: Create Enterprise Data Table

## Context & Purpose
Gunakan prompt ini untuk membuat Komponen Data Table High-Performance menggunakan TanStack Table v8, shadcn/ui Table primitives, Lucide Icons, serta mendukung fitur pencarian, filter, pengurutan (sorting), paginasi, dan aksi menu per baris.

---

## 🤖 AI Instructions

Saat membuat Data Table enterprise, AI **WAJIB** menyertakan fitur-fitur berikut:

### Step 1: Fitur Wajib Komponen Tabel
1. **Searching / Debounced Filter Input**: Input teks pencarian global dengan penundaan (*debounce 300ms*) agar tidak membebani server API.
2. **Column Sorting**: Tombol pengurutan asc/desc pada header kolom utama (contoh: Tanggal, Nama, NIP).
3. **Status Badges**: Format visual khusus untuk kolom status (contoh: `DRAFT` = Gray, `PENDING` = Amber, `APPROVED` = Green, `REJECTED` = Red).
4. **Row Selection (Checkbox)**: Opsi centang baris untuk aksi masal (*bulk actions*) seperti Hapus Masal atau Cetak Masal.
5. **Row Actions Menu**: Dropdown menu pada setiap baris (`DropdownMenu` shadcn) yang berisi:
   - 👁️ `Lihat Detail`
   - ✏️ `Edit Data`
   - 🗑️ `Hapus Data` (Soft Delete dengan dialog konfirmasi)
6. **Server-Side Pagination Controls**:
   - Info total data dan halaman aktif.
   - Select option `Rows per page` (10, 25, 50, 100).
   - Tombol Navigasi `First`, `Previous`, `Next`, `Last`.

### Step 2: Dukungan State UI (WCAG 2.1 AA)
- **Loading State**: Render `Skeleton` baris tabel sebanyak 5-10 baris saat data sedang dimuat. Tambahkan `aria-busy="true"` pada tabel.
- **Error State**: Render baris khusus dengan pesan error + tombol `Retry` jika fetch gagal (`isError`). Gunakan `role="alert"`.
- **Empty State**: Render baris khusus yang menampilkan pesan "Tidak ada data yang ditemukan" jika array data kosong. Tambahkan ilustrasi + tombol aksi "Buat Data Pertama".
- **Responsive View**: Gunakan scroll horizontal `overflow-x-auto` pada mobile; header tabel tetap visible.
- **Dark Mode**: Gunakan `bg-background text-foreground border-border` Tailwind untuk semua elemen tabel.

### Step 3: Aksesibilitas Wajib (WCAG 2.1 AA)
- **Header tabel**: Setiap `<th>` wajib `scope="col"`.
- **Tombol aksi ikon-only**: Wajib `aria-label` deskriptif (contoh: `aria-label="Edit data Budi Santoso"`).
- **Status badge**: Tidak hanya warna — sertakan teks/ikon (`<span className="sr-only">Status: Disetujui</span>`).
- **Aksi Hapus**: Wajib memicu `AlertDialog` konfirmasi sebelum soft-delete.
- **Pagination**: Gunakan `aria-live="polite"` pada info halaman.
- **Kontras**: Minimal 4.5:1 untuk teks, 3:1 untuk UI components.

### Step 4: Audit Trail & Regulasi
- Tabel backend **harus** memiliki 6 kolom audit: `created_at`, `updated_at`, `deleted_at`, `created_by` NOT NULL, `updated_by` NOT NULL, `deleted_by` nullable.
- Gunakan helper `auditColumns` dari `packages/database` untuk konsistensi.
- Query pencarian **harus** parameterized (Drizzle `ilike()`, `eq()`, `and()`) — DILARANG interpolasi string SQL.
- Sanitasi input pencarian (`%`, `_`, `\` di-escape) sebelum dipakai di `ilike()`.

### Step 5: Implementasi Kode Complete
Tulis komponen `.tsx` reusable yang menerima props data, pagination, dan handler callback secara eksplisit dan type-safe. Impor `StatusBadge`, `AlertDialog` dari shadcn/ui.
