# Template: Drizzle ORM Table Definition & Migration Schema

Boilerplate definisi tabel Drizzle ORM PostgreSQL dengan **6 Kolom Audit Wajib** (`created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`, `deleted_by`) dan Panduan RLS.

---

## 1. Drizzle Schema Definition (TypeScript)

```typescript
import { pgTable, uuid, varchar, text, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// Audit Columns Helper (6 KOLOM WAJIB)
// ============================================================================
export const auditColumns = {
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  createdBy: uuid('created_by').notNull(), // UUID actor yang membuat record
  updatedBy: uuid('updated_by').notNull(), // UUID actor yang terakhir mengupdate
  deletedBy: uuid('deleted_by'),           // UUID actor yang menghapus (soft delete)
};

// Background job/system principal: 00000000-0000-0000-0000-000000000001
// createdBy/updatedBy wajib NOT NULL; deletedAt/deletedBy nullable (NULL = belum dihapus)

// ============================================================================
// 1. Table Schema: Employee Profiles
// ============================================================================
export const employeeProfiles = pgTable(
  'employee_profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    nip: varchar('nip', { length: 18 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    departmentId: uuid('department_id').notNull(),
    status: varchar('status', { length: 20 }).default('active').notNull(),
    ...auditColumns,
  },
  (table) => ({
    nipIdx: index('idx_employee_nip').on(table.nip),
    deptIdx: index('idx_employee_dept').on(table.departmentId),
    deletedIdx: index('idx_employee_deleted').on(table.deletedAt),
  })
);

// ============================================================================
// 2. Table Schema: Departments (Unit Kerja)
// ============================================================================
export const departments = pgTable(
  'departments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    code: varchar('code', { length: 50 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    parentId: uuid('parent_id'),
    ...auditColumns,
  }
);

// ============================================================================
// 3. Relational Mapping
// ============================================================================
export const employeeProfilesRelations = relations(employeeProfiles, ({ one }) => ({
  department: one(departments, {
    fields: [employeeProfiles.departmentId],
    references: [departments.id],
  }),
}));

// ============================================================================
// 4. Append-Only Audit Logs Table (Immutable Event Log)
// ============================================================================
export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).defaultNow().notNull(),
    actorId: uuid('actor_id').notNull(),           // UUID user/principal yang melakukan aksi
    action: varchar('action', { length: 50 }).notNull(), // CREATE, UPDATE, DELETE, LOGIN, EXPORT, etc.
    resourceType: varchar('resource_type', { length: 100 }).notNull(), // employee_profiles, departments, etc.
    resourceId: uuid('resource_id').notNull(),     // UUID dari record yang diubah
    changes: text('changes'),                      // JSON diff (opsional, hati-hati ukuran)
    requestId: varchar('request_id', { length: 100 }), // Trace ID dari request HTTP
    ipAddress: varchar('ip_address', { length: 45 }), // IPv4/IPv6
    userAgent: text('user_agent'),
    eventHash: varchar('event_hash', { length: 64 }).notNull(), // HMAC-SHA256 hash chain
    previousEventHash: varchar('previous_event_hash', { length: 64 }), // Hash event sebelumnya (chain integrity)
  },
  (table) => ({
    actorIdx: index('idx_audit_actor').on(table.actorId),
    occurredIdx: index('idx_audit_occurred').on(table.occurredAt),
    resourceIdx: index('idx_audit_resource').on(table.resourceType, table.resourceId),
  })
);
```

---

## 2. Raw SQL Migration Helper (RLS & Immutability Trigger)

Tambahkan ini ke berkas migrasi SQL terpisah atau Drizzle Kit SQL output:

