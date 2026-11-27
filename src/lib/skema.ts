import { z } from "zod";

export const daftarKategoriLaporan = [
  "pelecehan",
  "perundungan",
  "kecurangan_akademik",
  "fasilitas",
  "lainnya",
] as const;

export const skemaLaporan = z.object({
  judul: z.string().min(5, "Judul minimal 5 karakter").max(100, "Judul maksimal 100 karakter"),
  kategori: z.enum(daftarKategoriLaporan),
  deskripsi: z.string().min(10, "Deskripsi minimal 10 karakter").max(1000, "Deskripsi maksimal 1000 karakter"),
  // Modul 7: "true" -> true, "false" -> false; nilai lain ditolak
  tersedia: z.stringbool(),
});

export type MasukanLaporan = z.infer<typeof skemaLaporan>;

export const skemaTindakLanjut = z.object({
  petugas: z.string().min(2, "Nama petugas minimal 2 karakter").max(60, "Nama petugas maksimal 60 karakter"),
  tahap: z.coerce.number().int().min(1, "Tahap minimal 1").max(5, "Tahap maksimal 5"),
  catatan: z.string().min(5, "Catatan minimal 5 karakter").max(500, "Catatan maksimal 500 karakter"),
});

/**
 * Modul 8: Skema query GET /api/v1/laporan (batas maks 50).
 */
export const skemaKueriLaporan = z.object({
  halaman: z.coerce.number().int().min(1, "Halaman minimal 1").default(1),
  batas: z.coerce.number().int().min(1, "Batas minimal 1").max(50, "Batas maksimal 50").default(10),
  kategori: z.enum(daftarKategoriLaporan).optional(),
});

/**
 * Modul 8: Skema body POST /api/v1/laporan.
 */
export const skemaPostLaporan = z.object({
  judul: z.string().trim().min(5, "Judul minimal 5 karakter").max(100, "Judul maksimal 100 karakter"),
  kategori: z.enum(daftarKategoriLaporan).default("lainnya"),
  deskripsi: z.string().trim().min(10, "Deskripsi minimal 10 karakter").max(1000, "Deskripsi maksimal 1000 karakter"),
  lokasiKejadian: z.string().trim().min(3, "Lokasi minimal 3 karakter").max(150).default("Lingkungan Kampus"),
  tanggalKejadian: z.coerce.date().default(() => new Date()),
  tersedia: z.boolean().default(true),
  lampiran: z.string().trim().nullable().optional(),
});

/**
 * Modul 8: Skema body PATCH /api/v1/laporan/{id} (parsial, minimal 1 field).
 */
export const skemaPatchLaporan = z
  .object({
    judul: z.string().trim().min(5, "Judul minimal 5 karakter").max(100, "Judul maksimal 100 karakter").optional(),
    kategori: z.enum(daftarKategoriLaporan).optional(),
    deskripsi: z.string().trim().min(10, "Deskripsi minimal 10 karakter").max(1000, "Deskripsi maksimal 1000 karakter").optional(),
    lokasiKejadian: z.string().trim().min(3, "Lokasi minimal 3 karakter").max(150).optional(),
    tersedia: z.boolean().optional(),
    lampiran: z.string().trim().nullable().optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "Body PATCH tidak boleh kosong; sertakan minimal satu field yang ingin diubah.",
  });
