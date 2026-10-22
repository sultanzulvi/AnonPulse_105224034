import React, { Suspense } from "react";
import Link from "next/link";
import TautanNav, { type NavLinkItem } from "./TautanNav";
import PanicButton from "@/components/ui/PanicButton";

const navLinks: NavLinkItem[] = [
  { href: "/", label: "Beranda" },
  { href: "/lapor", label: "Buat Laporan" },
  { href: "/pantau", label: "Pantau Tiket" },
  { href: "/tentang", label: "Tentang" },
];

function NavFallback() {
  return (
    <nav
      aria-label="Navigasi Utama"
      className="hidden sm:flex items-center gap-1 bg-zinc-900/60 border border-zinc-800/80 p-1 rounded-xl"
    >
      {navLinks.map((link) => (
        <span
          key={link.href}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-500"
        >
          {link.label}
        </span>
      ))}
    </nav>
  );
}

export const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-zinc-950/85 border-b border-zinc-800/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Sisi Kiri: Brand & Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group select-none focus:outline-none"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 group-hover:scale-125 transition-transform duration-200" />
          <span className="font-extrabold text-lg tracking-wider text-white">
            Anon<span className="text-emerald-400">Pulse</span>
          </span>
        </Link>

        {/* Sisi Tengah: Navigasi Antar Halaman dengan Suspense */}
        <Suspense fallback={<NavFallback />}>
          <TautanNav links={navLinks} />
        </Suspense>

        {/* Sisi Kanan: Panic Button Terisolasi */}
        <div className="flex items-center gap-3">
          <PanicButton />
        </div>

      </div>
    </header>
  );
};

export default Navbar;