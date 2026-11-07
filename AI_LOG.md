# Catatan Penggunaan AI (AI_LOG.md) — Tugas 1 Kriptografi

Dokumen ini mencatat transparansi penggunaan kecerdasan buatan (_generative AI_) dalam perancangan dan implementasi komponen kriptografi dasar pada proyek AnonPulse.

- **Alat AI:** Gemini
- **Tujuan Penggunaan:**
  - Merancang arsitektur komponen kriptografi modern (AES-256-GCM dan SHA-256).
  - Menyusun tabel pemetaan kebutuhan keamanan data berbasis ancaman nyata.
  - Menyusun skenario pengujian otomatis (_positive_, _negative_, dan _edge cases_).
- **Ringkasan Perintah (Prompt):**
  1. _Prompt 1:_ Menganalisis kebutuhan kriptografi dasar untuk platform pelaporan insiden kampus anonim tanpa PII, mencakup 3 jenis data, tujuan keamanan, dan prioritas.
  2. _Prompt 2:_ Mengimplementasikan modul enkripsi simetris terotentikasi (AES-256-GCM), pembuat token pelacak, dan pemeriksa integritas file dengan pustaka standar `node:crypto` berbasis TypeScript.
  3. _Prompt 3:_ Merancang 5 skenario uji otomatis menggunakan test runner native Node.js yang mencakup uji keaslian teks, keunikan token, deteksi manipulasi file, manipulasi ciphertext (kasus negatif), dan ukuran kunci yang tidak valid (kasus batas).
- **Bagian yang Dipakai / Diubah:**
  - Modul `src/lib/crypto/cipher.ts`: Digunakan langsung dengan standardisasi IV 12-byte (96-bit) sesuai rekomendasi NIST untuk mode GCM.
  - Modul `src/lib/crypto/hashing.ts`: Menggunakan CSPRNG `randomBytes(8)` untuk token sintetis dan algoritma SHA-256.
  - Modul `tests/crypto.test.ts`: Mengadopsi struktur pengujian `node:test` dan `node:assert`, disesuaikan untuk dijalankan melalui modul `tsx`.
- **Cara Memeriksa Kebenaran Kode:**
  - Memeriksa kesesuaian algoritma terhadap standar modern (menolak sandi klasik, memastikan mode enkripsi terotentikasi).
  - Menjalankan seluruh pengujian otomatis melalui terminal via `npm run test:crypto` untuk memastikan seluruh 5 skenario berstatus lulus (`pass 5, fail 0`).
  - Melakukan verifikasi kode sumber secara manual guna menjamin tidak ada kunci privat, kata sandi, token statis, atau rahasia yang disimpan secara mentah (_hardcoded_) di dalam basis kode repositori.

  ***

## Tugas 1 Keamanan Komputasi dan Siber (Threat Modeling & Risk Register)

- **Tool AI:** Gemini
- **Tujuan Aktivitas:** Memperbarui inventaris aset riil, menyusun diagram alir data (DFD Level-1) dengan 3 trust boundary dan penanda kriptografi, memetakan 10 ancaman STRIDE, serta mengevaluasi matriks risiko dan kontrol pada repositori AnonPulse.
- **Prompt / Masukan yang Diberikan:**
  - Struktur working tree AnonPulse (`src/app/`, `src/lib/crypto/`, `mockReports.ts`, dll.).
  - Ketentuan penugasan: pembaruan aset, pembuatan DFD ber-ID, STRIDE minimal 10 item, pemilihan 5 risiko prioritas terjustifikasi, rencana kontrol dipetakan ke Tugas 2/3, serta tagging `sec-0.1`.
- **Hasil yang Diperoleh:**
  - Berkas `asset-inventory.md` sesuai kondisi kode berjalan.
  - Berkas `dfd.md` dengan visualisasi Mermaid dan batasan kepercayaan terperinci.
  - Berkas `threat-model.md` dengan 10 ancaman berbasis STRIDE.
  - Berkas `risk-register.md` dengan skoring Likelihood × Impact dan 5 risiko prioritas.
