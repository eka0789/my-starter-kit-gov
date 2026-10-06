# AI Prompt: Debug & Fix System Issue

## Context & Purpose
Gunakan prompt mefokus ini untuk menganalisis, mendiagnosis, dan menyelesaikan bug atau error sistematis secara efektif sampai tuntas tanpa merusak bagian kode lain.

---

## 🤖 AI Instructions

Saat mengeksekusi debugging dan pemulihan bug, lakukan langkah-langkah berikut:

### Step 1: Analisis Gejala & Error Log
Minta atau kumpulkan detail:
- Pesan kesalahan (Error message & stack trace).
- Langkah-langkah mereproduksi bug (*steps to reproduce*).
- Berkas/komponen yang dicurigai.

### Step 2: Identifikasi Penyebab Utama (Root Cause Analysis)
Tentukan akar masalah:
- Apakah kegagalan validasi Zod (payload mismatch)?
- Apakah masalah autentikasi/permission token/session?
- Apakah kesalahan query Drizzle ORM / constraint database?
- Apakah masalah state re-render atau null-pointer di React?

### Step 3: Susun Rencana Perbaikan Minimal (Minimal Invasive Fix)
Rencanakan solusi perbaikan yang paling efisien tanpa merUbah arsitektur secara drastis.

### Step 4: Eksekusi Perbaikan Kode
Perbaiki kode dengan menyertakan komentar penjelas di tempat terjadinya bug.

### Step 5: Verifikasi & Pencegahan (Regression Prevention)
Jelaskan mengapa perbaikan tersebut menyelesaikan akar masalah dan berikan saran pengujian unit test agar bug tidak terulang di masa mendatang.
