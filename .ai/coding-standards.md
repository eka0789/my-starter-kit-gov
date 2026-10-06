# Coding Standards & Guidelines

## 🌟 Quality Principles

- Tulis kode yang bersih, mudah dibaca, dan mudah dipahami.
- Hindari optimasi dini (*No premature optimization*).
- Utamakan kejelasan dibanding trik pemograman yang rumit.

---

## 🚫 Absolute Prohibition Rules (Larangan Mutlak)

1. **Dilarang menggunakan `any`**: Selalu tentukan tipe data yang presisi atau gunakan `unknown` dengan type-guard.
2. **Dilarang menggunakan Magic Strings/Numbers**: Gunakan `enum` atau `const` object bertipe union.
3. **Dilarang ada kode duplikat (DRY)**: Abstraksi kode yang dipakai berulang ke dalam utility function.
4. **Dilarang menyisakan Dead Code / Unused Imports**: Bersihkan variabel dan berkas yang tidak lagi digunakan.
5. **Dilarang menyisakan kode yang di-comment**: Hapus kode mati; gunakan riwayat Git jika butuh mereferensi.
6. **Dilarang menyisakan komentar `TODO` / `FIXME`**: Selesaikan seluruh logika sebelum menyatakan pekerjaan tuntas.

---

## ✅ Mandatory Coding Practices (Praktik Wajib)

1. **Type Safety**: Manfaatkan TypeScript strict mode sepenuhnya. Dilarang menonaktifkan ts-check (`// @ts-ignore` dilarang).
2. **Fungsi Kecil & Fokus**: Setiap fungsi maksimal 50 baris kode dan hanya memiliki satu tanggung jawab (Single Responsibility Principle).
3. **Komponen UI Ringkas**: Komponen React maksimal 300 baris kode. Pecah komponen besar menjadi sub-komponen.
4. **Early Return Pattern**: Gunakan pola early return untuk mengurangi pencabangan percabangan bertingkat (*nested IF*).
5. **Validation with Zod**: Validasi seluruh input data di batas sistem (API request, form input, environment variables) menggunakan Zod schema.
6. **Async/Await**: Selalu gunakan `async/await` alih-alih raw Promise `.then().catch()`.
7. **Error Handling**: Gunakan `try-catch` dengan penanganan spesifik dan error logger terpusat.
8. **Dokumentasi Kode Komposisi Bisnis**: Jelaskan aturan bisnis pemerintah yang kompleks menggunakan komentar bahasa Indonesia yang jelas.

---

## 📐 Naming Conventions

- **File & Folder**: `kebab-case` (contoh: `outgoing-mail-list.tsx`, `use-employee-detail.ts`)
- **React Components**: `PascalCase` (contoh: `OutgoingMailCard.tsx`)
- **TypeScript Interfaces & Types**: `PascalCase` (contoh: `EmployeeProfile`, `CreateMailDTO`)
- **Functions & Variables**: `camelCase` (contoh: `calculateWorkingDays()`, `isPending`)
- **Database Tables & Columns**: `snake_case` (contoh: `employee_profiles`, `created_at`)
- **Constants / Enums**: `UPPER_SNAKE_CASE` (contoh: `MAX_FILE_SIZE_MB`, `MAIL_STATUS`)