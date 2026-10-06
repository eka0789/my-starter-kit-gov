# AI Prompt: Audit Kepatuhan UU PDP 27/2022

## Tujuan
Audit satu fitur, modul, atau pull request terhadap UU PDP 27/2022 dan `.ai/data-protection.md`.

## Instruksi
1. Inventaris semua data yang diproses. Klasifikasikan: Publik, Internal, Pribadi Umum, Pribadi Spesifik, Rahasia.
2. Identifikasi subjek data, tujuan pemrosesan, dasar hukum/consent, sumber data, penerima data, lokasi penyimpanan, retensi, dan transfer lintas batas.
3. Periksa NIK/NIP: enkripsi at-rest dengan KMS/HSM terpisah, masking default (`****1234`), akses penuh hanya dengan permission + purpose + audit.
4. Periksa data anak (<18): consent wali, DPIA wajib, akses terbatas, tidak tampil di dashboard publik.
5. Periksa hak subjek data: access, correction, restriction, portability, erasure. Pastikan soft-delete tidak dianggap sebagai penghapusan hukum.
6. Periksa purge workflow: legal hold → retensi → approval DPO → hapus/anonymize DB, storage, cache, backup → audit.
7. Periksa incident response: deteksi, containment, bukti, notifikasi regulator/subjek sesuai batas waktu kebijakan.
8. Pastikan PII tidak masuk URL, log, error message, analytics, atau telemetry.

## Output Wajib
- Data inventory table.
- Temuan Critical/High/Medium/Low dengan file dan line.
- Status PASS/FAIL per kontrol.
- Remediasi kode minimum siap pakai.
- Bukti audit yang harus disimpan.
- Disclaimer: baseline teknis, bukan opini hukum atau jaminan compliance otomatis.
