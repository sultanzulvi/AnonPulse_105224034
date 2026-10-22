"use client";

import { useId, useState } from "react";

export default function KolomCatatan({ label }: { label: string }) {
  const id = useId();
  const [catatan, setCatatan] = useState("");

  return (
    <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/60 p-3.5 text-sm">
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={catatan}
        onChange={(e) => setCatatan(e.target.value)}
        placeholder="Ketik teks uji..."
        className="mt-2 block w-full rounded-lg border border-zinc-700/60 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 transition focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
      />
    </div>
  );
}