import { createHash, randomBytes } from 'crypto';

/**
 * Membangkitkan token acak pelacak dengan entropi tinggi (CSPRNG)
 * Format output sintetis: ANON-XXXX-XXXX
 */
export function generateTrackingToken(): string {
  const bytes = randomBytes(8).toString('hex').toUpperCase();
  return `ANON-${bytes.slice(0, 4)}-${bytes.slice(4, 8)}`;
}

/**
 * Menghasilkan hash deterministik satu arah menggunakan SHA-256
 * @param token String token pelacak mentah
 */
export function hashToken(token: string): string {
  if (!token || token.trim() === '') {
    throw new Error('Token tidak valid untuk di-hash.');
  }
  return createHash('sha256').update(token.trim()).digest('hex');
}

/**
 * Menghitung digest SHA-256 dari berkas biner/buffer untuk validasi integritas
 * @param fileBuffer Buffer data berkas
 */
export function computeFileDigest(fileBuffer: Buffer): string {
  if (!fileBuffer || fileBuffer.length === 0) {
    throw new Error('Buffer berkas tidak boleh kosong.');
  }
  return createHash('sha256').update(fileBuffer).digest('hex');
}