import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import { ambilDaftarLaporan } from "@/lib/data";

export const metadata: Metadata = {
  title: "Pantau Tiket | AnonPulse",
};

export default async function HalamanPantau() {
  await connection();
  // Membaca langsung 5 baris laporan dari PostgreSQL via Prisma Client
  const laporanList = await ambilDaftarLaporan();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Daftar Pantau Laporan</h1>
        <p className="text-sm text-zinc-400">Pantau progres tindak lanjut investigasi tiket secara transparan.</p>
      </div>

      <div className="space-y-4">
        {laporanList.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-5 backdrop-blur-sm transition-colors hover:border-zinc-700"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-zinc-400">{item.token}</span>
              <span className="rounded-full bg-emerald-950/60 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-800/50">
                {item.kategori.replace("_", " ").toUpperCase()}
              </span>
            </div>

            <h2 className="mt-3 text-lg font-semibold text-white">
              {item.judul}
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              Dibuat: {new Date(item.dibuatPada).toLocaleDateString("id-ID")}
            </p>
            <p className="mt-3 text-sm text-zinc-400 line-clamp-2">
              {item.deskripsi}
            </p>

            <div className="mt-4 flex justify-end border-t border-zinc-800/60 pt-3">
              <Link
                href={`/pantau/${item.id}`}
                className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
              >
                Lihat Detail &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}