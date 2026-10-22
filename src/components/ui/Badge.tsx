import React from "react";

export type BadgeTone =
  | "darurat"
  | "tinggi"
  | "sedang"
  | "rendah"
  | "INVESTIGASI"
  | "TERKIRIM"
  | "SELESAI";

interface BadgeProps {
  label: string;
  tone?: BadgeTone | string;
}

export const Badge: React.FC<BadgeProps> = ({ label, tone }) => {
  const getStyle = () => {
    switch (tone) {
      case "darurat":
      case "tinggi":
        return "bg-red-100 text-red-800 border-red-200";
      case "sedang":
      case "INVESTIGASI":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "TERKIRIM":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "SELESAI":
      case "rendah":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-full border inline-flex items-center ${getStyle()}`}
    >
      {label}
    </span>
  );
};