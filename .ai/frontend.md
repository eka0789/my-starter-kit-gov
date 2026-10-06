# Frontend Rules & Standards

## Tech Stack
- **Framework**: `React` + `TypeScript` + `Vite` + `React Router`
- **Styling**: `Tailwind CSS` + `shadcn/ui`
- **State Management & Fetching**: `TanStack Query` (React Query)
- **Forms & Validation**: `React Hook Form` + `Zod`
- **Error Boundary**: `react-error-boundary` (wajib di setiap page)
- **Accessibility Lint**: `eslint-plugin-jsx-a11y` (zero errors)

---

## Structure Per Feature (Frontend Vertical Slice)

```text
features/[feature_name]/
├── components/     # Komponen UI khusus fitur (Cards, Modals, Local Tables)
├── pages/          # Komponen Halaman (Route Target)
├── hooks/          # Custom React hooks & TanStack Query mutations/queries
├── services/       # Client API call functions (fetch wrapper)
├── schemas/        # Zod form schemas
├── types/          # Frontend TypeScript types
└── index.ts        # Public exports
```

---

## Layout & UI Standards

1. **Ukuran Komponen**: Jaga komponen React di bawah 300 baris. Pecah UI kompleks menjadi sub-komponen.
2. **UI Library**: Komponen universal di `packages/ui` (`shadcn/ui`).
3. **Pencegahan Duplikasi**: Dilarang membuat form/komponen duplikat. Ekstrak dan reuse.

---

## Mandatory UI States (6 State Wajib)

Semua komponen list, tabel, dan form WAJIB mendukung:

1. ⏳ **Loading State**: Skeleton Loader (bukan hanya spinner) yang meniru layout data.
2. ❌ **Error State**: Pesan error user-friendly + tombol Coba Lagi. Jangan tampilkan stack trace.
3. 📭 **Empty State**: Jelaskan mengapa kosong + CTA untuk membuat data baru.
4. 📊 **Data View**: Tampilan data dengan aksesibilitas penuh.
5. 📱 **Responsive Layout**: Tampil sempurna di 320px (mobile) — 1440px (desktop).
6. 🌙 **Dark Mode**: Mendukung sakelar mode terang & gelap via Tailwind `dark:`.

---

## Error Boundary (Wajib di Setiap Page)

```tsx
import { ErrorBoundary } from 'react-error-boundary';
import { PageErrorFallback } from '@/components/error-fallback';

export const EmployeePage = () => (
  <ErrorBoundary fallback={<PageErrorFallback />}>
    <EmployeePageContent />
  </ErrorBoundary>
);
```

---

## Accessibility (WCAG 2.1 AA — Wajib)

Lihat `accessibility.md` untuk standar lengkap. Ringkasan wajib:

- **Icon-only button**: wajib `aria-label` + `<span className="sr-only">`.
- **Form input**: wajib `<label>` + `aria-describedby` untuk pesan error.
- **Table header**: wajib `scope="col"`.
- **Status badge**: tidak hanya warna — tambahkan teks/ikon alternatif.
- **Destructive action**: wajib confirmation dialog (`AlertDialog`).
- **Focus management**: setelah modal dibuka, pindahkan fokus ke heading modal.
- **Lighthouse score**: ≥ 90 untuk halaman production.
- **eslint-plugin-jsx-a11y**: zero errors di CI.

---

## Data Privacy di Frontend

- Jangan tampilkan NIK/NIP penuh di tabel, notifikasi, URL, atau log browser.
- Terapkan masking visual (`****1234`) untuk field PII sensitive.
- Jangan simpan PII di `localStorage`, `sessionStorage`, atau state global yang persist.
- Request PII penuh hanya untuk flow yang memiliki permission dan audit.

---

## Form Security

- Validasi Zod di client untuk UX; validasi server-side selalu wajib.
- Sanitasi input sebelum ditampilkan (React JSX mencegah XSS; jangan gunakan `dangerouslySetInnerHTML` kecuali dengan DOMPurify).
- Submit button: nonaktifkan (disabled) selama submission untuk mencegah double submit.
