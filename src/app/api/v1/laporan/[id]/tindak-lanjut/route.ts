import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { bacaId, problem } from "@/lib/problem";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/v1/laporan/{id}/tindak-lanjut
export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { id: rawId } = await params;
  const cekId = bacaId(rawId);
  if (!cekId.ok) return cekId.response;

  const laporan = await prisma.laporan.findUnique({
    where: { id: cekId.id },
    select: {
      id: true,
      tindakLanjut: {
        select: {
          id: true,
          laporanId: true,
          petugas: true,
          tahap: true,
          catatan: true,
          dibuatPada: true,
        },
        orderBy: { dibuatPada: "desc" },
      },
    },
  });

  if (!laporan) {
    return problem(404, "Not Found", {
      detail: `Laporan dengan ID ${cekId.id} tidak ditemukan.`,
    });
  }

  return Response.json({
    data: laporan.tindakLanjut,
    meta: {
      laporanId: laporan.id,
      total: laporan.tindakLanjut.length,
    },
  });
}
