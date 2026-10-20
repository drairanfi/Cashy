'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

import { useSessionHydrated } from '@/hooks/use-session-hydrated';
import { useSessionStore } from '@/store/session.store';

export default function AuthGroupLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const isHydrated = useSessionHydrated();
  const accessToken = useSessionStore(state => state.accessToken);

  useEffect(() => {
    if (isHydrated && accessToken) router.replace('/');
  }, [isHydrated, accessToken, router]);

  if (!isHydrated || accessToken) return null;

  return (
    <main className="grid min-h-screen place-items-center bg-muted/40 px-4 py-10">
      {children}
    </main>
  );
}
