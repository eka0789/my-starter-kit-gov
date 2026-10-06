import { StatusBadge, Input } from '@kit/ui';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuth } from '../../auth/context/auth-context';
import { useDebouncedValue } from '../../../hooks/use-debounced-value';
import { employeeQueryKeys, employeeService } from '../services/employee-service';
import type { EmployeeListItem } from '../types/employee.types';

export function EmployeeTable() {
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput);
  const { token } = useAuth();

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: employeeQueryKeys.list({ page: 1, pageSize: 10, search }),
    queryFn: () => employeeService.listEmployees({ page: 1, pageSize: 10, search }, token ?? undefined),
    enabled: Boolean(token),
  });

  if (isLoading) {
    return (
      <div className="space-y-2" aria-busy="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 w-full animate-pulse bg-muted/40 rounded-md" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div role="alert" className="flex flex-col items-center gap-2 py-8">
        <p className="text-sm text-red-600">
          {error instanceof Error ? error.message : 'Gagal memuat data pegawai'}
        </p>
        <button
          onClick={() => refetch()}
          className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  const employees: EmployeeListItem[] = data?.data ?? [];

  return (
    <div>
      <div className="mb-4">
        <label htmlFor="employee-search" className="sr-only">
          Cari pegawai
        </label>
        <Input
          id="employee-search"
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Cari nama atau NIP..."
          className="max-w-xs"
        />
      </div>

      <div className="overflow-x-auto" aria-busy={isFetching}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="text-left py-3 px-4">Nama</th>
              <th scope="col" className="text-left py-3 px-4">NIP</th>
              <th scope="col" className="text-left py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="border-b border-border/50">
                <td className="py-3 px-4">{emp.name}</td>
                <td className="py-3 px-4 font-mono text-xs">
                  <span aria-label={`NIP: ${emp.nip}`}>{emp.nip}</span>
                </td>
                <td className="py-3 px-4">
                  <StatusBadge status={emp.status} />
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan={3} className="py-8 text-center text-muted-foreground">
                  Tidak ada data pegawai.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}