import test from 'node:test';
import assert from 'node:assert';
import { randomBytes } from 'crypto';
import { bangkitkanKunciInduk, turunkanKunci, validasiKunci } from '../src/lib/crypto/kunci';
import { enkripsiAEAD, dekripsiAEAD } from '../src/lib/crypto/aead';
import { validasiDanNormalisasiMasukan } from '../src/lib/crypto/masukan';
import { amankanLaporan, bukaLaporan } from '../src/lib/crypto/alur-laporan';

// Kunci induk sistem acak 256-bit (CSPRNG) untuk pengujian
const masterKey = bangkitkanKunciInduk();

// =========================================================================
// 1. UJI POSITIF: Siklus Lengkap Alur Terintegrasi T1 -> T2
// =========================================================================
test('UJI 1 [POSITIF]: Alur penuh proteksi dan dekripsi laporan terautentikasi berhasil', () => {
  const teksAsli = 'Telah terjadi intimidasi relasi kuasa pada tanggal 24 Oktober 2026.';
  
  // Menjalankan alur integrasi: validasi -> HKDF T2 -> Token T1 -> AEAD T2 -> Hash T1
  const paket = amankanLaporan(teksAsli, masterKey);

  // Verifikasi keluaran paket
  assert.ok(paket.tokenRahasia.startsWith('ANON-'));
  assert.strictEqual(paket.tokenHash.length, 64);
  assert.strictEqual(paket.payloadTerenkripsi.iv.length, 24); // 12 bytes hex
  assert.strictEqual(paket.payloadTerenkripsi.authTag.length, 32); // 16 bytes hex
  assert.notStrictEqual(paket.payloadTerenkripsi.ciphertext, teksAsli);

  // Verifikasi pembukaan laporan dengan token pelapor yang sah
  const teksPulih = bukaLaporan(paket.payloadTerenkripsi, paket.tokenRahasia, masterKey);
  assert.strictEqual(teksPulih, teksAsli);
});

// =========================================================================
// 2. UJI NEGATIF: Deteksi Manipulasi Ciphertext (Anti-Tampering)
// =========================================================================
test('UJI 2 [NEGATIF]: Manipulasi ciphertext ditolak secara gagal tertutup (fail-closed)', () => {
  const teksAsli = 'Kronologi fakta insiden sensitif di area kampus.';
  const paket = amankanLaporan(teksAsli, masterKey);

  // Modifikasi karakter terakhir dari ciphertext
  const ctAsli = paket.payloadTerenkripsi.ciphertext;
  const charTerakhir = ctAsli.slice(-1);
  const ctManipulasi = ctAsli.slice(0, -1) + (charTerakhir === '0' ? '1' : '0');

  const payloadRusak = {
    ...paket.payloadTerenkripsi,
    ciphertext: ctManipulasi,
  };

  // Sistem wajib menolak dan melempar galat autentikasi
  assert.throws(
    () => {
      bukaLaporan(payloadRusak, paket.tokenRahasia, masterKey);
    },
    /Autentikasi data gagal/,
    'Manipulasi ciphertext wajib ditolak'
  );
});

// =========================================================================
// 3. UJI NEGATIF: Deteksi Manipulasi Authentication Tag
// =========================================================================
test('UJI 3 [NEGATIF]: Modifikasi Authentication Tag 128-bit ditolak', () => {
  const teksAsli = 'Laporan aduan perundungan ruang laboratorium.';
  const paket = amankanLaporan(teksAsli, masterKey);

  // Modifikasi tag otentikasi
  const tagAsli = paket.payloadTerenkripsi.authTag;
  const tagManipulasi = (tagAsli.startsWith('a') ? 'b' : 'a') + tagAsli.slice(1);

  const payloadTagRusak = {
    ...paket.payloadTerenkripsi,
    authTag: tagManipulasi,
  };

  assert.throws(
    () => {
      bukaLaporan(payloadTagRusak, paket.tokenRahasia, masterKey);
    },
    /Autentikasi data gagal/,
    'Modifikasi Auth Tag wajib ditolak'
  );
});

