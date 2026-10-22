import Link from "next/link";

export default function GlobalNotFound() {
  return (
    <main id="konten" className="mx-auto max-w-2xl py-16 text-center space-y-4">
      <h1 className="text-4xl font-extrabold text-slate-900">404</h1>
      <p className="text-lg text-slate-600">Halaman yang Anda tuju tidak ditemukan.</p>
      <Link
        href="/"
        className="inline-block rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
      >
        Kembali ke Beranda
      </Link>
    </main>
  );
}