import { randomBytes, hkdfSync } from 'crypto';

/**
 * Panjang standar kunci simetris AES-256 (32 byte / 256 bit).
 */
export const PANJANG_KUNCI_BYTE = 32;

/**
 * Membangkitkan kunci acak 256-bit menggunakan CSPRNG sistem operasi.
 */
export function bangkitkanKunciInduk(): Buffer {
  return randomBytes(PANJANG_KUNCI_BYTE);
}

/**
 * Memvalidasi format dan panjang kunci.
 * Bersifat gagal tertutup: menolak kunci jika tidak tepat 32 byte.
 */
export function validasiKunci(kunci: Buffer): void {
  if (!Buffer.isBuffer(kunci) || kunci.length !== PANJANG_KUNCI_BYTE) {
    throw new Error(
      `Kunci tidak valid: panjang kunci wajib tepat ${PANJANG_KUNCI_BYTE} byte (256 bit).`
    );
  }
}

/**
 * Memuat kunci induk dari variabel lingkungan atau masukan string hex.
 * Kunci disimpan di luar repositori (variabel lingkungan .env atau secrets store).
 * 
 * @param kunciHexOpsional String hex 64-karakter (opsional, bawaan membaca process.env.APP_MASTER_KEY)
 */
export function muatKunciInduk(kunciHexOpsional?: string): Buffer {
  const hex = kunciHexOpsional ?? process.env.APP_MASTER_KEY;
  if (!hex || typeof hex !== 'string') {
    throw new Error(
      'Kunci induk tidak ditemukan: APP_MASTER_KEY harus disetel di variabel lingkungan luar repositori.'
    );
  }

  const hexBersih = hex.trim();
  if (!/^[0-9a-fA-F]{64}$/.test(hexBersih)) {
    throw new Error(
      'Format kunci induk tidak valid: wajib berupa string heksadesimal 64 karakter (32 byte).'
    );
  }

  const kunci = Buffer.from(hexBersih, 'hex');
  validasiKunci(kunci);
  return kunci;
}

/**
 * Menurunkan kunci terpisah berdasarkan tujuan menggunakan HKDF-SHA256 (RFC 5869).
 * Menjamin prinsip "Satu Kunci, Satu Tujuan" (NIST SP 800-57 Part 1 §5.2 Key Usage).
 * 
 * @param kunciInduk Kunci master 256-bit
 * @param infoTujuan Label konteks domain spesifik (misal: "anonpulse v0.2 aduan")
 * @param panjangByte Panjang kunci turunan yang dihasilkan (bawaan 32 byte)
 */
export function turunkanKunci(
  kunciInduk: Buffer,
  infoTujuan: string,
  panjangByte: number = PANJANG_KUNCI_BYTE
): Buffer {
  validasiKunci(kunciInduk);

  if (!infoTujuan || infoTujuan.trim() === '') {
    throw new Error('Label konteks HKDF (info) tidak boleh kosong.');
  }

  const infoBuffer = Buffer.from(infoTujuan, 'utf8');
  // Salt kosong (empty buffer) diperbolehkan oleh RFC 5869 bila IKM (kunci induk) sudah berupa kunci acak berentropi tinggi
  const turunanArrayBuffer = hkdfSync(
    'sha256',
    kunciInduk,
    Buffer.alloc(0),
    infoBuffer,
    panjangByte
  );

  return Buffer.from(turunanArrayBuffer);
}

