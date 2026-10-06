# Data Protection Standard (UU PDP No. 27/2022)

## Tujuan

Menetapkan kontrol teknis untuk melindungi Data Pribadi. Setiap aplikasi wajib memiliki dasar pemrosesan, tujuan, retensi, pemilik data, dan prosedur hak subjek data yang disetujui instansi.

> **Catatan hukum**: Tim Legal/DPO wajib memvalidasi dasar pemrosesan dan periode retensi untuk setiap domain. Jangan menganggap semua data dapat diproses berdasarkan persetujuan.

---

## Klasifikasi Data

| Klasifikasi | Contoh | Kontrol Minimum |
|-------------|--------|------------------|
| **Publik** | Informasi layanan, alamat kantor | Integritas, availability, accessibility |
| **Internal** | Struktur organisasi, SOP internal | Authenticated access, audit |
| **Pribadi Umum** | Nama, email, jabatan, nomor telepon | Purpose limitation, masking, encryption in transit/at rest |
| **Pribadi Spesifik** | NIK, data kesehatan, biometrik, data anak, agama | Encryption, strict RBAC, field masking, DPIA, access logging |
| **Rahasia Negara/Instansi** | Dokumen berklasifikasi khusus | HSM/Key management, network isolation, need-to-know, approval khusus |

NIK, NIP, data santri/anak, dan data agama **tidak boleh** diperlakukan sebagai data biasa.

---

## Register Pemrosesan Data

Setiap field PII wajib memiliki metadata berikut:

```text
field_name
classification
purpose
legal_basis
controller
processor
retention_period
access_roles
masking_policy
encryption_policy
data_source
```

Simpan register di dokumentasi domain atau data catalog. Review setiap perubahan schema.

---

## Data Minimization & Purpose Limitation

- Ambil field minimum yang diperlukan untuk tujuan layanan.
- Jangan menyalin NIK/NIP ke log, URL, analytics, atau error message.
- Jangan mengembalikan PII penuh jika tampilan hanya membutuhkan sebagian.
- Jangan menggunakan data untuk tujuan baru tanpa review dasar pemrosesan.
- Data export wajib mencatat siapa, kapan, tujuan, dan scope data yang diekspor.

---

## Perlindungan NIK, NIP, dan PII Sensitif

### Penyimpanan

- TLS 1.2+ untuk transit; TLS 1.3 direkomendasikan.
- Enkripsi at-rest menggunakan kemampuan database/storage resmi dan key management terpisah.
- Kunci tidak boleh disimpan di repository atau database yang sama dengan ciphertext.
- Gunakan KMS/HSM instansi untuk production bila tersedia.
- Simpan hash keyed (HMAC) untuk pencarian exact-match bila diperlukan; jangan gunakan hash tanpa key untuk data berisiko.

### Tampilan & API

- Default response: masked (`************1234` atau format yang disetujui DPO).
- PII penuh hanya untuk permission khusus, purpose yang sah, dan access log.
- Jangan menampilkan NIK/NIP penuh di tabel, notifikasi, URL, atau log.
- Export PII wajib re-authentication, MFA untuk privileged user, dan audit event.
- Cache browser/API tidak boleh menyimpan response PII sensitif tanpa kontrol.

### Validasi

- NIK: `/^\d{16}$/`.
- NIP: `/^\d{18}$/`.
- Validasi server-side selalu wajib; validasi client hanya untuk UX.
- Validasi format tidak membuktikan identitas. Verifikasi terhadap sumber resmi dilakukan sesuai kebijakan instansi.

---

## Hak Subjek Data

Aplikasi wajib menyediakan workflow yang disetujui DPO untuk:

1. **Informasi**: tujuan, dasar pemrosesan, kategori data, retensi, penerima.
2. **Akses**: salinan data pribadi yang dapat diverifikasi identitasnya.
3. **Koreksi**: pengajuan koreksi dengan workflow approval dan audit.
4. **Pembatasan/keberatan**: menghentikan pemrosesan bila dasar hukum mengharuskan.
5. **Portabilitas**: export machine-readable jika berlaku.
6. **Penghapusan**: erasure/pemusnahan jika tidak ada kewajiban retensi atau legal hold.

Endpoint contoh (sesuaikan dengan policy instansi):

```text
GET  /v1/me/privacy-notice
POST /v1/me/data-access-requests
POST /v1/me/data-correction-requests
POST /v1/me/data-erasure-requests
GET  /v1/me/data-exports/:id
```

Semua request wajib memiliki identity verification, status workflow, SLA, reviewer, alasan keputusan, dan audit trail.

---

## Soft Delete, Retensi, dan Erasure

Soft delete **bukan** pengganti hak penghapusan. Terapkan tiga keadaan:

1. **Active**: Data aktif dan dapat digunakan sesuai purpose.
2. **Soft-deleted/retained**: Tidak tampil pada operasi normal, tetapi ditahan karena retensi arsip, legal hold, audit, atau kewajiban hukum.
3. **Purged/anonymized**: PII dimusnahkan atau dianonimkan setelah syarat penghapusan terpenuhi.

Purge workflow wajib:

- Memeriksa legal hold dan retention schedule.
- Memisahkan PII dari data agregat yang wajib dipertahankan.
- Menghapus/anonymize database, object storage, cache, search index, dan backup sesuai policy.
- Mencatat bukti penghapusan tanpa menyimpan kembali PII.
- Memakai approval dua pihak untuk data berisiko tinggi.
- Menjalankan cryptographic erasure untuk kunci khusus bila disetujui kebijakan keamanan.

---

## Data Anak & Data Spesifik

- Identifikasi data anak, agama, kesehatan, biometrik, dan data spesifik lainnya sejak desain.
- Terapkan persetujuan wali/landasan hukum yang sesuai jika diwajibkan.
- Batasi role, scope unit kerja, export, dan pencarian.
- Jangan tampilkan data anak pada dashboard publik.
- Lakukan DPIA sebelum fitur production.

---

## Insiden & Pelanggaran Data

- Deteksi, klasifikasi, isolasi, dan preservasi evidence.
- Laporkan ke CSIRT/DPO/Legal segera sesuai incident response plan.
- Penuhi kewajiban notifikasi regulator dan subjek data sesuai ketentuan yang berlaku dan instruksi Legal; jangan hardcode SLA tanpa verifikasi hukum terbaru.
- Rotasi kredensial, kunci, token, dan sesi yang terpapar.
- Dokumentasikan root cause dan corrective action.

---

## Checklist Implementasi

- [ ] Data inventory dan classification lengkap.
- [ ] Legal basis dan retention disetujui DPO.
- [ ] DPIA selesai untuk data berisiko tinggi.
- [ ] NIK/NIP masked by default.
- [ ] Encryption and key management tervalidasi.
- [ ] Data subject request workflow diuji.
- [ ] Soft-delete dan purge workflow terpisah.
- [ ] PII tidak muncul di log/URL/error.
- [ ] Access/export/erasure diaudit.
- [ ] Backup dan replica tercakup kebijakan erasure.
