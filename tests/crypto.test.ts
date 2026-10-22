import test from 'node:test';
import assert from 'node:assert';
import { randomBytes } from 'crypto';
import { encryptText, decryptText } from '../src/lib/crypto/cipher';
import { generateTrackingToken, hashToken, computeFileDigest } from '../src/lib/crypto/hashing';

// Kunci simetris 256-bit sintetis (32 bytes) dibangkitkan secara acak saat runtime
const syntheticKey = randomBytes(32);

// ==========================================
// 1. UJI POSITIF: Siklus Enkripsi & Dekripsi AES-256-GCM
// ==========================================
test('UJI 1 [POSITIF]: Enkripsi dan dekripsi teks aduan berhasil memulihkan teks asli', () => {
  const originalChronology = 'Terdapat intimidasi dari oknum di ruang sekretariat lantai 2.';
  
  const payload = encryptText(originalChronology, syntheticKey);

  // Verifikasi ciphertext tidak sama dengan plaintext
  assert.notStrictEqual(payload.ciphertext, originalChronology);
  // Verifikasi panjang representasi hex: IV 12 bytes = 24 hex char, AuthTag 16 bytes = 32 hex char
  assert.strictEqual(payload.iv.length, 24);
  assert.strictEqual(payload.authTag.length, 32);

  // Verifikasi dekripsi menghasilkan teks awal yang identik
  const decryptedText = decryptText(payload, syntheticKey);
  assert.strictEqual(decryptedText, originalChronology);
});

// ==========================================
// 2. UJI POSITIF: Determinisme SHA-256 & Keunikan Token
// ==========================================
test('UJI 2 [POSITIF]: Pembangkitan token unik dan hashing SHA-256 bersifat deterministik', () => {
  const tokenA = generateTrackingToken();
  const tokenB = generateTrackingToken();

  // Memastikan dua token yang dibangkitkan acak dan tidak saling tabrak
  assert.notStrictEqual(tokenA, tokenB);
  assert.match(tokenA, /^ANON-[A-F0-9]{4}-[A-F0-9]{4}$/);

  // Hash dari input token yang sama harus selalu menghasilkan digest yang persis sama
  const hash1 = hashToken(tokenA);
  const hash2 = hashToken(tokenA);
  assert.strictEqual(hash1, hash2);
  assert.strictEqual(hash1.length, 64); // SHA-256 menghasilkan 64 karakter heksadesimal
});

// ==========================================
// 3. UJI POSITIF: Integritas Berkas Bukti (Digest)
// ==========================================
test('UJI 3 [POSITIF]: Modifikasi data berkas bukti berhasil dideteksi lewat perbedaan digest', () => {
  const fileOriginal = Buffer.from('Lampiran_Bukti_Percakapan_Asli', 'utf-8');
  const fileTampered = Buffer.from('Lampiran_Bukti_Percakapan_Palsu', 'utf-8');

  const digestOriginal = computeFileDigest(fileOriginal);
  const digestTampered = computeFileDigest(fileTampered);

  // Digest wajib berbeda meskipun perubahan karakter minor
  assert.notStrictEqual(digestOriginal, digestTampered);
});

// ==========================================
// 4. UJI NEGATIF: Deteksi Integritas Ciphertext (Anti-Tampering GCM)
// ==========================================
test('UJI 4 [NEGATIF]: Dekripsi gagal dan melempar galat ketika ciphertext dimanipulasi', () => {
  const secretData = 'Keterangan saksi mata insiden.';
  const payload = encryptText(secretData, syntheticKey);

  // Manipulasi bit terakhir pada ciphertext
  const tamperedCiphertext =
    payload.ciphertext.slice(0, -1) + (payload.ciphertext.endsWith('a') ? 'b' : 'a');

  const corruptedPayload = {
    ...payload,
    ciphertext: tamperedCiphertext,
  };

  // Autentikasi GCM harus menolak payload yang rusak atau diubah pihak ketiga
  assert.throws(
    () => {
      decryptText(corruptedPayload, syntheticKey);
    },
    /Unsupported state or unable to authenticate data/,
    'Sistem wajib melempar galat autentikasi data'
  );
});

// ==========================================
// 5. UJI BATAS: Penolakan Kunci yang Tidak Sesuai Standar 256-bit
// ==========================================
test('UJI 5 [BATAS]: Enkripsi gagal melempar galat bila ukuran kunci bukan 32 byte', () => {
  const shortKey = randomBytes(16); // Kunci hanya 128 bit (16 bytes)

  assert.throws(
    () => {
      encryptText('Data aduan valid', shortKey);
    },
    /Panjang kunci enkripsi harus tepat 32 byte/,
    'Sistem wajib menolak penggunaan kunci non-256-bit'
  );
});