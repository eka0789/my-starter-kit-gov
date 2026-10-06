# Business Rules (Aturan Bisnis Pemerintah Enterprise)

## Purpose

Dokumen ini mendefinisikan aturan bisnis utama untuk aplikasi instansi pemerintah. Setiap kode, skema database, API, dan UI yang dihasilkan **WAJIB** mematuhi aturan yang relevan dan divalidasi oleh DPO/Legal instansi.

Regulasi rujukan utama: `compliance-baseline.md`, `data-protection.md`, `identity-and-signature.md`, `interoperability.md`.

---

## 1. Identitas & Data Pegawai (ASN / PNS / PPPK / Non-ASN)

### Validasi NIP

- NIP ASN terdiri dari **18 digit angka** dengan format `YYYYMMDDYYYYMMXNNN`.
- Validasi format: `/^\d{18}$/`.
- NIP unik dalam konteks instansi dan menjadi kunci pencarian sesuai permission.
- NIP penuh **tidak boleh** muncul pada UI/list/log tanpa permission dan purpose sah.

### Validasi NIK

- NIK terdiri dari **16 digit angka**.
- Validasi format: `/^\d{16}$/`.
- Validasi format tidak membuktikan identitas; verifikasi ke sumber resmi hanya sesuai dasar hukum.
- NIK disimpan terenkripsi/masked dan tidak boleh tercetak di log/error/URL.

---

## 2. Struktur Organisasi & Hierarki Jabatan

- Setiap pegawai terikat pada satu Unit Kerja Utama.
- Hirarki jabatan menentukan kewenangan persetujuan/disposisi dan visibilitas data.
- Perubahan jabatan/unit kerja wajib tercatat dalam riwayat dan tidak menghapus data historis.
- Data scoping wajib diterapkan server-side berdasarkan unit kerja, role, dan klasifikasi data.

---

## 3. Naskah Dinas & E-Surat (TNDE)

### Penomoran Surat

- Format mengikuti standar instansi: `[Kode-Klasifikasi]/[No-Urut]/[Kode-Unit]/[Tahun]`.
- Nomor urut atomik per tahun/jenis/unit menggunakan database transaction/sequence.
- Nomor surat tidak boleh didaur ulang setelah dokumen resmi diterbitkan.

### Klasifikasi Kerahasiaan

- `BIASA`: Unit kerja terkait.
- `TERBATAS`: Pihak yang tercantum pada tujuan/tembusan.
- `RAHASIA`: Permission khusus + MFA bila ditetapkan.
- `SANGAT_RAHASIA`: Enkripsi tingkat data + need-to-know.

### Workflow

`DRAFT` ➔ `PENGAJUAN` ➔ `VERIFIKASI` ➔ `TANDA_TANGAN` ➔ `TERKIRIM` ➔ `DISPOSISI` ➔ `SELESAI` / `DITOLAK`.

Setiap transition wajib mencatat actor, waktu, alasan, old/new status, dan audit event.

### Tanda Tangan Elektronik

- Dokumen resmi **WAJIB** menggunakan TTE tersertifikasi dari PSrE berlisensi (BSrE/BSSN, Peruri, Privy, atau provider resmi lain sesuai approval instansi).
- Mock token hanya boleh dipakai unit/integration test. Mock aktif di production adalah defect blocker.
- Validasi certificate chain, revocation, timestamp, hash dokumen, dan bukti signing.
- Detail implementasi: `identity-and-signature.md`.

---

## 4. Audit Trail & Soft Delete

### Kolom Audit Canonical (6 Kolom)

Setiap tabel transaksi bisnis wajib memiliki:

1. `created_at` (timestamp with timezone, default now())
2. `updated_at` (timestamp with timezone, default now())
3. `deleted_at` (timestamp with timezone, nullable)
4. `created_by` (UUID/service principal, NOT NULL)
5. `updated_by` (UUID/service principal, NOT NULL)
6. `deleted_by` (UUID, nullable; wajib terisi bersama `deleted_at`)

### Kebijakan Penghapusan

- Query normal wajib menyaring `deleted_at IS NULL`.
- Soft delete adalah mekanisme lifecycle aplikasi, bukan pengganti hak penghapusan UU PDP.
- Purge/anonymization hanya melalui workflow resmi yang memeriksa retention schedule, legal hold, dan approval DPO.
- Setiap purge menghasilkan audit event tanpa menyimpan ulang PII.
- Audit logs sendiri append-only dan tidak boleh dihapus oleh application role.

### Audit Event Kritis

Login/logout, perubahan permission, disposisi, TTE, export PII, data correction, soft delete, purge, dan percobaan akses tanpa hak wajib dicatat di `audit_logs` dengan hash chain/HMAC (lihat `audit-integrity.md`).

---

## 5. RBAC & Data Scoping

Peran standar:

- `SUPER_ADMIN`: Konfigurasi sistem (tidak otomatis berhak membaca semua PII).
- `ADMIN_INSTANSI`: Master data dan role instansi.
- `PIMPINAN`: Approval/disposisi/dashboard sesuai unit.
- `VERIFIKATOR`: Verifikasi kelengkapan.
- `OPERATOR` / `PENGELOLA_SURAT`: Input dan agenda surat.
- `PEGAWAI`: Layanan profil dan disposisi sendiri.
- `DPO`: Review privacy request, bukan akses bebas ke semua data.
- `AUDITOR`: Read-only evidence sesuai scope.

Aturan:
- Permission granular (`surat.read`, `surat.approve`, `pegawai.export`).
- User hanya melihat data sesuai unit kerja dan classification.
- Permission check dilakukan sebelum service logic.
- Export/read PII penuh membutuhkan permission, purpose, dan audit event.

---

## 6. Satu Data & Referensi Wilayah

- Gunakan kode wilayah resmi BPS/Kemendagri; dilarang kode buatan yang divergensi.
- Metadata SDI dan data lineage wajib disediakan untuk data yang dipertukarkan.
- Integrasi eksternal melalui kontrak SPLP/OpenAPI dengan idempotency dan audit.
- Detail: `interoperability.md`.

---

## 7. Validasi & Penanganan Insiden

- Semua formulir validasi client-side **dan** server-side Zod.
- Manipulasi data/akses tanpa hak diblokir dan dicatat sebagai potensi insiden.
- Error client tidak boleh menampilkan SQL, stack trace, secret, atau PII.
- Data subject request mengikuti `data-protection.md` dan approval DPO.
