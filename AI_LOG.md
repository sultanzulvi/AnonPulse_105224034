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
