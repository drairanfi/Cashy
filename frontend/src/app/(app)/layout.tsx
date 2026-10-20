'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useSessionHydrated } from '@/hooks/use-session-hydrated';
import { useSessionStore } from '@/store/session.store';

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const isHydrated = useSessionHydrated();
  const accessToken = useSessionStore(state => state.accessToken);

  useEffect(() => {
    if (isHydrated && !accessToken) router.replace('/login');
  }, [isHydrated, accessToken, router]);

  if (!isHydrated || !accessToken) return null;

  return <DashboardLayout>{children}</DashboardLayout>;
}
