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

---

## 🛠️ Tooling & Perintah Verifikasi

Konfigurasi nyata di repositori (bukan placeholder):

- **Formatter**: `Prettier` — konfigurasi di `prettier.config.cjs` (root): `semi: true`, `singleQuote: true`, `trailingComma: 'all'`, `printWidth: 100` (bukan 80).
- **Linter**: `ESLint 8` + `typescript-eslint` + `eslint-plugin-jsx-a11y` — konfigurasi di `.eslintrc.cjs` (root). Aturan wajib (error): dilarang `any` (`@typescript-eslint/no-explicit-any`), dilarang `@ts-ignore` (`ban-ts-comment`), dilarang komentar `TODO`/`FIXME` (`no-warning-comments`), aksesibilitas jsx-a11y (WCAG 2.1 AA).
- **Type Checking**: `tsc --noEmit` (TypeScript strict; lihat `tsconfig.json` root + `packages/config/tsconfig.base.json`).
- **Unit/Integration test**: `Vitest` (di `apps/api`, konfigurasi `apps/api/vitest.config.ts`).

Perintah wajib dijalankan sebelum menyatakan pekerjaan selesai (dari root repo):

```bash
pnpm lint        # ESLint semua package (harus 0 error)
pnpm typecheck   # tsc --noEmit semua package
pnpm test        # Vitest apps/api
pnpm build       # Turbo build semua package
```

---

## ✅ Sebelum Menyatakan Selesai (Before Finishing)

Seluruh pengecekan wajib hijau; kegagalan salah satu = pekerjaan belum selesai:

1. **Lint**: `pnpm lint` tanpa error. Jangan memperbaiki error dengan `@ts-ignore` atau `eslint-disable` tanpa alasan terdokumentasi.
2. **Type check**: `pnpm typecheck` tanpa error. Dilarang `any`, `@ts-ignore`, atau nonaktifkan strict mode.
3. **Test**: `pnpm test` lulus. Tambahkan/update test untuk perubahan behavior.
4. **Build**: `pnpm build` sukses untuk semua package.
5. **Responsif & Aksesibilitas**: periksa layout responsif dan WCAG 2.1 AA (`accessibility.md`, `definition-of-done.md`) jika UI berubah.
6. **Bersih**: hapus log debugging, kode mati, dan variabel/import tak terpakai (sudah dijamin linter + `noUnusedLocals`).