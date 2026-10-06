# Project Overview

## Enterprise Government Starter Kit (`my-starter-kit-gov`)

Starter Kit ini dirancang khusus untuk membangun aplikasi instansi pemerintah (Kementerian, Lembaga, Pemerintah Daerah) yang aman, terstruktur, dan memiliki **baseline kontrol teknis** untuk mendukung kepatuhan SPBE (Sistem Pemerintahan Berbasis Elektronik).

---

## Tujuan

Membangun aplikasi tingkat enterprise yang terukur dan aman menggunakan teknologi modern, namun tetap mempertahankan kesederhanaan arsitektur sehingga mudah dikembangkan dan dipelihara oleh tim maupun solo developer.

---

## Core Principles

1. **Simplicity Over Complexity**: Arsitektur jelas tanpa abstraksi berlebihan.
2. **Convention Over Configuration**: Struktur folder dan penamaan baku yang konsisten.
3. **AI-Friendly Architecture**: Instruksi `.ai` dirancang agar AI Coding Assistant bekerja dengan presisi dan konsistensi.
4. **Feature-First / Vertical Slice**: Setiap fitur otonom: UI, API, Schema, Hooks, Logic tersendiri.
5. **Baseline Security by Default**: Kontrol keamanan BSSN/OWASP, audit trail BPK, dan RBAC tersedia sejak awal.
6. **Adapter-based Externals**: SSO, TTE, storage, dan hosting dapat diganti tanpa mengubah logic bisnis.
7. **Accessible by Default**: WCAG 2.1 AA adalah standar minimum, bukan opsional.
8. **Privacy by Design**: Data pribadi diminimalkan, dilindungi, dan subjek data memiliki hak nyata.
9. **Maintainable**: Kode dapat dipahami oleh pengembang baru dalam satu hari.
10. **Strong Type Safety**: Zero `any`, validasi penuh dari database hingga UI.

---

## Guiding Rule

Setiap kode yang dihasilkan AI maupun developer manusia harus:
- Menyatakan asumsi yang dibuat.
- Mengidentifikasi data sensitif yang diproses.
- Menerapkan RBAC dan data scoping.
- Mencatat audit event untuk mutasi.
- Memenuhi aksesibilitas WCAG 2.1 AA.
- Tidak mengklaim compliance regulasi tanpa bukti audit.

Jangan memasukkan abstraksi, dependensi, atau vendor lock-in yang tidak diperlukan.
