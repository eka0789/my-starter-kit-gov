# Audit Trail & Log Integrity

## Tujuan

Menjamin bukti audit tidak dapat disangkal (non-repudiation), tidak dapat dimanipulasi, dan dapat diverifikasi oleh auditor internal/eksternal (BPK, BPKP, BSSN).

---

## 6 Kolom Audit Canonical

Setiap tabel transaksi bisnis **WAJIB** memiliki 6 kolom:

```sql
created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
deleted_at  TIMESTAMP WITH TIME ZONE,
created_by  UUID NOT NULL,
updated_by  UUID NOT NULL,
deleted_by  UUID
```

- Nilai `created_by` dan `updated_by` **tidak boleh null**.
- Untuk background job/system process, gunakan dedicated system user id (`00000000-0000-0000-0000-000000000001` atau service principal UUID).
- Dilarang `deleted_by` tanpa `deleted_at`.
- Dilarang overwrite `created_by` dan `created_at`.

---

## Tabel `audit_logs` (Append-Only)

Tabel pencatatan event kritis:

```sql
CREATE TABLE audit_logs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  actor_id            UUID NOT NULL,
  actor_type          VARCHAR(32) NOT NULL, -- user, system, service_account
  action              VARCHAR(64) NOT NULL, -- login, create, update, delete, sign, export
  resource_type       VARCHAR(64) NOT NULL,
  resource_id         VARCHAR(128) NOT NULL,
  request_id          VARCHAR(64) NOT NULL,
  ip_address          INET NOT NULL,
  user_agent          TEXT,
  old_value_hash      CHAR(64), -- SHA-256 of canonical JSON old values
  new_value_hash      CHAR(64), -- SHA-256 of canonical JSON new values
  previous_event_hash CHAR(64) NOT NULL, -- SHA-256 chain from previous log
  event_hash          CHAR(64) NOT NULL, -- HMAC-SHA256 of this row
  key_version         VARCHAR(16) NOT NULL,
  metadata            JSONB
);
```

### Constraint & Permission

- **Append-Only**: Role aplikasi hanya boleh `INSERT` dan `SELECT`.
- **DILARANG**: `UPDATE` atau `DELETE` pada `audit_logs`.
- Database enforcement:
  ```sql
  REVOKE UPDATE, DELETE, TRUNCATE ON audit_logs FROM app_user;
  GRANT INSERT, SELECT ON audit_logs TO app_user;
  ```
- Trigger untuk menolak update/delete:
  ```sql
  CREATE OR REPLACE FUNCTION prevent_audit_tampering()
  RETURNS TRIGGER AS $$
  BEGIN
    RAISE EXCEPTION 'audit_logs is append-only: updates and deletes are prohibited';
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER audit_logs_immutable
  BEFORE UPDATE OR DELETE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_tampering();
  ```

---

## Hash Chaining & HMAC

Setiap baris log diverifikasi dengan hash baris sebelumnya (blockchain sederhana):

```text
event_hash = HMAC_SHA256(
  key_version,
  id + occurred_at + actor_id + action + resource_type + resource_id +
  old_value_hash + new_value_hash + previous_event_hash
)
```

1. Kunci HMAC disimpan di KMS/HSM, bukan di database yang sama.
2. Root hash (genesis block) disimpan di dokumen konfigurasi aman.
3. Script verifikasi harian/mingguan memvalidasi seluruh rantai hash:
   - Jika `hash(row_n-1) != row_n.previous_event_hash` -> **TAMPERING DETECTED**.
   - Jika `HMAC(row_n) != row_n.event_hash` -> **TAMPERING DETECTED**.

---

## Waktu & Sinkronisasi NTP

- Semua timestamp menggunakan UTC (`TIMESTAMP WITH TIME ZONE`).
- Server aplikasi, database, dan logging wajib sinkron dengan server NTP resmi (contoh: `id.pool.ntp.org` atau NTP internal pemerintah).
- Maksimum toleransi drift: 500 ms.
- Drift berlebih harus memicu alert ke CSIRT/Sysadmin.

---

## Retensi & Ekspor Log

- Retensi minimum log audit transaksi: 5 tahun (atau sesuai audit BPK/aturan arsip).
- Retensi log akses (login, session): 1 tahun minimum.
- Ekspor berkala ke WORM (Write Once, Read Many) storage atau sistem log tersentralisasi instansi (SIEM).
- Log yang diekspor wajib ditandatangani digital atau di-hash manifest-nya.

---

## Alerting Tampering & Kegagalan Audit

Pemicu alert level tinggi ke CSIRT/DPO:

- Kegagalan penulisan audit log (aplikasi wajib fail-closed jika mutasi gagal dicatat).
- Ketidakcocokan hash chain dalam audit runner.
- Upaya eksekusi `UPDATE` atau `DELETE` pada `audit_logs`.
- Kegagalan rotasi kunci audit.

---

## Checklist

- [ ] 6 kolom audit ada di semua tabel bisnis.
- [ ] `created_by` dan `updated_by` non-nullable.
- [ ] Database role tidak memiliki hak UPDATE/DELETE di `audit_logs`.
- [ ] Trigger immutability aktif.
- [ ] HMAC hash chain terimplementasi.
- [ ] Kunci HMAC terpisah dari database.
- [ ] Script verifikasi integritas log berjalan otomatis.
- [ ] NTP sinkron di semua komponen.
- [ ] Fail-closed jika penulisan audit gagal.
- [ ] Ekspor WORM/SIEM terjadwal.
