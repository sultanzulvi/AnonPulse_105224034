import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { validasiKunci } from './kunci';
import { validasiAAD } from './masukan';

/**
 * Struktur payload hasil enkripsi AEAD (AES-256-GCM).
 */
export interface PayloadAEAD {
  /** Ciphertext dalam representasi heksadesimal */
  ciphertext: string;
  /** Nonce / Initialization Vector (IV) 96-bit dalam representasi heksadesimal (24 char hex) */
  iv: string;
  /** Authentication Tag 128-bit dalam representasi heksadesimal (32 char hex) */
  authTag: string;
  /** Additional Authenticated Data (opsional) */
  aad?: string;
}

const ALGORITMA_AEAD = 'aes-256-gcm';
const PANJANG_IV_BYTE = 12; // 96 bit: rekomendasi standar NIST SP 800-38D untuk AES-GCM
const PANJANG_AUTH_TAG_BYTE = 16; // 128 bit authentication tag

/**
 * Mengenkripsi teks menggunakan AES-256-GCM dengan dukungan Additional Authenticated Data (AAD).
 * 
 * CATATAN KEAMANAN (NONCE REUSE):
 * Setiap pemanggilan fungsi ini SELALU membangkitkan IV 12-byte baru menggunakan CSPRNG.
 * Penggunaan ulang (reuse) pasangan (kunci, IV) pada mode GCM adalah kerentanan fatal (catastrophic failure)
 * yang dapat memulihkan keystream XOR antar-pesan serta memalsukan authentication tag (GHASH key recovery).
 * 
 * @param plaintext Teks yang ingin dienkripsi
 * @param kunci Kunci simetris 256-bit (32 bytes Buffer)
 * @param aad Additional Authenticated Data opsional yang diikat pada tag otentikasi
 */
export function enkripsiAEAD(
  plaintext: string,
  kunci: Buffer,
  aad?: string
): PayloadAEAD {
  validasiKunci(kunci);

  if (!plaintext || plaintext.length === 0) {
    throw new Error('Teks plaintext tidak boleh kosong.');
  }

  // Bangkitkan Nonce / IV unik per enkripsi menggunakan CSPRNG sistem operasi
  const iv = randomBytes(PANJANG_IV_BYTE);
  const cipher = createCipheriv(ALGORITMA_AEAD, kunci, iv);

  // Jika terdapat AAD, ikat data tersebut ke otentikasi tag sebelum data dienkripsi
  if (aad !== undefined) {
    const aadValid = validasiAAD(aad);
    cipher.setAAD(Buffer.from(aadValid, 'utf8'));
  }

  let ciphertextHex = cipher.update(plaintext, 'utf8', 'hex');
  ciphertextHex += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return {
    ciphertext: ciphertextHex,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    ...(aad !== undefined ? { aad } : {}),
  };
}

/**
 * Mendekripsi payload dan memverifikasi integritas autentikasi AES-256-GCM.
 * Bersifat gagal tertutup: jika ciphertext, authTag, IV, atau AAD dimodifikasi,
 * fungsi akan melempar galat otentikasi dan menolak mengeluarkan plaintext parsial.
 * 
 * @param payload Objek PayloadAEAD (ciphertext, iv, authTag, aad)
 * @param kunci Kunci simetris 256-bit (32 bytes Buffer)
 * @param aadDiharapkan AAD yang diharapkan sesuai konteks verifikasi
 */
export function dekripsiAEAD(
  payload: PayloadAEAD,
  kunci: Buffer,
  aadDiharapkan?: string
): string {
  validasiKunci(kunci);

  if (!payload || typeof payload !== 'object') {
    throw new Error('Payload AEAD tidak sah.');
  }

  const { ciphertext, iv, authTag, aad } = payload;

  if (!ciphertext || typeof ciphertext !== 'string') {
    throw new Error('Payload ciphertext tidak ditemukan atau format salah.');
  }

  if (!iv || iv.length !== PANJANG_IV_BYTE * 2) {
    throw new Error(`IV tidak valid: harus berupa heksadesimal ${PANJANG_IV_BYTE * 2} karakter (12 byte).`);
  }

  if (!authTag || authTag.length !== PANJANG_AUTH_TAG_BYTE * 2) {
    throw new Error(`AuthTag tidak valid: harus berupa heksadesimal ${PANJANG_AUTH_TAG_BYTE * 2} karakter (16 byte).`);
  }

  // Verifikasi keselarasan AAD jika ditentukan
  const targetAAD = aadDiharapkan ?? aad;

  const ivBuffer = Buffer.from(iv, 'hex');
  const tagBuffer = Buffer.from(authTag, 'hex');
  const decipher = createDecipheriv(ALGORITMA_AEAD, kunci, ivBuffer);

  // Set Tag otentikasi yang harus diverifikasi
  decipher.setAuthTag(tagBuffer);

  if (targetAAD !== undefined) {
    decipher.setAAD(Buffer.from(targetAAD, 'utf8'));
  }

  try {
    let plaintext = decipher.update(ciphertext, 'hex', 'utf8');
    plaintext += decipher.final('utf8');
    return plaintext;
  } catch (err) {
    // Gagal tertutup: tolak semua masukan yang gagal verifikasi tanpa membuka detail internal
    throw new Error(
      'Autentikasi data gagal: data ciphertext, tag, atau AAD telah dimanipulasi atau kunci tidak sah.'
    );
  }
}