// =========================================================================
// 4. UJI NEGATIF: Deteksi Manipulasi AAD (Keterikatan Token ke Data)
// =========================================================================
test('UJI 4 [NEGATIF]: Percobaan membuka laporan dengan token/AAD yang salah ditolak', () => {
  const teksAsli = 'Laporan aduan penting sivitas akademika.';
  const paket = amankanLaporan(teksAsli, masterKey);

  // Token yang berbeda dari token asli yang diikat ke AAD
  const tokenPalsu = 'ANON-FFFF-0000';

  assert.throws(
    () => {
      bukaLaporan(paket.payloadTerenkripsi, tokenPalsu, masterKey);
    },
    /Autentikasi data gagal/,
    'Penggunaan token/AAD yang tidak sesuai wajib ditolak'
  );
});

// =========================================================================
// 5. UJI NEGATIF: Dekripsi dengan Kunci Induk yang Berbeda
// =========================================================================
test('UJI 5 [NEGATIF]: Penggunaan kunci master yang salah ditolak secara gagal tertutup', () => {
  const teksAsli = 'Laporan investigasi tertutup.';
  const paket = amankanLaporan(teksAsli, masterKey);

  // Bangkitkan kunci lain yang berbeda
  const kunciLain = bangkitkanKunciInduk();

  assert.throws(
    () => {
      bukaLaporan(paket.payloadTerenkripsi, paket.tokenRahasia, kunciLain);
    },
    /Autentikasi data gagal/,
    'Kunci yang tidak cocok wajib ditolak'
  );
});

// =========================================================================
// 6. UJI INTEGRITAS KUNCI: Pemisahan Kunci HKDF (Satu Kunci, Satu Tujuan)
// =========================================================================
test('UJI 6 [INTEGRITAS KUNCI]: Penurunan kunci HKDF menghasilkan kunci unik per domain', () => {
  const kunciAduan = turunkanKunci(masterKey, 'anonpulse v0.2 aduan');
  const kunciToken = turunkanKunci(masterKey, 'anonpulse v0.2 token');

  // Panjang kunci turunan harus tepat 32 byte
  assert.strictEqual(kunciAduan.length, 32);
  assert.strictEqual(kunciToken.length, 32);

  // Kunci untuk aduan dan kunci untuk token tidak boleh bernilai sama
  assert.notDeepStrictEqual(kunciAduan, kunciToken);

  // Jika payload aduan didekripsi dengan kunci turunan token, harus gagal
  const payload = enkripsiAEAD('Teks rahasia aduan mahasiswa', kunciAduan, 'TOKEN-1');
  assert.throws(
    () => {
      dekripsiAEAD(payload, kunciToken, 'TOKEN-1');
    },
    /Autentikasi data gagal/,
    'Kunci turunan yang salah domain wajib ditolak'
  );
});

// =========================================================================
// 7. UJI SAMBUNGAN T1 -> T2: Integritas Sambungan Lintas Komponen
// =========================================================================
test('UJI 7 [SAMBUNGAN]: Putusnya sambungan format token T1 menyebabkan penolakan alur', () => {
  // Simulasi jika sambungan diputus atau format token T1 dirusak menjadi bukan string sah
  assert.throws(
    () => {
      enkripsiAEAD('Data aduan mahasiswa', turunkanKunci(masterKey, 'aduan'), '');
    },
    /AAD tidak boleh berupa string kosong/,
    'Sambungan AAD kosong wajib ditolak di batas'
  );
});

// =========================================================================
// 8. UJI PENANGANAN MASUKAN: Validasi di Batas (Allowlist & Ukuran)
// =========================================================================
test('UJI 8 [MASUKAN]: Menolak masukan tidak sah (terlalu pendek, karakter kendali, kunci tidak valid)', () => {
  // 1. Teks terlalu pendek (< 10 karakter)
  assert.throws(
    () => {
      validasiDanNormalisasiMasukan('Pendek');
    },
    /Teks aduan terlalu pendek/
  );

  // 2. Karakter kendali terlarang (null byte)
  assert.throws(
    () => {
      validasiDanNormalisasiMasukan('Teks dengan \x00 karakter terlarang');
    },
    /karakter kendali yang tidak diizinkan/
  );

  // 3. Kunci non-32 byte
  const kunciPendek = randomBytes(16);
  assert.throws(
    () => {
      validasiKunci(kunciPendek);
    },
    /panjang kunci wajib tepat 32 byte/
  );
});

