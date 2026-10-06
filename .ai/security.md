# Security Standards & Guidelines

## Core Principles

1. **Never Trust Client Input**: Validasi server-side menggunakan Zod.
2. **Zero Trust Architecture**: Setiap permintaan API wajib diautentikasi dan diverifikasi hak aksesnya.
3. **Data Protection & Compliance**: Baseline kontrol mengikuti `compliance-baseline.md`, `data-protection.md`, `audit-integrity.md`, dan `identity-and-signature.md`.
4. **Fail-Closed**: Jika autentikasi, otorisasi, atau audit logging gagal, operasi mutasi **dibatalkan**.

---

## Authentication & Session

- Gunakan adapter identity (`packages/identity`), bukan vendor lock-in.
- Production: OIDC Authorization Code + PKCE atau SAML2 resmi.
- Simpan token di HTTP-Only Secure Cookies atau session server-side. **Dilarang** `localStorage`.
- Token JWT kedaluwarsa ketat; refresh token rotation + reuse detection.
- MFA wajib untuk privileged role.
- Akun lokal/break-glass hanya untuk bootstrap/darurat, time-boxed, dual-control, dan diaudit.

---

## Role-Based Access Control (RBAC) & Scope

- Permission granular (`pegawai.read`, `pegawai.create`, `pegawai.export`).
- Data scoping berdasarkan hierarki unit kerja dan klasifikasi data.
- Check permission **sebelum** menjalankan service logic.
- Super Admin tidak otomatis memiliki akses ke semua PII.
- Impersonation/break-glass: wajib alasan, durasi, dual control, dan audit.

---

## Data Sanitization & Protection

- Sanitasi seluruh string input untuk mencegah XSS.
- Drizzle ORM menyusun parameterized queries secara otomatis.
- **Jika raw SQL diperlukan** (hanya jika benar-benar tidak bisa dengan ORM):
  - Gunakan `sql` tagged template dari Drizzle (`sql\`SELECT ... WHERE id = ${id}\``) — **jangan** interpolasi string biasa.
  - Jangan concat user input ke query.
  - Dokumentasikan alasan raw SQL di komentar.
- Dilarang menyimpan kata sandi plain text. Hashing ditangani identity provider.
- PII (NIK, NIP, email, alamat) **tidak boleh** muncul di log, URL, error, atau analytics.

---

## Secret & Key Management

- Dilarang keras menaruh API Key, Secret Key, atau Password di kode sumber.
- Gunakan `.env` untuk development (didaftarkan ke `.gitignore`).
- Production: Secret Manager (Vault, KMS, environment secret CI/CD).
- Rotation secret terjadwal; aplikasi mendukung reload tanpa downtime.
- Kunci HMAC audit trail terpisah dari database.

---

## Audit Logging & Non-Repudiation

- Catat seluruh transaksi penting (Login, Perubahan Akses, TTE, Disposisi Surat, Hapus Data, Export PII) ke tabel `audit_logs`.
- Log mencatat: `actor_id`, `ip_address`, `action`, `resource`, `old_value_hash`, `new_value_hash`, `timestamp`, `request_id`.
- `audit_logs` adalah **append-only**: role aplikasi hanya boleh `INSERT` dan `SELECT`.
- HMAC hash chain untuk deteksi tampering (lihat `audit-integrity.md`).
- Fail-closed: jika penulisan audit gagal, operasi mutasi dibatalkan.

---

## Error & Information Leak Prevention

- Dilarang mengembalikan stack trace, raw SQL error, atau detail internal server kepada client.
- Tampilkan pesan error yang umum bagi client, dan catat detail error sesungguhnya ke server log (tanpa PII).
- HTTP 500 tidak boleh berisi informasi sistem.

---

## Security Headers (Wajib)

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), camera=(), microphone=()
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

---

## Rate Limiting & Anti-Abuse

- Login: 5 attempt / 15 menit per IP + username.
- API publik: 100 request / menit per IP.
- API authenticated: 1000 request / menit per user.
- Sensitive operation (export, TTE, data subject request): 10 request / jam per user.

---

## Checklist

- [ ] Identity adapter terkonfigurasi (OIDC/SAML2 production).
- [ ] Token tidak disimpan di `localStorage`.
- [ ] MFA aktif untuk privileged role.
- [ ] RBAC granular + data scoping diterapkan.
- [ ] Query parameterized (tidak ada interpolasi string).
- [ ] Secret di secret manager, bukan hardcoded.
- [ ] `audit_logs` append-only + HMAC chain.
- [ ] Fail-closed jika audit logging gagal.
- [ ] Error tidak leak SQL/stack/PII.
- [ ] Security headers terpasang.
- [ ] Rate limiting aktif.
