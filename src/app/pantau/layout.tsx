import KolomCatatan from "@/components/KolomCatatan";

export default function LayoutPantau({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-8 lg:grid lg:grid-cols-[18rem_1fr] lg:gap-8">
        <aside aria-label="Panel pemantauan" className="mb-6 space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
            Panel Monitoring
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Layout mempertahankan state komponen klien saat rute anak berpindah.
          </p>
          <KolomCatatan label="Catatan di layout" />
        </aside>
        <section>{children}</section>
      </div>
    </div>
  );
}