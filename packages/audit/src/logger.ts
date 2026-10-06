import { createHash, createHmac } from 'crypto';
import { desc } from 'drizzle-orm';
import { type Database } from '@kit/database';
import { auditLogs } from '@kit/database/schema';
import type { Actor, Uuid } from '@kit/types';

const configuredHmacKey = process.env.AUDIT_HMAC_KEY;

// Fail-closed: production tanpa AUDIT_HMAC_KEY tidak boleh jalan dengan kunci dev
// (semua event hash akan bisa direkayasa ulang oleh pihak luar — lihat audit-integrity.md).
if (process.env.NODE_ENV === 'production' && !configuredHmacKey) {
  throw new Error('AUDIT_HMAC_KEY wajib diset di production (KMS/Secret Manager)');
}

const HMAC_KEY = configuredHmacKey ?? 'development-only-change-me';

function computeHash(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}

function computeEventHash(payload: string): string {
  return createHmac('sha256', HMAC_KEY).update(payload).digest('hex');
}

export interface AuditEventInput {
  actor: Actor;
  action: string;
  resourceType: string;
  resourceId?: Uuid;
  requestId: string;
  ipAddress?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  note?: string;
}

export async function logAudit(tx: Database, input: AuditEventInput): Promise<void> {
  const oldHash = input.oldValue ? computeHash(JSON.stringify(input.oldValue)) : undefined;
  const newHash = input.newValue ? computeHash(JSON.stringify(input.newValue)) : undefined;

  const prevRow = await tx
    .select({ eventHash: auditLogs.eventHash })
    .from(auditLogs)
    // Ambil event TERAKHIR sebagai previous hash (urut menurun). Bug lama: ascending
    // mengambil baris terlama sehingga verifyChain gagal mulai baris ke-3.
    .orderBy(desc(auditLogs.createdAt))
    .limit(1);

  const previousHash = prevRow[0]?.eventHash ?? '';
  const payload = `${input.actor.id}|${input.action}|${input.resourceType}|${input.resourceId ?? ''}|${input.requestId}|${oldHash ?? ''}|${newHash ?? ''}|${previousHash}`;
  const eventHash = computeEventHash(payload);

  await tx.insert(auditLogs).values({
    actorId: input.actor.id,
    action: input.action,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    requestId: input.requestId,
    ipAddress: input.ipAddress,
    oldValueHash: oldHash,
    newValueHash: newHash,
    metadata: input.metadata,
    previousHash,
    eventHash,
    note: input.note,
  });
}

export async function verifyChain(tx: Database): Promise<{ valid: boolean; brokenAt?: string }> {
  const rows = await tx.select().from(auditLogs).orderBy(auditLogs.createdAt);
  let lastHash = '';
  for (const row of rows) {
    const payload = `${row.actorId}|${row.action}|${row.resourceType}|${row.resourceId ?? ''}|${row.requestId}|${row.oldValueHash ?? ''}|${row.newValueHash ?? ''}|${lastHash}`;
    const expected = computeEventHash(payload);
    if (row.eventHash !== expected) {
      return { valid: false, brokenAt: row.id };
    }
    lastHash = row.eventHash;
  }
  return { valid: true };
}