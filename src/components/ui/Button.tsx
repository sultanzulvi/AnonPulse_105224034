import React, { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  fullWidth = false,
  className = "",
  disabled,
  ...props
}) => {
  const baseClasses =
    "relative inline-flex items-center justify-center font-semibold rounded-xl text-sm px-5 py-2.5 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.96] select-none";

  const variants = {
    primary:
      "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 hover:-translate-y-0.5 focus:ring-emerald-400 font-bold",
    secondary:
      "bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-200 border border-zinc-700/60 hover:border-zinc-500 hover:text-white shadow-sm hover:-translate-y-0.5 focus:ring-zinc-600",
    danger:
      "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/25 hover:shadow-rose-600/40 hover:-translate-y-0.5 focus:ring-rose-500",
    ghost:
      "bg-transparent text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};