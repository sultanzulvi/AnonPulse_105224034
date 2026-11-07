# Laporan Uji Kontrol Akses Berbasis Peran & Hash Kata Sandi (Tugas 2 KKS)

Dokumen ini memuat matriks kontrol akses berbasis peran (*Role-Based Access Control* / RBAC), tabel pembuktian uji akses positif dan negatif, serta pembuktian mekanisme penyimpanan kata sandi menggunakan fungsi hash lambat pada platform **AnonPulse**.

---

## 1. Matriks Hak Akses Berbasis Peran

| Sumber Daya / Rute / Aksi | Publik / Pelapor (Anonim) | Petugas Satgas PPKS (Terkonfirmasi) | Penyerang / Tanpa Sesi (Unauthenticated) |
| :--- | :---: | :---: | :---: |
| Akses Landing Page (`/`) | **Boleh (R)** | **Boleh (R)** | **Boleh (R)** |
| Pengisian Formulir Aduan (`/lapor`) | **Boleh (C)** | **Boleh (C)** | **Boleh (C)** |
| Pemantauan Tiket (`/pantau`, `/pantau/[id]`) | **Boleh (R)** | **Boleh (R)** | **Boleh (R)** |
| Login Pengelola (`/masuk`) | Tidak Perlu | **Boleh (Auntentikasi)** | Ditolak bila kredensial salah |
| Dashboard Pengelola (`/latihan`) | **Ditolak (403/Redirect)** | **Boleh (R/W)** | **Ditolak (Redirect ke /masuk)** |
| Tambah Catatan Tindak Lanjut (`tambahTindakLanjut`) | **Ditolak** | **Boleh (C)** | **Ditolak (Unauthorized)** |
| Hapus Riwayat Tindak Lanjut (`hapusTindakLanjut`) | **Ditolak** | **Boleh (D)** | **Ditolak (Unauthorized)** |
| Hapus Laporan Beserta Relasi (`hapusLaporan`) | **Ditolak** | **Boleh (D)** | **Ditolak (Unauthorized)** |

*Keterangan:* `C` = Create, `R` = Read, `W` = Write/Update, `D` = Delete.

---

## 2. Tabel Skenario Pengujian Akses Per Peran

Sesuai ketentuan, jumlah **uji akses negatif** (penolakan akses ilegal) dibuat sama banyaknya dengan **uji akses positif** (5 Positif vs 5 Negatif):

| No | Tipe Uji | Peran yang Diuji | Aksi / Percobaan Akses | Ekspektasi Keamanan | Hasil Aktual | Status | Rujukan ID Risiko |
| :-: | :---: | :--- | :--- | :--- | :--- | :---: | :---: |
| **1** | **Positif** | Pelapor (Anonim) | Mengirim aduan baru melalui form `/lapor` | Laporan diterima, token diterbitkan | Laporan tersimpan di DB, token diterbitkan | **LULUS** | R-01 |
| **2** | **Positif** | Pelapor (Anonim) | Membuka rute status tiket `/pantau/[id]` | Detail publik dan tahap investigasi tampil | Detail tiket dapat dibaca | **LULUS** | R-02 |
| **3** | **Positif** | Petugas Satgas | Login dengan kredensial valid di `/masuk` | Otentikasi sukses, cookie sesi diterbitkan | Dialihkan ke dashboard, cookie disetel | **LULUS** | TH-10 |
| **4** | **Positif** | Petugas Satgas | Menambah catatan tindak lanjut pada tiket | Catatan tersimpan dengan relasi laporan valid | Record tersimpan di tabel `TindakLanjut` | **LULUS** | TH-10 |
| **5** | **Positif** | Petugas Satgas | Menghapus laporan tuntas via transaksi atomik | Laporan dan seluruh riwayat terhapus bersih | Transaksi berhasil, record terhapus | **LULUS** | TH-10 |
| **6** | **Negatif** | Tamu / Tanpa Sesi | Mengakses langsung `/latihan` tanpa cookie sesi | Akses ditolak, dialihkan paksa ke `/masuk` | HTTP 307 Redirect ke rute `/masuk` | **LULUS** | TH-10 |
| **7** | **Negatif** | Penyerang | Login di `/masuk` dengan kata sandi salah | Otentikasi gagal, tolak pembentukan sesi | Pesan galat "Email atau kata sandi salah" | **LULUS** | R-04 |
| **8** | **Negatif** | Pelapor / Publik | Mencoba mengeksekusi penghapusan catatan investigasi | Aksi ditolak di server action | Ditolak; operasi membutuhkan sesi petugas | **LULUS** | TH-10 |
| **9** | **Negatif** | Penyerang | Memalsukan ID laporan fiktif pada `/pantau/99999` | Rute melempar penanganan 404 Not Found | Ditampilkan antarmuka 404 resmi | **LULUS** | R-02 |
| **10** | **Negatif** | Tamu / Sesi Rusak | Mengirim cookie sesi palsu (`sesi=invalid-uuid-1234`) | Sesi ditolak karena tidak ada di memory map | Nilai null dikembalikan, dialihkan ke login | **LULUS** | TH-10 |

---

## 3. Bukti Penyimpanan Kata Sandi Menggunakan Fungsi Hash Lambat

Untuk mencegah serangan *offline dictionary attack* dan akselerasi komputasi GPU/ASIC (*rainbow table attacks*), seluruh kata sandi akun diverifikasi menggunakan fungsi **scrypt** (RFC 7914).

### A. Konfigurasi Parameter Kriptografi
* **Algoritma:** `scrypt` (Standard OWASP Password Storage Cheat Sheet).
* **Cost Factor ($N$):** $16384$ ($2^{14}$ iterasi memori).
* **Block Size ($r$):** $8$ (ukuran blok 1024 byte).
* **Parallelization ($p$):** $1$ (jalur komputasi sekuensial).
* **Salt:** 16 byte (128 bit) dibangkitkan secara acak melalui CSPRNG (`crypto.randomBytes(16)`).
* **Proteksi Komparasi:** Menggunakan `crypto.timingSafeEqual` untuk mencegah serangan waktu (*timing attacks*).

### B. Bukti Eksekusi Tanpa Membuka Data Pengguna Nyata (Data Sintetis)
Pengujian modul [`src/lib/crypto/password.ts`](file:///src/lib/crypto/password.ts) menggunakan akun uji sintetis:

```text
Input Kata Sandi Sintetis: "DemoPetugasSatgas2026!"
Salt Acak CSPRNG (Hex):    cec9eb6554299d5e7d7444035e8fa17f
Hash Digest scrypt (Hex):  8170100a1bcf588aa216d1551aee6431830d43c39f5525adfb73fc7c7da284a6...

Format Tersimpan pada Database (Format Standar PHC):
$scrypt$N=16384,r=8,p=1$cec9eb6554299d5e7d7444035e8fa17f$8170100a1bcf588aa216d1551aee6431830d43c39f5525adfb73fc7c7da284a6a9fd344b62c73baf4b02bc2388229f3370b79fd77d37a8ede571521183cbbc00

Hasil Verifikasi Waktu Konstan (Timing-Safe):
- Kata sandi cocok: true
- Kata sandi salah: false
```

