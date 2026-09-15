import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error = false, className = '', ...props }, ref) => (
    <input ref={ref} className={`input ${error ? 'input--error' : ''} ${className}`} {...props} />
  ),
);

Input.displayName = 'Input';
