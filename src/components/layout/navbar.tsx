'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Navbar: React.FC = () => {
  const pathname = usePathname();

  const handlePanicEscape = () => {
    if (typeof window !== 'undefined') {
      // 1. Bersihkan seluruh penyimpanan lokal dan sesi peramban
      sessionStorage.clear();
      localStorage.clear();
      // 2. Alihkan seketika ke portal umum netral tanpa meninggalkan riwayat 'Back'
      window.location.replace('https://sso.universitaspertamina.ac.id/');
    }
  };

  const navLinks = [
    { href: '/', label: 'Beranda' },
    { href: '/lapor', label: 'Buat Laporan' },
    { href: '/pantau', label: 'Pantau Tiket' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-zinc-950/85 border-b border-zinc-800/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Sisi Kiri: Brand & Logo Link ke Beranda */}
        <Link
          href="/"
          className="flex items-center gap-2 group select-none focus:outline-none"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 group-hover:scale-125 transition-transform duration-200" />
          <span className="font-extrabold text-lg tracking-wider text-white">
            Anon<span className="text-emerald-400">Pulse</span>
          </span>
        </Link>

        {/* Sisi Tengah: Navigasi Antar Halaman */}
        <nav aria-label="Navigasi Utama" className="hidden sm:flex items-center gap-1 bg-zinc-900/60 border border-zinc-800/80 p-1 rounded-xl">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
                  isActive
                    ? 'bg-zinc-800 text-emerald-400 shadow-sm border border-zinc-700/60'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Sisi Kanan: Panic Button Terintegrasi */}
        <div className="flex items-center gap-3">
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
        </div>

      </div>
    </header>
  );
};