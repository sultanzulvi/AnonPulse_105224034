"use client";

import { useActionState } from "react";
import { masuk } from "@/app/masuk/actions";
import { StatusForm } from "@/lib/schema/skema-latihan";

const awal: StatusForm = {};
const inputClass =
  "mt-1 block w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none";

export default function FormMasuk() {
  const [status, aksi, pending] = useActionState(masuk, awal);
  const g = status.galat;

  return (
    <form action={aksi} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-neutral-300">
          Email Petugas
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          placeholder="pengelola@contoh.ac.id"
          className={inputClass}
          aria-invalid={!!g?.email}
          aria-describedby="galat-email"
        />
        <p id="galat-email" className="mt-1 text-sm text-red-500">
          {g?.email?.[0]}
        </p>
      </div>

      <div>
        <label htmlFor="kataSandi" className="block text-sm font-medium text-neutral-300">
          Kata Sandi
        </label>
        <input
          id="kataSandi"
          name="kataSandi"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          className={inputClass}
          aria-invalid={!!g?.kataSandi}
          aria-describedby="galat-sandi"
        />
        <p id="galat-sandi" className="mt-1 text-sm text-red-500">
          {g?.kataSandi?.[0]}
        </p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-emerald-500 py-2.5 font-medium text-black hover:bg-emerald-400 disabled:opacity-50"
      >
        {pending ? "Memverifikasi..." : "Masuk"}
      </button>

      {status.pesan && (
        <p role="status" className="text-center text-sm font-medium text-red-400">
          {status.pesan}
        </p>
      )}
    </form>
  );
}