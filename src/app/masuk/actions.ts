"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { skemaMasuk, StatusForm } from "@/lib/schema/skema-latihan";
import { buatSesi, hapusSesi } from "@/lib/sesi";

export async function masuk(
  _sebelumnya: StatusForm,
  formData: FormData
): Promise<StatusForm> {
  const mentah = Object.fromEntries(formData);
  const hasil = skemaMasuk.safeParse(mentah);

  if (!hasil.success) {
    return { galat: z.flattenError(hasil.error).fieldErrors };
  }

  const { email, kataSandi } = hasil.data;

  if (
    email !== process.env.DEMO_EMAIL ||
    kataSandi !== process.env.DEMO_KATA_SANDI
  ) {
    return { pesan: "Email atau kata sandi salah." };
  }

  await buatSesi(email);
  redirect("/latihan");
}

export async function keluar() {
  await hapusSesi();
  redirect("/");
}