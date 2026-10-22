"use client";

import React from "react";

export default function PanicButton() {
  const handlePanicEscape = () => {
    if (typeof window !== "undefined") {
      sessionStorage.clear();
      localStorage.clear();
      window.location.replace("https://sso.universitaspertamina.ac.id/");
    }
  };

  return (
    <button
      type="button"
      onClick={handlePanicEscape}
      aria-label="Tombol Keluar Darurat Instan"
      className="group relative flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2 bg-rose-600/90 hover:bg-rose-500 border border-rose-500/40 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-rose-600/25 hover:shadow-rose-600/40 transition-all duration-200 active:scale-95 cursor-pointer"
    >
      <span className="w-2 h-2 rounded-full bg-white animate-ping" aria-hidden="true" />
      <span>Panic Exit</span>
      <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-rose-700/80 rounded border border-rose-400/30 text-rose-100">
        ESC
      </kbd>
    </button>
  );
}