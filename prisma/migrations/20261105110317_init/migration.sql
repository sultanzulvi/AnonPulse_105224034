-- CreateEnum
CREATE TYPE "KategoriLaporan" AS ENUM ('pelecehan', 'perundungan', 'kecurangan_akademik', 'fasilitas', 'lainnya');

-- CreateEnum
CREATE TYPE "StatusLaporan" AS ENUM ('menunggu', 'diproses', 'selesai', 'ditolak');

-- CreateTable
CREATE TABLE "Laporan" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "kategori" "KategoriLaporan" NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "tersedia" BOOLEAN NOT NULL DEFAULT true,
    "lampiran" TEXT,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Laporan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TindakLanjut" (
    "id" SERIAL NOT NULL,
    "petugas" TEXT NOT NULL,
    "tahap" INTEGER NOT NULL,
    "catatan" TEXT NOT NULL,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "laporanId" INTEGER NOT NULL,

    CONSTRAINT "TindakLanjut_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Laporan_token_key" ON "Laporan"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Laporan_judul_key" ON "Laporan"("judul");

-- CreateIndex
CREATE UNIQUE INDEX "TindakLanjut_laporanId_petugas_key" ON "TindakLanjut"("laporanId", "petugas");

-- AddForeignKey
ALTER TABLE "TindakLanjut" ADD CONSTRAINT "TindakLanjut_laporanId_fkey" FOREIGN KEY ("laporanId") REFERENCES "Laporan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
