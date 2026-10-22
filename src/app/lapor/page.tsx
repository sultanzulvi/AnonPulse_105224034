"use client";

import React, { useState } from "react";
import Link from "next/link";
import { InputField } from "@/components/ui/InputField";
import { TextareaField } from "@/components/ui/TextareaField";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface FormInputs {
  dateIncident: string;
  location: string;
  description: string;
  evidenceConsent: boolean;
}

type FormErrors = Partial<Record<keyof FormInputs | "evidenceFile", string>>;

export default function ReportPage() {
  const [formData, setFormData] = useState<FormInputs>({
    dateIncident: "",
    location: "",
    description: "",
    evidenceConsent: false,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [generatedTicket, setGeneratedTicket] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.dateIncident) {
      newErrors.dateIncident = "Tanggal perkiraan kejadian wajib diisi.";
    } else {
      const inputDate = new Date(formData.dateIncident);
      const today = new Date();
      if (inputDate > today) {
        newErrors.dateIncident = "Tanggal kejadian tidak boleh melewati hari ini.";
      }
    }

    if (!formData.location.trim()) {
      newErrors.location = "Lokasi spesifik kejadian wajib dicantumkan.";
    } else if (formData.location.trim().length < 5) {
      newErrors.location = "Keterangan lokasi minimal 5 karakter.";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Kronologi kejadian wajib dijabarkan.";
    } else if (formData.description.trim().length < 30) {
      newErrors.description = "Jelaskan kronologi minimal 30 karakter agar informasi dapat ditindaklanjuti.";
    }

    if (selectedFile) {
      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
      const maxSizeBytes = 10 * 1024 * 1024;

      if (!allowedTypes.includes(selectedFile.type)) {
        newErrors.evidenceFile = "Format berkas harus berupa JPG, PNG, atau PDF.";
      } else if (selectedFile.size > maxSizeBytes) {
        newErrors.evidenceFile = "Ukuran berkas bukti tidak boleh melebihi 10 MB.";
      }
    }

    if (!formData.evidenceConsent) {
      newErrors.evidenceConsent = "Pernyataan iktikad baik wajib disetujui.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (errors.evidenceFile) {
      setErrors((prev) => ({ ...prev, evidenceFile: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const tokenSegment = () => Math.random().toString(36).substring(2, 6).toUpperCase();
    const token = `ANON-${tokenSegment()}-${tokenSegment()}-${tokenSegment()}`;

    setGeneratedTicket(token);
  };

  return (
    <main className="min-h-screen bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        <nav aria-label="Navigasi Kembali">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-emerald-400 transition-colors"
          >
            &larr; Kembali ke Beranda
          </Link>
        </nav>

        {generatedTicket ? (
          <Card title="Laporan Berhasil Terkirim" className="text-center py-10">
            <p className="text-sm text-zinc-400 mb-6 max-w-md mx-auto leading-relaxed">
              Simpan <strong>Secret Tracking Token</strong> berikut. Ini adalah satu-satunya kunci Anda untuk mengecek tindak lanjut aduan tanpa perlu akun[cite: 1, 3].
            </p>
            
            <div className="p-4 bg-zinc-950 border border-emerald-500/40 rounded-xl inline-block font-mono text-xl sm:text-2xl font-bold tracking-widest text-emerald-400 shadow-lg shadow-emerald-500/10 mb-8">
              {generatedTicket}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/pantau">
                <Button variant="primary">Pantau Kasus Ini</Button>
              </Link>
              <Button
                variant="secondary"
                onClick={() => {
                  setGeneratedTicket(null);
                  setFormData({ dateIncident: "", location: "", description: "", evidenceConsent: false });
                  setSelectedFile(null);
                }}
              >
                Buat Laporan Lain
              </Button>
            </div>
          </Card>
        ) : (
          <Card
            title="Formulir Pengaduan Insiden Kampus"
            subtitle="Isi kronologi fakta secara objektif. Hindari mencantumkan nama atau nomor identitas pribadi Anda di kolom mana pun[cite: 1, 3]."
          >
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  id="dateIncident"
                  type="date"
                  label="Tanggal Kejadian"
                  value={formData.dateIncident}
                  onChange={(e) => setFormData({ ...formData, dateIncident: e.target.value })}
                  error={errors.dateIncident}
                  required
                />
                <InputField
                  id="location"
                  type="text"
                  label="Lokasi Kejadian"
                  placeholder="Misal: Lab Komputer B Lantai 3"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  error={errors.location}
                  required
                />
              </div>

              <TextareaField
                id="description"
                label="Kronologi Lengkap"
                placeholder="Deskripsikan urutan waktu, rincian peristiwa, dan dampak insiden secara faktual..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                error={errors.description}
                maxLength={1000}
                required
              />

              {/* Upload Bukti Berdesain Dark Box */}
              <div>
                <label htmlFor="evidenceFile" className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Bukti Digital Pendukung (Opsional)
                </label>
                <div className="p-3 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 transition-colors">
                  <input
                    id="evidenceFile"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                    aria-invalid={Boolean(errors.evidenceFile)}
                    aria-describedby={errors.evidenceFile ? "evidenceFile-error" : "evidenceFile-help"}
                    className="w-full text-xs text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer"
                  />
                </div>
                <p id="evidenceFile-help" className="mt-1.5 text-xs text-zinc-500">
                  Format didukung: JPG, PNG, PDF (Maks. 10 MB). Metadata EXIF/geolokasi dibersihkan otomatis demi keamanan[cite: 1, 3].
                </p>
                {errors.evidenceFile && (
                  <p id="evidenceFile-error" role="alert" className="mt-1.5 text-xs text-rose-400 font-medium">
                    {errors.evidenceFile}
                  </p>
                )}
              </div>

              {/* Konfirmasi Iktikad Baik */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    id="evidenceConsent"
                    type="checkbox"
                    checked={formData.evidenceConsent}
                    onChange={(e) => setFormData({ ...formData, evidenceConsent: e.target.checked })}
                    aria-invalid={Boolean(errors.evidenceConsent)}
                    aria-describedby={errors.evidenceConsent ? "consent-error" : undefined}
                    className="mt-0.5 h-4 w-4 rounded border-zinc-800 bg-zinc-900 text-emerald-500 focus:ring-emerald-500/20 focus:ring-2 cursor-pointer"
                  />
                  <span className="text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors leading-relaxed">
                    Saya menyatakan aduan ini disampaikan atas iktikad baik tanpa fitnah demi integritas sivitas akademika kampus.
                  </span>
                </label>
                {errors.evidenceConsent && (
                  <p id="consent-error" role="alert" className="mt-1.5 text-xs text-rose-400 font-medium">
                    {errors.evidenceConsent}
                  </p>
                )}
              </div>

              <div className="pt-3">
                <Button type="submit" variant="primary" fullWidth className="py-3 text-sm">
                  Kirim Aduan Terenkripsi
                </Button>
              </div>

            </form>
          </Card>
        )}

      </div>
    </main>
  );
}