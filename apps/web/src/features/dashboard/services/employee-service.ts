import type { EmployeeListItem } from '../types/employee.types';

const API_BASE = '/api/v1';

export const employeeQueryKeys = {
  all: ['employees'] as const,
  list: (params: { page: number; pageSize: number; search?: string }) =>
    ['employees', 'list', params] as const,
};

export async function listEmployees(
  params: { page: number; pageSize: number; search?: string },
  token?: string
): Promise<{ data: EmployeeListItem[] }> {
  const qs = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
  });
  if (params.search) {
    qs.set('search', params.search);
  }

  const res = await fetch(`${API_BASE}/pegawai?${qs.toString()}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  const body = await res.json();

  if (!res.ok) {
    throw new Error(body.message ?? 'Gagal memuat data pegawai');
  }
  return body;
}

export const employeeService = {
  listEmployees,
};