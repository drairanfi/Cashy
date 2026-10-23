'use client';

import {
  Boxes,
  Home,
  Landmark,
  LogOut,
  MoreHorizontal,
  Settings,
  type LucideIcon
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

import { commonMessages } from '@/config/messages';
import { siteConfig } from '@/config/site';
import { ChatAssistant } from '@/domains/ai/components/organisms/chat-assistant';
import { MODULOS_OPCIONALES } from '@/domains/modulos/config';
import { modulosMessages } from '@/domains/modulos/messages';
import { useModulos, useModulosPersonalizados } from '@/domains/modulos/hooks/use-modulos';
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

const HOME_ITEM: NavItem = { label: commonMessages.navigation.home, href: '/', icon: Home };

const CONFIG_ITEMS: NavItem[] = [
  { label: commonMessages.navigation.settings, href: '/configuracion', icon: Settings },
  { label: commonMessages.navigation.profile, href: '/perfil', icon: MoreHorizontal }
];

const SETTINGS_SUB_ITEMS: NavItem[] = [
  { label: modulosMessages.tabs.modules, href: '/configuracion/modulos', icon: Boxes },
  { label: modulosMessages.tabs.accounts, href: '/configuracion/cuentas', icon: Landmark }
];

function isItemActive(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useSessionStore(state => state.user);
  const { data: modulos = [] } = useModulos();
  const { data: modulosPersonalizados = [] } = useModulosPersonalizados();

  const handleLogout = () => {
    clearSession();
    router.replace('/login');
  };

  const activeModuleItems: NavItem[] = MODULOS_OPCIONALES.filter(
    definition => modulos.find(modulo => modulo.clave === definition.clave)?.activo
  ).map(definition => ({ label: definition.label, href: definition.href, icon: definition.icon }));

  const customModuleItems: NavItem[] = modulosPersonalizados
    .filter(modulo => modulo.activo)
    .map(modulo => ({ label: modulo.nombre, href: `/modulos/${modulo.id}`, icon: Boxes }));

  const mainItems = [HOME_ITEM, ...activeModuleItems, ...customModuleItems];

  const isConfigActive = pathname.startsWith('/configuracion');
  const configNavItems: NavItem[] = isConfigActive
    ? [CONFIG_ITEMS[0], ...SETTINGS_SUB_ITEMS, CONFIG_ITEMS[1]]
    : CONFIG_ITEMS;

  const initial = user?.nombre.charAt(0).toUpperCase() ?? 'U';

  const renderSidebarLink = (item: NavItem) => {
    const isActive =
      item.href === '/configuracion' ? pathname === item.href : isItemActive(pathname, item.href);
    const isNested = SETTINGS_SUB_ITEMS.some(sub => sub.href === item.href);
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          'flex items-center gap-3 rounded-lg py-2 pr-3 text-sm font-medium transition-colors',
          isNested ? 'pl-9' : 'pl-3',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
      >
        <Icon className="size-5" />
        {item.label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-16 items-center px-6 text-lg font-extrabold text-primary">
          {siteConfig.name}
        </div>
        <nav aria-label="Navegación principal" className="flex flex-1 flex-col gap-1 px-3 py-2">
          {mainItems.map(renderSidebarLink)}
          <div className="mt-auto flex flex-col gap-1 border-t border-border pt-3">
            <p className="px-3 pb-1 text-xs font-semibold uppercase text-muted-foreground">
              {commonMessages.navigation.settings}
            </p>
            {configNavItems.map(renderSidebarLink)}
          </div>
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

      <ChatAssistant />

      <nav
        aria-label="Navegación principal"
        className="fixed inset-x-0 bottom-0 z-30 flex overflow-x-auto border-t border-border bg-card lg:hidden"
      >
        {[...mainItems, ...configNavItems].map(item => {
          const isActive = isItemActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex min-w-16 flex-1 flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-medium transition-colors',
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
