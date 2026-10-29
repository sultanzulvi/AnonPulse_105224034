"use client";

import { useActionState } from "react";
import { kirimLaporanLatihan } from "@/app/lapor/actions-latihan";
import { StatusForm } from "@/lib/schema/skema-latihan";

const awal: StatusForm = {};
const kelasInput = "mt-1 block w-full rounded border p-2 text-black";

export default function FormLatihan() {
  const [status, aksi, pending] = useActionState(kirimLaporanLatihan, awal);
  const g = status.galat;
  const n = status.nilai;

  return (
    <form action={aksi} className="max-w-xl mx-auto space-y-4 p-6 bg-white rounded shadow text-black">
      <h2 className="text-xl font-bold">Latihan Form Validation</h2>

      <div>
        <label htmlFor="judul" className="font-medium">Judul Laporan</label>
        <input
          id="judul"
          name="judul"
          defaultValue={n?.judul}
          className={kelasInput}
          aria-invalid={!!g?.judul}
          aria-describedby="galat-judul"
        />
        <p id="galat-judul" className="text-sm text-red-600">{g?.judul?.[0]}</p>
      </div>

      <div>
        <label htmlFor="kategori" className="font-medium">Kategori</label>
        <select
          id="kategori"
          name="kategori"
          key={n?.kategori ?? "awal"}
          defaultValue={n?.kategori ?? ""}
          className={kelasInput}
          aria-invalid={!!g?.kategori}
          aria-describedby="galat-kategori"
        >
          <option value="" disabled>Pilih kategori</option>
          <option value="akademik">Akademik</option>
          <option value="fasilitas">Fasilitas</option>
          <option value="keamanan">Keamanan</option>
        </select>
        <p id="galat-kategori" className="text-sm text-red-600">{g?.kategori?.[0]}</p>
      </div>

      <div>
        <label htmlFor="isiLaporan" className="font-medium">Isi Laporan</label>
        <textarea
          id="isiLaporan"
          name="isiLaporan"
          rows={4}
          defaultValue={n?.isiLaporan}
          className={kelasInput}
          aria-invalid={!!g?.isiLaporan}
          aria-describedby="galat-isi"
        />
        <p id="galat-isi" className="text-sm text-red-600">{g?.isiLaporan?.[0]}</p>
      </div>

      <label className="flex items-center gap-2">
        <input type="checkbox" name="anonim" defaultChecked />
        Kirim secara anonim
      </label>

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? "Memeriksa..." : "Kirim Laporan"}
      </button>

      {status.pesan && (
        <p role="status" className="text-center font-medium mt-2">
          {status.pesan}
        </p>
      )}
    </form>
  );
}