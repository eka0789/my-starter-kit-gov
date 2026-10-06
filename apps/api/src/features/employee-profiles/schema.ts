import { z } from 'zod';

export const EmployeeListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().max(100).optional(),
});

export const CreateEmployeeSchema = z.object({
  nip: z.string().regex(/^\d{18}$/, 'NIP harus 18 digit angka'),
  name: z.string().min(1, 'Nama wajib diisi').max(255),
  email: z.string().email('Format email tidak valid').optional(),
  unitKerjaId: z.string().uuid().optional(),
});

export type EmployeeListQuery = z.infer<typeof EmployeeListQuerySchema>;
export type CreateEmployeeInput = z.infer<typeof CreateEmployeeSchema>;
