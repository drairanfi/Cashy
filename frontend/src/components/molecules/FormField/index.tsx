import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
}

export function FormField({ label, error, children }: FormFieldProps) {
  return (
    <label className="form-field">
      <span className="form-field__label">{label}</span>
      {children}
      {error && <span className="form-field__error">{error}</span>}
    </label>
  );
}
