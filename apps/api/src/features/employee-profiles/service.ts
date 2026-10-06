import { and, desc, eq, ilike, isNull, sql, type SQL } from 'drizzle-orm';
import { db, type Database } from '@kit/database';
import { employeeProfiles } from '@kit/database/schema';
import { logAudit } from '@kit/audit';
import type { Actor, Uuid } from '@kit/types';
import type { CreateEmployeeInput, EmployeeListQuery } from './schema';

function sanitizeSearchQuery(query: string): string {
  return query.replace(/[%_\\]/g, '\\$&').trim();
}

export async function listEmployees(query: EmployeeListQuery) {
  const { page, pageSize, search } = query;
  const offset = (page - 1) * pageSize;

  const conditions: SQL[] = [isNull(employeeProfiles.deletedAt)];

  if (search) {
    const sanitized = sanitizeSearchQuery(search);
    conditions.push(
      sql`(${ilike(employeeProfiles.name, `%${sanitized}%`)} OR ${ilike(employeeProfiles.nip, `%${sanitized}%`)})`
    );
  }

  const whereClause = and(...conditions);

  const [data, totalCount] = await Promise.all([
    db
      .select({
        id: employeeProfiles.id,
        nip: employeeProfiles.nip,
        name: employeeProfiles.name,
        email: employeeProfiles.email,
        status: employeeProfiles.status,
        createdAt: employeeProfiles.createdAt,
      })
      .from(employeeProfiles)
      .where(whereClause)
      .orderBy(desc(employeeProfiles.createdAt))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(employeeProfiles)
      .where(whereClause),
  ]);

  const total = totalCount[0]?.count ?? 0;

  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function createEmployee(
  actor: Actor,
  input: CreateEmployeeInput,
  requestId: string,
  ipAddress?: string
) {
  return await db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(employeeProfiles)
      .values({
        nip: input.nip,
        name: input.name,
        email: input.email,
        unitKerjaId: input.unitKerjaId,
        createdBy: actor.id,
        updatedBy: actor.id,
      })
      .returning();

    if (!inserted) {
      throw new Error('Gagal menambahkan pegawai');
    }

    await logAudit(tx as unknown as Database, {
      actor,
      action: 'EMPLOYEE_CREATE',
      resourceType: 'employee_profiles',
      resourceId: inserted.id,
      requestId,
      ipAddress,
      newValue: { nip: inserted.nip, name: inserted.name },
    });

    return inserted;
  });
}

export async function softDeleteEmployee(
  actor: Actor,
  id: Uuid,
  requestId: string,
  ipAddress?: string
) {
  return await db.transaction(async (tx) => {
    const existing = await tx
      .select()
      .from(employeeProfiles)
      .where(and(eq(employeeProfiles.id, id), isNull(employeeProfiles.deletedAt)))
      .limit(1);

    if (!existing[0]) {
      throw new Error('Pegawai tidak ditemukan atau sudah dihapus');
    }

    await tx
      .update(employeeProfiles)
      .set({
        deletedAt: new Date(),
        deletedBy: actor.id,
        updatedBy: actor.id,
      })
      .where(eq(employeeProfiles.id, id));

    await logAudit(tx as unknown as Database, {
      actor,
      action: 'EMPLOYEE_DELETE',
      resourceType: 'employee_profiles',
      resourceId: id,
      requestId,
      ipAddress,
      oldValue: { nip: existing[0].nip, name: existing[0].name },
    });

    return true;
  });
}
