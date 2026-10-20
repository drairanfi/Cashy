'use client';

import { useSyncExternalStore } from 'react';

import { useSessionStore } from '@/store/session.store';

export function useSessionHydrated(): boolean {
  return useSyncExternalStore(
    onStoreChange => useSessionStore.persist.onFinishHydration(onStoreChange),
    () => useSessionStore.persist.hasHydrated(),
    () => false
  );
}
