"use client";

import { useActionState } from "react";
import { kirimLaporan, type FormState } from "../pantau/actions";

const initialState: FormState = {};

export default function FormLaporPage() {
  const [state, formAction, isPending] = useActionState(kirimLaporan, initialState);

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-8 shadow-xl">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Formulir Pengaduan Insiden Kampus
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Isi kronologi fakta secara objektif. Hindari mencantumkan nama atau nomor identitas pribadi Anda di kolom mana pun.
        </p>

        {state.pesan && (
          <div className="mt-4 rounded-lg bg-red-950/60 border border-red-800 p-3 text-xs text-red-300">
            {state.pesan}
          </div>
        )}

        <form action={formAction} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Tanggal Kejadian *
              </label>
              <input
                type="date"
                name="tanggalKejadian"
                className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                required
              />
              {state.galat?.tanggalKejadian && (
                <p className="mt-1 text-xs text-red-400">{state.galat.tanggalKejadian[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Lokasi Kejadian *
              </label>
              <input
                type="text"
                name="lokasiKejadian"
                placeholder="Misal: Lab Komputer B Lantai 3"
                className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                required
              />
              {state.galat?.lokasiKejadian && (
                <p className="mt-1 text-xs text-red-400">{state.galat.lokasiKejadian[0]}</p>
              )}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Kronologi Lengkap *
              </label>
              <span className="text-xs text-zinc-500">Min. 10 karakter</span>
            </div>
            <textarea
              name="kronologi"
              rows={5}
              placeholder="Deskripsikan urutan waktu, rincian peristiwa, dan dampak insiden secara faktual..."
              className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
              required
            />
            {state.galat?.kronologi && (
              <p className="mt-1 text-xs text-red-400">{state.galat.kronologi[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Bukti Digital Pendukung (Opsional)
            </label>
            <input
            type="file"
            name="buktiDigital"
            accept="image/png, image/jpeg, application/pdf"
            className="mt-2 block w-full text-xs text-zinc-400 file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-800 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-zinc-200 hover:file:bg-zinc-700 file:cursor-pointer cursor-pointer"
            />
            <p className="mt-1 text-[11px] text-zinc-500">
              Format didukung: JPG, PNG, PDF (Maks. 10 MB). Metadata EXIF/geolokasi dibersihkan otomatis.
            </p>
          </div>

          <div className="flex items-start gap-3 pt-2">
            <input
              type="checkbox"
              id="pernyataanSah"
              name="pernyataanSah"
              className="mt-0.5 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-0"
              required
            />
            <label htmlFor="pernyataanSah" className="text-xs text-zinc-400 leading-normal">
              Saya menyatakan aduan ini disampaikan atas iktikad baik tanpa fitnah demi integritas sivitas akademika kampus.
            </label>
          </div>
          {state.galat?.pernyataanSah && (
            <p className="text-xs text-red-400">{state.galat.pernyataanSah[0]}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-400 disabled:opacity-50"
          >
            {isPending ? "Mengenkripsi & Menyimpan..." : "Kirim Aduan Terenkripsi"}
          </button>
        </form>
      </div>
    </div>
  );
}