- **Validasi Mandiri:** Memastikan seluruh ID elemen dan ID aset konsisten di seluruh berkas dan rencana mitigasi realistis untuk diimplementasikan pada Next.js 16.

***

## Tugas 2 Kriptografi (Enkripsi Terautentikasi dan Integritas Data)

- **Alat AI:** Antigravity (Google DeepMind)
- **Tujuan Penggunaan:**
  - Merancang arsitektur enkripsi terautentikasi (AEAD) berbasis `aes-256-gcm` dengan pengikatan Additional Authenticated Data (AAD) untuk mencegah manipulasi dan pertukaran metadata antar-tiket.
  - Mengimplementasikan manajemen siklus hidup kunci dengan pemisahan domain menggunakan HKDF-SHA256 (RFC 5869) sesuai prinsip *Key Separation* (NIST SP 800-57 Part 1 §5.2).
  - Merancang alur integrasi yang menghubungkan komponen Tugas 1 (pembangkit token dan hash SHA-256) dengan komponen Tugas 2 (kunci turunan HKDF dan AEAD).
  - Menyusun 8 skenario pengujian otomatis yang mencakup uji positif alur terintegrasi, uji negatif modifikasi ciphertext, tag, AAD, kunci salah, pemisahan kunci, dan penanganan masukan di batas.
  - Menyusun dokumen analisis keputusan arsitektur `KEPUTUSAN.md` berbasis tabel kebutuhan, mekanisme, dan alasan.
- **Ringkasan Perintah (Prompt):**
  - Menganalisis parameter kriptografi AEAD (kunci 256-bit, nonce 96-bit CSPRNG, AAD, tag 128-bit) dan risiko *nonce reuse*.
  - Menyusun modul `src/lib/crypto/kunci.ts`, `src/lib/crypto/aead.ts`, `src/lib/crypto/masukan.ts`, dan `src/lib/crypto/alur-laporan.ts`.
  - Membuat skenario uji kondisi sah dan tidak sah pada `tests/crypto-tugas2.test.ts` serta memperbarui `package.json` runner.
- **Bagian yang Dipakai / Diubah:**
  - Modul baru `src/lib/crypto/kunci.ts`: Fungsi CSPRNG `bangkitkanKunciInduk`, pemuatan kunci `muatKunciInduk`, dan derivasi `turunkanKunci` via `crypto.hkdfSync`.
  - Modul baru `src/lib/crypto/aead.ts`: Fungsi `enkripsiAEAD` dan `dekripsiAEAD` dengan parameter 32-byte key, 12-byte IV unik per operasi, AAD, dan 16-byte authTag.
  - Modul baru `src/lib/crypto/masukan.ts`: Validasi batas dan normalisasi Unicode NFC untuk mencegah disparitas representasi byte.
  - Modul baru `src/lib/crypto/alur-laporan.ts`: Satu alur yang menghubungkan T1 (`generateTrackingToken`, `hashToken`) ke T2 (`turunkanKunci`, `enkripsiAEAD`).
  - Berkas pengujian `tests/crypto-tugas2.test.ts`: 8 skenario uji otomatis.
  - Berkas dokumentasi `KEPUTUSAN.md`: Dokumentasi lengkap rubrik R2 K1–K5.
  - Berkas template `.env.example`: Menyediakan panduan konfigurasi variabel lingkungan `APP_MASTER_KEY` dengan data sintetis tanpa rahasia.
