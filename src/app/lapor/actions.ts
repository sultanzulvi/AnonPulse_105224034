"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type FormState = {
  sukses?: boolean;
  pesan?: string;
  galat?: Record<string, string[]>;
};

export async function kirimLaporan(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const tanggalRaw = formData.get("tanggalKejadian") as string;
  const lokasi = (formData.get("lokasiKejadian") as string)?.trim();
  const kronologi = (formData.get("kronologi") as string)?.trim();
  const iktikadBaik = formData.get("pernyataanSah") === "on";

  // Ambil nama file lampiran jika ada
  const berkas = formData.get("buktiDigital") as File | null;
  const namaLampiran = berkas && berkas.size > 0 ? berkas.name : null;

  // Validasi input
  const galat: Record<string, string[]> = {};
  if (!tanggalRaw) galat.tanggalKejadian = ["Tanggal kejadian wajib diisi"];
  if (!lokasi || lokasi.length < 3) galat.lokasiKejadian = ["Lokasi minimal 3 karakter"];
  if (!kronologi || kronologi.length < 10) galat.kronologi = ["Kronologi minimal 10 karakter"];
  if (!iktikadBaik) galat.pernyataanSah = ["Pernyataan integritas wajib dicentang"];

  if (Object.keys(galat).length > 0) {
    return { galat };
  }

  // Validasi objek Date
  const tanggalObj = new Date(tanggalRaw);
  if (isNaN(tanggalObj.getTime())) {
    return { galat: { tanggalKejadian: ["Format tanggal tidak valid"] } };
  }

  // Token unik acak & judul unik
  const tokenAcak = "TKN-" + Math.random().toString(36).substring(2, 8).toUpperCase();
  const judulOtomatis = `Insiden di ${lokasi} (${tanggalRaw}) - ${tokenAcak.substring(4)}`;

  try {
  await prisma.laporan.create({
    data: {
      token: tokenAcak,
      judul: judulOtomatis,
      kategori: "lainnya",
      tanggalKejadian: new Date(tanggalRaw),
      lokasiKejadian: lokasi,
      deskripsi: kronologi,
      lampiran: namaLampiran,
      pernyataanSah: true,
      tersedia: true,
    },
  });
} catch (e) {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
    return {
      galat: {
        lokasiKejadian: [
          "Laporan dengan lokasi dan tanggal yang sama sudah pernah dilaporkan.",
        ],
      },
    };
  }
  console.error("Gagal menyimpan ke database:", e);
  return { pesan: "Terjadi kesalahan internal server saat menyimpan laporan." };
}

revalidatePath("/pantau");
redirect("/pantau");
}