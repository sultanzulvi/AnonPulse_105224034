# Dokumen Teknis Modul 6 PostgreSQL dan Prisma ORM

- Nama: Sultan Zulvi Risda
- NIM: 105224034

## 1. Rancangan Data

- **Diagram Dua Entitas & Relasi:** Entitas `Laporan` (induk, 1) berelasi satu-ke-banyak (1:N) dengan `TindakLanjut` (anak, N).
- **Kunci & Constraint Unik:**
  - `Laporan`: Primary Key `id` (autoincrement), Unique Constraint `@unique` pada `token` dan `judul`.
  - `TindakLanjut`: Primary Key `id` (autoincrement), Foreign Key `laporanId` mereferensikan `Laporan(id)`, Unique Constraint gabungan `@@unique([laporanId, petugas])`.
- **Alasan Pemilihan Aturan `onDelete: Restrict`:** Dalam sistem whistleblowing kampus, catatan tindak lanjut investigasi merupakan rekam jejak formal yang memiliki integritas pembuktian tinggi. Data laporan induk tidak boleh terhapus secara otomatis bila masih memiliki riwayat penanganan aktif; penghapusan harus dilakukan secara eksplisit melalui transaksi atomik dua arah.

## 2. Skema dan Migrasi

- Berkas `prisma/schema.prisma` mendefinisikan model `Laporan` dan `TindakLanjut` beserta enum `KategoriLaporan` dan `StatusLaporan`.
- Riwayat folder migrasi: `prisma/migrations/*_init/migration.sql`.
- Bukti constraint PostgreSQL `\d "TindakLanjut"` menunjukkan keberadaan constraint foreign key dengan klausul `ON DELETE RESTRICT` serta indeks unik gabungan `TindakLanjut_laporanId_petugas_key`.

![alt text](<Screenshot 2026-11-06 075759.png>)

## 3. Seed dan Prisma Client

- Seeding pada `prisma/seed.ts` menggunakan metode `upsert` berbasis klausa `where: { judul }` untuk laporan dan `where: { laporanId_petugas }` untuk tindak lanjut.
- Hasil eksekusi `npx prisma db seed` dua kali menghasilkan jumlah data identik (5 laporan dan 5 tindak lanjut) tanpa memicu galat P2002.
- `prisma/seed.ts` berjalan langsung melalui `tsx` di luar siklus hidup Next.js sehingga membentuk instans PrismaClient sendiri dengan driver adapter PostgreSQL dan tidak mengimpor `lib/prisma.ts` yang terikat batasan `server-only`.

## 4. Operasi CRUD

| Operasi       | Entitas                | Metode Prisma                    | Galat yang Ditangani   | Pesan ke Pengguna                                                           |
| ------------- | ---------------------- | -------------------------------- | ---------------------- | --------------------------------------------------------------------------- |
| Create        | Laporan                | `prisma.laporan.create`          | P2002 (Judul duplikat) | "Judul laporan sudah terdaftar"                                             |
| Read List     | Laporan                | `prisma.laporan.findMany`        | Hasil array kosong     | Menampilkan daftar kosong tanpa galat                                       |
| Read Detail   | Laporan & TindakLanjut | `prisma.laporan.findUnique`      | Hasil `null`           | Dialihkan ke halaman 404 via `notFound()`                                   |
| Update        | Laporan                | `prisma.laporan.update`          | P2002, P2025           | "Judul laporan sudah terdaftar" / "Laporan tidak ditemukan"                 |
| Create Child  | TindakLanjut           | `prisma.tindakLanjut.create`     | P2002, P2003           | "Petugas ini sudah memberikan catatan..." / "Laporan induk tidak ditemukan" |
| Delete Child  | TindakLanjut           | `prisma.tindakLanjut.deleteMany` | Idempoten              | Rekam catatan terhapus dari tampilan detail                                 |
| Delete Parent | Laporan & TindakLanjut | `prisma.$transaction([...])`     | P2025                  | Laporan beserta riwayat anak terhapus secara atomik                         |

## 5. Transaksi dan Rollback

- Percobaan penghapusan langsung laporan induk melalui `prisma.laporan.delete` ditolak oleh engine PostgreSQL karena adanya constraint foreign key `ON DELETE RESTRICT`.
- Pengujian transaksi atomik dengan perintah kedua yang sengaja dibuat gagal membuktikan rollback: perintah pertama `deleteMany` otomatis dibatalkan, dan kueri PostgreSQL membuktikan baris `TindakLanjut` tetap utuh.

## 6. Skenario Uji

| No  | Skenario                       | Langkah Uji                             | Hasil Diharapkan           | Hasil Aktual                   | Status   |
| --- | ------------------------------ | --------------------------------------- | -------------------------- | ------------------------------ | -------- |
| 1   | Tambah laporan valid           | Input judul, kategori, deskripsi sah    | Tersimpan di DB PostgreSQL | Tersimpan dan muncul di daftar | Berhasil |
| 2   | Tambah laporan judul ganda     | Masukkan judul yang sudah terdaftar     | Galat kolom P2002          | Pesan galat duplikasi muncul   | Berhasil |
| 3   | Validasi masukan kosong        | Submit form tanpa judul                 | Ditolak Zod sebelum query  | Pesan galat validasi muncul    | Berhasil |
| 4   | Ubah data laporan              | Update deskripsi laporan                | Data terbarui di DB        | Perubahan tersimpan            | Berhasil |
| 5   | Ubah laporan id fiktif         | Request update ID tidak ada             | Ditangani galat P2025      | Pesan tidak ditemukan          | Berhasil |
| 6   | Akses rute ID invalid          | Buka `/pantau/abc` atau `/pantau/99999` | Ditangani `notFound()`     | Halaman 404 ditampilkan        | Berhasil |
| 7   | Hapus laporan & riwayat        | Eksekusi transaksi atomik               | Laporan dan anak terhapus  | Data bersih & dialihkan        | Berhasil |
| 8   | Bukti rollback transaksi       | Eksekusi transaksi query kedua gagal    | Seluruh query dibatalkan   | Baris anak tetap utuh          | Berhasil |
| 9   | Tambah tindak lanjut tahap > 5 | Masukkan tahap 6                        | Ditolak validasi Zod       | Galat tahap maksimal 5         | Berhasil |
| 10  | Tindak lanjut petugas ganda    | Petugas sama mengisi laporan sama       | Galat P2002 unik gabungan  | Pesan penolakan ditampilkan    | Berhasil |

Persentase Kelulusan: 10/10 (100%).

## 7. Kendala dan Penyelesaian

- Hambatan autentikasi lokal PostgreSQL (P1000) diselesaikan dengan penyetelan kredensial password superuser melalui SQL Shell serta sinkronisasi `DATABASE_URL` pada `.env`.
- Perbedaan pemuatan konfigurasi Prisma 7 diselesaikan dengan penyesuaian properti `seed` pada berkas konfigurasi menggunakan `tsx`.

## 8. Catatan Pemanfaatan AI

- AI digunakan untuk menavigasi skema relasional dua entitas sesuai kebutuhan domain produk AnonPulse, menyusun adapter PostgreSQL Prisma 7, serta memetakan penanganan kode galat Prisma (P2002, P2003, P2025). Seluruh migrasi, seed, dan pengujian rollback diverifikasi langsung melalui terminal psql dan UI browser lokal.
