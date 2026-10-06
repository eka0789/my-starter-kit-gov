# AI Prompt: Audit Aksesibilitas WCAG 2.1 AA & Permen Kominfo 8/2019

## Tujuan
Audit komponen atau halaman terhadap `.ai/accessibility.md`.

## Instruksi
1. Kontras: teks normal min 4.5:1, teks besar/bold min 3:1, komponen UI/grafis/focus outline min 3:1.
2. Warna: status, error, dan metrik tidak boleh hanya mengandalkan warna; wajib ada teks/ikon/underline.
3. Keyboard: navigasi penuh Tab/Shift+Tab, Enter/Space aktifkan kontrol, Esc tutup modal, focus trap modal aktif, focus restore saat tutup, skip to content ada.
4. Screen reader: `<button>`, `<nav>`, `<main>`, `<th scope="col">`, `<label htmlFor>` terhubung ID, `aria-label` untuk icon button, `aria-invalid` + `aria-describedby` untuk error, `aria-live` untuk dynamic update.
5. 6 State UI: Loading (Skeleton), Error, Empty, Data View, Responsive, Dark Mode.
6. ErrorBoundary membungkus halaman.
7. Tidak ada lint error `jsx-a11y`, zero critical/serious di axe-core, target Lighthouse Accessibility ≥ 90.

## Output Wajib
- Daftar pelanggaran: File:Line | Kriteria WCAG | Severity | Masalah | Kode Perbaikan.
- Keyboard navigation checklist.
- Screen reader announcements map.
- Skor evaluasi axe/Lighthouse estimasi.
