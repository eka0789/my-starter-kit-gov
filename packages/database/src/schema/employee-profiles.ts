import { pgTable, uuid, varchar, index } from 'drizzle-orm/pg-core';
import { auditColumns } from './helpers';

export const employeeProfiles = pgTable(
  'employee_profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    nip: varchar('nip', { length: 18 }).notNull().unique(),
    nikEncrypted: varchar('nik_encrypted', { length: 255 }),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }),
    unitKerjaId: uuid('unit_kerja_id'),
    status: varchar('status', { length: 32 }).notNull().default('ACTIVE'),
    ...auditColumns,
  },
  (table) => ({
    nipIdx: index('idx_employee_nip').on(table.nip),
    nameIdx: index('idx_employee_name').on(table.name),
  }),
);
