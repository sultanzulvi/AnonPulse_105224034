// src/app/pantau/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MOCK_REPORTS } from '@/data/mockReports';
import { ReportRecord } from '@/types/report';
import { InputField } from '@/components/ui/InputField';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function TrackPage() {
  const [tokenInput, setTokenInput] = useState('');
  const [activeReport, setActiveReport] = useState<ReportRecord | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanToken = tokenInput.trim().toUpperCase();

    if (!cleanToken) {
      setSearchError('Silakan masukkan Secret Tracking Token Anda.');
      setActiveReport(null);
      return;
    }

    const result = MOCK_REPORTS[cleanToken];
    if (result) {
      setActiveReport(result);
      setSearchError(null);
    } else {
      setSearchError('Tiket tidak ditemukan. Pastikan format token benar (Contoh: ANON-7A8B-9C0D-1E2F).');
      setActiveReport(null);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Tombol Navigasi Kembali Seragam */}
        <nav aria-label="Navigasi Kembali">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-emerald-400 transition-colors"
          >
            &larr; Kembali ke Beranda
          </Link>
        </nav>

        {/* Header Bersih */}
        <header className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Pelacakan Status Aduan Anonim
          </h1>
          <p className="text-sm text-zinc-400">
            Gunakan Secret Tracking Token untuk memantau linimasa investigasi secara aman[cite: 1].
          </p>
        </header>

        {/* Card Form Pencarian */}
        <Card
          title="Masukkan Kredensial Tiket"
          subtitle="Akses bersifat langsung tanpa perlu verifikasi email atau akun[cite: 1, 3]."
        >
          <form onSubmit={handleSearch} className="space-y-4">
            <InputField
              id="searchToken"
              label="Secret Tracking Token"
              placeholder="Contoh: ANON-7A8B-9C0D-1E2F"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              error={searchError || undefined}
              required
            />

            <Button type="submit" variant="primary" fullWidth className="py-2.5 text-sm">
              Cari Tiket Aduan
            </Button>
          </form>

          {/* Kotak Mock Bantuan Gelap Kontras Tinggi */}
          <div className="mt-5 p-3.5 bg-zinc-950/70 border border-zinc-800 rounded-xl text-xs text-zinc-400">
            <span className="font-semibold text-zinc-300">Pilih Token Pengujian:</span>{' '}
            <button
              type="button"
              onClick={() => setTokenInput('ANON-7A8B-9C0D-1E2F')}
              className="font-mono text-emerald-400 font-bold hover:underline hover:text-emerald-300 ml-1 cursor-pointer"
            >
              ANON-7A8B-9C0D-1E2F
            </button>
            {' '}atau{' '}
            <button
              type="button"
              onClick={() => setTokenInput('ANON-3X9K-4P2L-8W0Q')}
              className="font-mono text-emerald-400 font-bold hover:underline hover:text-emerald-300 cursor-pointer"
            >
              ANON-3X9K-4P2L-8W0Q
            </button>
          </div>
        </Card>

        {/* Card Hasil Pencarian Laporan */}
        {activeReport && (
          <article aria-labelledby="detail-header" className="space-y-6">
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-800">
                <div>
                  <h2 id="detail-header" className="text-lg font-bold text-white font-mono tracking-wider">
                    {activeReport.ticketCode}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Terdaftar pada: {activeReport.createdAt}</p>
                </div>
                <Badge label={activeReport.status} tone={activeReport.status} />
              </div>

              {/* Rincian Aduan dengan Kontras Jelas */}
              <div className="py-4 space-y-3 text-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-zinc-300">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Lokasi:</span>
                  <span className="text-white font-medium">{activeReport.location}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-zinc-300">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Tanggal Kejadian:</span>
                  <span className="text-white font-medium">{activeReport.dateIncident}</span>
                </div>

                {activeReport.evidenceFileName && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-zinc-300">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Lampiran Bukti:</span>
                    <code className="text-xs bg-zinc-950 border border-zinc-800 text-emerald-400 px-2.5 py-1 rounded-lg">
                      {activeReport.evidenceFileName}
                    </code>
                  </div>
                )}

                <div className="pt-2">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Kronologi Lengkap:
                  </span>
                  <p className="p-4 bg-zinc-950/70 border border-zinc-800 rounded-xl text-zinc-200 text-sm leading-relaxed">
                    {activeReport.description}
                  </p>
                </div>
              </div>

              {/* Linimasa Penanganan Kasus */}
              <div className="mt-4 pt-4 border-t border-zinc-800">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">
                  Linimasa Investigasi Tim Satgas
                </h3>
                <ol className="relative border-l border-zinc-800 ml-2 space-y-6">
                  {activeReport.timeline.map((log, index) => (
                    <li key={index} className="ml-5">
                      <span className="absolute -left-1.5 flex items-center justify-center w-3 h-3 bg-emerald-500 rounded-full ring-4 ring-zinc-900" />
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-white">{log.stage}</span>
                        <time className="text-xs text-zinc-400">{log.timestamp}</time>
                      </div>
                      <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{log.description}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </Card>
          </article>
        )}

      </div>
    </main>
  );
}