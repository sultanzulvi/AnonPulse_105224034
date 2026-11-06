import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { dataAwalLaporan } from "./data-awal";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  for (const data of dataAwalLaporan) {
    const laporan = await prisma.laporan.upsert({
      where: { judul: data.judul },
      update: {},
      create: data,
    });

    await prisma.tindakLanjut.upsert({
      where: {
        laporanId_petugas: {
          laporanId: laporan.id,
          petugas: "Satgas Investigasi",
        },
      },
      update: {},
      create: {
        laporanId: laporan.id,
        petugas: "Satgas Investigasi",
        tahap: 1,
        catatan: "Laporan telah diverifikasi dan masuk tahap investigasi awal.",
      },
    });
  }

  const jumlahLaporan = await prisma.laporan.count();
  const jumlahTindakLanjut = await prisma.tindakLanjut.count();
  console.log(`Seed selesai: ${jumlahLaporan} laporan, ${jumlahTindakLanjut} tindak lanjut`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());