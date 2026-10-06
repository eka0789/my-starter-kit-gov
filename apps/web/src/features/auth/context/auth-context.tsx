import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Actor } from '@kit/types';

interface AuthState {
  token: string | null;
  actor: Actor | null;
  login: (token: string, actor: Actor) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

// Token disimpan di memori SAJA — dilarang localStorage/sessionStorage
// (lihat .ai/security.md § Authentication & Session). Refresh halaman mengakhiri sesi;
// production memakai session cookie server-side / SSO resmi.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [actor, setActor] = useState<Actor | null>(null);

  const login = useCallback((nextToken: string, nextActor: Actor) => {
    setToken(nextToken);
    setActor(nextActor);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setActor(null);
  }, []);

  const value = useMemo(() => ({ token, actor, login, logout }), [token, actor, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth harus dipakai di dalam AuthProvider');
  }
  return ctx;
}