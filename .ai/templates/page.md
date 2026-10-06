# Template: Enterprise React Page Component

Template halaman React enterprise lengkap dengan **ErrorBoundary**, 6 State UI Wajib (Loading/Skeleton, Error, Empty, Data View, Responsive, Dark Mode), Header, Breadcrumb, Search Bar, Filter, Button Tambah, dan Aksesibilitas WCAG 2.1 AA.

---

```tsx
import React, { useState } from 'react';
import { Plus, Search, RefreshCw, AlertCircle, Inbox } from 'lucide-react';
import { Button } from '@my-starter-kit-gov/ui/button';
import { Input } from '@my-starter-kit-gov/ui/input';
import { Card, CardContent } from '@my-starter-kit-gov/ui/card';
import { Skeleton } from '@my-starter-kit-gov/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@my-starter-kit-gov/ui/alert';
import { ErrorBoundary } from '@my-starter-kit-gov/ui/error-boundary';
import { useEmployeeList, useDeleteEmployee } from '../hooks/use-employee';
import { EmployeeTable } from '../components/EmployeeTable';
import { EmployeeFormModal } from '../components/EmployeeFormModal';

// ============================================================================
// 1. Error Fallback Component
// ============================================================================
const PageErrorFallback: React.FC<{ error?: Error; resetErrorBoundary?: () => void }> = ({
  error,
  resetErrorBoundary
}) => (
  <div className="p-6 space-y-4" role="alert">
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" aria-hidden="true" />
      <AlertTitle>Terjadi Kesalahan Halaman</AlertTitle>
      <AlertDescription className="mt-2 flex flex-col gap-2">
        <p>{error?.message || 'Halaman tidak dapat dimuat karena terjadi kesalahan teknis.'}</p>
        {resetErrorBoundary && (
          <Button variant="outline" size="sm" onClick={resetErrorBoundary} className="self-start">
            Muat Ulang Halaman
          </Button>
        )}
      </AlertDescription>
    </Alert>
  </div>
);

// ============================================================================
// 2. Main Page Content Component
// ============================================================================
const EmployeePageContent: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useEmployeeList({
    page,
    pageSize: 10,
    q: search
  });

  const deleteMutation = useDeleteEmployee();

  const handleEdit = (id: string) => {
    setEditId(id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      refetch();
    } catch (err) {
      console.error('Failed to delete employee:', err);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* 1. Page Header & Breadcrumb */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <nav className="text-xs text-muted-foreground mb-1" aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 list-none p-0 m-0">
              <li><span>Beranda</span></li>
              <li aria-hidden="true">&gt;</li>
              <li><span>Kepegawaian</span></li>
              <li aria-hidden="true">&gt;</li>
              <li aria-current="page"><span className="text-foreground font-medium">Daftar Pegawai</span></li>
            </ol>
          </nav>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Daftar Pegawai (SIMPEG)</h1>
          <p className="text-sm text-muted-foreground">Kelola master data pegawai ASN dan Non-ASN instansi.</p>
        </div>

        <Button onClick={() => { setEditId(null); setIsModalOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Tambah Pegawai</span>
        </Button>
      </div>

      {/* 2. Search & Filter Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-80">
            <label htmlFor="search-employee" className="sr-only">Cari NIP atau Nama Pegawai</label>
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="search-employee"
              placeholder="Cari NIP atau Nama Pegawai..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Button variant="outline" onClick={() => refetch()} className="gap-2 w-full md:w-auto" aria-label="Segarkan data pegawai">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            <span>Segarkan</span>
          </Button>
        </CardContent>
      </Card>

      {/* 3. 6 State UI Handlers */}
      {/* State 1: Loading (Skeleton) */}
      {isLoading ? (
        <Card className="p-6 space-y-4" aria-busy="true" aria-label="Memuat data pegawai">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </Card>
      ) : /* State 2: Error */
      isError ? (
        <Alert variant="destructive" role="alert">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>Gagal Memuat Data</AlertTitle>
          <AlertDescription className="mt-2 flex flex-col sm:flex-row sm:items-center gap-4">
            <span>{error?.message || 'Terjadi kesalahan saat menghubungi server.'}</span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>Coba Lagi</Button>
          </AlertDescription>
        </Alert>
      ) : /* State 3: Empty State */
      !data || data.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center">
          <Inbox className="h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Belum Ada Data Pegawai</h2>
          <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
            Tidak ada pegawai yang sesuai dengan kriteria pencarian. Tambahkan pegawai baru untuk memulai.
          </p>
          <Button onClick={() => { setEditId(null); setIsModalOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Tambah Pegawai Pertama</span>
          </Button>
        </Card>
      ) : (
        /* State 4: Data View */
        <EmployeeTable
          data={data}
          onRefresh={refetch}
          onView={(id) => console.log('View detail:', id)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* 4. Form Modal */}
      <EmployeeFormModal
        isOpen={isModalOpen}
        employeeId={editId}
        onClose={() => { setIsModalOpen(false); setEditId(null); }}
        onSuccess={() => {
          setIsModalOpen(false);
          setEditId(null);
          refetch();
        }}
      />
    </div>
  );
};

// ============================================================================
// 3. Export Wrapped with ErrorBoundary (WAJIB PER HALAMAN)
// ============================================================================
export const EmployeePage: React.FC = () => (
  <ErrorBoundary fallback={<PageErrorFallback />}>
    <EmployeePageContent />
  </ErrorBoundary>
);
```

---

## Standar Kepatuhan Wajib

1. **ErrorBoundary**: Setiap berkas `*Page.tsx` WAJIB diekspor terbungkus `<ErrorBoundary>`. Komponen anak yang error tidak boleh membuat seluruh layar putih (*blank screen*).
2. **6 State UI**:
   - Loading: Skeleton loader (bukan spinner polos).
   - Error: Alert deskriptif + tombol "Coba Lagi" + `role="alert"`.
   - Empty: Pesan ramah + CTA action yang jelas.
   - Data View: Tabel/card responsif dengan sorting dan filter.
   - Responsive: Flex-col pada layar mobile (`md:flex-row`).
   - Dark Mode: Menggunakan semantic token (`text-foreground`, `bg-card`, dll.).
3. **Aksesibilitas**:
   - Breadcrumb menggunakan semantic `<nav>` + `<ol>` + `aria-current="page"`.
   - Input pencarian menggunakan `<label htmlFor="..." className="sr-only">`.
   - Semua ikon dekoratif menyertakan `aria-hidden="true"`.
   - Tombol ikon menyertakan teks tersembunyi untuk screen reader atau `aria-label`.
