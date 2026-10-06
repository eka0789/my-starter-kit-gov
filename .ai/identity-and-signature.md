# Identity, SSO, dan Tanda Tangan Elektronik

## Tujuan

Menetapkan pola identitas, otentikasi, otorisasi, dan TTE resmi. Production tidak boleh bergantung pada mock token, password hardcoded, atau SSO yang tidak tervalidasi.

---

## Prinsip Identitas

- Zero Trust: setiap request diverifikasi.
- Least Privilege: permission granular, bukan role global semata.
- Official Identity First: SSO instansi/INA Digital/OIDC resmi lebih diutamakan daripada akun lokal.
- MFA wajib untuk privileged role (`SUPER_ADMIN`, `ADMIN_INSTANSI`, `PIMPINAN`, operator TTE, DPO).
- Akun lokal hanya untuk bootstrap, disaster recovery, atau break-glass dengan audit ketat.
- Session harus dapat dicabut; token yang dicuri harus bisa direvoke.

---

## Adapter Identitas

Jangan ikat aplikasi ke satu vendor. Gunakan interface:

```text
IdentityProvider
  authenticate(request)
  getUser(subject)
  listRoles(subject)
  revokeSession(sessionId)
  validateToken(token)
```

Implementasi yang didukung:

| Profile | Penggunaan | Catatan |
|---------|------------|---------|
| `oidc-official` | Production instansi | Authorization Code + PKCE, issuer allowlist, JWKS rotation |
| `saml2-official` | Integrasi IdP yang mensyaratkan SAML | Validasi metadata, ACS, audience, clock skew |
| `development-local` | Development/test | Tidak boleh aktif di production |
| `break-glass` | Darurat | MFA, time-boxed, dual control, audit penuh |

Supabase Auth, Keycloak, atau IdP lain hanya implementasi adapter. Aplikasi memakai `packages/identity`.

---

## OIDC Wajib

- Authorization Code Flow + PKCE.
- Validasi `iss`, `aud`, `exp`, `nbf`, `iat`, `nonce`, `azp` bila ada.
- Fetch JWKS dari issuer resmi; cache dengan TTL dan key rotation.
- State dan nonce wajib; tolak replay.
- Clock skew maksimum 60 detik, NTP wajib.
- Redirect URI allowlist, tidak boleh wildcard di production.
- Refresh token rotation; reuse detection wajib mencabut session.
- Logout harus mencabut session aplikasi dan, bila tersedia, session IdP.

Mapping claim:

```text
sub -> user_id
preferred_username/email -> login
name -> display_name
org_unit / custom claim -> unit_kerja_id
roles/groups -> RBAC roles
acr/amr -> MFA evidence
```

---

## SAML2 Wajib

- Validasi signature metadata, certificate, audience, InResponseTo, NotOnOrAfter.
- Tolak assertion unsigned atau signed dengan issuer tidak dikenal.
- ACS URL hanya endpoint resmi.
- Attribute mapping didokumentasikan dan ditinjau Legal/IAM.

---

## Session, Token, RBAC

- Access token pendek; session server-side atau encrypted cookie `HttpOnly; Secure; SameSite=Lax/Strict`.
- Jangan simpan token di `localStorage`.
- Permission contoh: `surat.read`, `surat.approve`, `pegawai.export`, `privacy.request.review`.
- Data scoping berdasarkan unit kerja, hierarki jabatan, dan klasifikasi dokumen.
- Privilege elevation (impersonation, break-glass) wajib alasan, durasi, dual control, dan audit.

---

## Tanda Tangan Elektronik (TTE)

Naskah dinas resmi, SK, dan dokumen yang membutuhkan kekuatan hukum wajib memakai TTE tersertifikasi dari PSrE berlisensi.

### Adapter TTE

```text
SignatureProvider
  prepareHash(document)
  requestSign(payload)
  verify(document, evidence)
  getCertificateStatus(serial)
```

Status dokumen:

```text
UNSIGNED
PENDING
SIGNED
FAILED
REVOKED
```

### Kontrol Wajib

- Hash dokumen sebelum signing; simpan hash, algorithm, dan evidence.
- Validasi certificate chain, revocation (CRL/OCSP sesuai provider), dan masa berlaku.
- Timestamp resmi bila disyaratkan PSrE.
- Webhook/callback wajib signature verification, idempotency, dan replay protection.
- Retry tidak boleh menghasilkan tanda tangan ganda tanpa deteksi.
- Fake/mock provider **hanya** untuk unit/integration test. Flag production yang mengaktifkan mock adalah defect blocker.
- Verifikasi tanda tangan sebelum distribusi naskah.
- Simpan bukti: request_id, signer_id, certificate serial, provider, signed_at, hash, status.

---

## Endpoint Minimum

```text
GET  /v1/auth/login
GET  /v1/auth/callback
POST /v1/auth/logout
GET  /v1/auth/session
POST /v1/signatures
GET  /v1/signatures/:id
POST /v1/signatures/:id/webhook
GET  /v1/signatures/:id/verify
```

---

## Checklist

- [ ] Production memakai OIDC/SAML resmi, bukan mock.
- [ ] Issuer, audience, redirect URI, dan JWKS tervalidasi.
- [ ] MFA aktif untuk privileged role.
- [ ] Token tidak disimpan di localStorage.
- [ ] Session revocation diuji.
- [ ] TTE memakai PSrE berlisensi.
- [ ] Mock TTE tidak dapat diaktifkan di production.
- [ ] Evidence signing tersimpan dan dapat diverifikasi.
- [ ] Break-glass time-boxed dan diaudit.