```sql
-- ============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE employee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated users can read non-deleted items
CREATE POLICY "Read Active Employees"
  ON employee_profiles FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "Create Employee"
  ON employee_profiles FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- ============================================================================
-- AUDIT LOGS IMMUTABILITY (DB-Level Protection)
-- ============================================================================
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- GRANT SELECT, INSERT saja untuk app_user role (tidak ada UPDATE/DELETE)
GRANT SELECT, INSERT ON audit_logs TO app_user;
REVOKE UPDATE, DELETE, TRUNCATE ON audit_logs FROM app_user;

-- Trigger mencegah UPDATE/DELETE pada audit_logs (fail-safe)
CREATE OR REPLACE FUNCTION prevent_audit_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs is append-only: UPDATE/DELETE forbidden';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_audit_update
  BEFORE UPDATE OR DELETE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_mutation();

-- ============================================================================
-- SYSTEM PRINCIPAL UUID untuk Background Job
-- ============================================================================
-- Gunakan UUID 00000000-0000-0000-0000-000000000001 untuk aksi sistem/job.
-- Simpan referensi di tabel auth.users atau principals jika diperlukan.
```

---

## 3. Panduan Penggunaan

### Membuat Record Baru (INSERT)
```typescript
const currentUser = c.get('user'); // dari auth middleware

const [newEmployee] = await db.insert(employeeProfiles).values({
  nip: '199001012020011001',
  name: 'Ahmad Fauzi',
  email: 'ahmad.fauzi@kemenag.go.id',
  departmentId: 'uuid-of-department',
  status: 'active',
  createdBy: currentUser.id,
  updatedBy: currentUser.id,
}).returning();

// Wajib tulis audit log dalam transaksi yang sama
await db.insert(auditLogs).values({
  occurredAt: new Date(),
  actorId: currentUser.id,
  action: 'CREATE',
  resourceType: 'employee_profiles',
  resourceId: newEmployee.id,
  requestId: c.req.header('x-request-id'),
  ipAddress: c.req.header('x-forwarded-for') || c.req.raw.headers.get('x-real-ip'),
  eventHash: computeEventHash({ /* ... */ }),
  previousEventHash: await getLastEventHash(),
});
```

### Update Record (PATCH)
```typescript
const [updated] = await db.update(employeeProfiles)
  .set({
    name: 'Ahmad Fauzi (Updated)',
    updatedBy: currentUser.id,
    updatedAt: new Date(),
  })
  .where(eq(employeeProfiles.id, employeeId))
  .returning();

// Tulis audit log
await db.insert(auditLogs).values({ /* sama seperti di atas, action: 'UPDATE' */ });
```

### Soft Delete (DELETE)
```typescript
const [deleted] = await db.update(employeeProfiles)
  .set({
    deletedAt: new Date(),
    deletedBy: currentUser.id,
  })
  .where(eq(employeeProfiles.id, employeeId))
  .returning();

// Tulis audit log dengan action: 'DELETE'
await db.insert(auditLogs).values({ /* ... */ });
```

### Purge Workflow (Hak Penghapusan UU PDP Pasal 8)
```typescript
// HANYA via workflow resmi, bukan langsung dari aplikasi CRUD biasa.
// Cek: legal hold, retensi, approval DPO, lalu anonymize/hard-delete.
// Catat di audit_logs dengan action: 'PURGE_REQUEST', 'PURGE_APPROVED', 'PURGE_EXECUTED'.
```

---

## 4. Catatan Penting

1. **`createdBy` dan `updatedBy` wajib NOT NULL**: Background job menggunakan UUID sistem `00000000-0000-0000-0000-000000000001`.
2. **`deletedBy` nullable**: NULL berarti record belum dihapus. Jika soft-delete, wajib isi `deletedBy`.
3. **Audit Logs Append-Only**: Tidak ada UPDATE/DELETE. Hash chain mencegah tamper. Verifikasi hash chain via job harian/mingguan.
4. **Soft-Delete ≠ Purge**: Soft-delete untuk lifecycle aplikasi. Purge untuk hak hukum UU PDP (workflow terpisah).
5. **Fail-Closed Audit**: Jika audit log gagal, rollback transaksi mutasi.
