"use client";

import React from "react";

export const QuickExitButton: React.FC = () => {
  const handleEscape = () => {
    if (typeof window !== "undefined") {

      sessionStorage.clear();
      localStorage.clear();

      window.location.replace("https://id.wikipedia.org/wiki/Portal:Komunitas");
    }
  };

  return (
    <button
      type="button"
      onClick={handleEscape}
      aria-label="Tombol Keluar Cepat untuk keselamatan privasi"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-xl hover:bg-red-700 focus:ring-4 focus:ring-red-200 transition-all active:scale-95"
    >
      <span className="h-2 w-2 rounded-full bg-white animate-pulse" aria-hidden="true" />
      Quick Exit (Esc)
    </button>
  );
};