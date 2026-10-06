# AI Prompt: Integrasi SSO Nasional (INA Digital / Keycloak OIDC / SAML2)

## Tujuan
Panduan implementasi SSO produksi untuk portal pemerintah sesuai `.ai/identity-and-signature.md`.

## Pra-syarat (Wajib Konfirmasi Sebelum Mulai)
- [ ] Provider SSO: INA Digital (OIDC) | Keycloak (OIDC) | AD FS (SAML2) | lainnya.
- [ ] Protokol: OIDC Authorization Code + PKCE | SAML2.
- [ ] Client ID, redirect URI, scopes sudah terdaftar.
- [ ] Lingkungan: staging atau production.

## Instruksi Implementasi (OIDC)
1. Buat `packages/identity/src/adapters/oidc-adapter.ts` dengan interface `IdentityAdapter`: `authorize(redirectUri)`, `handleCallback(code, state)`, `verifyToken(token)`, `refreshToken(refreshToken)`, `logout(token)`.
2. PKCE wajib: generate `codeVerifier` (random 43-128 char), hash → `codeChallenge` (SHA256 base64url), kirim `code_challenge` + `code_challenge_method=S256` saat authorize.
3. State wajib: generate random state, simpan ke session, validasi saat callback untuk cegah CSRF.
4. Token validation: verify `iss`, `aud`, `exp`, `iat`, signature (JWK/JWKS), claims (`sub`, `email`, `name`, `roles`).
5. Refresh token: simpan refresh token secure (httpOnly cookie atau encrypted storage), panggil `/token` dengan `grant_type=refresh_token`.
6. Logout: panggil `/logout` endpoint dengan `id_token_hint` + `post_logout_redirect_uri`.
7. MOCK ONLY untuk unit test. `NODE_ENV=production` dengan adapter local/mock → fail-fast.
8. Catat event auth ke `audit_logs`: LOGIN, LOGOUT, TOKEN_REFRESH, FAILED_LOGIN.

## Instruksi Implementasi (SAML2)
1. Metadata exchange: download IdP metadata XML, upload SP metadata XML ke IdP.
2. AuthnRequest: sign dengan SP private key, POST/Redirect binding, `ForceAuthn=false`, `IsPassive=false`.
3. Response validation: signature (XMLDSig), `Destination`, `InResponseTo`, `NotBefore`, `NotOnOrAfter`, `Audience`.
4. Attribute mapping: map SAML attributes (`uid`, `email`, `displayName`, `groups`) ke user profile.
5. Logout: `LogoutRequest` SAML dengan `NameID` dan `SessionIndex`.

## Output
- Adapter interface TypeScript.
- Implementasi OIDC atau SAML2.
- Middleware Hono untuk protect routes.
- Unit test dengan mock.
- Fail-fast guard production.
