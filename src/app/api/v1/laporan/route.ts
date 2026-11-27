import { NextRequest } from "next/server";
import { z } from "zod";
import { Prisma } from "../../../../../generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { bacaJson, problem, problemValidasi } from "@/lib/problem";
import { skemaKueriLaporan, skemaPostLaporan } from "@/lib/skema";

export const kolomLaporanApi = {
  id: true,
  token: true,
  judul: true,
  kategori: true,
  tanggalKejadian: true,
  lokasiKejadian: true,
  deskripsi: true,
  tersedia: true,
  lampiran: true,
  dibuatPada: true,
  diperbaruiPada: true,
} as const;

// GET /api/v1/laporan?halaman=1&batas=10&kategori=pelecehan
export async function GET(request: NextRequest) {
  const kueri = skemaKueriLaporan.safeParse(
    Object.fromEntries(request.nextUrl.searchParams)
  );
  if (!kueri.success) {
    return problem(400, "Bad Request", {
      detail: "Parameter kueri tidak valid.",
      errors: z.flattenError(kueri.error).fieldErrors,
    });
  }

  const { halaman, batas, kategori } = kueri.data;
  const where = kategori ? { kategori } : {};

  const [data, total] = await prisma.$transaction([
    prisma.laporan.findMany({
      where,
      select: kolomLaporanApi,
      orderBy: { id: "asc" },
      skip: (halaman - 1) * batas,
      take: batas,
    }),
    prisma.laporan.count({ where }),
  ]);

  return Response.json({ data, meta: { halaman, batas, total } });
}

// POST /api/v1/laporan
export async function POST(request: NextRequest) {
  const body = await bacaJson(request);
  if (!body.ok) return body.response;

  const hasil = skemaPostLaporan.safeParse(body.data);
  if (!hasil.success) {
    return problemValidasi(hasil.error);
  }

  const tokenAcak =
    "TKN-" + Math.random().toString(36).substring(2, 8).toUpperCase();

  try {
    const dibuat = await prisma.laporan.create({
      data: {
        token: tokenAcak,
        judul: hasil.data.judul,
        kategori: hasil.data.kategori,
        tanggalKejadian: hasil.data.tanggalKejadian,
        lokasiKejadian: hasil.data.lokasiKejadian,
        deskripsi: hasil.data.deskripsi,
        tersedia: hasil.data.tersedia,
        lampiran: hasil.data.lampiran ?? null,
        pernyataanSah: true,
      },
      select: kolomLaporanApi,
    });

    return Response.json(
      { data: dibuat },
      {
        status: 201,
        headers: {
          Location: `/api/v1/laporan/${dibuat.id}`,
        },
      }
    );
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return problem(409, "Conflict", {
        detail: "Judul laporan sudah terdaftar.",
        errors: { judul: ["Judul laporan sudah terdaftar."] },
      });
    }
    throw e;
  }
}

