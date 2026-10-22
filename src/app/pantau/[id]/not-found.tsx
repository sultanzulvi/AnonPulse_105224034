import Link from "next/link";

export default function LaporanNotFound() {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center space-y-3">
      <h1 className="text-xl font-bold text-red-900">Laporan Tidak Ditemukan</h1>
      <p className="text-sm text-red-700">
        ID laporan tidak valid atau tidak terdaftar pada sistem.
      </p>
      <Link
        href="/pantau"
        className="inline-block rounded-md bg-red-700 px-4 py-2 text-xs font-semibold text-white hover:bg-red-800"
      >
        Kembali ke Daftar Pantau
      </Link>
    </div>
  );
}