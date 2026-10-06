# Accessibility Standards (WCAG 2.1 Level AA)

## Tujuan

Memastikan aplikasi dapat diakses oleh seluruh warga negara, termasuk penyandang disabilitas, sesuai **Permen Kominfo No. 8/2019** tentang Pedoman Penyediaan Layanan Aplikasi dan Konten yang Mudah Diakses.

**Baseline**: WCAG 2.1 Level AA adalah standar minimum. Level AAA untuk layanan kritis/khusus disabilitas sesuai keputusan instansi.

---

## Prinsip POUR

1. **Perceivable**: Informasi dapat dirasakan semua indera.
2. **Operable**: Dapat dioperasikan tanpa mouse.
3. **Understandable**: Antarmuka dapat dipahami.
4. **Robust**: Bekerja lintas teknologi assistive.

---

## Kontras Warna (WCAG 1.4.3)

- Teks normal (< 18pt): Rasio kontras minimum **4.5:1** terhadap background.
- Teks besar (≥ 18pt atau bold ≥ 14pt): Rasio kontras minimum **3:1**.
- Komponen UI interaktif dan ikon: Rasio kontras minimum **3:1**.
- Jangan hanya gunakan warna untuk membedakan status (contoh: success = hijau, error = merah). Tambahkan ikon, teks, atau pola.

**Alat verifikasi**: Chrome DevTools Accessibility Panel, WebAIM Contrast Checker, axe DevTools.

---

## Keyboard Navigation (WCAG 2.1.1)

- Semua fungsi dapat diakses tanpa mouse (keyboard only).
- Urutan `tab` logis (top-to-bottom, left-to-right).
- Fokus visible (outline atau border yang jelas saat tab).
- Jangan suppress outline tanpa ganti dengan indikator alternatif yang jelas.
- Modal/dialog: trap focus di dalam modal; `Escape` menutup.
- Dropdown/menu: `Arrow keys` navigasi, `Enter`/`Space` pilih, `Escape` tutup.

**Alat verifikasi**: Tab through entire flow; `Shift+Tab` mundur; test tanpa mouse.

---

## Focus Management (WCAG 2.4.7)

- Fokus visible dengan kontras minimum 3:1.
- Setelah aksi (submit form, buka modal), pindahkan fokus ke elemen relevan (heading modal, pesan sukses).
- Jangan biarkan fokus hilang atau pindah tanpa konteks.

**Anti-pattern**:
```jsx
// ❌ JANGAN: Fokus hilang setelah dialog dibuka
<Dialog open={isOpen}>
  <DialogContent>
    <DialogTitle>Konfirmasi</DialogTitle>
    ...
  </DialogContent>
</Dialog>
```

**Pattern yang benar**:
```jsx
// ✅ Fokus otomatis ke heading atau tombol utama
<Dialog open={isOpen} onOpenAutoFocus={(e) => headingRef.current?.focus()}>
  <DialogContent>
    <DialogTitle ref={headingRef} tabIndex={-1}>Konfirmasi</DialogTitle>
    ...
  </DialogContent>
</Dialog>
```

---

## Semantic HTML & ARIA (WCAG 4.1.2)

- Gunakan elemen semantik: `<button>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<header>`, `<footer>`.
- Jangan gunakan `<div>` atau `<span>` untuk tombol interaktif.
- Gunakan ARIA hanya bila semantik HTML tidak cukup.

**Landmark ARIA**:
```html
<header role="banner">
<nav role="navigation" aria-label="Menu Utama">
<main role="main">
<aside role="complementary">
<footer role="contentinfo">
```

**Icon-only button wajib label**:
```jsx
// ❌ JANGAN
<Button><MoreHorizontal /></Button>

// ✅ WAJIB
<Button aria-label="Aksi baris">
  <span className="sr-only">Buka menu aksi</span>
  <MoreHorizontal />
</Button>
```

---

## Form & Input (WCAG 1.3.1, 3.3.1, 3.3.2)

