import React, { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  className = "",
}) => {
  return (
    <section
      className={`p-6 sm:p-8 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl shadow-xl shadow-black/40 backdrop-blur-sm transition-all hover:border-zinc-700/80 ${className}`}
    >
      {title && (
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100 mb-1.5">
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="text-sm text-zinc-400 mb-6 leading-relaxed">{subtitle}</p>
      )}
      {children}
    </section>
  );
};