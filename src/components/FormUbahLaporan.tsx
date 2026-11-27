"use client";

import { useActionState } from "react";
import { ubahLaporan, type FormState } from "@/app/pantau/actions";

type PropsLaporan = {
  id: number;
  judul: string;
  kategori: string;
  deskripsi: string;
  tersedia: boolean;
};

const initialState: FormState = {};

export default function FormUbahLaporan({ laporan }: { laporan: PropsLaporan }) {
  const [state, formAction, pending] = useActionState(
    ubahLaporan.bind(null, laporan.id),
    initialState
  );

  return (
    <form action={formAction} className="space-y-5 rounded-xl border border-zinc-800 bg-zinc-950/60 p-6">
      <div>
        <label htmlFor="judul" className="block text-sm font-medium text-zinc-200">
          Judul Laporan
        </label>
        <input
          id="judul"
          name="judul"
          type="text"
          defaultValue={laporan.judul}
          required
          className="mt-1.5 block w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
        />
        {state.galat?.judul && (
          <p role="alert" className="mt-1 text-xs text-red-400">
            {state.galat.judul[0]}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="kategori" className="block text-sm font-medium text-zinc-200">
          Kategori
        </label>
        <select
          id="kategori"
          name="kategori"
          defaultValue={laporan.kategori}
          className="mt-1.5 block w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
        >
          <option value="pelecehan">Pelecehan</option>
          <option value="perundungan">Perundungan</option>
          <option value="kecurangan_akademik">Kecurangan Akademik</option>
          <option value="fasilitas">Fasilitas</option>
          <option value="lainnya">Lainnya</option>
        </select>
        {state.galat?.kategori && (
          <p role="alert" className="mt-1 text-xs text-red-400">
            {state.galat.kategori[0]}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="deskripsi" className="block text-sm font-medium text-zinc-200">
          Deskripsi / Kronologi
        </label>
        <textarea
          id="deskripsi"
          name="deskripsi"
          rows={4}
          defaultValue={laporan.deskripsi}
          required
          className="mt-1.5 block w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
        />
        {state.galat?.deskripsi && (
          <p role="alert" className="mt-1 text-xs text-red-400">
            {state.galat.deskripsi[0]}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="tersedia" className="block text-sm font-medium text-zinc-200">
          Ketersediaan Kasus (Status Pantau)
        </label>
        <select
          id="tersedia"
          name="tersedia"
          defaultValue={String(laporan.tersedia)}
          className="mt-1.5 block rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
        >
          <option value="true">Tersedia</option>
          <option value="false">Tidak tersedia</option>
        </select>
        {state.galat?.tersedia && (
          <p role="alert" className="mt-1 text-xs text-red-400">
            {state.galat.tersedia[0]}
          </p>
        )}
      </div>

      {state.pesan && (
        <p
          role="status"
          className={`text-sm ${state.sukses ? "text-emerald-400" : "text-red-400"}`}
        >
          {state.pesan}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
      >
        {pending ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}
