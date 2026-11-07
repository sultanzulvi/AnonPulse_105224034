/**
 * Modul Integrasi Kriptografi Lanjutan (Tugas 2)
 * Menghubungkan Komponen Dasar Tugas 1 (T1) dan Komponen Lanjutan Tugas 2 (T2)
 * Pola Integrasi:
 * 1. Kunci mengalir: Kunci induk diturunkan menggunakan HKDF-SHA256 (T2) menjadi kunci aduan spesifik.
 * 2. Data berlapis / AAD: Token acak T1 dijadikan AAD untuk mengikat metadata ke enkripsi AEAD T2.
 * 3. Hashing deterministik: Token T1 di-hash menggunakan SHA-256 (T1) untuk penyimpanan indeks.
 */

import { generateTrackingToken, hashToken } from './hashing';
import { turunkanKunci } from './kunci';
import { enkripsiAEAD, dekripsiAEAD, type PayloadAEAD } from './aead';
import { validasiDanNormalisasiMasukan } from './masukan';

export interface PaketAduanTerproteksi {
  /** Token rahasia pelapor T1 (diberikan kepada pelapor, format ANON-XXXX-XXXX) */
  tokenRahasia: string;
  /** Hash SHA-256 dari token untuk indeks pencarian di basis data (T1) */
  tokenHash: string;
  /** Payload terenkripsi AEAD AES-256-GCM dengan token sebagai AAD (T2) */
  payloadTerenkripsi: PayloadAEAD;
}

const KONTEKS_HKDF_ADUAN = 'anonpulse v0.2 aduan';

/**
 * Menjalankan satu alur lengkap pemrosesan aduan:
 * Masukan -> Validasi & Normalisasi -> Kunci Turunan HKDF (T2) -> Pembangkitan Token (T1) -> Enkripsi AEAD (T2) -> Hash Token (T1)
 * 
 * @param teksKronologiMentah Narasi insiden dari pelapor
 * @param kunciInduk Kunci master 256-bit sistem
 * @returns Paket aduan terproteksi siap simpan ke basis data
 */
export function amankanLaporan(
  teksKronologiMentah: string,
  kunciInduk: Buffer
): PaketAduanTerproteksi {
  // 1. Validasi masukan di batas (allowlist & NFC)
  const { teksTernormalisasi } = validasiDanNormalisasiMasukan(teksKronologiMentah);

  // 2. Turunkan kunci khusus aduan melalui HKDF T2 (Satu Kunci, Satu Tujuan)
  const kunciAduan = turunkanKunci(kunciInduk, KONTEKS_HKDF_ADUAN);

  // 3. Bangkitkan token pelacak anonim unik T1
  const tokenRahasia = generateTrackingToken();

  // 4. Enkripsi teks aduan menggunakan AEAD T2 dengan mengikat token T1 sebagai AAD
  // Keterikatan: jika token berubah, verifikasi AEAD gagal
  const payloadTerenkripsi = enkripsiAEAD(teksTernormalisasi, kunciAduan, tokenRahasia);

  // 5. Bangkitkan hash digest token T1 untuk indeks penyimpanan
  const tokenHash = hashToken(tokenRahasia);

  return {
    tokenRahasia,
    tokenHash,
    payloadTerenkripsi,
  };
}

/**
 * Membuka dan memverifikasi laporan terenkripsi dengan token pelapor.
 * Bersifat gagal tertutup: jika token salah, ciphertext diubah, atau tag rusak,
 * proses akan ditolak tanpa membocorkan data.
 * 
 * @param payloadTerenkripsi Objek PayloadAEAD dari database
 * @param tokenPelapor Token rahasia yang dimasukkan pelapor
 * @param kunciInduk Kunci master sistem
 */
export function bukaLaporan(
  payloadTerenkripsi: PayloadAEAD,
  tokenPelapor: string,
  kunciInduk: Buffer
): string {
  // 1. Turunkan kunci yang sama melalui HKDF T2
  const kunciAduan = turunkanKunci(kunciInduk, KONTEKS_HKDF_ADUAN);

  // 2. Lakukan dekripsi AEAD dengan memverifikasi AAD token T1
  return dekripsiAEAD(payloadTerenkripsi, kunciAduan, tokenPelapor);
}

