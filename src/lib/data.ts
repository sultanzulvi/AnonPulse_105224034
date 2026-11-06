import "server-only";
import { prisma } from "./prisma";

const kolomLaporan = {
  id: true,
  token: true,
  judul: true,
  kategori: true,
  deskripsi: true,
  tersedia: true,
  lampiran: true,
  dibuatPada: true,
} as const;

export async function ambilDaftarLaporan() {
  return prisma.laporan.findMany({
    select: kolomLaporan,
    orderBy: { dibuatPada: "desc" },
  });
}

export async function ambilLaporanDetail(id: number) {
  return prisma.laporan.findUnique({
    where: { id },
    select: {
      ...kolomLaporan,
      tindakLanjut: {
        select: {
          id: true,
          petugas: true,
          tahap: true,
          catatan: true,
          dibuatPada: true,
        },
        orderBy: { dibuatPada: "desc" },
      },
    },
  });
}