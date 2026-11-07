# KEPUTUSAN.md — Keputusan Arsitektur Kriptografi (Tugas 2)

Dokumen ini mencatat keputusan pemilihan mekanisme kriptografi, pendokumentasian parameter, pengelolaan siklus hidup kunci, serta strategi pengujian pada platform pelaporan insiden kampus **AnonPulse** untuk memenuhi seluruh kriteria Rubrik R2 (Tugas 2 — Enkripsi Terautentikasi dan Integritas Data).

---

## 1. Pemetaan Kebutuhan $\rightarrow$ Mekanisme $\rightarrow$ Alasan (K1)

| No | Kebutuhan Keamanan Data Produk | Mekanisme Kriptografi Terpilih | Alasan & Landasan Pemilihan |
| :--- | :--- | :--- | :--- |
| **1** | **Kerahasiaan Narasi Aduan Sensitif (`chronology`)** | **Enkripsi Simetris AEAD: AES-256-GCM** | Narasi aduan memuat rincian insiden traumatis korban. Menggunakan enkripsi simetris terautentikasi (Authenticated Encryption with Associated Data) memastikan kerahasiaan (*confidentiality*) dan integritas (*integrity*) secara simultan dalam satu primitif terpadu standar industri (NIST SP 800-38D). |
| **2** | **Keterikatan Metadata Tiket ke Narasi Aduan** | **Additional Authenticated Data (AAD)** pada AES-GCM | Mencegah ancaman *cut-and-paste* atau pertukaran ciphertext antar-laporan. Token tiket rahasia (`ANON-XXXX-XXXX`) diikat sebagai AAD sehingga jika ciphertext dipindahkan ke tiket lain atau token dipalsukan, verifikasi tag otentikasi akan gagal seketika. |
| **3** | **Pemisahan Kunci untuk Tujuan Berbeda (*Key Separation*)** | **HKDF-SHA256 (RFC 5869)** | Sesuai aturan NIST SP 800-57 Part 1 §5.2 (*Key Usage Limitation*), satu kunci kriptografi tidak boleh digunakan untuk multi-tujuan. Kunci induk tunggal diturunkan secara deterministik menjadi kunci spesifik (`anonpulse v0.2 aduan`) dengan label konteks domain terisolasi. |
| **4** | **Pseudonimitas & Indeks Pencarian Tiket di Basis Data** | **Fungsi Hash Kriptografis Satu Arah: SHA-256** | Pelapor memegang token rahasia teks polos, sedangkan database hanya menyimpan nilai *digest* (hash 64 karakter hex). Operator atau administrator basis data tidak dapat merekonstruksi token pelapor dari nilai digest (*pre-image resistance*). |
| **5** | **Integritas Berkas Digital Bukti Lampiran** | **Cryptographic Digest: SHA-256 Checksum** | Memastikan berkas bukti (tangkapan layar / rekaman) yang diunggah tidak mengalami kerusakan bit (*tampering*) saat transmisi maupun penyimpanan. |

---

## 2. Parameter Kriptografi Terdokumentasi (K2)

Implementasi menggunakan pustaka standar `node:crypto` dengan parameter ketat:

### A. Parameter AES-256-GCM
* **Algoritma:** `aes-256-gcm` (NIST SP 800-38D).
* **Panjang Kunci:** Tepat **32 byte (256 bit)**.
* **Nonce / Initialization Vector (IV):** Tepat **12 byte (96 bit)**, dibangkitkan secara acak melalui CSPRNG sistem (`crypto.randomBytes(12)`) **setiap kali proses enkripsi dipanggil**.
* **Additional Authenticated Data (AAD):** String UTF-8 representasi token pelacak aduan.
* **Authentication Tag:** Tepat **16 byte (128 bit)**, diverifikasi menggunakan `decipher.setAuthTag()`.

