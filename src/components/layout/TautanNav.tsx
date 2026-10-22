"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavLinkItem {
  href: string;
  label: string;
}

export default function TautanNav({ links }: { links: NavLinkItem[] }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi Utama"
      className="hidden sm:flex items-center gap-1 bg-zinc-900/60 border border-zinc-800/80 p-1 rounded-xl"
    >
      {links.map((link) => {
        const isActive =
          link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
              isActive
                ? "bg-zinc-800 text-emerald-400 shadow-sm border border-zinc-700/60"
                : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}