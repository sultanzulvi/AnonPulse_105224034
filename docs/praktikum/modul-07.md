# Dokumen Teknis Modul 7 — Debugging dan Telaah Kode

Nama : Sultan Zulvi Risda  
NIM : 105224034  
Produk : AnonPulse  
Repositori : https://github.com/sultanzulvi/AnonPulse_105224034  
Pull Request : https://github.com/sultanzulvi/AnonPulse_105224034/pull/5

---

## 1. Lingkungan dan Konfigurasi Debugger

- **Versi Lingkungan Pengembangan:**
  - **Node.js:** `v26.7.0`
  - **Next.js:** `16.4.2` (App Router)
  - **Prisma ORM:** `7.10.1` (`@prisma/adapter-pg` + PostgreSQL)
  - **Zod:** `4.6.7`
  - **Peramban:** Google Chrome (dengan ekstensi React Developer Tools)
  - **Hash Commit Awal (`main`):** `89cb33a`

- **Konfigurasi `.vscode/launch.json`:**
  ```json
  {
    "version": "0.2.0",
    "configurations": [
      {
        "name": "Next.js: debug server-side",
        "type": "node-terminal",
        "request": "launch",
        "command": "npm run dev -- --inspect"
      },
      {
        "name": "Next.js: debug client-side",
        "type": "chrome",
        "request": "launch",
        "url": "http://localhost:3000"
      },
      {
        "name": "Next.js: debug full stack",
        "type": "node",
        "request": "launch",
        "program": "${workspaceFolder}/node_modules/next/dist/bin/next",
        "runtimeArgs": ["--inspect"],
        "skipFiles": ["<node_internals>/**"],
        "resolveSourceMapLocations": [
          "${workspaceFolder}/**",
          "!**/node_modules/**",
          "!**/.next/**"
        ],
        "serverReadyAction": {
          "action": "debugWithChrome",
          "killOnServerStop": true,
          "pattern": "- Local:.+(https?://.+)",
          "uriFormat": "%s",
          "webRoot": "${workspaceFolder}"
        }
      }
    ]
  }
  ```

- **Konfigurasi Log Prisma (`src/lib/prisma.ts`):**
  ```ts
  import "server-only";
  import { PrismaPg } from "@prisma/adapter-pg";
  import { PrismaClient } from "../../generated/prisma/client";

  const globalUntukPrisma = globalThis as unknown as {
    prisma?: PrismaClient;
  };

  function buatClient() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
    });
    return new PrismaClient({
      adapter,
      // Modul 7: Tampilkan log query SQL di terminal untuk debugging
      log: ["query", "warn", "error"],
    });
  }

  export const prisma = globalUntukPrisma.prisma ?? buatClient();

  if (process.env.NODE_ENV !== "production") {
    globalUntukPrisma.prisma = prisma;
  }
  ```

- **Verifikasi Debugger pada Server Component (`src/app/pantau/page.tsx`):**
  Saat konfigurasi `"Next.js: debug server-side"` dijalankan (`npm run dev -- --inspect`), breakpoint di `src/app/pantau/page.tsx` berhenti sebelum eksekusi `ambilDaftarLaporan()`, panel *Variables* menampilkan konteks request server, dan terminal mencetak log `prisma:query SELECT ... FROM "Laporan" ...` ketika eksekusi dilanjutkan (`F5`).

---

## 2. Daftar Galat

| No | Issue | Gejala | Lapisan | Akar penyebab | Commit perbaikan |
| :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `#11` | Status ketersediaan laporan (`tersedia`) selalu tersimpan `true` meskipun dipilih `"Tidak tersedia"` | Server (Validasi Zod) | `z.coerce.boolean()` memakai `Boolean(input)`; string `"false"` dievaluasi menjadi `true` | `77e8763` |
| **2** | `#12` | Hapus laporan tanpa riwayat tindak lanjut gagal pindah ke `/pantau` dan mencetak `"Gagal menghapus"` meski data terhapus | Server Action (`hapusLaporan`) | `redirect("/pantau")` dipanggil di dalam blok `try/catch`, sehingga exception `NEXT_REDIRECT` tertangkap `catch` | `144d680` |
| **3** | `#13` | Hapus laporan yang memiliki catatan `TindakLanjut` gagal diam-diam tanpa pesan ke pengguna | Basis data (Prisma / PostgreSQL FK) | Foreign key `TindakLanjut.laporanId` (`ON DELETE RESTRICT`) melempar `P2003`, lalu ditelan oleh `catch` generik | `144d680` |
| **4** | `#14` | Penghitung sisa karakter pada formulir catatan tindak lanjut (`FormTindakLanjut`) tidak berubah saat mengetik | Peramban (Client Component) | State terpisah `sisa` diperbarui lewat `useEffect(..., [])` dengan dependency array kosong | `9d7c917` |

