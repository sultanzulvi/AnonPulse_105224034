import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  authTag: string;
}

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit standar NIST untuk GCM mode

/**
 * Mengenkripsi teks aduan menggunakan AES-256-GCM
 * @param plaintext Teks yang ingin dienkripsi
 * @param key Kunci simetris 256-bit (32 bytes Buffer)
 */
export function encryptText(plaintext: string, key: Buffer): EncryptedPayload {
  if (key.length !== 32) {
    throw new Error('Panjang kunci enkripsi harus tepat 32 byte (256 bit).');
  }
  if (!plaintext || plaintext.trim() === '') {
    throw new Error('Teks plaintext tidak boleh kosong.');
  }

  // Sumber keacakan aman (CSPRNG)
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
  ciphertext += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return {
    ciphertext,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  };
}

/**
 * Mendekripsi payload terenkripsi menggunakan AES-256-GCM
 * @param payload Objek berisi ciphertext, iv, dan authTag
 * @param key Kunci simetris 256-bit (32 bytes Buffer)
 */
export function decryptText(payload: EncryptedPayload, key: Buffer): string {
  if (key.length !== 32) {
    throw new Error('Panjang kunci enkripsi harus tepat 32 byte (256 bit).');
  }

  const iv = Buffer.from(payload.iv, 'hex');
  const authTag = Buffer.from(payload.authTag, 'hex');
  const decipher = createDecipheriv(ALGORITHM, key, iv);

  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(payload.ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}