import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

/**
 * Parameter standar scrypt (RFC 7914 / OWASP Password Storage Cheat Sheet).
 * Menghasilkan fungsi hash lambat yang tahan terhadap akselerasi perangkat keras (GPU/ASIC).
 */
const SCRYPT_CONFIG = {
  N: 16384, // Cost parameter (2^14)
  r: 8,     // Block size parameter
  p: 1,     // Parallelization parameter
  panjangKunciByte: 64, // Panjang output digest
  panjangSaltByte: 16,  // Salt acak 128-bit
};

export interface RekamKataSandi {
  saltHex: string;
  hashHex: string;
  algoritma: string;
  parameter: string;
}

/**
 * Menghasilkan hash lambat dari kata sandi menggunakan scrypt dengan salt acak berentropi tinggi.
 * 
 * @param kataSandi Teks polos kata sandi pengguna
 * @returns String format terstruktur: $scrypt$N=16384,r=8,p=1$<salt>$<hash>
 */
export function hashKataSandi(kataSandi: string): string {
  if (!kataSandi || typeof kataSandi !== 'string' || kataSandi.length === 0) {
    throw new Error('Kata sandi tidak boleh kosong.');
  }

  // Bangkitkan salt acak 16-byte menggunakan CSPRNG
  const salt = randomBytes(SCRYPT_CONFIG.panjangSaltByte);

  // Eksekusi fungsi scrypt CPU & Memory hard
  const derivedKey = scryptSync(kataSandi, salt, SCRYPT_CONFIG.panjangKunciByte, {
    N: SCRYPT_CONFIG.N,
    r: SCRYPT_CONFIG.r,
    p: SCRYPT_CONFIG.p,
    maxmem: 32 * 1024 * 1024, // Batas memori aman 32MB
  });

  const saltHex = salt.toString('hex');
  const hashHex = derivedKey.toString('hex');

  return `$scrypt$N=${SCRYPT_CONFIG.N},r=${SCRYPT_CONFIG.r},p=${SCRYPT_CONFIG.p}$${saltHex}$${hashHex}`;
}

/**
 * Memverifikasi kata sandi terhadap hash lambat tersimpan menggunakan perbandingan waktu konstan (timing-safe).
 * 
 * @param kataSandi Teks polos yang dicoba
 * @param formatTersimpan String hash dalam format $scrypt$...
 * @returns boolean true jika cocok, false jika tidak cocok
 */
export function verifikasiKataSandi(kataSandi: string, formatTersimpan: string): boolean {
  if (!kataSandi || !formatTersimpan) return false;

  const bagian = formatTersimpan.split('$');
  // Format split: ["", "scrypt", "N=...,r=...,p=...", "<saltHex>", "<hashHex>"]
  if (bagian.length !== 5 || bagian[1] !== 'scrypt') {
    return false;
  }

  const saltHex = bagian[3];
  const hashHexAsli = bagian[4];

  if (!saltHex || !hashHexAsli) return false;

  try {
    const salt = Buffer.from(saltHex, 'hex');
    const hashAsliBuffer = Buffer.from(hashHexAsli, 'hex');

    const derivedKey = scryptSync(kataSandi, salt, hashAsliBuffer.length, {
      N: SCRYPT_CONFIG.N,
      r: SCRYPT_CONFIG.r,
      p: SCRYPT_CONFIG.p,
      maxmem: 32 * 1024 * 1024,
    });

    // Cegah Timing Attack dengan timingSafeEqual
    return timingSafeEqual(derivedKey, hashAsliBuffer);
  } catch {
    return false;
  }
}

