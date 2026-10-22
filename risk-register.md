# Risk Register & Rencana Mitigasi - AnonPulse

### Kriteria Matriks Risiko

- **Likelihood (Kemungkinan):** 1 (Rendah), 2 (Sedang), 3 (Tinggi)
- **Impact (Dampak):** 1 (Rendah), 2 (Sedang), 3 (Tinggi)
- **Risk Score:** Likelihood × Impact. Klasifikasi: Low (1-2), Medium (3-4), High (6-9).

---

### Penilaian 10 Ancaman

| ID        | Ancaman                       | Likelihood | Impact | Skor  | Justifikasi Berdasarkan Kondisi Produk                                                                 |
| :-------- | :---------------------------- | :--------: | :----: | :---: | :----------------------------------------------------------------------------------------------------- |
| **TH-01** | Brute-force Tracking Token    |     2      |   3    | **6** | Endpoint `/pantau` belum memiliki _rate limiting_ dan delay verifikasi token.                          |
| **TH-02** | Tampering Ciphertext / Tag    |     1      |   3    |   3   | Node native crypto `cipher.ts` secara default melempar exception bila auth tag GCM tidak cocok.        |
| **TH-03** | Modifikasi Bukti Digital      |     2      |   2    |   4   | Berkas lampiran belum divalidasi checksum-nya secara streaming di layer upload.                        |
| **TH-04** | Repudiasi Pelaporan           |     3      |   1    |   3   | Didesain Zero-PII by design; penolakan laporan tidak mengancam kerahasiaan sistem secara fatal.        |
| **TH-05** | Kebocoran Master Key          |     2      |   3    | **6** | Kunci disimpan pada environment variable runtime; jika runtime server terekspos, seluruh data terbuka. |
| **TH-06** | Residu Data Sesi Klien        |     3      |   2    | **6** | Fitur Panic Exit ada, tetapi _form persistence_ / cache browser belum dipastikan bersih total.         |
| **TH-07** | IV Reuse pada AES-GCM         |     1      |   3    |   3   | Implementasi `cipher.ts` selalu menghasilkan `randomBytes(12)` baru di setiap pemanggilan `encrypt()`. |
| **TH-08** | DoS Flooding Rute Lapor       |     3      |   2    | **6** | Endpoint `/lapor` terbuka publik tanpa mekanisme anti-spam/captcha atau pembatasan request IP.         |
| **TH-09** | DoS Enumerasi Endpoint Pantau |     3      |   2    | **6** | Pencarian token di rute `/pantau` belum dibatasi, memungkinkan enumerasi status ribuan kali per detik. |
| **TH-10** | Privilege Escalation Server   |     1      |   3    |   3   | Arsitektur Next.js 16 App Router secara bawaan mengisolasi runtime klien dan modul server.             |

---

### 5 Risiko Prioritas Terpilih

1. **R-01 (TH-08 - DoS Flooding Endpoint Pelaporan):**
   - _Skor:_ 6 (High)
   - _Justifikasi:_ Form terbuka untuk publik tanpa autentikasi berpotensi diserang bot yang membanjiri penyimpanan dengan ribuan laporan sampah.
2. **R-02 (TH-09 - DoS & Enumerasi Brute-Force pada Tracking):**
   - _Skor:_ 6 (High)
   - _Justifikasi:_ Ketiadaan batas permintaan memungkinkan pihak luar melakukan pemindaian token secara masif untuk menemukan token valid.
3. **R-03 (TH-05 - Kebocoran Kunci Enkripsi Master):**
   - _Skor:_ 6 (High)
   - _Justifikasi:_ Penggunaan kunci simetris tunggal bersifat single point of failure (SPOF); kompromi pada variabel lingkungan mengekspos semua aduan.
4. **R-04 (TH-01 - Tebakan Tracking Token Pengguna Lain):**
   - _Skor:_ 6 (High)
   - _Justifikasi:_ Pelaporan tidak menggunakan nama pengguna/kata sandi; perlindungan akses status hanya bergantung pada kerahasiaan dan entropi token.
5. **R-05 (TH-06 - Residu Data Sensitif Saat Panic Exit):**
   - _Skor:_ 6 (High)
   - _Justifikasi:_ Jika tombol ESC ditekan namun browser masih menyimpan form state di riwayat navigasi (_history back_), keselamatan pelapor terancam.

---

### Rencana Kontrol & Pemetaan Tugas

| ID Risiko | Nama Risiko Prioritas           | Rencana Kontrol Mitigasi                                                                                                                        | Pemetaan Tugas           |
| :-------- | :------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------- |
| **R-01**  | DoS Flooding Endpoint Pelaporan | Pasang middleware rate-limiting (sliding window per-IP) dan validasi batas payload body request (max 1 MB).                                     | **Tugas 2 (KKS)**        |
| **R-02**  | DoS & Enumerasi Tracking        | Terapkan rate limiting ketat pada endpoint `/pantau` (maksimal 5 percobaan per menit per IP) dan constant-time matching.                        | **Tugas 2 (KKS)**        |
| **R-05**  | Residu Form Saat Panic Exit     | Hardening `QuickExitButton.tsx`: flush state React, bersihkan storage sesi, dan ganti entry browser via `window.location.replace()`.            | **Tugas 2 (KKS/PAW)**    |
| **R-03**  | Kebocoran Kunci Master          | Terapkan Key Derivation Function (HKDF/PBKDF2) dengan _salt_ dinamis per kategori/instansi dan isolasi secret management.                       | **Tugas 3 (Kripto/KKS)** |
| **R-04**  | Tebakan Tracking Token          | Tingkatkan entropi pembangkitan token menjadi minimal 128-bit acak CSPRNG dan implementasikan penalti delay bertingkat (_exponential backoff_). | **Tugas 3 (KKS)**        |
