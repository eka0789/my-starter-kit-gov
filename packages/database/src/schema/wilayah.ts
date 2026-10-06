import { date, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const wilayah = pgTable('wilayah', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 16 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  level: varchar('level', { length: 16 }).notNull(),
  parentCode: varchar('parent_code', { length: 16 }),
  source: varchar('source', { length: 64 }).notNull(),
  sourceVersion: varchar('source_version', { length: 32 }),
  validFrom: date('valid_from').notNull(),
  validTo: date('valid_to'),
  lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }).defaultNow(),
});
