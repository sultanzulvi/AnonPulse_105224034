import { NextRequest } from "next/server";
import { Prisma } from "../../../../../../generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { bacaId, bacaJson, problem, problemValidasi } from "@/lib/problem";
import { skemaPatchLaporan } from "@/lib/skema";
import { kolomLaporanApi } from "../route";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/v1/laporan/{id}
export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { id: rawId } = await params;
  const cekId = bacaId(rawId);
  if (!cekId.ok) return cekId.response;

  const laporan = await prisma.laporan.findUnique({
    where: { id: cekId.id },
    select: kolomLaporanApi,
  });

  if (!laporan) {
    return problem(404, "Not Found", {
      detail: `Laporan dengan ID ${cekId.id} tidak ditemukan.`,
    });
  }

  return Response.json({ data: laporan });
}

// PATCH /api/v1/laporan/{id}
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { id: rawId } = await params;
  const cekId = bacaId(rawId);
  if (!cekId.ok) return cekId.response;

  const body = await bacaJson(request);
  if (!body.ok) return body.response;

  const hasil = skemaPatchLaporan.safeParse(body.data);
  if (!hasil.success) {
    return problemValidasi(hasil.error);
  }

  try {
    const diperbarui = await prisma.laporan.update({
      where: { id: cekId.id },
      data: hasil.data,
      select: kolomLaporanApi,
    });

    return Response.json({ data: diperbarui });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025") {
        return problem(404, "Not Found", {
          detail: `Laporan dengan ID ${cekId.id} tidak ditemukan.`,
        });
      }
      if (e.code === "P2002") {
        return problem(409, "Conflict", {
          detail: "Judul laporan sudah terdaftar.",
          errors: { judul: ["Judul laporan sudah terdaftar."] },
        });
      }
    }
    throw e;
  }
}

// DELETE /api/v1/laporan/{id}
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const { id: rawId } = await params;
  const cekId = bacaId(rawId);
  if (!cekId.ok) return cekId.response;

  const jumlahTindakLanjut = await prisma.tindakLanjut.count({
    where: { laporanId: cekId.id },
  });

  if (jumlahTindakLanjut > 0) {
    return problem(409, "Conflict", {
      detail: `Laporan ID ${cekId.id} tidak dapat dihapus karena masih memiliki ${jumlahTindakLanjut} riwayat tindak lanjut aktif (ON DELETE RESTRICT).`,
    });
  }

  try {
    await prisma.laporan.delete({
      where: { id: cekId.id },
    });
    return new Response(null, { status: 204 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025") {
        return problem(404, "Not Found", {
          detail: `Laporan dengan ID ${cekId.id} tidak ditemukan.`,
        });
      }
      if (e.code === "P2003") {
        return problem(409, "Conflict", {
          detail: "Laporan masih dirujuk oleh data tindak lanjut.",
        });
      }
    }
    throw e;
  }
}
