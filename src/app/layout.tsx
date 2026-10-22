// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/navbar';

export const metadata: Metadata = {
  title: 'AnonPulse | Platform Pelaporan Kampus Terenkripsi',
  description: 'Laporkan pelanggaran etik kampus secara anonim tanpa jejak identitas.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
        {/* Navbar Terpadu dengan Navigasi Beranda dan Panic Button */}
        <Navbar />
        
        {/* Konten Halaman */}
        <div className="flex-1">
          {children}
        </div>
      </body>
    </html>
  );
}