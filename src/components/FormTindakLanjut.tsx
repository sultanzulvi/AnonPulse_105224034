"use client";

import { useActionState, useState } from "react";
import {
  tambahTindakLanjut,
  type StatusFormTindakLanjut,
} from "@/app/pantau/tindak-lanjut-actions";

const MAKS_KARAKTER = 500;
const initialState: StatusFormTindakLanjut = {};

export default function FormTindakLanjut({ laporanId }: { laporanId: number }) {
  const [state, formAction, pending] = useActionState(
    tambahTindakLanjut.bind(null, laporanId),
    initialState
  );

  const [catatan, setCatatan] = useState("");
  // Nilai turunan: dihitung langsung saat render (tanpa useState tambahan & useEffect)
  const sisa = MAKS_KARAKTER - catatan.length;

  return (
    <form
      action={formAction}
      className="mt-6 space-y-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-5"
    >
      <h3 className="text-base font-semibold text-white">Tambah Catatan Tindak Lanjut</h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="petugas" className="block text-xs font-medium text-zinc-300">
            Nama Petugas
          </label>
          <input
            id="petugas"
            name="petugas"
            type="text"
            required
            placeholder="Misal: Satgas Etik 1"
            className="mt-1 block w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
          />
          {state.galat?.petugas && (
            <p role="alert" className="mt-1 text-xs text-red-400">
              {state.galat.petugas[0]}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="tahap" className="block text-xs font-medium text-zinc-300">
            Tahap Penanganan (1–5)
          </label>
          <input
            id="tahap"
            name="tahap"
            type="number"
            min={1}
            max={5}
            defaultValue={1}
            required
            className="mt-1 block w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
          />
          {state.galat?.tahap && (
            <p role="alert" className="mt-1 text-xs text-red-400">
              {state.galat.tahap[0]}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="catatan" className="block text-xs font-medium text-zinc-300">
          Catatan Investigasi
        </label>
        <textarea
          id="catatan"
          name="catatan"
          rows={3}
          value={catatan}
          maxLength={MAKS_KARAKTER}
          onChange={(e) => setCatatan(e.target.value)}
          required
          placeholder="Tulis ringkasan progres tindak lanjut..."
          className="mt-1 block w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
        />
        <p className="mt-1 text-xs text-zinc-400">{sisa} karakter tersisa</p>
        {state.galat?.catatan && (
          <p role="alert" className="mt-1 text-xs text-red-400">
            {state.galat.catatan[0]}
          </p>
        )}
      </div>

      {state.pesan && (
        <p role="status" className="text-xs text-emerald-400">
          {state.pesan}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
      >
        {pending ? "Mengirim..." : "Kirim Catatan"}
      </button>
    </form>
  );
}
