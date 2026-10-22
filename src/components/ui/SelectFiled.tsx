import React, { SelectHTMLAttributes } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  label: string;
  options: Option[];
  error?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  id,
  label,
  options,
  error,
  required,
  className = "",
  ...props
}) => {
  return (
    <div className="w-full mb-3">
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-slate-800 mb-1"
      >
        {label} {required && <span className="text-red-500" aria-hidden="true">*</span>}
      </label>
      <select
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        required={required}
        className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-slate-50 text-slate-900 focus:ring-2 focus:outline-none transition-colors ${
          error
            ? "border-red-500 focus:ring-red-200 focus:border-red-500"
            : "border-slate-300 focus:border-indigo-600 focus:ring-indigo-100"
        } ${className}`}
        {...props}
      >
        <option value="">-- Silakan Pilih --</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-red-600 font-medium">
          {error}
        </p>
      )}
    </div>
  );
};