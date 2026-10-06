# Template: TanStack Query Custom Hooks

Boilerplate Custom React Hook menggunakan TanStack Query v5 (`useQuery` & `useMutation`) lengkap dengan toast notifications, cache invalidation, dan tipe penuh dari Zod schema.

---

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@my-starter-kit-gov/ui/use-toast';
import { fetchFeatures, createFeature, updateFeature, softDeleteFeature } from '../services/feature-api';
import type { QueryFeatureDTO, CreateFeatureDTO, UpdateFeatureDTO } from '../types';

export const FEATURE_QUERY_KEY = ['features'];

// Hook: Fetch Feature List
export const useFeatureList = (params: QueryFeatureDTO) => {
  return useQuery({
    queryKey: [...FEATURE_QUERY_KEY, params],
    queryFn: () => fetchFeatures(params),
    staleTime: 1000 * 60 * 5, // Cache valid for 5 minutes
  });
};

// Hook: Fetch Single Feature Detail
export const useFeatureDetail = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: [...FEATURE_QUERY_KEY, 'detail', id],
    queryFn: () => fetchFeatureDetail(id),
    enabled: enabled && !!id,
  });
};

// Hook: Create Feature Mutation
export const useCreateFeature = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFeatureDTO) => createFeature(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: FEATURE_QUERY_KEY });
      toast({
        title: 'Berhasil',
        description: `${data.title} berhasil ditambahkan.`
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Gagal Menambah Data',
        description: error.message || 'Terjadi kesalahan sistem.'
      });
    }
  });
};

// Hook: Update Feature Mutation
export const useUpdateFeature = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateFeatureDTO & { id: string }) => updateFeature(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: FEATURE_QUERY_KEY });
      toast({
        title: 'Berhasil',
        description: `${data.title} berhasil diperbarui.`
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Gagal Memperbarui Data',
        description: error.message
      });
    }
  });
};

// Hook: Soft Delete Feature Mutation
export const useDeleteFeature = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => softDeleteFeature(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FEATURE_QUERY_KEY });
      toast({
        title: 'Penghapusan Berhasil',
        description: 'Data telah di-soft delete.'
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Gagal Menghapus Data',
        description: error.message
      });
    }
  });
};

// Hook: Purge Feature (Hak Penghapusan UU PDP - Hanya via workflow DPO)
// export const usePurgeFeature = () => { ... }
```

---

## Catatan

1. **Tipe Penuh**: Semua DTO berasal dari `schemas/[feature].schema.ts` via `z.infer<>`.
2. **Cache Invalidation**: `invalidateQueries({ queryKey: FEATURE_QUERY_KEY })` membersihkan cache list & detail.
3. **Toast**: Gunakan `use-toast` dari shadcn/ui untuk feedback user. Jangan `alert()` atau `console.log()`.
4. **Error Handling**: `onError` wajib ada untuk setiap mutasi. Tampilkan pesan ramah, log detail internal.
5. **Purge**: Jangan expose purge di UI biasa. Hanya tersedia di halaman khusus DPO dengan approval workflow.