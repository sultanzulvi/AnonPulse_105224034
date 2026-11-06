"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { skemaTindakLanjut } from "@/lib/skema";

export type StatusFormTindakLanjut = {
  pesan?: string;
  galat?: Record<string, string[]>;
};

export async function tambahTindakLanjut(
  laporanId: number,
  _prev: StatusFormTindakLanjut,
  formData: FormData
): Promise<StatusFormTindakLanjut> {
  const hasil = skemaTindakLanjut.safeParse(Object.fromEntries(formData));

  if (!hasil.success) {
    return { galat: z.flattenError(hasil.error).fieldErrors };
  }

  try {
    await prisma.tindakLanjut.create({
      data: {
        ...hasil.data,
        laporanId,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return { galat: { petugas: ["Petugas ini sudah memberikan catatan pada laporan ini"] } };
      }
      if (e.code === "P2003") {
        return { pesan: "Laporan induk tidak ditemukan." };
      }
    }
    throw e;
  }

  revalidatePath(`/pantau/${laporanId}`);
  return { pesan: "Catatan tindak lanjut tersimpan." };
}

export async function hapusTindakLanjut(id: number, laporanId: number) {
  await prisma.tindakLanjut.deleteMany({
    where: { id, laporanId },
  });
  revalidatePath(`/pantau/${laporanId}`);
}