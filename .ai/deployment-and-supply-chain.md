# Deployment & Supply Chain Security

## Tujuan

Menetapkan standar deployment aplikasi pemerintah sesuai regulasi kedaulatan data (PP 71/2019), keamanan supply chain, dan pengelolaan lisensi perangkat lunak.

---

## Profil Deployment

### 1. `pdn-managed` — Pusat Data Nasional (Wajib Utama)
**Gunakan untuk**: Sistem yang mengolah data pribadi warga, transaksi pemerintah, dan data berklasifikasi.

- Infrastruktur: PDN atau fasilitas yang tersertifikasi Kominfo/PDN sesuai ketentuan berlaku.
- Koneksi: Jaringan Intra Pemerintah (GSN/MPLS instansi).
- Database: PostgreSQL on-premise atau database termanaged di infrastruktur PDN.
- Auth: SSO instansi atau INA Digital (OIDC).
- TIDAK menggunakan: Vercel, Cloudflare Workers (yang rutekan data ke server luar RI), atau SaaS US/EU lainnya.

> Verifikasi status PDN dan syarat hosting dengan legal dan TI instansi sebelum deployment.

### 2. `on-premise` — Server Instansi
**Gunakan untuk**: Sistem intranet, sistem kepegawaian, dan sistem yang data center-nya sudah ada di instansi.

- Docker Compose atau Kubernetes on-premise.
- PostgreSQL on-premise dengan PgBouncer untuk connection pooling.
- Nginx/Caddy sebagai reverse proxy + TLS termination.
- Auth: Keycloak on-premise atau SSO LDAP/AD instansi.
- TTE: BSrE API melalui jaringan pemerintah.

### 3. `approved-private-cloud` — Cloud Sovereign (Kondisional)
**Gunakan untuk**: Instansi yang memiliki persetujuan khusus dari legal untuk hosting cloud.

- Cloud provider harus memiliki data center beroperasi di wilayah RI.
- Data perjanjian, SLA, enkripsi, dan data sovereignty tersertifikasi.
- Kontrak hosting mencakup klausul SPBE dan UU PDP.
- Wajib verifikasi hukum per instansi.

### 4. `development` — Development & CI/CD
**Gunakan untuk**: Developer lokal dan pipeline CI. **TIDAK untuk production.**

- Docker Compose dengan PostgreSQL lokal.
- Auth mock/sandbox.
- Supabase lokal (docker) atau PostgreSQL lokal.
- Secret menggunakan `.env.local` yang tidak di-commit.

---

## Arsitektur Jaringan

### DMZ & Network Tier

```text
Internet
   │
   ▼
[WAF / Anti-DDoS]
   │
   ▼
[DMZ: Reverse Proxy / API Gateway]  ──── [Monitoring / Log Collector]
   │
   ▼
[App Tier: Aplikasi / API]  ──────────── [Auth / SSO]
   │
   ▼
[DB Tier: PostgreSQL + PgBouncer]  ───── [Backup / Replica]
   │
   ▼
[Storage Tier: Object Storage / Archive]
```

- Tiap tier berada di network segment terpisah.
- App Tier tidak boleh diakses langsung dari Internet.
- DB Tier tidak menerima koneksi kecuali dari App Tier.
- Admin/maintenance melalui bastion host, tidak langsung ke DB.
- Firewall whitelist berbasis IP, bukan blacklist.

---

## SBOM, SAST, dan Dependency Security

Setiap release wajib:

1. **SBOM**: Generate `sbom.json` menggunakan tool seperti `cyclonedx-bom` atau `syft`. Simpan di artefak release.
2. **Dependency Scan**: `pnpm audit --audit-level=high`. Temuan high/critical harus diselesaikan sebelum deployment.
3. **SAST**: Jalankan ESLint, Semgrep, atau alat SAST lain. Temuan high/critical diblokir di CI.
4. **Secret Scan**: Jalankan `gitleaks` atau `trufflehog` pada setiap commit dan PR.
5. **Container Scan**: Jika menggunakan Docker, scan image dengan Trivy atau Grype sebelum deployment.
6. **Image Signing**: Tanda tangani image production menggunakan Cosign atau mekanisme registri resmi.

---

## Lisensi Perangkat Lunak

- Tentukan lisensi eksplisit di file `LICENSE` di root repository.
- Lisensi default rekomendasi: MIT atau Apache 2.0 untuk open-source pemerintah.
- Daftarkan kode yang merupakan Barang Milik Negara (BMN) ke LKPP sesuai peraturan.
- Periksa lisensi semua dependensi kompatibel dengan lisensi pilihan menggunakan `license-checker` atau SBOM tooling.
- Dependensi berlisensi GPL/AGPL perlu review legal sebelum digunakan di produk pemerintah.

---

## CI/CD Pipeline Minimum

```yaml
# .github/workflows/ci.yml (contoh — sesuaikan dengan platform CI instansi)
stages:
  - secret-scan       # gitleaks, trufflehog
  - lint              # eslint, tsc
  - sast              # semgrep, codeql
  - test              # vitest, playwright
  - build             # turbo build
  - dependency-audit  # pnpm audit
  - sbom              # cyclonedx
  - container-scan    # trivy (jika Docker)
  - deploy-staging
  - integration-test
  - deploy-production # wajib approval gated
```

- Deployment ke production wajib approval minimal dua pihak.
- Rollback prosedur terdokumentasi dan diuji.

---

## Environment & Secret

- Secret hanya di secret manager (Vault, KMS, environment secret CI/CD).
- `.env` hanya untuk development lokal; `.env.example` tanpa nilai sensitif di-commit.
- Rotation secret terjadwal; aplikasi mendukung reload tanpa downtime.
- Jangan pernah log secret, key, atau token.

---

## Backup & Disaster Recovery

- RPO (Recovery Point Objective) dan RTO (Recovery Time Objective) ditetapkan per sistem, didokumentasikan, dan diuji.
- Backup terenkripsi, disimpan di lokasi terpisah dari production.
- Backup mencakup: database dump, object storage, config, kunci enkripsi (terpisah dan aman), dan secret reference.
- Restore drill wajib minimal dua kali per tahun.

---

## Checklist

- [ ] `LICENSE` ada di root repository.
- [ ] SBOM di-generate setiap release.
- [ ] `pnpm audit` tanpa high/critical.
- [ ] Secret scan lulus.
- [ ] SAST lulus tanpa high/critical.
- [ ] Container image di-scan.
- [ ] Production deployment gated approval.
- [ ] Data center berada di wilayah RI (untuk data warga negara).
- [ ] Backup dan restore drill terdokumentasi.
- [ ] RTO/RPO ditetapkan dan diuji.
