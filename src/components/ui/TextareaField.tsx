import React, { TextareaHTMLAttributes } from "react";

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label: string;
  error?: string;
  maxLength?: number;
}

export const TextareaField: React.FC<TextareaFieldProps> = ({
  id,
  label,
  error,
  maxLength = 1000,
  value,
  required,
  className = "",
  ...props
}) => {
  const currentCount = typeof value === "string" ? value.length : 0;

  return (
    <div className="w-full mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <label
          htmlFor={id}
          className="block text-xs font-semibold uppercase tracking-wider text-zinc-300"
        >
          {label} {required && <span className="text-rose-400" aria-hidden="true">*</span>}
        </label>
        <span className="text-xs font-mono text-zinc-400" aria-live="polite">
          {currentCount}/{maxLength}
        </span>
      </div>
      <textarea
        id={id}
        value={value}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        required={required}
        rows={4}
        className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-zinc-950/70 text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all duration-200 resize-none ${
          error
            ? "border-rose-500/80 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            : "border-zinc-800 hover:border-zinc-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        } ${className}`}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-rose-400 font-medium flex items-center gap-1">
          <span>●</span> {error}
        </p>
      )}
    </div>
  );
};