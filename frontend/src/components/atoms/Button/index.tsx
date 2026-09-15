import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline' | 'danger';
}

const VARIANTS = {
  primary: 'btn btn--primary',
  ghost: 'btn btn--ghost',
  outline: 'btn btn--outline',
  danger: 'btn btn--danger',
} as const;

export function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  return <button type={type} className={`${VARIANTS[variant]} ${className}`} {...props} />;
}
