import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui';
import { useAuth } from '../context/auth-context';
import { devLogin } from '../services/auth-service';

const DEV_ACCOUNTS = [
  { username: 'dev-admin', label: 'Dev Admin — semua permission' },
  { username: 'dev-operator', label: 'Dev Operator — kepegawaian' },
  { username: 'dev-pimpinan', label: 'Dev Pimpinan — approval' },
];

export function LoginPage() {
  const [username, setUsername] = useState(DEV_ACCOUNTS[0]?.username ?? 'dev-admin');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await devLogin(username);
      login(result.token, result.actor);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login gagal. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Masuk</CardTitle>
          <CardDescription>
            Akun development via LocalAdapter — otomatis nonaktif di production (wajib SSO resmi).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <label htmlFor="dev-username" className="text-sm font-medium">
                Akun development
              </label>
              <select
                id="dev-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {DEV_ACCOUNTS.map((account) => (
                  <option key={account.username} value={account.username}>
                    {account.label}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Memproses…' : 'Masuk'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}