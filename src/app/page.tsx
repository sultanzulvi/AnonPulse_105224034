import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Ambient Radial Gradient di latar belakang */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-emerald-500/10 blur-[130px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto space-y-16 relative z-10">
        
        {/* Hero Section */}
        <header className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 text-emerald-300 text-xs font-semibold tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Kanal Pelaporan Terenkripsi Sivitas Akademika
          </div>
          
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
            AnonPulse <br className="hidden sm:block" />
          </h1>
          
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-zinc-400 leading-relaxed">
            Jaminan perlindungan privasi. Tidak ada pencatatan alamat IP, jenis peramban, maupun nama dan identitas mahasiswa (NIM).
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link href="/lapor">
              <Button variant="primary" className="w-full sm:w-auto px-7 py-3 text-sm">
                Buat Laporan Anonim
              </Button>
            </Link>
            <Link href="/pantau">
              <Button variant="secondary" className="w-full sm:w-auto px-7 py-3 text-sm">
                Cek Status Tiket Laporan
              </Button>
            </Link>
          </div>
        </header>

        {/* 3 Kartu Keamanan Berdesain Dark Glass */}
        <section aria-label="Jaminan Keamanan Sistem" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card
            title="Zero Metadata Log"
            subtitle="Jaminan Tanpa Jejak"
            className="hover:scale-[1.02] transition-transform duration-300"
          >
            <p className="text-sm text-zinc-400 leading-relaxed">
              Jaringan dan basis data tidak merekam IP address, cookie, maupun data sesi kampus Anda.
            </p>
          </Card>

          <Card
            title="Secret Tracking Key"
            subtitle="Kendali Penuh Pelapor"
            className="hover:scale-[1.02] transition-transform duration-300"
          >
            <p className="text-sm text-zinc-400 leading-relaxed">
              Dapatkan token unik 16-karakter sebagai satu-satunya tiket memantau investigasi tanpa perlu membuat akun.
            </p>
          </Card>

          <Card
            title="Trauma-Informed Safe"
            subtitle="Perlindungan Kondisi Nyata"
            className="hover:scale-[1.02] transition-transform duration-300"
          >
            <p className="text-sm text-zinc-400 leading-relaxed">
              Fitur Quick Exit instan mengalihkan tab ke situs umum jika situasi di sekitar Anda tiba-tiba tidak aman.
            </p>
          </Card>
        </section>

      </div>
    </main>
  );
}