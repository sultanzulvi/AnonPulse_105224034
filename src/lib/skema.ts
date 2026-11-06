import { z } from "zod";

export const skemaLaporan = z.object({
  judul: z.string().min(5, "Judul minimal 5 karakter").max(100, "Judul maksimal 100 karakter"),
  kategori: z.enum([
    "pelecehan",
    "perundungan",
    "kecurangan_akademik",
    "fasilitas",
    "lainnya",
  ]),
  deskripsi: z.string().min(10, "Deskripsi minimal 10 karakter").max(1000, "Deskripsi maksimal 1000 karakter"),
  tersedia: z.boolean().default(true),
});

export const skemaTindakLanjut = z.object({
  petugas: z.string().min(2, "Nama petugas minimal 2 karakter").max(60, "Nama petugas maksimal 60 karakter"),
  tahap: z.coerce.number().int().min(1, "Tahap minimal 1").max(5, "Tahap maksimal 5"),
  catatan: z.string().min(5, "Catatan minimal 5 karakter").max(500, "Catatan maksimal 500 karakter"),
});