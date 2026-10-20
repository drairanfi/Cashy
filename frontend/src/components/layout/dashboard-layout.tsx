'use client';

import {
  Dumbbell,
  Home,
  LogOut,
  MoreHorizontal,
  PiggyBank,
  Tag,
  UtensilsCrossed,
  Wallet,
  type LucideIcon
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

import { commonMessages } from '@/config/messages';
import { siteConfig } from '@/config/site';
import { clearSession } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import { useSessionStore } from '@/store/session.store';

interface DashboardLayoutProps {
  children: ReactNode;
}

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { label: commonMessages.navigation.home, href: '/', icon: Home },
  { label: commonMessages.navigation.expenses, href: '/gastos', icon: Wallet },
  { label: commonMessages.navigation.food, href: '/comida', icon: UtensilsCrossed },
  { label: commonMessages.navigation.gym, href: '/gimnasio', icon: Dumbbell },
  { label: commonMessages.navigation.savings, href: '/ahorros', icon: PiggyBank },
  { label: commonMessages.navigation.categories, href: '/categorias', icon: Tag },
  { label: commonMessages.navigation.more, href: '/mas', icon: MoreHorizontal }
];

function isItemActive(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useSessionStore(state => state.user);

  const handleLogout = () => {
    clearSession();
    router.replace('/login');
  };

  const initial = user?.nombre.charAt(0).toUpperCase() ?? 'U';

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-16 items-center px-6 text-lg font-extrabold text-primary">
          {siteConfig.name}
        </div>
        <nav aria-label="Navegación principal" className="flex flex-1 flex-col gap-1 px-3 py-2">
          {NAV_ITEMS.map(item => {
            const isActive = isItemActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3 border-t border-border p-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {user?.nombre ?? 'Usuario'}
            </p>
            <p className="truncate text-xs text-muted-foreground">{user?.email ?? '—'}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            aria-label={commonMessages.actions.logout}
            className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
        <span className="text-lg font-extrabold text-primary">{siteConfig.name}</span>
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {initial}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            aria-label={commonMessages.actions.logout}
            className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </header>

      <main className="lg:pl-64">
        <div className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6 sm:px-6 lg:pb-10">
          {children}
        </div>
      </main>

      <nav
        aria-label="Navegación principal"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-7 border-t border-border bg-card lg:hidden"
      >
        {NAV_ITEMS.map(item => {
          const isActive = isItemActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex flex-col items-center gap-0.5 px-0.5 py-2 text-[10px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="size-5" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
