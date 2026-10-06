import { EmployeeTable } from '../components/employee-table';

export function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-6 py-4">
        <h1 className="text-2xl font-semibold">Dashboard E-Government</h1>
        <p className="text-sm text-muted-foreground">
          Starter kit aplikasi pemerintah — UU PDP, SPBE, BSSN, Satu Data Indonesia
        </p>
      </header>

      <section className="p-6 max-w-5xl mx-auto" aria-label="Daftar Pegawai">
        <h2 className="text-lg font-medium mb-4">Daftar Pegawai</h2>
        <EmployeeTable />
      </section>
    </main>
  );
}