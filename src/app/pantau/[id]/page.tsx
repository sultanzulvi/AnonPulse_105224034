import Link from "next/link";
import { notFound } from "next/navigation";
import { cariLaporan, MOCK_REPORTS } from "@/data/mockReports";

export function generateStaticParams() {
  return Object.keys(MOCK_REPORTS).map((id) => ({ id }));
}

export default async function HalamanDetailLaporan({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cleanId = decodeURIComponent(id);

  const laporan = cariLaporan(cleanId);
  if (!laporan) {
    notFound();
  }

  return (
    <main id="konten" className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-sm space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <span className="font-mono text-xs text-zinc-500">Kode Tiket: #{laporan.ticketCode}</span>
          <h1 className="text-xl font-extrabold text-white mt-1">{laporan.location}</h1>
          <p className="text-xs text-zinc-400 mt-0.5">Insiden: {laporan.dateIncident}</p>
        </div>
        <span className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400">
          {laporan.status}
        </span>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Deskripsi Insiden:</p>
        <p className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-xs text-zinc-300 leading-relaxed">
          {laporan.description}
        </p>
      </div>

      {laporan.timeline && laporan.timeline.length > 0 && (
        <div className="space-y-3 pt-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Timeline Penanganan:</p>
          <div className="space-y-2">
            {laporan.timeline.map((t, idx) => (
              <div key={idx} className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3 text-xs">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="font-bold text-emerald-400">{t.stage}</span>
                  <span className="text-[11px] font-mono text-zinc-500">{t.timestamp}</span>
                </div>
                <p className="text-zinc-300 mt-1">{t.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-zinc-800 flex justify-between items-center text-xs">
        <span className="text-zinc-500">Dibuat: {laporan.createdAt}</span>
        <Link href="/pantau" className="font-semibold text-emerald-400 hover:text-emerald-300 transition">
          &larr; Kembali ke daftar pantau
        </Link>
      </div>
    </main>
  );
}