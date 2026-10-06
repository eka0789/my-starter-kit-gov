# Interoperabilitas & Satu Data Indonesia

## Tujuan

Menjamin aplikasi dapat beroperasi dalam ekosistem Satu Data Indonesia (SDI) dan berintegrasi dengan SPLP (Sistem Penghubung Layanan Pemerintah) serta sistem eksternal resmi.

---

## Standar Data & Metadata SDI

Setiap elemen data yang diekspos secara internal/eksternal wajib memiliki metadata:

| Atribut | Contoh | Wajib |
|---------|--------|-------|
| Kode data / ID | `data.pegawai.nip` | Ya |
| Nama data | `Nomor Induk Pegawai` | Ya |
| Definisi | `Identitas unik pegawai negeri sipil 18 digit` | Ya |
| Kelasifikasi | `Pribadi Spesifik` | Ya |
| Pemilik data | `Bagian Kepegawaian` | Ya |
| Sumber otoritatif | `SIMPEG Pusat` | Ya |
| Format / pola | `^\d{18}$` | Ya |
| Versi skema | `v1.2` | Ya |
| Tanggal efektif | `2024-01-01` | Ya |
| Retensi | `Aktif + 10 tahun` | Ya |
| Akses minimum | `pegawai.read` | Ya |

Simpan metadata di katalog data instansi, bukan hardcode di kode.

---

## Kode Referensi Resmi

Gunakan **hanya** kode referensi resmi, tidak buat kode internal yang divergensi:

| Domain | Sumber Resmi | Contoh |
|--------|--------------|--------|
| Provinsi | BPS / Permendagri 72/2019 | `11` (Aceh), `32` (Jawa Barat) |
| Kabupaten/Kota | BPS / Permendagri 72/2019 | `3273` (Bandung) |
| Kecamatan | BPS | `3273010` |
| Kelurahan/Desa | BPS | `3273010001` |
| Organisasi | Kode induk kementerian/daerah | `001` (Kemenag) |
| Pegawai | NIP 18 digit | `197503152000031001` |
| Matakuliah/SKPD | Referensi KemenPAN-RB | - |
| Mata Anggaran | Kode Rekening APBN/APBD | `5.1.01.01` |

Tabel referensi wajib memiliki kolom:
```text
code, name, parent_code, level, valid_from, valid_to, source, source_version, last_synced_at
```

Sinkronisasi periodik dari sumber resmi; catat gagal/jatuh tempo.

---

## SPLP Integration

Setiap layanan yang terdaftar di SPLP wajib:

1. Mempunyai OpenAPI 3.0 specification.
2. Menerapkan standar keamanan BSSN (mTLS, API Gateway, rate limit).
3. Menggunakan kontrak data yang divalidasi walidata.
4. Memiliki SLA, timeout, retry, circuit breaker, idempotency key.
5. Melakukan logging permintaan/respons untuk audit trail SPLP.
6. Tidak menyimpan salinan data eksternal tanpa dasar hukum dan retensi.

Pola consumer SPLP:

```typescript
interface SplpClient {
  call<T>(serviceCode: string, operation: string, payload: unknown, options?: {
    idempotencyKey: string;
    timeoutMs: number;
    retries: number;
  }): Promise<T>;
}
```

---

## API Contract & Versioning

- Base path: `/v{major}/` (contoh: `/v1/surat`).
- Breaking change = major baru; minor = backward compatible.
- Deprecation notice minimal 6 bulan; dokumentasi migrasi.
- Envelope response standar:

```json
{
  "success": true,
  "message": "Operasi berhasil",
  "data": {},
  "meta": {
    "timestamp": "2026-10-06T07:00:00Z",
    "request_id": "req_abc123",
    "version": "v1",
    "sdi_metadata": {
      "data_owner": "Bagian Kepegawaian",
      "data_classification": "Pribadi Spesifik",
      "source_system": "SIMPEG"
    }
  }
}
```

---

## Data Lineage & Provenance

Setiap data yang berasal dari sistem lain wajib mencatat:

```text
source_system, source_operation, source_record_id, received_at, transform_version, hash
```

Jangan menimpa data master tanpa audit trail. Data turunan harus dapat dilacak ke sumber.

---

## External Data Mapping

| Source | Target | Mapping Rule | Validation |
|--------|--------|--------------|------------|
| BPS Wilayah | `wilayah` table | exact code match | version check |
| SIMPEG Pusat | `pegawai` | NIP match + org unit | checksum + timestamp |
| DJP | `npwp` | NPWP + nama | reference check |

---

## Checklist

- [ ] Katalog data terisi metadata SDI lengkap.
- [ ] Kode wilayah menggunakan BPS/Kemendagri resmi.
- [ ] Tabel referensi memiliki versioning dan last_synced.
- [ ] OpenAPI spec tersedia untuk semua endpoint SPLP.
- [ ] Idempotency key diterapkan pada operasi mutasi.
- [ ] Data eksternal tidak disimpan tanpa retensi jelas.
- [ ] Data lineage tercatat untuk data turunan.