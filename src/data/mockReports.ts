import { ReportRecord } from '@/types/report';

export const MOCK_REPORTS: Record<string, ReportRecord> = {
  'ANON-7A8B-9C0D-1E2F': {
    ticketCode: 'ANON-7A8B-9C0D-1E2F',
    dateIncident: '2026-10-15',
    location: 'Gedung Kuliah Bersama Lantai 3',
    description: 'Terjadi intimidasi verbal berulang oleh sekelompok oknum saat jam keluar praktikum selesai.',
    evidenceFileName: 'rekaman_suara_koridor.mp3',
    status: 'INVESTIGASI',
    createdAt: '2026-10-16 09:30 WIB',
    timeline: [
      {
        timestamp: '2026-10-16 09:30 WIB',
        stage: 'Laporan Diterima',
        description: 'Tiket berhasil dibuat secara anonim di sistem. Menunggu verifikasi awal Satgas PPKS.',
      },
      {
        timestamp: '2026-10-17 14:10 WIB',
        stage: 'Verifikasi Awal',
        description: 'Satgas mengonfirmasi kronologi dan waktu kejadian tanpa meminta data identitas pelapor.',
      },
      {
        timestamp: '2026-10-19 11:00 WIB',
        stage: 'Investigasi Lapangan',
        description: 'Satgas berkoordinasi dengan pengelola gedung untuk pemeriksaan rekaman CCTV area lorong.',
      },
    ],
  },
  'ANON-3X9K-4P2L-8W0Q': {
    ticketCode: 'ANON-3X9K-4P2L-8W0Q',
    dateIncident: '2026-10-18',
    location: 'Area Kantin Fakultas Teknik',
    description: 'Catcalling dan ujaran pelecehan secara terbuka di selasar barat.',
    status: 'TERKIRIM',
    createdAt: '2026-10-19 13:45 WIB',
    timeline: [
      {
        timestamp: '2026-10-19 13:45 WIB',
        stage: 'Laporan Diterima',
        description: 'Tiket terdaftar. Tim konselor independen sedang dijadwalkan untuk peninjauan berkas.',
      },
    ],
  },
};