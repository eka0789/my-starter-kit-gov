# AI Prompt: Audit Kepatuhan SPBE, BSSN, PP 71/2019, Satu Data

## Tujuan
Audit fitur/modul terhadap `.ai/compliance-baseline.md`, `.ai/deployment-and-supply-chain.md`, `.ai/audit-integrity.md`, dan `.ai/interoperability.md`.

## Instruksi
1. Tentukan deployment profile: `pdn-managed`, `on-premise`, `approved-private-cloud`, atau `development`.
2. Periksa kedaulatan data: data publik tidak boleh disimpan/dirutekan ke Vercel/Cloudflare/SaaS luar RI tanpa dasar hukum.
3. Periksa 6 kolom audit: `created_at`, `updated_at`, `deleted_at`, `created_by` NOT NULL, `updated_by` NOT NULL, `deleted_by`.
4. Periksa `audit_logs` append-only: INSERT/SELECT saja, trigger immutability, HMAC chain, fail-closed.
5. Periksa identity: production OIDC Authorization Code + PKCE atau SAML2. Local/mock hanya development/test.
6. Periksa TTE: PSrE berlisensi (BSrE/Peruri/Privy). Mock TTE aktif di `NODE_ENV=production` adalah blocker.
7. Periksa kode referensi: BPS/Kemendagri, bukan kode internal wilayah.
8. Periksa SDI metadata, OpenAPI, idempotency, timeout, retry, circuit breaker, mTLS jika SPLP.
9. Periksa SBOM, `pnpm audit --audit-level=high`, gitleaks, SAST, container scan, LICENSE, dan BMN jika relevan.

## Output Wajib
- Matriks kontrol: Regulasi | Kontrol | Status | Bukti | Gap.
- Temuan blocker vs residual risk.
- Perbaikan konkret.
- Jangan klaim "sudah memenuhi semua regulasi pemerintah".
