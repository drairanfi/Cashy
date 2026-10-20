'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { commonMessages } from '@/config/messages';
import { clearSession } from '@/lib/api/client';
import { useSessionStore } from '@/store/session.store';

export default function MorePage() {
  const router = useRouter();
  const user = useSessionStore(state => state.user);

  const handleLogout = () => {
    clearSession();
    router.replace('/login');
  };

  const initial = user?.nombre.charAt(0).toUpperCase() ?? 'U';

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold text-foreground">
        {commonMessages.navigation.more}
      </h1>
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">
          {commonMessages.more.accountTitle}
        </h2>
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {initial}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{user?.nombre ?? 'Usuario'}</p>
            <p className="truncate text-sm text-muted-foreground">{user?.email ?? '—'}</p>
          </div>
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">
          {commonMessages.more.sessionTitle}
        </h2>
        <Button variant="destructive" className="self-start" onClick={handleLogout}>
          <LogOut className="size-4" />
          {commonMessages.actions.logout}
        </Button>
      </section>
    </div>
  );
}
