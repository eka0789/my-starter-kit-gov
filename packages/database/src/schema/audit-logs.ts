import { pgTable, uuid, varchar, jsonb, timestamp, text, index } from 'drizzle-orm/pg-core';

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    actorId: uuid('actor_id').notNull(),
    action: varchar('action', { length: 64 }).notNull(),
    resourceType: varchar('resource_type', { length: 64 }).notNull(),
    resourceId: uuid('resource_id'),
    requestId: varchar('request_id', { length: 64 }).notNull(),
    ipAddress: varchar('ip_address', { length: 64 }),
    oldValueHash: varchar('old_value_hash', { length: 128 }),
    newValueHash: varchar('new_value_hash', { length: 128 }),
    metadata: jsonb('metadata'),
    previousHash: varchar('previous_hash', { length: 128 }),
    eventHash: varchar('event_hash', { length: 128 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    note: text('note'),
  },
  (table) => ({
    actorIdx: index('idx_audit_logs_actor').on(table.actorId),
    resourceIdx: index('idx_audit_logs_resource').on(table.resourceType, table.resourceId),
    createdIdx: index('idx_audit_logs_created').on(table.createdAt),
  }),
);
