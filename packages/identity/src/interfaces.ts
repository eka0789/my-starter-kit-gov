import { z } from 'zod';
import type { Actor } from '@kit/types';

export interface IdentityProvider {
  validateToken(token: string): Promise<Actor>;
  getLoginUrl(state: string, nonce: string): string;
  handleCallback(code: string, state: string): Promise<{ actor: Actor; session: unknown }>;
}

export const ActorSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().optional(),
  name: z.string().optional(),
  permissions: z.array(z.string()),
});

export type ValidatedActor = z.infer<typeof ActorSchema>;

export interface IdentityAdapter {
  type: 'oidc' | 'saml2' | 'local' | 'break-glass';
  validate(token: string): Promise<ValidatedActor>;
  getAuthUrl(state: string, nonce: string): string;
  callback(code: string, state: string): Promise<ValidatedActor>;
}

export interface OIDCConfig {
  issuer: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface SAML2Config {
  entryPoint: string;
  issuer: string;
  cert: string;
  callbackUrl: string;
}