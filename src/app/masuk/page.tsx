import type { Metadata } from "next";
import FormMasuk from "@/components/FormMasuk";

export const metadata: Metadata = { title: "Masuk Pengelola | AnonPulse" };

export default function HalamanMasuk() {
  return (
    <main id="konten" className="flex min-h-screen items-center justify-center p-4 bg-black text-white">
      <div className="w-full max-w-md rounded-xl border border-neutral-800 bg-[#12161f] p-8 shadow-2xl">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          Masuk Pengelola
        </h1>
        <p className="text-sm text-neutral-400 mb-6">
          Gunakan akun demo terdaftar untuk mengelola laporan masuk.
        </p>
        <FormMasuk />
      </div>
    </main>
  );
}