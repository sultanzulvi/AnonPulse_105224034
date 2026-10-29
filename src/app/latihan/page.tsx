import { redirect } from "next/navigation";
import FormLatihan from "@/components/FormLatihan";
import { bacaSesi } from "@/lib/sesi";
import { keluar } from "@/app/masuk/actions";

export default async function LatihanPage() {
  const sesi = await bacaSesi();

  // Jika sesi tidak valid / palsu / kedaluwarsa, arahkan ke login
  if (!sesi) {
    redirect("/masuk");
  }

  return (
    <main id="konten" className="min-h-screen p-8 bg-gray-50 text-black">
      <div className="max-w-xl mx-auto mb-4 flex justify-between items-center bg-white p-4 rounded shadow">
        <p className="text-sm text-gray-700">
          Masuk sebagai: <span className="font-semibold">{sesi.email}</span>
        </p>
        <form action={keluar}>
          <button
            type="submit"
            className="text-sm font-medium text-red-600 hover:underline"
          >
            Keluar
          </button>
        </form>
      </div>

      <FormLatihan />
    </main>
  );
}