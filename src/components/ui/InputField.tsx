import React, { InputHTMLAttributes } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  helperText?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  error,
  helperText,
  required,
  className = "",
  ...props
}) => {
  return (
    <div className="w-full mb-4">
      <label
        htmlFor={id}
        className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5"
      >
        {label} {required && <span className="text-rose-400" aria-hidden="true">*</span>}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error ? `${id}-error` : helperText ? `${id}-helper` : undefined
        }
        required={required}
        className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-zinc-950/70 text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all duration-200 ${
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
      {!error && helperText && (
        <p id={`${id}-helper`} className="mt-1.5 text-xs text-zinc-400">
          {helperText}
        </p>
      )}
    </div>
  );
};