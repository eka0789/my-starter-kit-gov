# AI Prompt: Create Complex Form Component

## Context & Purpose
Gunakan prompt ini untuk membuat Komponen Form Enterprise menggunakan React Hook Form, validasi Zod schema, shadcn/ui Form controls, serta penanganan feedback error dan loading state penyerahan data (*submitting*).

---

## 🤖 AI Instructions

Saat membuat Komponen Form, jalankan panduan berikut:

### Step 1: Definisikan Skema Zod
Buat skema validasi Zod di berkas `schema.ts` yang menangani aturan validasi instansi pemerintah:
- Validasi wajib diisi (`.min(1, 'Wajib diisi')`).
- Validasi format khusus (Email, NIP 18 digit angka, NIK 16 digit angka, Nomor HP Indonesia, URL).
- Validasi berkas lampiran (Maksimal ukuran MB, tipe MIME PDF/JPG/PNG).
- Masking helper: Sediakan helper `maskNik(nik)` dan `maskNip(nip)` untuk data pribadi di sisi UI.
- Consent checkbox: Untuk form pengumpulan data pribadi (UU PDP), sediakan checkbox persetujuan wajib yang mencatat consent status.

### Step 2: Gunakan `useForm` dari React Hook Form
Hubungkan skema Zod ke `useForm` via `@hookform/resolvers/zod`:
```typescript
const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: { ... }
});
```

### Step 3: Implementasi Komponen Input UI shadcn
Gunakan `<Form>`, `<FormField>`, `<FormItem>`, `<FormLabel>`, `<FormControl>`, `<FormDescription>`, `<FormMessage>` untuk setiap input:
- Input Teks / Email / Angka.
- Select Dropdown (dengan data dinamis).
- Date Picker (Calendar Popover).
- Textarea untuk deskripsi/catatan.
- Input File / File Upload Dropzone.

### Step 4: Aksesibilitas Form (WCAG 2.1 AA)
- Setiap `<input>` **wajib** memiliki `<label htmlFor="...">` yang terhubung via `id`.
- Tanda wajib (`*`) diberi `aria-label="wajib diisi"`.
- Input yang error memiliki `aria-invalid="true"` dan `aria-describedby="[field]-error"`.
- Dialog modal (`DialogContent`) wajib memiliki `<DialogDescription>` atau `aria-describedby`.
- Tombol Submit menampilkan `aria-busy="true"` saat submitting.
- Urutan fokus keyboard (Tab order) logis dari atas ke bawah.
- Kontras teks placeholder minimal 4.5:1 terhadap background.

### Step 5: Penanganan Feedback & Submitting
- Nonaktifkan tombol Submit dan tampilkan Spinner Loader saat `form.formState.isSubmitting === true`.
- Tampilkan Toast Notification Sukses saat penyerahan data berhasil.
- Tampilkan Error Message inline pada input yang bermasalah.
- Sediakan Tombol Batal / Reset.
- Kirim `actor` ID saat submit untuk audit trail 6 kolom (`created_by`/`updated_by`).