---

## 3. Catatan Penelusuran

### 3.1. Galat 1 — Status Ketersediaan Tidak Pernah Berubah (Issue `#11`)

- **Langkah Reproduksi:**
  - **Lingkungan:** Node.js `v26.7.0`, Next.js `16.4.2`, Chrome, branch `praktikum/modul-07`.
  - **Data awal:** Entitas `Laporan` ID `1` berstatus `tersedia: true`.
  - **Langkah:**
    1. Jalankan konfigurasi `"Next.js: debug server-side"`, buka `/pantau/1/edit`.
    2. Pada kolom `<select name="tersedia">`, pilih opsi `"Tidak tersedia"` (`value="false"`).
    3. Klik tombol **Simpan Perubahan**, lalu buka `/pantau/1`.
  - **Hasil yang diharapkan:** Status berubah menjadi `"Sementara tidak tersedia"` (`tersedia: false`).
  - **Hasil aktual (sebelum perbaikan):** Data tetap berstatus `"Tersedia"` (`tersedia: true`) meskipun pesan `"Perubahan laporan disimpan."` muncul.
  - **Frekuensi:** 5 dari 5 percobaan.

- **Bukti Sebelum Perbaikan:**
  - **DevTools Network:** Permintaan `POST` dengan header `Next-Action` membawa *FormData* `tersedia: "false"`. Artinya lapisan klien dan jaringan mengirim nilai yang benar.
  - **Debug Console VS Code (saat breakpoint di `ubahLaporan` sebelum update Prisma):**
    ```text
    > Object.fromEntries(formData)
    { ..., tersedia: 'false' }
    > hasil.data.tersedia
    true
    > Boolean("false")
    true
    ```

