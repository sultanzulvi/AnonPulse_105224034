import Link from "next/link";
import { MOCK_REPORTS } from "@/data/mockReports";

export default function HalamanPantau() {
  const daftarLaporan = Object.values(MOCK_REPORTS);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">
          Daftar Pantau Laporan
        </h1>
        <p className="mt-1 text-xs text-zinc-400">
          Pantau progres tindak lanjut investigasi tiket secara transparan.
        </p>
      </div>

      <div className="grid gap-4">
        {daftarLaporan.map((item) => (
          <div
            key={item.ticketCode}
            className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-sm space-y-4 transition-all hover:border-zinc-700/80"
          >
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
              <span className="font-mono text-xs text-zinc-400">
                #{item.ticketCode}
              </span>
              <span className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                {item.status}
              </span>
            </div>

            <div>
              <h2 className="text-base font-bold text-white">
                <Link
                  href={`/pantau/${item.ticketCode}`}
                  className="transition hover:text-emerald-400"
                >
                  {item.location}
                </Link>
              </h2>
              <p className="mt-1 text-xs text-zinc-500">
                Tanggal Kejadian: {item.dateIncident}
              </p>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2">
              {item.description}
            </p>

            <div className="flex justify-end pt-2">
              <Link
                href={`/pantau/${item.ticketCode}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 transition hover:text-emerald-300"
              >
                <span>Lihat Detail</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}