CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL,
  action varchar(64) NOT NULL,
  resource_type varchar(64) NOT NULL,
  resource_id uuid,
  request_id varchar(64) NOT NULL,
  ip_address varchar(64),
  old_value_hash varchar(128),
  new_value_hash varchar(128),
  metadata jsonb,
  previous_hash varchar(128),
  event_hash varchar(128) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  note text
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs (actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs (resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs (created_at);

REVOKE UPDATE, DELETE ON audit_logs FROM PUBLIC;

CREATE OR REPLACE FUNCTION prevent_audit_log_mutation()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs is append-only';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS audit_logs_immutable ON audit_logs;
CREATE TRIGGER audit_logs_immutable
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_mutation();

CREATE TABLE IF NOT EXISTS wilayah (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(16) NOT NULL UNIQUE,
  name varchar(255) NOT NULL,
  level varchar(16) NOT NULL,
  parent_code varchar(16),
  source varchar(64) NOT NULL,
  source_version varchar(32),
  valid_from date NOT NULL,
  valid_to date,
  last_synced_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS employee_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nip varchar(18) NOT NULL UNIQUE,
  nik_encrypted varchar(255),
  name varchar(255) NOT NULL,
  email varchar(255),
  unit_kerja_id uuid,
  status varchar(32) NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid NOT NULL,
  updated_by uuid NOT NULL,
  deleted_by uuid
);

CREATE INDEX IF NOT EXISTS idx_employee_nip ON employee_profiles (nip);
CREATE INDEX IF NOT EXISTS idx_employee_name ON employee_profiles (name);
