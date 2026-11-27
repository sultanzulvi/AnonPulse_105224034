import { notFound } from "next/navigation";
import Link from "next/link";
import { ambilLaporanDetail } from "@/lib/data";
import FormUbahLaporan from "@/components/FormUbahLaporan";

export default async function EditLaporanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const id = Number(rawId);

  if (!Number.isInteger(id) || id <= 0) {
    notFound();
  }

  const laporan = await ambilLaporanDetail(id);
  if (!laporan) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href={`/pantau/${laporan.id}`}
        className="inline-flex items-center text-sm text-zinc-400 hover:text-white transition-colors"
      >
        &larr; Kembali ke Detail Laporan
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Ubah Data Laporan</h1>
        <p className="mt-1 text-xs font-mono text-zinc-400">Token: {laporan.token}</p>
      </div>

      <FormUbahLaporan laporan={laporan} />
    </div>
  );
}
