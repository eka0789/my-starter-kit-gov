# AI Prompt: Integrasi TTE Tersertifikasi PSrE (BSrE/Peruri/Privy)

## Tujuan
Panduan implementasi Tanda Tangan Elektronik Tersertifikasi sesuai UU ITE 11/2008 dan Peraturan BSSN, berdasarkan `.ai/identity-and-signature.md`.

## Pra-syarat (Wajib Konfirmasi Sebelum Mulai)
- [ ] Provider PSrE yang digunakan: BSrE/BSSN | Peruri | Privy | lainnya.
- [ ] Jenis dokumen yang ditandatangani (PDF/XML).
- [ ] Format TTE yang diterapkan (PAdES, XAdES, CAdES).
- [ ] Sertifikat digital sudah diterbitkan oleh PSrE berlisensi.
- [ ] Lingkungan: staging/sandbox atau production.

## Instruksi Implementasi
1. Buat `packages/tte/src/adapters/` dengan interface `TteAdapter`: `requestSign(doc, signerInfo)`, `verifySignature(doc)`, `getStatus(jobId)`, `getSignedDocument(jobId)`.
2. Implementasi `bsre-adapter.ts` (atau provider lain) yang memanggil API PSrE dengan mTLS/auth header.
3. Pastikan hash dokumen dikomputasi sebelum dikirim ke PSrE (jangan kirim dokumen cleartext jika bisa kirim hash).
4. Tangani status: UNSIGNED, PENDING, SIGNED, FAILED, REVOKED.
5. Validasi: certificate chain, CRL/OCSP, audience, timestamp, InResponseTo (SAML) atau state/nonce (OIDC).
6. Webhook/callback: verifikasi signature webhook, idempotency key, simpan `jobId` di DB sebelum redirect.
7. MOCK ONLY untuk unit/integration test. Deteksi `NODE_ENV=production` → fail-fast jika adapter mock aktif.
8. Catat semua event TTE ke `audit_logs`: REQUEST, SIGNED, FAILED, REVOKED.
9. Simpan dokumen yang ditandatangani di storage RI (bukan S3 US/EU tanpa approval).

## Output
- Adapter interface TypeScript.
- Implementasi adapter untuk provider yang dipilih.
- Zod schema untuk request/response.
- Unit test dengan mock adapter.
- Fail-fast guard untuk production.
