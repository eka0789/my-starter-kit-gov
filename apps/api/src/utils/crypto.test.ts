import { describe, expect, it } from 'vitest';
import { decryptField, encryptField } from './crypto';

describe('field encryption (AES-256-GCM)', () => {
  it('roundtrips plaintext without leaking it into the ciphertext', () => {
    const nik = '3175010101900001';
    const cipher = encryptField(nik);

    expect(cipher.startsWith('v1:')).toBe(true);
    expect(cipher).not.toContain(nik);
    expect(decryptField(cipher)).toBe(nik);
  });

  it('produces different ciphertext per call (random IV)', () => {
    expect(encryptField('rahasia')).not.toBe(encryptField('rahasia'));
  });

  it('rejects tampered ciphertext (auth tag mismatch)', () => {
    const cipher = encryptField('data-pribadi');
    const parts = cipher.split(':');
    parts[3] = Buffer.from('data-palsu').toString('base64');

    expect(() => decryptField(parts.join(':'))).toThrow();
  });
});