### B. Analisis Bahaya Penggunaan Ulang Nonce (*Nonce Reuse*)
> [!CAUTION]
> **Mengapa Nonce/IV Tidak Boleh Berulang pada AES-GCM?**
> Mode Galois/Counter Mode (GCM) bekerja dengan mengenkripsi counter berurutan menggunakan cipher blok untuk menghasilkan *keystream*, yang kemudian di-XOR dengan plaintext:
> $$C_1 = P_1 \oplus K_s, \quad C_2 = P_2 \oplus K_s$$
> Jika IV yang sama digunakan dua kali dengan kunci yang sama ($K_s$ identik), maka:
> $$C_1 \oplus C_2 = P_1 \oplus P_2$$
> Hal ini memulihkan relasi XOR kedua plaintext (hilangnya kerahasiaan). Selain itu, pada mode GCM, pengulangan nonce membocorkan kunci GHASH internal ($H$), memungkinkan penyerang membuat *authentication tag* palsu dan memalsukan pesan apa pun secara bebas tanpa terdeteksi.
>
> **Mitigasi di AnonPulse:**
> Setiap pemanggilan [`enkripsiAEAD()`](file:///src/lib/crypto/aead.ts) membangkitkan IV 12-byte baru secara independen dari CSPRNG sistem operasi.

---

## 3. Penanganan Masukan dan Pengelolaan Kunci (K3)

### A. Penanganan Masukan di Batas Kepercayaan (*Boundary Validation*)
* **Normalisasi Unicode:** Teks aduan dinormalisasi ke bentuk kanonis **NFC** (`normalize('NFC')`) untuk mencegah ketidaksesuaian representasi byte pada karakter majemuk (*homoglyph / byte divergence*).
* **Validasi Allowlist:** Memeriksa batasan panjang teks (minimal 10 karakter, maksimal 10.000 karakter) serta menolak karakter kontrol ASCII berbahaya (`\x00-\x1F` selain newline/tab).
* **Prinsip Gagal Tertutup (*Fail-Closed*):** Bila masukan tidak valid, sistem menolak sedini mungkin sebelum data menyentuh fungsi kriptografi. Jika dekripsi atau verifikasi tag gagal, fungsi menolak secara tegas tanpa melepaskan plaintext parsial.

### B. Pembangkitan dan Penyimpanan Kunci
1. **Sumber Entropi:** Kunci induk 256-bit dibangkitkan murni menggunakan CSPRNG (`crypto.randomBytes(32)`).
2. **Penyimpanan di Luar Repositori:** Kunci induk tidak pernah di-hardcode ke dalam kode sumber atau di-commit ke repositori Git. Kunci dimuat pada saat *runtime* melalui variabel lingkungan `APP_MASTER_KEY` (terdokumentasi nilai contoh sintetis pada [`.env.example`](file:///.env.example)).
3. **Pemisahan Kunci (HKDF - RFC 5869):**
   * Input Keying Material (IKM): `APP_MASTER_KEY` (32 byte).
   * Context Label (`info`): `"anonpulse v0.2 aduan"`.
   * Output Kunci Turunan: 32 byte kunci simetris terisolasi khusus domain enkripsi aduan.

---

## 4. Rincian Skenario Pengujian (K4)

Pengujian diimplementasikan menggunakan test runner native Node.js pada berkas [`tests/crypto-tugas2.test.ts`](file:///tests/crypto-tugas2.test.ts) (8 skenario) dan [`tests/crypto.test.ts`](file:///tests/crypto.test.ts) (5 skenario), seluruhnya lulus (13/13, 100%):

| ID Uji | Kategori | Skenario Pengujian | Hasil yang Diharapkan | Hasil Aktual | Status |
| :---: | :---: | :--- | :--- | :--- | :---: |
| **U1** | Positif | Siklus lengkap proteksi & dekripsi (HKDF $\rightarrow$ AEAD + AAD $\rightarrow$ Hash) | Teks aduan asli pulih 100% identik | Plaintext dipulihkan persis | **LULUS** |
| **U2** | Negatif | Modifikasi 1 karakter bit pada ciphertext | Ditolak autentikasi GCM (gagal tertutup) | Melempar galat autentikasi data | **LULUS** |
| **U3** | Negatif | Modifikasi nilai Authentication Tag 128-bit | Ditolak oleh GCM tag verification | Melempar galat autentikasi data | **LULUS** |
| **U4** | Negatif | Modifikasi nilai AAD (token pelapor dipalsukan/ditukar) | Ditolak karena ketidakcocokan tag otentikasi | Melempar galat autentikasi data | **LULUS** |
| **U5** | Negatif | Dekripsi menggunakan kunci master sistem yang salah | Ditolak secara aman tanpa membocorkan data | Melempar galat autentikasi data | **LULUS** |
| **U6** | Kunci | Penurunan kunci HKDF menghasilkan kunci unik per domain (`k_aduan \ne k_token`) | Kunci berbeda dan payload domain silang ditolak | Domain kunci terbukti terisolasi | **LULUS** |
| **U7** | Sambungan | Uji sambungan format token T1 rusak/kosong | Ditolak di batas masukan AAD | Melempar galat validasi masukan AAD | **LULUS** |
| **U8** | Batas | Masukan teks terlalu pendek, karakter kendali, atau kunci non-32 byte | Ditolak sedini mungkin sebelum enkripsi | Melempar galat validasi | **LULUS** |

Perintah untuk menjalankan pengujian:
```bash
npm run test:crypto
```

---

## 5. Panduan Demonstrasi Praktis (K5)

Saat sesi evaluasi/demonstrasi individu ($\pm 3$ menit):
1. **Menunjukkan Kunci:** Perlihatkan bahwa berkas `.env` memuat `APP_MASTER_KEY` dan file tersebut dikecualikan oleh `.gitignore` (hanya `.env.example` yang di-commit).
2. **Menunjukkan Sambungan T1 $\rightarrow$ T2:** Buka berkas [`src/lib/crypto/alur-laporan.ts`](file:///src/lib/crypto/alur-laporan.ts) yang mengimpor `generateTrackingToken` (T1) sebagai AAD bagi `enkripsiAEAD` (T2) serta HKDF `turunkanKunci` (T2).
3. **Menjalankan Uji Otomatis:** Jalankan perintah `npm run test:crypto` di terminal untuk memperlihatkan keberhasilan seluruh pengujian kondisi sah dan kondisi tidak sah.

