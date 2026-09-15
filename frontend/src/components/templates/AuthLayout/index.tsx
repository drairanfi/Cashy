import type { ReactNode } from 'react';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="auth-layout">
      <div className="auth-layout__card">
        <h1 className="auth-layout__title">{title}</h1>
        {subtitle && <p className="auth-layout__subtitle">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}
