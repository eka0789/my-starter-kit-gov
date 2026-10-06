# Template: React Reusable UI Component

Boilerplate komponen React reusable menggunakan Tailwind CSS, shadcn/ui primitives, dan Lucide Icons, dengan Aksesibilitas WCAG 2.1 AA (Status Badge tidak hanya warna — harus ada teks & ikon).

---

```tsx
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { ShieldAlert, CheckCircle2, Clock, FileEdit } from 'lucide-react';

// ============================================================================
// StatusBadge — Status wajib disampaikan dengan TEKS + IKON (bukan warna saja)
// Memenuhi WCAG 2.1 AA 1.4.1 (Use of Color)
// ============================================================================
const statusBadgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      status: {
        draft: 'bg-muted text-muted-foreground hover:bg-muted/80',
        pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
        approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
        rejected: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
      },
    },
    defaultVariants: {
      status: 'draft',
    },
  }
);

// Peta status ke label Indonesia & ikon
const STATUS_MAP: Record<string, { label: string; icon: React.FC<{ className?: string }> }> = {
  draft: { label: 'Draft', icon: FileEdit },
  pending: { label: 'Menunggu', icon: Clock },
  approved: { label: 'Disetujui', icon: CheckCircle2 },
  rejected: { label: 'Ditolak', icon: ShieldAlert },
};

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  label?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  className,
  status,
  label,
  ...props
}) => {
  const config = STATUS_MAP[status] ?? STATUS_MAP.draft;
  const Icon = config.icon;
  const displayLabel = label ?? config.label;

  return (
    <div
      className={cn(statusBadgeVariants({ status }), className)}
      role="status"
      aria-label={`Status: ${displayLabel}`}
      {...props}
    >
      {/* Ikon: aria-hidden karena label teks sudah ada */}
      <Icon className="h-3 w-3" aria-hidden="true" />
      {/* Teks wajib ada (bukan hanya warna) */}
      <span>{displayLabel}</span>
    </div>
  );
};
```

---

## Panduan Penggunaan

```tsx
// Penggunaan di kolom tabel
cell: ({ row }) => <StatusBadge status={row.getValue('status')} />

// Dengan label custom
<StatusBadge status="approved" label="SK Diterbitkan" />

// Dengan label ekstra tersembunyi untuk konteks (screen reader)
<StatusBadge status="pending" label="Menunggu Verifikasi" aria-label="Status pengajuan: Menunggu Verifikasi" />
```

---

## Catatan Aksesibilitas Wajib

1. **Status bukan hanya warna**: Wajib menyertakan teks + ikon. Pengguna buta warna tidak bisa membedakan hanya dari warna.
2. **`role="status"`**: Memberikan konteks semantik pada screen reader.
3. **Ikon dekoratif**: `aria-hidden="true"` mencegah screen reader membaca nama ikon yang tidak informatif.
4. **Kontras minimum**: Setiap varian status harus memenuhi kontras 4.5:1 (normal text) antara warna teks dan latar belakang badge.
