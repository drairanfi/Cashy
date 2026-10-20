import type { ReactNode } from 'react';

import { siteConfig } from '@/config/site';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-sm">
      <p className="text-sm font-semibold text-primary">{siteConfig.name}</p>
      <h1 className="mt-1 text-2xl font-extrabold text-foreground">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}
