import type { Actor } from '@kit/types';

export interface DevLoginResult {
  token: string;
  actor: Actor;
}

export async function devLogin(username: string): Promise<DevLoginResult> {
  const res = await fetch('/api/v1/auth/dev-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  });
  const body = await res.json();

  if (!res.ok) {
    throw new Error(body.message ?? 'Login gagal');
  }
  return body.data as DevLoginResult;
}