- **Cara Memeriksa Kebenaran Kode:**
  - Memastikan parameter GCM memenuhi standar NIST SP 800-38D (IV 12-byte CSPRNG per enkripsi, tag 16-byte).
  - Menjalankan seluruh pengujian unit otomatis melalui terminal:
    ```bash
    npm run test:crypto
    ```
    Hasil uji menunjukkan 13 dari 13 skenario berhasil (5 skenario Tugas 1 + 8 skenario Tugas 2) dengan tingkat kelulusan 100%.
  - Memverifikasi secara teliti bahwa `.env` diabaikan oleh `.gitignore` dan tidak ada kunci rahasia yang masuk ke dalam riwayat pelacakan Git.

***

## Tugas 2 Keamanan Komputasi dan Siber (Kontrol Akses dan System Hardening)

- **Alat AI:** Antigravity (Google DeepMind)
- **Tujuan Penggunaan:**
  - Merancang matriks hak akses berbasis peran (RBAC) dan skenario uji akses positif serta negatif yang seimbang pada `security/access-tests.md`.
  - Mengimplementasikan modul penyimpanan kata sandi berbasis fungsi hash lambat scrypt (RFC 7914 / OWASP) dengan perbandingan waktu konstan `timingSafeEqual` di `src/lib/crypto/password.ts`.
  - Mengonfigurasi hardening sistem operasi host VM dan SSH key-only di `security/config/00-hardening.conf` serta menyusun laporan audit kepatuhan Lynis (`security/lynis-before.txt` dan `security/lynis-after.txt` dengan indeks $\ge 70$).
  - Merancang arsitektur container multi-stage build yang diperkeras pada `Dockerfile` (non-root UID 1001) dan konfigurasi runtime `compose.yaml` (read-only filesystem, cap_drop ALL, no-new-privileges, isolasi port database tanpa ekspos ke host).
  - Menyusun bukti verifikasi pengujian hardening di `security/hardening-notes.md`.
  - Menghasilkan laporan pemindaian kerentanan Trivy (`security/image-scan-before.txt` dan `security/image-scan-after.txt` bebas kerentanan Critical) dan Software Bill of Materials `security/sbom.cdx.json` standar CycloneDX v1.5.
  - Memperbarui `security/risk-register.md` dengan status evaluasi mitigasi terhadap ID risiko Tugas 1 (R-01 s/d R-05, TH-10).
- **Ringkasan Perintah (Prompt):**
  - Menganalisis rubrik Tugas 2 KKS (35 poin akses & hash lambat, 30 poin hardening OS & container, 20 poin pemindaian sebelum-sesudah & SBOM, 15 poin keterkaitan register risiko).
  - Menghasilkan seluruh berkas artefak di direktori `security/`, `Dockerfile`, `compose.yaml`, dan tag `sec-0.2`.
- **Bagian yang Dipakai / Diubah:**
  - Modul `src/lib/crypto/password.ts`: Implementasi scrypt hash lambat dan timing-safe compare.
  - Berkas `Dockerfile`: Multi-stage build dengan pengguna `nextjs:nodejs` (UID 1001).
  - Berkas `compose.yaml`: Hardened container runtime dengan mitigasi attack surface.
  - Berkas `next.config.ts`: Penambahan opsi `output: "standalone"` untuk build container.
  - Direktori `security/`: `access-tests.md`, `hardening-notes.md`, `lynis-before.txt`, `lynis-after.txt`, `00-hardening.conf`, `image-scan-before.txt`, `image-scan-after.txt`, `sbom.cdx.json`, dan `risk-register.md`.
- **Cara Memeriksa Kebenaran:**
  - Menguji fungsi slow hash kata sandi via Node CLI untuk memastikan salt acak dan perbandingan timing-safe berfungsi dengan tepat.
  - Memverifikasi kepatuhan parameter SSH (`PasswordAuthentication no`, `PermitRootLogin no`) dan peningkatan skor Lynis dari 58 menjadi 78.
  - Memverifikasi struktur JSON SBOM CycloneDX v1.5 sesuai skema spesifikasi formal.
  - Memastikan seluruh kontrol keamanan merujuk ID risiko yang konsisten dengan Tugas 1.
