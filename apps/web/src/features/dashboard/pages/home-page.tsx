import { Button } from '@kit/ui';
import { EmployeeTable } from '../components/employee-table';
import { useAuth } from '../../auth/context/auth-context';

export function HomePage() {
  const { actor, logout } = useAuth();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard E-Government</h1>
            <p className="text-sm text-muted-foreground">
              Starter kit aplikasi pemerintah — UU PDP, SPBE, BSSN, Satu Data Indonesia
            </p>
          </div>
          <div className="flex items-center gap-3">
            {actor?.name && <span className="text-sm text-muted-foreground">{actor.name}</span>}
            <Button variant="outline" size="sm" onClick={logout}>
              Keluar
            </Button>
          </div>
        </div>
      </header>

      <section className="p-6 max-w-5xl mx-auto" aria-label="Daftar Pegawai">
        <h2 className="text-lg font-medium mb-4">Daftar Pegawai</h2>
        <EmployeeTable />
      </section>
    </main>
  );
}