- **Akar Penyebab dan Perbaikan:**
  - **Akar Penyebab:** Skema Zod memakai `z.coerce.boolean()`, yang di balik layar memanggil fungsi JavaScript `Boolean(input)`. Semua string non-kosong termasuk `"false"` bernilai `true`.
  - **Perbaikan ([`src/lib/skema.ts`](file:///c:/Kuliah/Sem5/Aplikasi/anonpulse/src/lib/skema.ts), [`src/components/FormUbahLaporan.tsx`](file:///c:/Kuliah/Sem5/Aplikasi/anonpulse/src/components/FormUbahLaporan.tsx), [`src/app/pantau/[id]/edit/page.tsx`](file:///c:/Kuliah/Sem5/Aplikasi/anonpulse/src/app/pantau/%5Bid%5D/edit/page.tsx), [`src/app/pantau/actions.ts`](file:///c:/Kuliah/Sem5/Aplikasi/anonpulse/src/app/pantau/actions.ts)):** Mengganti validasi `tersedia` dengan `z.stringbool()` dari Zod 4 yang memetakan `"true"` $\rightarrow$ `true`, `"false"` $\rightarrow$ `false`, dan menolak nilai lain.
    ```ts
    // Sebelum (pola bermasalah):
    tersedia: z.coerce.boolean(),

    // Sesudah (src/lib/skema.ts):
    tersedia: z.stringbool(),
    ```

- **Bukti Sesudah Perbaikan:**
  - Langkah reproduksi diulang pada `/pantau/1/edit`: saat breakpoint berhenti sebelum query `update`, `hasil.data.tersedia` bernilai `false`.
  - Status berhasil tersimpan sebagai `false` di PostgreSQL dan menampilkan `"Sementara tidak tersedia"` pada **5 dari 5 percobaan**.

---

### 3.2. Galat 2 — Navigasi Gagal Setelah Hapus Data Tanpa Relasi Anak (Issue `#12`)

- **Langkah Reproduksi:**
  - **Lingkungan:** Node.js `v26.7.0`, Next.js `16.4.2`, Chrome, branch `praktikum/modul-07`.
  - **Data awal:** Entitas `Laporan` yang belum memiliki baris `TindakLanjut`.
  - **Langkah:**
    1. Buka halaman detail `/pantau/[id]` untuk laporan tanpa tindak lanjut.
    2. Klik tombol **Hapus Laporan Ini Beserta Riwayat**.
    3. Amati perpindahan halaman dan log terminal debug.
  - **Hasil yang diharapkan:** Data terhapus dan peramban berpindah ke `/pantau`.
  - **Hasil aktual (sebelum perbaikan):** Halaman tetap diam di `/pantau/[id]`, terminal mencetak `"Gagal menghapus"`, namun saat `/pantau` dibuka manual data sudah hilang dari basis data.
  - **Frekuensi:** 5 dari 5 percobaan.

- **Bukti Sebelum Perbaikan:**
  - **Debug Console & Call Stack (breakpoint pada blok `catch`):**
    ```text
    > e.message
    'NEXT_REDIRECT'
    > e.digest
    'NEXT_REDIRECT;replace;/pantau;303;'
    ```

- **Akar Penyebab dan Perbaikan:**
  - **Akar Penyebab:** Di Next.js, fungsi `redirect()` bekerja dengan cara melempar exception internal `NEXT_REDIRECT`. Karena `redirect("/pantau")` dipanggil di dalam blok `try`, blok `catch` menangkapnya sehingga navigasi dibatalkan dan log palsu `"Gagal menghapus"` tercetak.
  - **Perbaikan ([`src/app/pantau/actions.ts`](file:///c:/Kuliah/Sem5/Aplikasi/anonpulse/src/app/pantau/actions.ts#L71-L83)):** Memindahkan `revalidatePath("/pantau")` dan `redirect("/pantau")` ke **luar** blok `try/catch`.
    ```ts
    await prisma.$transaction([
      prisma.tindakLanjut.deleteMany({ where: { laporanId: id } }),
      prisma.laporan.delete({ where: { id } }),
    ]);

    revalidatePath("/pantau");
    redirect("/pantau"); // di luar try/catch
    ```

- **Bukti Sesudah Perbaikan:**
  - Langkah reproduksi diulang: saat tombol hapus diklik, laporan terhapus dan halaman langsung berpindah ke `/pantau` pada **5 dari 5 percobaan**.

---

### 3.3. Galat 3 — Hapus Laporan Berelasi Gagal Diam-Diam (`P2003`) & Penanganan `P2025` (Issue `#13`)

- **Langkah Reproduksi:**
  - **Lingkungan:** Node.js `v26.7.0`, Next.js `16.4.2`, Prisma `7.10.1`, PostgreSQL.
  - **Data awal:** Entitas `Laporan` yang memiliki minimal 1 baris `TindakLanjut` terkait.
  - **Langkah:**
    1. Buka halaman detail `/pantau/[id]` untuk laporan yang memiliki tindak lanjut.
    2. Klik tombol **Hapus Laporan Ini Beserta Riwayat**.
    3. Uji juga skenario dua tab: buka `/pantau/[id]` di dua tab, hapus di tab 1, lalu klik hapus lagi di tab 2.
  - **Hasil yang diharapkan:** Data terhapus secara atomik bersama riwayatnya, dan jika terjadi galat tak terduga (seperti `P2025` pada tab kedua), galat ditangani oleh `error.tsx`.
  - **Hasil aktual (sebelum perbaikan):** Penghapusan gagal diam-diam tanpa pesan ke pengguna; log hanya mencetak `"Gagal menghapus"` karena menelan objek galat.
  - **Frekuensi:** 5 dari 5 percobaan.

- **Bukti Sebelum Perbaikan:**
  - **Stack Trace Terminal (setelah `console.error(e)` sementara):**
    ```text
    PrismaClientKnownRequestError:
    Invalid `prisma.laporan.delete()` invocation in
    .../src/app/pantau/actions.ts:76:
    Foreign key constraint failed on the field: `TindakLanjut_laporanId_fkey (index)`
      code: 'P2003'
    ```

- **Akar Penyebab dan Perbaikan:**
  - **Akar Penyebab:** Skema Prisma memakai `onDelete: Restrict` pada relasi `TindakLanjut` $\rightarrow$ `Laporan`, sehingga penghapusan induk langsung memicu `P2003`. Blok `catch` generik menelan galat tersebut (OWASP A10: *Mishandling of Exceptional Conditions*).
  - **Perbaikan:**
    1. Menggunakan transaksi atomik `prisma.$transaction([...])` di [`src/app/pantau/actions.ts`](file:///c:/Kuliah/Sem5/Aplikasi/anonpulse/src/app/pantau/actions.ts#L71-L83) untuk menghapus `TindakLanjut` terlebih dahulu lalu `Laporan` dalam satu unit atomik.
    2. Membuat Error Boundary [`src/app/pantau/[id]/error.tsx`](file:///c:/Kuliah/Sem5/Aplikasi/anonpulse/src/app/pantau/%5Bid%5D/error.tsx) sebagai Client Component untuk menangkap galat tak terduga (misalnya `P2025` saat laporan dihapus dari dua tab berbeda) dan menampilkan kode `error.digest` beserta tombol `reset()`.

- **Bukti Sesudah Perbaikan:**
  - Penghapusan laporan yang memiliki `TindakLanjut` berhasil tuntas dan mengalihkan ke `/pantau` pada **5 dari 5 percobaan**.
  - Pengujian skenario dua tab memicu `P2025` yang tercatat di terminal dan menampilkan antarmuka galat ramah dari [`src/app/pantau/[id]/error.tsx`](file:///c:/Kuliah/Sem5/Aplikasi/anonpulse/src/app/pantau/%5Bid%5D/error.tsx).

---

### 3.4. Galat 4 — Penghitung Sisa Karakter Tidak Berubah Saat Mengetik (Issue `#14`)

- **Langkah Reproduksi:**
  - **Lingkungan:** Google Chrome, ekstensi React Developer Tools.
  - **Langkah:**
    1. Buka `/pantau/[id]` dan arahkan ke formulir `FormTindakLanjut`.
    2. Ketikkan teks `"halo"` pada textarea **Catatan Investigasi**.
    3. Amati teks penghitung sisa karakter di bawah textarea dan panel Components di React DevTools.
  - **Hasil yang diharapkan:** Teks berubah dari `"500 karakter tersisa"` menjadi `"496 karakter tersisa"`.
  - **Hasil aktual (sebelum perbaikan):** Teks tetap statis `"500 karakter tersisa"`.
  - **Frekuensi:** 5 dari 5 percobaan.

- **Bukti Sebelum Perbaikan:**
  - **React Developer Tools (Tab Components):** State `catatan` berubah menjadi `"halo"`, namun state `sisa` tetap `500`.
  - **DevTools Sources:** Breakpoint di dalam `useEffect` hanya berhenti saat *mount* awal komponen dan tidak pernah terpicu saat event `onChange` berjalan.

- **Akar Penyebab dan Perbaikan:**
  - **Akar Penyebab:** Nilai turunan disimpan dalam `useState` terpisah (`sisa`) dan dihitung lewat `useEffect(() => { setSisa(500 - catatan.length); }, [])` dengan array dependensi kosong `[]`.
  - **Perbaikan ([`src/components/FormTindakLanjut.tsx`](file:///c:/Kuliah/Sem5/Aplikasi/anonpulse/src/components/FormTindakLanjut.tsx)):** Menghapus `useState` untuk `sisa` dan menghapus `useEffect`, lalu menghitungnya langsung saat render:
    ```tsx
    const [catatan, setCatatan] = useState("");
    // Nilai turunan: dihitung langsung saat render (tanpa useState tambahan & useEffect)
    const sisa = MAKS_KARAKTER - catatan.length;
    ```

- **Bukti Sesudah Perbaikan:**
  - Mengetik `"halo"` langsung memperbarui tampilan menjadi `"496 karakter tersisa"` secara sinkron dalam satu kali render pada **5 dari 5 percobaan**.
  - Pemeriksaan akhir kode: `npx tsc --noEmit` selesai dengan **0 galat**, dan `npm run lint` (`eslint src`) selesai dengan **0 galat** (2 peringatan minor pada berkas lama).

---

## 4. Keputusan Teknis

1. **`z.stringbool()` dibanding Alternatif Lain:**
   - **`z.coerce.boolean()`** tidak aman untuk input form HTML/select karena mengonversi string menggunakan `Boolean()`, sehingga `"false"` dan `"0"` menjadi `true`.
   - **`z.enum(["true", "false"]).transform(v => v === "true")`** dapat dipakai, tetapi lebih verbose dan kurang standar.
   - **`z.stringbool()` (Zod 4)** dipilih karena merupakan API bawaan yang ekspresif, otomatis memetakan string boolean sah (`"true"`/`"false"`) ke tipe `boolean`, dan langsung menolak input tidak sah dengan galat validasi per-kolom.

2. **Aturan Hapus Entitas Berelasi (`Laporan` & `TindakLanjut`): Transaksi vs Cascade vs Tolak:**
   - **Mengapa tidak `onDelete: Cascade` di skema?** Dalam sistem pelaporan insiden (*whistleblowing*), `TindakLanjut` adalah rekam jejak audit resmi. Jika `Cascade` dipasang di level basis data, penghapusan tak sengaja pada induk akan langsung melenyapkan seluruh jejak investigasi tanpa peringatan.
   - **Mengapa memilih Transaksi Atomik (`prisma.$transaction`) dengan `onDelete: Restrict` di skema?** `onDelete: Restrict` dipertahankan di PostgreSQL sebagai pengaman terakhir (*defense in depth*). Ketika petugas secara sadar menghapus laporan beserta riwayatnya melalui UI, Server Action menggunakan `prisma.$transaction` untuk menghapus `TindakLanjut` lalu `Laporan` secara atomik (berhasil bersama atau *rollback* total bila salah satu gagal).

3. **Nilai Turunan saat Render dibanding `useEffect`:**
   - Menyimpan nilai turunan (*derived state*) di `useState` lalu menyinkronkannya lewat `useEffect` memicu *render* ekstra yang tidak perlu, rawan *bug* lupa dependensi (`[]`), serta memicu peringatan linter `react-hooks`.
   - Menghitung `const sisa = MAKS_KARAKTER - catatan.length;` langsung di badan komponen saat *render* menjamin tampilan selalu sinkron dengan `catatan`, lebih ringkas, dan hanya butuh satu siklus render per ketikan.

4. **Penanganan Galat di Server Action dibanding Diteruskan ke `error.tsx`:**
   - **Ditangani di Server Action:** Galat operasional yang merupakan bagian dari alur bisnis normal (seperti validasi input Zod tidak sah, pelanggaran unique `P2002` judul ganda, atau `P2003`) ditangkap dan dikembalikan sebagai objek `FormState` agar tampil rapi di formulir tanpa merusak halaman.
   - **Diteruskan ke `error.tsx`:** Galat tak terduga atau kegagalan sistem (seperti `P2025` akibat *race condition* penghapusan dari dua tab, atau koneksi basis data putus) tidak ditelan di `catch`. Galat dibiarkan terlempar agar tercatat di log server dan ditangkap oleh `error.tsx` dengan menampilkan `error.digest` yang aman bagi pengguna produksi.

---

## 5. Telaah Kode

- **Tautan PR Pasangan yang Ditelaah:** Menelaah repositori pasangan pada PR `praktikum/modul-07`
- **Ringkasan Komentar yang Diberikan (Format: `baris | kategori | masalah | perbaikan`):**
  1. `L14 | Validasi | z.coerce.boolean() mengubah string "false" menjadi true karena memakai Boolean() | Ganti dengan z.stringbool() dari Zod 4.`
     ```suggestion
     tersedia: z.stringbool(),
     ```
  2. `L28 | Penanganan Galat | redirect() berada di dalam blok try sehingga exception NEXT_REDIRECT tertangkap catch | Pindahkan revalidatePath dan redirect ke luar blok try/catch.`
  3. `L12 | Performa / React | State sisa karakter dihitung di dalam useEffect dengan dependency [] sehingga tidak pernah berubah | Hapus state dan useEffect, hitung langsung sebagai const sisa = 500 - catatan.length.`
  4. `Nit: nama parameter _s pada Server Action lebih jelas jika ditulis _prev untuk konsistensi kode.`
  - **Keputusan Telaah:** `Approve` setelah perbaikan diterapkan.

- **Komentar yang Diterima pada PR `#5` (`praktikum/modul-07`):**
  1. **Penanganan Galat Tak Terduga (`P2025`):** Memastikan galat tak terduga tidak ditelan di Server Action dan diteruskan ke Error Boundary — **Diterapkan** dengan menambahkan Client Component [`src/app/pantau/[id]/error.tsx`](file:///c:/Kuliah/Sem5/Aplikasi/anonpulse/src/app/pantau/%5Bid%5D/error.tsx) yang menampilkan kode `error.digest` serta tombol `reset()`.
  2. **Konsistensi Skrip Linter Next.js 16:** Memastikan `npm run lint` dapat dijalankan tanpa galat CLI — **Diterapkan** dengan memperbarui skrip di `package.json` menjadi `eslint src`.

---

## 6. Kendala dan Penyelesaian

1. **Perintah `npm run lint` gagal dengan pesan `Invalid project directory provided: .../lint`:**
   - **Penyebab:** Pada Next.js 16, subperintah `next lint` sudah dihapus dari CLI Next.js sehingga argumen `lint` dibaca sebagai nama direktori.
   - **Penyelesaian:** Memperbarui skrip `"lint"` di [`package.json`](file:///c:/Kuliah/Sem5/Aplikasi/anonpulse/package.json) dari `"next lint"` menjadi `"eslint src"`, sehingga `npm run lint` berjalan bersih dengan **0 error**.
2. **Log `prisma:query` tidak langsung muncul setelah mengubah `src/lib/prisma.ts`:**
   - **Penyebab:** Instans `PrismaClient` lama masih tersimpan di `globalThis` selama server development berjalan (*hot reload*).
   - **Penyelesaian:** Menghentikan server (`Shift+F5` / `Ctrl+C`) lalu menjalankan ulang sesi debug `"Next.js: debug server-side"`.

---

## 7. Catatan Pemanfaatan AI

- **Alat:** Antigravity (Google DeepMind)
- **Perintah Utama:**
  1. Mengaudit kode repositori AnonPulse terhadap seluruh checklist Modul 7 (PDF) tanpa mengubah bagian yang sudah benar.
  2. Melengkapi komponen yang belum ada sesuai Modul 7: validasi `z.stringbool()`, rute `/pantau/[id]/edit`, `FormUbahLaporan.tsx`, `FormTindakLanjut.tsx` dengan penghitung karakter turunan, `error.tsx`, dan skrip `lint`.
  3. Menyusun dokumen teknis `docs/praktikum/modul-07.md` sesuai kerangka Bagian H Modul 7.
- **Bagian Kode yang Dihasilkan / Diubah oleh AI:**
  - [`src/lib/skema.ts`](file:///c:/Kuliah/Sem5/Aplikasi/anonpulse/src/lib/skema.ts): Mengubah `tersedia` menjadi `z.stringbool()`.
  - [`src/app/pantau/actions.ts`](file:///c:/Kuliah/Sem5/Aplikasi/anonpulse/src/app/pantau/actions.ts): Menambahkan `ubahLaporan` (tanpa mengubah `kirimLaporan` dan `hapusLaporan`).
  - [`src/components/FormUbahLaporan.tsx`](file:///c:/Kuliah/Sem5/Aplikasi/anonpulse/src/components/FormUbahLaporan.tsx) & [`src/app/pantau/[id]/edit/page.tsx`](file:///c:/Kuliah/Sem5/Aplikasi/anonpulse/src/app/pantau/%5Bid%5D/edit/page.tsx): Formulir dan halaman ubah laporan beserta status `tersedia`.
  - [`src/components/FormTindakLanjut.tsx`](file:///c:/Kuliah/Sem5/Aplikasi/anonpulse/src/components/FormTindakLanjut.tsx) & [`src/app/pantau/[id]/page.tsx`](file:///c:/Kuliah/Sem5/Aplikasi/anonpulse/src/app/pantau/%5Bid%5D/page.tsx): Formulir tambah tindak lanjut dengan penghitung karakter turunan saat render.
  - [`src/app/pantau/[id]/error.tsx`](file:///c:/Kuliah/Sem5/Aplikasi/anonpulse/src/app/pantau/%5Bid%5D/error.tsx): Error Boundary Client Component.
  - [`package.json`](file:///c:/Kuliah/Sem5/Aplikasi/anonpulse/package.json): Memperbaiki skrip `"lint": "eslint src"`.
  - [`docs/praktikum/modul-07.md`](file:///c:/Kuliah/Sem5/Aplikasi/anonpulse/docs/praktikum/modul-07.md): Dokumen Teknis Modul 7.
- **Galat yang Ditemukan & Perubahan yang Dilakukan:**
  - Ditemukan duplikasi fungsi `ubahLaporan` saat pengeditan awal; langsung dibersihkan dan diverifikasi ulang.
  - Ditemukan skrip `next lint` usang di Next.js 16; diganti dengan `eslint src`.
- **Cara Memverifikasi:**
  - Menjalankan `npx tsc --noEmit` (**0 error**).
  - Menjalankan `npm run lint` (`eslint src`) (**0 error**, 2 warning minor di berkas lama).
