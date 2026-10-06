# Template: React Hook Form + Zod Form Component

Boilerplate Komponen Modal Form menggunakan React Hook Form, Zod validation resolver, shadcn/ui Form primitives, Toast feedback, NIK/NIP Input Mask Helper, dan Aksesibilitas WCAG 2.1 AA.

---

```tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@my-starter-kit-gov/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@my-starter-kit-gov/ui/form';
import { Input } from '@my-starter-kit-gov/ui/input';
import { Button } from '@my-starter-kit-gov/ui/button';
import { Loader2 } from 'lucide-react';
import { useCreateEmployee, useUpdateEmployee } from '../hooks/use-employee';
import { maskNipInput } from '@my-starter-kit-gov/utils';

// ============================================================================
// 1. Zod Validation Schema
// ============================================================================
const formSchema = z.object({
  nip: z.string()
    .length(18, 'NIP harus persis 18 digit angka')
    .regex(/^\d{18}$/, 'NIP hanya boleh berisi angka'),
  name: z.string()
    .min(3, 'Nama minimal 3 karakter')
    .max(255, 'Nama maksimal 255 karakter'),
  email: z.string()
    .email('Format email tidak valid')
    .max(255, 'Email maksimal 255 karakter'),
  department_id: z.string()
    .min(1, 'Pilih unit kerja')
    .uuid('ID unit kerja tidak valid')
});

type FormValues = z.infer<typeof formSchema>;

// ============================================================================
// 2. Props Interface
// ============================================================================
interface EmployeeFormModalProps {
  isOpen: boolean;
  employeeId?: string | null; // null = create, string = edit
  onClose: () => void;
  onSuccess: () => void;
}

// ============================================================================
// 3. Form Modal Component
// ============================================================================
export const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
  isOpen,
  employeeId,
  onClose,
  onSuccess
}) => {
  const isEditMode = Boolean(employeeId);
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nip: '',
      name: '',
      email: '',
      department_id: ''
    }
  });

  // Saat edit mode, panggil query detail fitur dan reset form dengan data existing sebelum render.

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEditMode && employeeId) {
        await updateMutation.mutateAsync({ id: employeeId, ...values });
      } else {
        await createMutation.mutateAsync(values);
      }
      form.reset();
      onSuccess();
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]" aria-describedby="form-description">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Data Pegawai' : 'Tambah Data Pegawai'}</DialogTitle>
          <DialogDescription id="form-description">
            {isEditMode
              ? 'Perbarui informasi pegawai ASN/Non-ASN yang terdaftar.'
              : 'Isikan formulir di bawah ini untuk menambahkan data pegawai ASN/Non-ASN baru.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* NIP Field (18 digit) dengan Input Mask */}
            <FormField
              control={form.control}
              name="nip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="nip">
                    NIP (18 Digit) <span className="text-rose-500" aria-label="wajib diisi">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="nip"
                      placeholder="199001012015011001"
                      maxLength={18}
                      {...field}
                      onChange={(e) => {
                        const masked = maskNipInput(e.target.value);
                        field.onChange(masked);
                      }}
                      aria-invalid={!!form.formState.errors.nip}
                      aria-describedby={form.formState.errors.nip ? 'nip-error' : 'nip-description'}
                    />
                  </FormControl>
                  <FormDescription id="nip-description">
                    Format NIP tanpa spasi, contoh: 199001012015011001
                  </FormDescription>
                  <FormMessage id="nip-error" />
                </FormItem>
              )}
            />

            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="name">
                    Nama Lengkap <span className="text-rose-500" aria-label="wajib diisi">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="name"
                      placeholder="Nama Pegawai beserta Gelar"
                      {...field}
                      aria-invalid={!!form.formState.errors.name}
                      aria-describedby={form.formState.errors.name ? 'name-error' : undefined}
                    />
                  </FormControl>
                  <FormMessage id="name-error" />
                </FormItem>
              )}
            />

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="email">
                    Email Instansi <span className="text-rose-500" aria-label="wajib diisi">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="email"
                      type="email"
                      placeholder="pegawai@instansi.go.id"
                      {...field}
                      aria-invalid={!!form.formState.errors.email}
                      aria-describedby={form.formState.errors.email ? 'email-error' : undefined}
                    />
                  </FormControl>
                  <FormMessage id="email-error" />
                </FormItem>
              )}
            />

            {/* Department Select (placeholder, butuh integrasi dropdown/combobox) */}
            <FormField
              control={form.control}
              name="department_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="department_id">
                    Unit Kerja <span className="text-rose-500" aria-label="wajib diisi">*</span>
                  </FormLabel>
                  <FormControl>
                    {/* Ganti Input ini dengan Combobox/Select shadcn yang terhubung ke API departments. */}
                    <Input
                      id="department_id"
                      placeholder="UUID Unit Kerja"
                      {...field}
                      aria-invalid={!!form.formState.errors.department_id}
                      aria-describedby={form.formState.errors.department_id ? 'department-error' : undefined}
                    />
                  </FormControl>
                  <FormMessage id="department-error" />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                {isEditMode ? 'Perbarui Pegawai' : 'Simpan Pegawai'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
```

---

## Utility: NIK/NIP Input Mask Helper

Tambahkan di `packages/utils/src/mask.ts`:

```typescript
/**
 * Mask NIP input — hanya izinkan angka, batas 18 digit.
 */
export function maskNipInput(value: string): string {
  // Hanya izinkan angka
  const digits = value.replace(/\D/g, '');
  // Batas 18 karakter
  return digits.slice(0, 18);
}

/**
 * Mask NIP untuk display (hide sebagian digit).
 * Contoh: 199001012015011001 → ****1001
 */
export function maskNip(nip: string): string {
  if (nip.length !== 18) return nip;
  return `****${nip.slice(-4)}`;
}
```

---

## Catatan Aksesibilitas Wajib

1. **Label Form**: Setiap input wajib memiliki `<FormLabel htmlFor="...">` yang terhubung dengan `<Input id="...">`.
2. **Required Indicator**: Tandai field wajib dengan `<span className="text-rose-500" aria-label="wajib diisi">*</span>`.
3. **Error Association**: `aria-invalid={!!errors.field}` + `aria-describedby="field-error"` menghubungkan input dengan pesan error.
4. **Description Helper**: `aria-describedby` juga menghubungkan input dengan `<FormDescription>` untuk panduan tambahan.
5. **Dialog**: `aria-describedby="form-description"` menghubungkan dialog dengan deskripsi purpose-nya.
6. **Loading State**: `disabled={isPending}` + spinner `aria-hidden="true"` + teks tombol berubah.