- Setiap input wajib `<label>` terkait (via `for`/`htmlFor` atau wrap).
- Error wajib dikaitkan dengan input menggunakan `aria-describedby`.
- Required field ditandai `required` dan `aria-required="true"`.
- Validasi error menyebutkan field yang salah dan solusinya.

```jsx
<Label htmlFor="nip">NIP *</Label>
<Input
  id="nip"
  name="nip"
  required
  aria-required="true"
  aria-invalid={!!errors.nip}
  aria-describedby={errors.nip ? "nip-error" : undefined}
/>
{errors.nip && (
  <p id="nip-error" className="text-sm text-destructive" role="alert">
    {errors.nip.message}
  </p>
)}
```

---

## Table (WCAG 1.3.1)

- Header kolom: `<th scope="col">`.
- Header baris: `<th scope="row">`.
- Caption tabel: `<caption>`.

```jsx
<table>
  <caption>Daftar Pegawai Aktif</caption>
  <thead>
    <tr>
      <th scope="col">NIP</th>
      <th scope="col">Nama</th>
      <th scope="col">Aksi</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>197503152000031001</td>
      <td>Ahmad Saleh</td>
      <td><Button aria-label="Edit Ahmad Saleh">Edit</Button></td>
    </tr>
  </tbody>
</table>
```

---

## Status & Live Region (WCAG 4.1.3)

- Pesan dinamis (toast, alert, loading) gunakan `role="status"` atau `role="alert"`.
- `aria-live="polite"` untuk notifikasi non-kritis.
- `aria-live="assertive"` untuk error/warning kritis.

```jsx
{isLoading && (
  <div role="status" aria-live="polite">
    <span className="sr-only">Sedang memuat data...</span>
    <Spinner />
  </div>
)}
```

---

## Responsive & Zoom (WCAG 1.4.4, 1.4.10)

- Layout tidak rusak pada zoom 200%.
- Teks dapat di-reflow tanpa scroll horizontal pada 320px viewport width.
- Touch target minimum 44x44 CSS pixels (WCAG 2.5.5 Level AAA, rekomendasi untuk mobile).

---

## Screen Reader Testing

**Wajib diuji dengan**:
- NVDA (Windows, gratis): https://www.nvaccess.org/
- JAWS (Windows, berbayar / trial): https://www.freedomscientific.com/
- VoiceOver (macOS/iOS, bawaan): `Cmd+F5`.
- TalkBack (Android, bawaan).

**Test flow**:
1. Navigasi tanpa mouse.
2. Semua konten terbaca.
3. Tombol dan link jelas tujuan.
4. Form error dapat didengar.
5. Modal trap fokus dan dapat ditutup dengan `Escape`.

---

## Automated Testing

**Tool wajib**:
- `axe-core` / `@axe-core/react` (npm package, runtime check).
- Lighthouse Accessibility Audit (Chrome DevTools).
- `eslint-plugin-jsx-a11y` (linter).

**CI/CD Integration**:
```json
// package.json
{
  "scripts": {
    "test:a11y": "axe-cli http://localhost:3000"
  }
}
```

**Threshold minimum**: Zero critical/serious axe violations, Lighthouse Accessibility score ≥ 90.

---

## Checklist

- [ ] Kontras teks dan UI ≥ 4.5:1 (normal) / 3:1 (besar).
- [ ] Status tidak hanya dibedakan warna.
- [ ] Semua fungsi dapat diakses keyboard.
- [ ] Fokus visible dan logis.
- [ ] Icon-only button memiliki `aria-label`.
- [ ] Form input memiliki label terkait.
- [ ] Error form di-announce dengan `aria-describedby`.
- [ ] Table header menggunakan `<th scope>`.
- [ ] Modal trap fokus dan dapat ditutup `Escape`.
- [ ] Screen reader test lulus (NVDA/VoiceOver).
- [ ] Lighthouse Accessibility ≥ 90.
- [ ] `eslint-plugin-jsx-a11y` zero errors.
- [ ] Zoom 200% tidak merusak layout.
