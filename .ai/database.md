# Database Rules & Schema Standards

## Database Platform & ORM
- **Engine**: `PostgreSQL` (wajib relasional; versi 14+)
- **ORM**: `Drizzle ORM`
- **Migration Tool**: `drizzle-kit`
- **Connection Pooling**: `PgBouncer` untuk production

---

## Schema Naming & Data Type Standards

1. **Naming Convention**:
   - Tabel: `snake_case`, plural (`users`, `employee_profiles`, `incoming_mails`).
   - Kolom: `snake_case`, singular (`first_name`, `employee_id`, `created_at`).
   - Primary Key: Selalu `id` bertipe `uuid` (`defaultRandom()`). Dilarang auto-increment integer ID untuk tabel bisnis.

2. **Mandatory Audit Columns (6 Kolom Wajib)**:
   Setiap tabel transaksi bisnis WAJIB menyertakan **6 kolom** berikut:
   ```typescript
   id: uuid("id").primaryKey().defaultRandom(),
   created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
   updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
   deleted_at: timestamp("deleted_at", { withTimezone: true }),
   created_by: uuid("created_by").notNull(), // WAJIB NOT NULL
   updated_by: uuid("updated_by").notNull(), // WAJIB NOT NULL
   deleted_by: uuid("deleted_by")
   ```

   **Penjelasan**:
   - `created_by` dan `updated_by` **tidak boleh null**; setiap record wajib traceable.
   - Untuk sistem/background job, gunakan service account UUID khusus (`00000000-0000-0000-0000-000000000001` atau UUID service principal).
   - `deleted_by` mencatat siapa yang soft-delete; nullable karena record aktif tidak memiliki nilai ini.
   - Timestamp wajib `withTimezone: true` dan UTC.

3. **Drizzle Helper `auditColumns`**:
   ```typescript
   // packages/database/schema/helpers.ts
   export const auditColumns = {
     created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
     updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
     deleted_at: timestamp('deleted_at', { withTimezone: true }),
     created_by: uuid('created_by').notNull(),
     updated_by: uuid('updated_by').notNull(),
     deleted_by: uuid('deleted_by'),
   };
   ```

4. **Tabel Audit Log Append-Only**:
   Lihat spesifikasi lengkap di `audit-integrity.md`. Tabel `audit_logs` wajib:
   - Role aplikasi hanya `INSERT` dan `SELECT`.
   - Trigger mencegah `UPDATE` dan `DELETE`.
   - Hash chain HMAC per baris.

5. **Foreign Keys & Indexing**:
   - Deklarasikan `foreignKey` eksplisit dengan `ON DELETE RESTRICT` atau `CASCADE` sesuai konteks.
   - Buat `index` pada kolom yang sering dijadikan kriteria pencarian atau join (`nip`, `email`, `unit_kerja_id`, `created_at`, `status`).
   - Untuk pencarian teks Indonesia: gunakan `GIN` index + `unaccent` extension.

6. **Soft Delete Policy**:
   - Dilarang eksekusi `DELETE FROM table` untuk data bisnis.
   - Soft delete: `UPDATE table SET deleted_at = NOW(), deleted_by = $user_id WHERE ...`.
   - Purge permanen hanya melalui workflow resmi data-subject erasure atau retensi yang disetujui DPO (lihat `data-protection.md`).

7. **Migrations**:
   - Setiap perubahan schema wajib dibuatkan migrasi resmi via `pnpm drizzle-kit generate`.
   - File migrasi disimpan di `packages/database/drizzle/` (lihat `out` di `drizzle.config.ts`).
   - Migration wajib diuji di environment staging sebelum production.
   - Jangan rollback migrasi production tanpa approval dan backup.

---

## Environment & Seed

1. **Koneksi via Environment**:
   - `DATABASE_URL` harus berasal dari environment variable — dilarang hardcode connection string di source. `packages/database/src/client.ts` sudah throw `DATABASE_URL is required` bila tidak tersedia (fail-fast).
   - Development, staging, dan production harus memakai database terpisah (lihat `.env.example` + profil deployment di `tech-stack.md`).
   - Production memakai `PgBouncer` untuk connection pooling; jangan mengubah `max` di client tanpa alasan.

2. **Seed Data** (perintah: `pnpm db:seed`, script `packages/database/src/seed.ts`):
   - Seed hanya membuat data development/test (contoh di repo: wilayah BPS + pegawai dummy), **bukan** data asli atau rahasia.
   - Dilarang menaruh seed berisi NIK/NIP asli, kata sandi, TTE token, atau secret apa pun.
   - Kolom `created_by`/`updated_by` pada seed wajib memakai service principal `SERVICE_PRINCIPAL_ID` (`00000000-0000-0000-0000-000000000001`) dari `@kit/types`.
   - Seed idempotent (`onConflictDoNothing`) dan tidak boleh mengubah data production; jalankan hanya di environment yang dituju.

3. **Aturan Production**:
   - Dilarang `pnpm db:studio` / reset / migrate langsung di production tanpa proses rilis.
   - Mutasi multi-tabel wajib `db.transaction` (termasuk menulis `audit_logs` bersama data; lihat `audit-integrity.md`).
   - Backup sebelum perubahan destructive; dokumentasikan restore drill.

---

## Tabel Referensi Wilayah (BPS/Kemendagri)

Gunakan kode referensi resmi sesuai `interoperability.md`:

```typescript
export const wilayah = pgTable('wilayah', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 16 }).notNull().unique(), // kode BPS
  name: varchar('name', { length: 255 }).notNull(),
  level: varchar('level', { length: 16 }).notNull(), // 'provinsi', 'kabkota', 'kecamatan', 'kelurahan'
  parent_code: varchar('parent_code', { length: 16 }),
  source: varchar('source', { length: 64 }).notNull(), // 'BPS', 'Kemendagri'
  source_version: varchar('source_version', { length: 32 }),
  valid_from: date('valid_from').notNull(),
  valid_to: date('valid_to'),
  last_synced_at: timestamp('last_synced_at', { withTimezone: true }).defaultNow(),
});
```

Sinkronisasi periodik; jangan hardcode nama provinsi/kota di kode.

---

## PII & Encrypted Columns

- NIK, NIP, data kesehatan, biometrik wajib terenkripsi at-rest atau masked.
- Enkripsi aplikasi-level: gunakan field `_encrypted` + key management terpisah dari database.
- Enkripsi database: aktifkan `pgcrypto` extension; simpan kunci di KMS/HSM (bukan di env var atau database yang sama).
- Jangan simpan PII dalam log, error message, atau URL.

---

## Checklist

- [ ] 6 kolom audit ada di semua tabel bisnis.
- [ ] `created_by` dan `updated_by` NOT NULL.
- [ ] Helper `auditColumns` sudah diimplementasi di `packages/database`.
- [ ] Tabel `audit_logs` append-only dengan trigger immutability.
- [ ] Tabel wilayah BPS/Kemendagri terisi dan up-to-date.
- [ ] PII terenkripsi atau masked.
- [ ] Migration file tersimpan dan tested.
- [ ] Index pada kolom high-cardinality dan join frequent.
