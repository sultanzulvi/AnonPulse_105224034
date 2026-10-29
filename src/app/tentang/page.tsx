import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tentang | AnonPulse",
};

export default function HalamanTentang() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <main id="konten" className="mx-auto max-w-3xl px-4 py-16 space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Tentang Platform
        </div>
        
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          AnonPulse
        </h1>
        
        <p className="text-sm text-zinc-400 leading-relaxed">
          AnonPulse adalah platform pelaporan pelanggaran kampus secara anonim yang menjaga privasi pelapor melalui enkripsi sisi klien. Platform ini memfasilitasi penyampaian aspirasi dan laporan insiden secara aman, terverifikasi, dan transparan tanpa membahayakan identitas sivitas akademika.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 pt-4">
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Privasi Mutlak</h2>
            <p className="mt-1 text-xs text-zinc-400">Data identitas pelapor tidak direkam ke server logs maupun basis data.</p>
          </div>
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Kriptografi Klien</h2>
            <p className="mt-1 text-xs text-zinc-400">Enkripsi payload laporan dijalankan langsung di peramban pengguna.</p>
          </div>
        </div>
      </main>
    </div>
  );
}``