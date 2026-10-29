"use server";

import { z } from "zod";
import { skemaLaporan, StatusForm } from "@/lib/schema/skema-latihan";
import { bacaSesi } from "@/lib/sesi"; // Tambahkan impor ini

export async function kirimLaporanLatihan(
  _sebelumnya: StatusForm,
  formData: FormData
): Promise<StatusForm> {
  // 1. Verifikasi Sesi Server-Side
  const sesi = await bacaSesi();
  if (!sesi) {
    return {
      pesan: "Silakan masuk terlebih dahulu.",
    };
  }

  const mentah = Object.fromEntries(formData);
  const nilai = {
    judul: String(mentah.judul ?? ""),
    kategori: String(mentah.kategori ?? ""),
    isiLaporan: String(mentah.isiLaporan ?? ""),
  };

  const hasil = skemaLaporan.safeParse(mentah);

  if (!hasil.success) {
    return {
      galat: z.flattenError(hasil.error).fieldErrors,
      pesan: "Ada kesalahan pada isian formulir. Silakan periksa kembali.",
      nilai,
    };
  }

  return {
    pesan: "Laporan berhasil divalidasi dan dikirim!",
  };
}