/**
 * Modul Penanganan Masukan Kriptografi
 * Menerapkan prinsip validasi di batas kepercayaan (boundary validation),
 * allowlist, normalisasi Unicode NFC, dan respon gagal tertutup (fail-closed).
 */

export interface MasukanAduanBersih {
  teksTernormalisasi: string;
  panjangKarakter: number;
}

const MIN_KARAKTER = 10;
const MAX_KARAKTER = 10000;

/**
 * Memvalidasi dan menormalisasi teks aduan sebelum masuk ke operasi kriptografi.
 * 
 * @param teksMentah String masukan dari pengguna
 * @returns Objek MasukanAduanBersih berisi teks yang telah dinormalisasi ke NFC
 * @throws Error jika masukan melanggar batasan ukuran atau format
 */
export function validasiDanNormalisasiMasukan(teksMentah: unknown): MasukanAduanBersih {
  if (typeof teksMentah !== 'string') {
    throw new Error('Tipe masukan aduan tidak sah: wajib berupa teks (string).');
  }

  // Normalisasi Unicode NFC untuk mencegah "makna sama, representasi byte berbeda"
  const teksTernormalisasi = teksMentah.normalize('NFC').trim();

  // Pemeriksaan karakter kontrol berbahaya (kecuali newline, tab, carriage return)
  // Menolak karakter ASCII 0x00 - 0x08, 0x0B, 0x0C, 0x0E - 0x1F
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(teksTernormalisasi)) {
    throw new Error('Teks aduan memuat karakter kendali yang tidak diizinkan.');
  }

  if (teksTernormalisasi.length < MIN_KARAKTER) {
    throw new Error(
      `Teks aduan terlalu pendek: minimal ${MIN_KARAKTER} karakter (aktual: ${teksTernormalisasi.length}).`
    );
  }

  if (teksTernormalisasi.length > MAX_KARAKTER) {
    throw new Error(
      `Teks aduan melebihi batas: maksimal ${MAX_KARAKTER} karakter (aktual: ${teksTernormalisasi.length}).`
    );
  }

  return {
    teksTernormalisasi,
    panjangKarakter: teksTernormalisasi.length,
  };
}

/**
 * Memvalidasi format Additional Authenticated Data (AAD) seperti kode token.
 */
export function validasiAAD(aad: unknown): string {
  if (typeof aad !== 'string') {
    throw new Error('AAD tidak sah: wajib berupa string.');
  }
  const aadBersih = aad.trim();
  if (aadBersih === '') {
    throw new Error('AAD tidak boleh berupa string kosong.');
  }
  return aadBersih;
}

