# Compliance Baseline (Dasar Kepatuhan Regulasi)

## Tujuan Dokumen

Dokumen ini menetapkan kerangka dasar kepatuhan regulasi pemerintah Indonesia untuk aplikasi yang dibangun menggunakan starter kit ini. Dokumen ini **bukan jaminan kepatuhan otomatis**, melainkan baseline kontrol teknis yang harus divalidasi oleh:

- Tim Legal instansi
- Data Protection Officer (DPO)
- Auditor internal/eksternal (BPK, BPKP, Inspektorat)
- Penasihat Hukum
- Tim Keamanan Informasi/CSIRT instansi

---

## Prinsip Fundamental

1. **Compliance is a Process, Not a Product**: Starter kit menyediakan kontrol teknis, tetapi kepatuhan final bergantung pada implementasi, konfigurasi, operasi, dan validasi konteks instansi.
2. **Risk-Based Approach**: Kontrol disesuaikan dengan klasifikasi data, tingkat risiko, dan profil ancaman instansi.
3. **Shared Responsibility**: Pengembang bertanggung jawab atas kode aplikasi; operator bertanggung jawab atas infrastruktur; DPO bertanggung jawab atas tata kelola data.
4. **Continuous Validation**: Regulasi berubah; kontrol wajib ditinjau berkala.

---

## Matriks Regulasi & Status Kontrol

| Regulasi | Ruang Lingkup | Status Baseline | Validasi Wajib Oleh | Keterangan |
|----------|---------------|-----------------|----------------------|------------|
| **UU PDP No. 27/2022** | Perlindungan data pribadi warga negara Indonesia | ⚠️ **Kontrol Parsial** | DPO, Legal | Lihat `data-protection.md`. Memerlukan penilaian risiko (DPIA), consent management, dan Data Subject Request workflow yang disesuaikan per instansi. |
| **Perpres SPBE No. 95/2018** | Sistem Pemerintahan Berbasis Elektronik | ⚠️ **Kontrol Parsial** | Auditor SPBE, TI instansi | Arsitektur mendukung integrasi SPLP dan SSO nasional; deployment wajib validasi Pusat Data Nasional (PDN). |
| **PP 71/2019** (Penyelenggaraan Sistem dan Transaksi Elektronik) | Kedaulatan data, hosting sistem elektronik publik | 🔴 **Memerlukan Deployment Configuration** | Legal, TI, Auditor | Data warga negara wajib disimpan di wilayah RI. Deployment cloud luar negeri **tidak compliant** tanpa approval khusus. Lihat `deployment-and-supply-chain.md`. |
| **UU ITE (UU 1/2024)** | Tanda Tangan Elektronik (TTE), transaksi elektronik | 🔴 **Memerlukan Integrasi PSrE** | Legal, TI | TTE harus menggunakan Penyelenggara Sertifikasi Elektronik (PSrE) berlisensi BSSN (BSrE, Peruri, Privy, dll). Mock TTE tidak sah secara hukum. Lihat `identity-and-signature.md`. |
| **Perpres 39/2019** (Satu Data Indonesia) | Interoperabilitas data pemerintah | ⚠️ **Kontrol Parsial** | Walidata instansi, DSDI | API wajib menggunakan standar metadata Satu Data Indonesia dan kode referensi resmi (BPS, Kemendagri). Lihat `interoperability.md`. |
| **Peraturan BSSN** (Keamanan Informasi) | Audit trail, keamanan sistem | ⚠️ **Kontrol Parsial** | CSIRT, Auditor | Audit log wajib tamper-evident. Lihat `audit-integrity.md` dan `security.md`. |
| **Standar BPK** (Audit Keuangan & Kinerja) | Audit trail transaksi keuangan/aset negara | ⚠️ **Kontrol Parsial** | Auditor BPK, Internal Audit | Tabel bisnis memiliki 6 kolom audit; audit log append-only. Validasi wajib dilakukan auditor BPK/BPKP. |
| **Permen Kominfo No. 8/2019** (Aksesibilitas Konten Web dan Aplikasi) | Aksesibilitas untuk disabilitas | ⚠️ **Kontrol Parsial** | QA, Accessibility Tester | Baseline WCAG 2.1 Level AA disediakan di template UI. Validasi manual dengan screen reader dan pengguna disabilitas wajib dilakukan. Lihat `accessibility.md`. |
| **UU No. 14/2008** (Keterbukaan Informasi Publik) | Transparansi data publik | 🟢 **Out of Scope Starter Kit** | Legal, Humas | Aplikasi wajib menyediakan mekanisme publikasi informasi sesuai KIP. Implementasi diserahkan ke instansi. |

