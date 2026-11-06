import { notFound } from "next/navigation";
import Link from "next/link";
import { ambilLaporanDetail } from "@/lib/data";
import { hapusTindakLanjut } from "../tindak-lanjut-actions";
import { hapusLaporan } from "../actions";

export default async function DetailLaporan({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);

  if (!Number.isInteger(id) || id <= 0) {
    notFound();
  }

  const laporan = await ambilLaporanDetail(id);
  if (!laporan) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link
        href="/pantau"
        className="inline-flex items-center text-sm text-zinc-400 hover:text-white transition-colors"
      >
        &larr; Kembali ke Daftar Pantau
      </Link>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-emerald-950/60 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-800/50">
            {laporan.kategori.replace("_", " ").toUpperCase()}
          </span>
          <span className="font-mono text-xs text-zinc-400">Token: {laporan.token}</span>
        </div>
        <h1 className="mt-4 text-2xl font-bold text-white">{laporan.judul}</h1>
        <p className="mt-1 text-xs text-zinc-500">
          Waktu Lapor: {new Date(laporan.dibuatPada).toLocaleString("id-ID")}
        </p>
        <p className="mt-4 text-sm text-zinc-300 leading-relaxed">{laporan.deskripsi}</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">
          Riwayat Tindak Lanjut ({laporan.tindakLanjut.length})
        </h2>

        {laporan.tindakLanjut.length === 0 ? (
          <p className="text-sm text-zinc-500">Belum ada catatan tindak lanjut dari petugas.</p>
        ) : (
          <ul className="space-y-3">
            {laporan.tindakLanjut.map((tl) => (
              <li key={tl.id} className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm text-zinc-200">{tl.petugas}</span>
                  <span className="text-xs bg-blue-950 text-blue-400 border border-blue-800/50 px-2.5 py-0.5 rounded-full">
                    Tahap {tl.tahap}/5
                  </span>
                </div>
                <p className="mt-2 text-sm text-zinc-400">{tl.catatan}</p>
                <form action={hapusTindakLanjut.bind(null, tl.id, laporan.id)} className="mt-3">
                  <button
                    type="submit"
                    className="text-xs text-red-400 hover:text-red-300 underline"
                  >
                    Hapus Catatan Ini
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <form action={hapusLaporan.bind(null, laporan.id)} className="pt-6 border-t border-zinc-800">
          <button
            type="submit"
            className="rounded-lg bg-red-900/80 px-4 py-2 text-sm font-medium text-red-200 hover:bg-red-800 border border-red-700/50 transition-colors"
          >
            Hapus Laporan Ini Beserta Riwayat
          </button>
        </form>
      </div>
    </div>
  );
}