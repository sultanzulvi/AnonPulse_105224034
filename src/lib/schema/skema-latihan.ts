import { z } from "zod";

export const skemaLaporan = z.object({
  judul: z
    .string()
    .trim()
    .min(5, "Judul laporan minimal 5 karakter")
    .max(100, "Judul laporan maksimal 100 karakter"),
  kategori: z.enum(["akademik", "fasilitas", "keamanan"], {
    error: "Pilih salah satu kategori yang sah",
  }),
  isiLaporan: z
    .string()
    .trim()
    .min(20, "Isi laporan minimal 20 karakter agar jelas")
    .max(1000, "Isi laporan maksimal 1000 karakter"),
  anonim: z.stringbool().default(false),
});

export type MasukanLaporan = z.infer<typeof skemaLaporan>;

export type StatusForm = {
  galat?: Record<string, string[] | undefined>;
  pesan?: string;
  nilai?: Record<string, string>;
};

export const skemaMasuk = z.object({
  email: z.string().trim().min(1, "Email wajib diisi").email("Format email tidak valid"),
  kataSandi: z.string().min(8, "Kata sandi minimal 8 karakter"),
});