### Legenda Status

- 🟢 **Kontrol Lengkap**: Baseline sudah mencakup kontrol teknis lengkap.
- ⚠️ **Kontrol Parsial**: Baseline menyediakan fondasi teknis; konfigurasi dan validasi konteks instansi wajib dilakukan.
- 🔴 **Memerlukan Action**: Baseline menyediakan panduan, tetapi integrasi/deployment nyata wajib diselesaikan sebelum production.
- 🔵 **Out of Scope**: Tidak tercakup dalam starter kit teknis; tanggung jawab kebijakan instansi.

---

## Batas Tanggung Jawab Hukum

Starter kit ini menyediakan:
- ✅ Struktur arsitektur yang mendukung kepatuhan.
- ✅ Template kode dengan kontrol keamanan dasar.
- ✅ Dokumentasi standar regulasi.
- ✅ Panduan implementasi teknis.

Starter kit ini **TIDAK** menyediakan:
- ❌ Jaminan kepatuhan hukum tanpa validasi instansi.
- ❌ Penilaian Dampak Perlindungan Data (DPIA) yang sudah jadi.
- ❌ Sertifikat compliance dari auditor/regulator.
- ❌ Legal opinion atas penggunaan starter kit.
- ❌ Integrasi otomatis dengan sistem legacy instansi.

**Rekomendasi**: Sebelum deployment production, lakukan:
1. Data Protection Impact Assessment (DPIA) sesuai UU PDP.
2. Audit keamanan informasi oleh CSIRT/pihak ketiga.
3. Penetration testing.
4. Legal review atas mekanisme consent, retensi data, dan TTE.
5. Validasi compliance SPBE oleh auditor SPBE.

---

## Audit Evidence & Checklist

Untuk setiap kontrol yang diklaim, siapkan bukti audit:

| Kontrol | Bukti Audit yang Diperlukan |
|---------|------------------------------|
| Data residency (PP 71/2019) | Sertifikat data center PDN, kontrak hosting, log deployment |
| Audit trail integrity | Export log audit dengan hash chain verification, policy database role, bukti log immutability test |
| TTE compliance (UU ITE) | Kontrak PSrE, certificate chain, log signing activity, sample signed document |
| UU PDP compliance | Dokumen DPIA, register pemrosesan data, consent workflow, data subject request log, breach notification procedure |
| WCAG 2.1 AA | Lighthouse/axe audit report, manual screen reader test report, remediation log |
| Satu Data compliance | Mapping metadata ke standar SDI, approval walidata, integrasi SPLP |
| SBOM & supply chain | `sbom.json` dari setiap release, dependency vulnerability scan, license compliance report |

---

## Timeline Review

- **Setiap Release**: Security scan, dependency audit, SBOM generation.
- **Setiap 6 Bulan**: Review perubahan regulasi, update kontrol.
- **Setiap 12 Bulan**: Audit keamanan eksternal, penetration test, compliance review.
- **Setiap Insiden**: Root cause analysis, kontrol remediasi, notifikasi sesuai UU PDP (jika melibatkan data pribadi).

---

## Kontak & Eskalasi

Jika menemukan gap compliance atau pertanyaan regulasi:
1. Eskalasi ke DPO instansi.
2. Konsultasi dengan legal counsel.
3. Laporkan ke CSIRT instansi jika terkait keamanan.
4. Dokumentasikan keputusan di `agent-memory.md`.

---

**Versi Dokumen**: 1.0.0  
**Tanggal**: 2026-10-06  
**Status**: Baseline - Memerlukan Validasi Instansi
