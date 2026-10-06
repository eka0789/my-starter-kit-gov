export interface EmployeeListResult {
  data: EmployeeListItem[];
}

export interface EmployeeListItem {
  id: string;
  nip: string;
  name: string;
  email?: string;
  status: string;
  createdAt: string;
}