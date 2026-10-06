import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

// Enkripsi field-level (at-rest) untuk PII seperti NIK — lihat .ai/data-protection.md.
// Format ciphertext: v1:<iv>:<auth-tag>:<ciphertext> (AES-256-GCM).
// Kunci diambil dari FIELD_ENCRYPTION_KEY (base64, 32 byte) — produksi via KMS/Secret Manager,
// dilarang hardcode; rotasi kunci = dekripsi ulang data dengan kunci lama lalu enkripsi ulang.

const KEY_ENV_NAME = 'FIELD_ENCRYPTION_KEY';

function getKey(): Buffer {
  const raw = process.env[KEY_ENV_NAME];
  if (!raw) {
    throw new Error(`${KEY_ENV_NAME} wajib diset untuk enkripsi field (lihat .ai/data-protection.md)`);
  }
  const key = Buffer.from(raw, 'base64');
  if (key.length !== 32) {
    throw new Error(`${KEY_ENV_NAME} harus base64 32-byte (AES-256). Generate: openssl rand -base64 32`);
  }
  return key;
}

export function encryptField(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `v1:${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`;
}

export function decryptField(payload: string): string {
  const parts = payload.split(':');
  const version = parts[0];
  const ivB64 = parts[1];
  const tagB64 = parts[2];
  const dataB64 = parts[3];

  if (version !== 'v1' || !ivB64 || !tagB64 || !dataB64) {
    throw new Error('Format ciphertext tidak valid');
  }

  const decipher = createDecipheriv('aes-256-gcm', getKey(), Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(dataB64, 'base64')), decipher.final()]).toString('utf8');
}