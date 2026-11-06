export type KategoriLaporan =
  | "pelecehan"
  | "perundungan"
  | "kecurangan_akademik"
  | "fasilitas"
  | "lainnya";

type DataAwalLaporan = {
  token: string;
  judul: string;
  kategori: KategoriLaporan;
  deskripsi: string;
  tersedia: boolean;
};

export const dataAwalLaporan = [
  {
    token: "TKN-PLH-001",
    judul: "Dugaan Pelecehan Verbal di Koridor Gedung A",
    kategori: "pelecehan" as const,
    tanggalKejadian: new Date("2026-10-15"),
    lokasiKejadian: "Koridor Gedung A Lantai 2",
    deskripsi: "Terjadi insiden catcalling berulang saat jam pergantian perkuliahan.",
    tersedia: true,
    pernyataanSah: true,
  },
  {
    token: "TKN-BLG-002",
    judul: "Intimidasi Kelompok Mahasiswa di Kantin Teknik",
    kategori: "perundungan" as const,
    tanggalKejadian: new Date("2026-10-18"),
    lokasiKejadian: "Area Kantin Fakultas Teknik",
    deskripsi: "Tindakan pengancaman dan pemaksaan iuran oleh oknum senior.",
    tersedia: true,
    pernyataanSah: true,
  },
  {
    token: "TKN-AKD-003",
    judul: "Praktek Jasa Pembuatan Skripsi dan Tugas Akhir",
    kategori: "kecurangan_akademik" as const,
    tanggalKejadian: new Date("2026-10-20"),
    lokasiKejadian: "Platform Media Sosial Sivitas Kampus",
    deskripsi: "Penyebaran pamflet joki tugas akhir yang melibatkan jaringan luar.",
    tersedia: true,
    pernyataanSah: true,
  },
  {
    token: "TKN-FAS-004",
    judul: "CCTV Rusak di Area Parkir Belakang Kampus",
    kategori: "fasilitas" as const,
    tanggalKejadian: new Date("2026-10-22"),
    lokasiKejadian: "Parkiran Motor Belakang Gedung Utama",
    deskripsi: "Dua kamera pengawas mati sehingga menimbulkan blindspot keamanan.",
    tersedia: true,
    pernyataanSah: true,
  },
  {
    token: "TKN-LNY-005",
    judul: "Pungutan Liar Parkir oleh Oknum Tidak Resmi",
    kategori: "lainnya" as const,
    tanggalKejadian: new Date("2026-10-25"),
    lokasiKejadian: "Pintu Gerbang Keluar Barat",
    deskripsi: "Penarikan tarif parkir tidak resmi tanpa karcis yang sah.",
    tersedia: true,
    pernyataanSah: true,
  },
];