# Template: Enterprise TanStack Data Table Component

Boilerplate Komponen Data Table High-Performance menggunakan TanStack Table v8, shadcn/ui Table, Lucide Icons, Status Badges dengan Aksesibilitas WCAG 2.1 AA, dan Action Dropdown Menu dengan AlertDialog Konfirmasi Hapus.

---

```tsx
import React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@my-starter-kit-gov/ui/table';
import { Button } from '@my-starter-kit-gov/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@my-starter-kit-gov/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction
} from '@my-starter-kit-gov/ui/alert-dialog';
import { MoreHorizontal, ArrowUpDown, Eye, Edit, Trash2 } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export interface EmployeeData {
  id: string;
  nip: string;
  name: string;
  email: string;
  departmentName: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
}

interface EmployeeTableProps {
  data: EmployeeData[];
  onRefresh: () => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  data,
  onRefresh,
  onView,
  onEdit,
  onDelete
}) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns: ColumnDef<EmployeeData>[] = [
    {
      accessorKey: 'nip',
      header: 'NIP',
      cell: ({ row }) => (
        <span className="font-mono text-xs" aria-label={`NIP: ${row.getValue('nip')}`}>
          {row.getValue('nip')}
        </span>
      )
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="p-0 hover:bg-transparent"
          aria-label={`Urutkan berdasarkan Nama, saat ini ${column.getIsSorted() ? column.getIsSorted() : 'tidak diurutkan'}`}
        >
          Nama Lengkap
          <ArrowUpDown className="ml-2 h-4 w-4" aria-hidden="true" />
        </Button>
      ),
      cell: ({ row }) => <span className="font-medium">{row.getValue('name')}</span>
    },
    {
      accessorKey: 'email',
      header: 'Email'
    },
    {
      accessorKey: 'departmentName',
      header: 'Unit Kerja'
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.getValue('status')} />
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0" aria-label="Buka menu aksi">
                <span className="sr-only">Buka menu aksi</span>
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => onView(item.id)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4 text-blue-500" aria-hidden="true" />
                <span>Lihat Detail</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onEdit(item.id)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4 text-amber-500" aria-hidden="true" />
                <span>Edit Data</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {/* Aksi Hapus: Wajib AlertDialog Konfirmasi */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className="flex items-center gap-2 text-rose-600 focus:text-rose-600"
                    onClick={() => {}}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    <span>Hapus Data</span>
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Data Pegawai?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tindakan ini akan melakukan soft delete pada data pegawai <strong>{item.name}</strong> (NIP: {item.nip}).
                      Data dapat dipulihkan melalui workflow resmi. Lanjutkan?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(item.id)}
                    className="bg-rose-600 hover:bg-rose-700"
                  >
                    Ya, Hapus
                  </AlertDialogAction>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    }
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: { sorting }
  });

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} scope="col">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  Tidak ada data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-2" role="navigation" aria-label="Pagination">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          aria-label="Halaman sebelumnya"
        >
          Sebelumnya
        </Button>
        <span className="text-sm text-muted-foreground" aria-live="polite">
          Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          aria-label="Halaman selanjutnya"
        >
          Selanjutnya
        </Button>
      </div>
    </div>
  );
};
```

---

## Catatan Aksesibilitas (WCAG 2.1 AA) Wajib

1. **Header Tabel**: `<TableHead scope="col">` pada setiap kolom.
2. **Icon-Only Button (Dropdown Trigger)**: `aria-label="Buka menu aksi"` + `<span className="sr-only">Buka menu aksi</span>` di dalam button.
3. **Status Badge**: Bukan hanya warna. Harus menyertakan teks (label) & ikon sebagai alternative.
4. **Aksi Hapus (Destructive)**: Wajib `AlertDialog` dengan `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogCancel`, `AlertDialogAction`.
5. **Pagination**: `aria-label` pada navigasi, `aria-live="polite"` pada indikator halaman.
6. **Keyboard Navigation**: Semua interaksi bisa diakses Tab/Enter/Space. Fokus terlihat (outline ring 3:1 contrast).
7. **Sorting Button**: `aria-label` menjelaskan status sortir saat ini.