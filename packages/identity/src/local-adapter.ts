import { ActorSchema, type IdentityAdapter, type ValidatedActor } from './interfaces';
import type { Actor } from '@kit/types';

const MOCK_USERS: Map<string, Actor> = new Map([
  ['dev-admin', { id: '11111111-1111-1111-1111-111111111111', email: 'admin@local.gov', name: 'Dev Admin', permissions: ['*'] }],
  ['dev-operator', { id: '22222222-2222-2222-2222-222222222222', email: 'operator@local.gov', name: 'Dev Operator', permissions: ['surat.read', 'surat.create', 'pegawai.read'] }],
  ['dev-pimpinan', { id: '33333333-3333-3333-3333-333333333333', email: 'pimpinan@local.gov', name: 'Dev Pimpinan', permissions: ['surat.approve', 'dashboard.read'] }],
]);

export const LocalAdapter: IdentityAdapter = {
  type: 'local',
  async validate(token: string): Promise<ValidatedActor> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('LocalAdapter tidak boleh digunakan di production');
    }
    const actor = MOCK_USERS.get(token);
    if (!actor) {
      throw new Error('Invalid local token');
    }
    return ActorSchema.parse(actor);
  },
  getAuthUrl(state: string, nonce: string): string {
    return `/auth/local?state=${state}&nonce=${nonce}`;
  },
  async callback(code: string): Promise<ValidatedActor> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('LocalAdapter tidak boleh digunakan di production');
    }
    const actor = MOCK_USERS.get(code);
    if (!actor) {
      throw new Error('Invalid local code');
    }
    return ActorSchema.parse(actor);
  },
};