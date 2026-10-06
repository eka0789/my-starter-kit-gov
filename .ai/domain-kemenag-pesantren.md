# Domain Context: E-Government Kemenag (Direktorat Pendidikan Diniyah & Pondok Pesantren)

## Profil Domain & Instansi

- **Instansi**: Kementerian Agama RI (Kemenag)
- **Unit Kerja**: Direktorat Jenderal Pendidikan Islam (Ditjen Pendis) / Direktorat PD Pontren
- **Tujuan Aplikasi**: Sistem Informasi Manajemen & Layanan Digital Pesantren (SIMBA / IJOP / Data Santri & Kiyai)

---

## Aturan Bisnis & Entitas Domain Kemenag Pesantren

### 1. Nomor Statistik Pesantren (NSP)

- NSP adalah 12-digit angka unik pengenal pesantren terdaftar resmi Kemenag.
- Format NSP: `[Kode_Prov 2d][Kode_KabKota 2d][Kode_Tipe 2d][No_Urut 6d]` (contoh: `320101000123`).
- **Kode Provinsi & Kab/Kota menggunakan kode referensi resmi BPS/Kemendagri** (bukan kode internal yang divergensi).
- Regex Validasi Zod: `/^\d{12}$/`.
- NSP bersifat `UNIQUE` dan menjadi kunci relasi data santri, ustadz, dan bantuan.

### 2. Izin Operasional Pesantren (IJOP)

**Alur Pelayanan (Workflow)**:

1. `PENGAJUAN`: Pengurus Yayasan/Pesantren mengunggah berkas syarat (Akta Yayasan, SK Kemenkumham, rekomendasi KUA/PCNU/PD Muhammadiyah, daftar 15 santri mukim).
2. `VERIFIKASI_ADMIN`: Kemenag Kab/Kota memeriksa keabsahan dokumen.
3. `VERIFIKASI_LAPANGAN`: Tim verifikator melakukan peninjauan fisik pesantren.
4. `REKOMENDASI_KANWIL`: Kanwil Kemenag Provinsi menerbitkan surat rekomendasi.
5. `PENERBITAN_SK`: Terbit SK Dirjen Pendis & Nomor Statistik Pesantren (NSP).

**Status IJOP**: `DRAFT` ➔ `SUBMITTED` ➔ `VERIF_DOKUMEN` ➔ `VERIF_LAPANGAN` ➔ `RECOMMENDED` ➔ `APPROVED` / `REJECTED`.

**Tanda Tangan SK**: SK Dirjen wajib ditandatangani menggunakan **TTE Tersertifikasi PSrE berlisensi BSSN**. Mock token tidak sah secara hukum.

### 3. Tipe Satuan Pendidikan Pesantren

- `SALAFIYAH`: Pesantren pengajian kitab kuning murni.
- `MUADALAH`: Pesantren kesetaraan (Ula, Wustha, Ulya).
- `PDF`: Pendidikan Diniyah Formal.
- `KOMBUN`: Pesantren yang menyelenggarakan sekolah umum (SD/SMP/SMA/SMK/Madrasah).

### 4. Entitas Utama Database

1. `pesantren`: Master data lembaga (NSP, Nama, Pengasuh/Kiyai, Alamat, Kode Wilayah BPS, Ormas affiliation, Koordinat GPS).
2. `ijop_applications`: Pengajuan izin operasional, dokumen persyarat, & log verifikasi.
3. `santri`: Master data santri (NISN, NIK terenkripsi, Nama, Status Mukim/Non-Mukim, Orangtua/Wali).
4. `ustadz`: Master data pengajar (NIP/NPU, NIK terenkripsi, Keahlian Kitab, Sertifikasi).
5. `bantuan_submissions`: Pengajuan bantuan sarpras & insentif pengajar.

---

## Perlindungan Data Santri & Anak (UU PDP + UU Perlindungan Anak)

- Santri umumnya di bawah 18 tahun → **data anak** (pribadi spesifik).
- NIK santri wajib terenkripsi at-rest (pgcrypto/KMS) dan masked di UI/API.
- Persetujuan wali/ortu wajib untuk pengumpulan data santri; catat consent log.
- Data anak tidak boleh diekspos di dashboard publik atau analytics.
- DPIA wajib dilakukan sebelum fitur data santri production.
- Retensi data santri mengikuti kebijakan arsip dinas + UU PDP; purge workflow wajib.

---

## Koordinat GPS Pesantren

- Koordinat wajib validasi batas wilayah RI (tidak boleh di laut/middle of nowhere).
- Koordinat disimpan sebagai `POINT` PostGIS dengan SRID 4326 (WGS84).
- Validasi: koordinat harus berada di dalam batas administrasi provinsi/kabupaten yang dicantumkan.

---

## Peran User (RBAC Kemenag)

| Role | Scope | Catatan |
|------|-------|---------|
| `SUPER_ADMIN_KEMENAG` | Pusat Ditjen Pendis | Konfigurasi sistem, tidak akses bebas PII |
| `VERIFIKATOR_KABKOTA` | Unit Kab/Kota | Verifikasi dokumen |
| `TIM_LAPANGAN` | Area tugas | Verifikasi fisik, GPS photo |
| `KANWIL_PROVINSI` | Provinsi | Rekomendasi SK |
| `OPERATOR_PESANTREN` | Pesantren terkait | Data santri, IJOP |
| `DPO` | Instansi | Review privacy request |

---

## Checklist Domain Khusus

- [ ] NSP menggunakan kode wilayah BPS/Kemendagri resmi.
- [ ] Data santri (data anak) terenkripsi, masked, consent logged.
- [ ] DPIA selesai sebelum production.
- [ ] SK IJOP ditandatangani TTE PSrE berlisensi.
- [ ] Koordinat GPS divalidasi batas wilayah RI.
- [ ] RBAC unit kerja wajib (tidak lihat data pesantren Kab/Kota lain).
- [ ] Audit trail 6 kolom + audit_logs append-only diterapkan.